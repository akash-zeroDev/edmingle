import { Webhook } from "svix"
import { headers } from "next/headers"
import { clerkClient } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If secret is set, verify headers are present
  if (WEBHOOK_SECRET) {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 })
    }
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: { type: string; data: any }

  // Verify the payload with Svix
  if (WEBHOOK_SECRET) {
    const wh = new Webhook(WEBHOOK_SECRET)
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id!,
        "svix-timestamp": svix_timestamp!,
        "svix-signature": svix_signature!,
      }) as unknown as { type: string; data: any }
    } catch (err: any) {
      console.error("Error verifying webhook signature:", err.message)
      return new Response("Invalid webhook signature", { status: 400 })
    }
  } else {
    console.warn("CLERK_WEBHOOK_SECRET is not set. Processing webhook without verification.")
    evt = payload
  }

  const eventType = evt.type
  const data = evt.data

  console.log(`[Clerk Webhook] Received event: ${eventType} (User ID: ${data?.id})`)

  try {
    // =========================================================================
    // EVENT: user.created & user.updated
    // =========================================================================
    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkUserId = data.id
      const emailAddresses: string[] =
        data.email_addresses?.map((e: any) => e.email_address?.toLowerCase().trim()).filter(Boolean) || []
      const primaryEmail = emailAddresses[0] || null

      const phoneNumbers: string[] =
        data.phone_numbers?.map((p: any) => p.phone_number?.replace(/\D/g, "")).filter(Boolean) || []
      const primaryPhone = phoneNumbers[0] || null

      const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ").trim()
      const publicMeta = data.public_metadata || {}

      let resolvedRole = publicMeta.role as string | undefined
      let resolvedInstituteId = publicMeta.instituteId as string | undefined

      // 1. Superadmin check
      if (
        primaryEmail === "master@edmingle.com" ||
        primaryEmail === "master@classly.com" ||
        primaryEmail === "programcoder.ak@gmail.com"
      ) {
        resolvedRole = "superadmin"
      }

      // 2. Explicit Student ID in metadata
      if (publicMeta.studentId) {
        const student = await prisma.student.findFirst({
          where: { id: publicMeta.studentId },
        })
        if (student) {
          resolvedRole = "student"
          resolvedInstituteId = student.instituteId
          await prisma.student.update({
            where: { id: student.id },
            data: {
              clerkUserId,
              ...(fullName && !student.name ? { name: fullName } : {}),
            },
          })
        }
      }

      // 3. Explicit Teacher ID in metadata
      if (publicMeta.teacherId) {
        const teacher = await prisma.teacher.findFirst({
          where: { id: publicMeta.teacherId },
        })
        if (teacher) {
          resolvedRole = "teacher"
          resolvedInstituteId = teacher.instituteId
          await prisma.teacher.update({
            where: { id: teacher.id },
            data: {
              clerkUserId,
              ...(fullName && !teacher.name ? { name: fullName } : {}),
            },
          })
        }
      }

      // 4. Auto-discover Student by Phone or Email if not linked
      if (!resolvedRole) {
        const phoneConditions = phoneNumbers.map((phone) => {
          const last10 = phone.slice(-10)
          return { phoneNo: { contains: last10 } }
        })

        const student = await prisma.student.findFirst({
          where: {
            OR: [
              { clerkUserId },
              ...(emailAddresses.length > 0 ? [{ email: { in: emailAddresses } }] : []),
              ...phoneConditions,
            ],
          },
        })

        if (student) {
          resolvedRole = "student"
          resolvedInstituteId = student.instituteId
          await prisma.student.update({
            where: { id: student.id },
            data: {
              clerkUserId,
              ...(fullName ? { name: fullName } : {}),
              ...(primaryEmail && !student.email ? { email: primaryEmail } : {}),
            },
          })
        }
      }

      // 5. Auto-discover Teacher by Phone or Email if not linked
      if (!resolvedRole) {
        const phoneConditions = phoneNumbers.map((phone) => {
          const last10 = phone.slice(-10)
          return { phoneNo: { contains: last10 } }
        })

        const teacher = await prisma.teacher.findFirst({
          where: {
            OR: [
              { clerkUserId },
              ...(emailAddresses.length > 0 ? [{ email: { in: emailAddresses } }] : []),
              ...phoneConditions,
            ],
          },
        })

        if (teacher) {
          resolvedRole = "teacher"
          resolvedInstituteId = teacher.instituteId
          await prisma.teacher.update({
            where: { id: teacher.id },
            data: {
              clerkUserId,
              ...(fullName ? { name: fullName } : {}),
              ...(primaryEmail && !teacher.email ? { email: primaryEmail } : {}),
            },
          })
        }
      }

      // 6. Auto-discover Institute Admin by Email
      if (!resolvedRole && emailAddresses.length > 0) {
        const institute = await prisma.institute.findFirst({
          where: { adminEmail: { in: emailAddresses } },
        })

        if (institute) {
          resolvedRole = "institute_admin"
          resolvedInstituteId = institute.id
        }
      }

      // 7. Backfill Clerk publicMetadata so role evaluations in session claims are instant
      if (resolvedRole) {
        try {
          const client = await clerkClient()
          const needsMetaUpdate =
            publicMeta.role !== resolvedRole ||
            (resolvedInstituteId && publicMeta.instituteId !== resolvedInstituteId)

          if (needsMetaUpdate) {
            await client.users.updateUserMetadata(clerkUserId, {
              publicMetadata: {
                ...publicMeta,
                role: resolvedRole,
                ...(resolvedInstituteId ? { instituteId: resolvedInstituteId } : {}),
              },
            })
            console.log(`[Clerk Webhook] Backfilled metadata for ${clerkUserId}: role=${resolvedRole}`)
          }
        } catch (metaErr: any) {
          console.warn("[Clerk Webhook] Non-fatal: failed to backfill metadata:", metaErr.message)
        }
      }
    }

    // =========================================================================
    // EVENT: user.deleted
    // =========================================================================
    if (eventType === "user.deleted") {
      const clerkUserId = data.id

      // Unbind student clerkUserId
      await prisma.student.updateMany({
        where: { clerkUserId },
        data: { clerkUserId: null },
      })

      // Suspend teacher if Clerk user is deleted
      await prisma.teacher.updateMany({
        where: { clerkUserId },
        data: { status: "SUSPENDED" },
      })

      console.log(`[Clerk Webhook] Safely unbound records for deleted user ${clerkUserId}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("[Clerk Webhook] Processing error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

import { cookies } from "next/headers"
import { currentUser, clerkClient } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { resolveUserRole } from "@/lib/auth-guard"

export async function getAuthenticatedInstitute() {
  const user = await currentUser()
  if (!user) return null

  const role = await resolveUserRole(user)

  // 1. Strict Tenant Isolation: Only institute_admin and authorized superadmin can resolve an institute
  if (role !== "institute_admin" && role !== "superadmin") {
    return null
  }

  // 2. Check if Superadmin is currently impersonating an institute via secure cookie
  if (role === "superadmin") {
    const cookieStore = await cookies()
    const impersonatedId = cookieStore.get("impersonated_institute_id")?.value
    if (impersonatedId) {
      const institute = await prisma.institute.findUnique({
        where: { id: impersonatedId },
      })
      if (institute) {
        return { institute, user, isImpersonating: true }
      }
    }
  }

  // 3. Check if instituteId is explicitly pinned in Clerk publicMetadata
  const pinnedInstituteId = user.publicMetadata?.instituteId as string | undefined
  if (pinnedInstituteId) {
    const pinnedInstitute = await prisma.institute.findUnique({
      where: { id: pinnedInstituteId },
    })
    if (pinnedInstitute) {
      return { institute: pinnedInstitute, user, isImpersonating: false }
    }
  }

  // 4. Resolve Institute by verified administrator email
  const emailList = user.emailAddresses?.map((e: any) => e.emailAddress.toLowerCase()) || []
  const primaryEmail = emailList[0] || null

  const institute = await prisma.institute.findFirst({
    where: {
      OR: [
        ...(primaryEmail ? [{ adminEmail: primaryEmail }] : []),
        ...(emailList.length > 0 ? [{ adminEmail: { in: emailList } }] : []),
      ],
    },
  })

  if (!institute) return null

  // Backfill instituteId to publicMetadata for instant O(1) multi-tenant lookup
  if (user.publicMetadata?.instituteId !== institute.id) {
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          instituteId: institute.id,
        },
      })
    } catch {
      // Non-fatal
    }
  }

  return { institute, user, isImpersonating: false }
}

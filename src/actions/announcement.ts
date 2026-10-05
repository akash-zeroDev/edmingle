"use server"

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export interface BatchAnnouncementItem {
  id: string
  content: string
  priority: "NORMAL" | "HIGH" | "URGENT"
  batchId: string | null
  batchName?: string
  authorRole: "ADMIN" | "FACULTY"
  authorName: string
  createdAt: string
}

/**
 * Creates an announcement for a batch or entire institute.
 * Authenticates user and automatically tags whether it was authored by Faculty or Institute Admin.
 */
export async function createBatchAnnouncement(data: {
  batchId?: string | null
  content: string
  priority?: "NORMAL" | "HIGH" | "URGENT"
  title?: string
}) {
  try {
    const user = await currentUser()
    if (!user) {
      return { error: "Unauthorized. Please log in." }
    }

    const emailList = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
    const phoneList = user.phoneNumbers?.map((p) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

    // 1. Check if Institute Admin
    const institute = await prisma.institute.findFirst({
      where: { adminEmail: { in: emailList } },
    })

    // 2. Check if Teacher
    const teacher = !institute
      ? await prisma.teacher.findFirst({
          where: {
            OR: [
              { clerkUserId: user.id },
              ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
              ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
            ],
          },
        })
      : null

    if (!institute && !teacher) {
      return { error: "Unauthorized: only faculty members and institute admins can publish announcements." }
    }

    const targetBatchId = data.batchId && data.batchId !== "ALL" ? data.batchId : null
    let targetInstituteId = institute ? institute.id : teacher!.instituteId
    let targetTeacherId = teacher ? teacher.id : null

    // If targetBatchId is given, guarantee it belongs to this institute
    if (targetBatchId) {
      const b = await prisma.batch.findUnique({
        where: { id: targetBatchId },
      }).catch(() => null)
      if (!b || b.instituteId !== targetInstituteId) {
        return { error: "Unauthorized: batch does not belong to your institute." }
      }
      if (!targetTeacherId && b.teacherId) {
        targetTeacherId = b.teacherId
      }
    }

    const authorRole: "ADMIN" | "FACULTY" = teacher ? "FACULTY" : "ADMIN"
    const authorName = teacher ? teacher.name : (institute?.name ? `${institute.name} Administration` : "Institute Admin")
    const priority = data.priority || "NORMAL"

    const id = `ann_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date()

    let announcement: any = null
    try {
      announcement = await prisma.announcement.create({
        data: {
          content: data.content.trim(),
          priority,
          instituteId: targetInstituteId,
          teacherId: targetTeacherId,
          batchId: targetBatchId,
        },
        include: {
          batch: true,
          teacher: true,
        },
      })
    } catch (createErr: any) {
      console.warn("Direct prisma.announcement.create failed, falling back to raw query:", createErr?.message)
      await prisma.$executeRaw`
        INSERT INTO "Announcement" ("id", "content", "priority", "instituteId", "teacherId", "batchId", "createdAt", "updatedAt")
        VALUES (${id}, ${data.content.trim()}, ${priority}, ${targetInstituteId}, ${targetTeacherId}, ${targetBatchId}, ${now}, ${now})
      `
      announcement = {
        id,
        content: data.content.trim(),
        priority,
        instituteId: targetInstituteId,
        teacherId: targetTeacherId,
        batchId: targetBatchId,
        createdAt: now,
      }
    }

    revalidatePath("/teacher")
    revalidatePath("/student")
    revalidatePath("/institute")
    revalidatePath("/institute/announcements")
    revalidatePath("/institute/batches")
    if (targetBatchId) {
      revalidatePath(`/institute/batches/${targetBatchId}`)
    }

    return {
      success: true,
      announcement: {
        id: announcement.id,
        content: announcement.content,
        priority: announcement.priority,
        batchId: announcement.batchId,
        authorRole,
        authorName,
        createdAt: (announcement.createdAt instanceof Date ? announcement.createdAt : new Date(announcement.createdAt)).toISOString(),
      },
    }
  } catch (error: any) {
    console.error("Error creating batch announcement:", error)
    return { error: error.message || "Failed to post announcement." }
  }
}

/**
 * Deletes an announcement.
 */
export async function deleteAnnouncement(announcementId: string) {
  try {
    const user = await currentUser()
    if (!user) return { error: "Unauthorized." }

    const emailList = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
    const phoneList = user.phoneNumbers?.map((p) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: { in: emailList } },
    })

    const teacher = !institute
      ? await prisma.teacher.findFirst({
          where: {
            OR: [
              { clerkUserId: user.id },
              ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
              ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
            ],
          },
        })
      : null

    if (!institute && !teacher) {
      return { error: "Unauthorized." }
    }

    const callerInstituteId = institute ? institute.id : teacher!.instituteId

    // Find the announcement and ensure it belongs to caller's institute
    const existing = await prisma.announcement.findUnique({
      where: { id: announcementId },
    }).catch(() => null)

    if (!existing || existing.instituteId !== callerInstituteId) {
      return { error: "Unauthorized: announcement not found in your institute." }
    }

    try {
      await prisma.announcement.delete({
        where: { id: announcementId },
      })
    } catch {
      await prisma.$executeRaw`
        DELETE FROM "Announcement" WHERE "id" = ${announcementId}
      `
    }

    revalidatePath("/teacher")
    revalidatePath("/student")
    revalidatePath("/institute")
    revalidatePath("/institute/announcements")
    revalidatePath("/institute/batches")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete announcement" }
  }
}

/**
 * Loads all announcements for a batch (and institute-wide notices).
 * Used by Batch Command Center (/institute/batches/[batchId]).
 */
export async function getAnnouncementsForBatch(
  batchId: string,
  instituteId: string
): Promise<BatchAnnouncementItem[]> {
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT a."id", a."content", a."priority", a."batchId", a."teacherId", a."instituteId", a."createdAt",
             b."className" as "batchClassName", b."batchName" as "batchBatchName", b."subject" as "batchSubject",
             t."name" as "teacherName",
             i."name" as "instituteName"
      FROM "Announcement" a
      LEFT JOIN "Batch" b ON a."batchId" = b."id"
      LEFT JOIN "Teacher" t ON a."teacherId" = t."id"
      LEFT JOIN "Institute" i ON a."instituteId" = i."id"
      WHERE a."instituteId" = ${instituteId}
        AND (a."batchId" = ${batchId} OR a."batchId" IS NULL)
      ORDER BY a."createdAt" DESC
      LIMIT 50;
    `

    return rows.map((r: any) => ({
      id: r.id,
      content: r.content,
      priority: r.priority || "NORMAL",
      batchId: r.batchId,
      batchName: r.batchClassName ? `${r.batchClassName} (${r.batchBatchName || r.batchSubject})` : "All Batches",
      authorRole: r.teacherId ? "FACULTY" : "ADMIN",
      authorName: r.teacherName || (r.instituteName ? `${r.instituteName} Administration` : "Institute Admin"),
      createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching batch announcements:", error)
    return []
  }
}

/**
 * Loads all announcements relevant to a student:
 * - Announcements targeted to any of the student's enrolled batches
 * - Institute-wide announcements (batchId is null)
 */
export async function getAnnouncementsForStudent(
  instituteId: string,
  batchIds: string[]
): Promise<BatchAnnouncementItem[]> {
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT a."id", a."content", a."priority", a."batchId", a."teacherId", a."instituteId", a."createdAt",
             b."className" as "batchClassName", b."batchName" as "batchBatchName", b."subject" as "batchSubject",
             t."name" as "teacherName",
             i."name" as "instituteName"
      FROM "Announcement" a
      LEFT JOIN "Batch" b ON a."batchId" = b."id"
      LEFT JOIN "Teacher" t ON a."teacherId" = t."id"
      LEFT JOIN "Institute" i ON a."instituteId" = i."id"
      WHERE a."instituteId" = ${instituteId}
        AND (
          a."batchId" IS NULL
          ${batchIds.length > 0 ? Prisma.sql`OR a."batchId" IN (${Prisma.join(batchIds)})` : Prisma.empty}
        )
      ORDER BY a."createdAt" DESC
      LIMIT 50;
    `

    return rows.map((r: any) => ({
      id: r.id,
      content: r.content,
      priority: r.priority || "NORMAL",
      batchId: r.batchId,
      batchName: r.batchClassName ? `${r.batchClassName} (${r.batchBatchName || r.batchSubject})` : "Institute Notice",
      authorRole: r.teacherId ? "FACULTY" : "ADMIN",
      authorName: r.teacherName || (r.instituteName ? `${r.instituteName} Administration` : "Institute Admin"),
      createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching student announcements:", error)
    return []
  }
}

/**
 * Loads recent announcements for an institute.
 * Used by main institute dashboard (/institute).
 */
export async function getAnnouncementsForInstitute(
  instituteId: string,
  limit: number = 10
): Promise<BatchAnnouncementItem[]> {
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT a."id", a."content", a."priority", a."batchId", a."teacherId", a."instituteId", a."createdAt",
             b."className" as "batchClassName", b."batchName" as "batchBatchName", b."subject" as "batchSubject",
             t."name" as "teacherName",
             i."name" as "instituteName"
      FROM "Announcement" a
      LEFT JOIN "Batch" b ON a."batchId" = b."id"
      LEFT JOIN "Teacher" t ON a."teacherId" = t."id"
      LEFT JOIN "Institute" i ON a."instituteId" = i."id"
      WHERE a."instituteId" = ${instituteId}
      ORDER BY a."createdAt" DESC
      LIMIT ${limit};
    `

    return rows.map((r: any) => ({
      id: r.id,
      content: r.content,
      priority: r.priority || "NORMAL",
      batchId: r.batchId,
      batchName: r.batchClassName ? `${r.batchClassName} (${r.batchBatchName || r.batchSubject})` : "All Batches",
      authorRole: r.teacherId ? "FACULTY" : "ADMIN",
      authorName: r.teacherName || (r.instituteName ? `${r.instituteName} Administration` : "Institute Admin"),
      createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching institute announcements:", error)
    return []
  }
}

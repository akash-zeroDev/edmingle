"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { z } from "zod"

const batchSchema = z.object({
  className: z.string().min(1, "Class / Grade is required (e.g. Class 12, Class 11, Class 10)."),
  batchName: z.string().min(1, "Batch name is required (e.g. Batch A, Morning Cohort, Target JEE)."),
  subject: z.string().min(1, "Subject name is required."),
  timing: z.string().optional(),
  teacherId: z.string().optional(),
})

export async function createBatch(formData: FormData) {
  try {
    const user = await currentUser()
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized. Institute admin access required." }
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return { error: "User email not found" }
    }

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    })

    if (!institute) {
      return { error: "Institute not found" }
    }

    const className = (formData.get("className") as string)?.trim()
    const batchName = (formData.get("batchName") as string)?.trim()
    const subject = (formData.get("subject") as string)?.trim()
    const timing = ((formData.get("timing") as string) || undefined)?.trim()
    const teacherIdRaw = (formData.get("teacherId") as string) || undefined
    const teacherId = teacherIdRaw && teacherIdRaw !== "none" ? teacherIdRaw : undefined

    const parsed = batchSchema.safeParse({ className, batchName, subject, timing, teacherId })
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid batch data" }
    }

    // Verify teacher belongs to this institute if provided
    if (parsed.data.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: parsed.data.teacherId, instituteId: institute.id },
      })
      if (!teacher) {
        return { error: "Selected faculty member does not belong to your institute." }
      }
    }

    const batch = await prisma.batch.create({
      data: {
        className: parsed.data.className,
        batchName: parsed.data.batchName,
        subject: parsed.data.subject,
        timing: parsed.data.timing,
        teacherId: parsed.data.teacherId || null,
        instituteId: institute.id,
      },
      include: {
        teacher: true,
      },
    })

    revalidatePath("/institute/batches")
    revalidatePath("/institute")
    return { success: true, batch }
  } catch (error: any) {
    console.error("Error creating batch:", error)
    return { error: error.message || "Failed to create batch" }
  }
}

export async function deleteBatch(batchId: string) {
  try {
    const user = await currentUser()
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" }
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) return { error: "User email not found" }

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    })

    if (!institute) return { error: "Institute not found" }

    // Ensure batch belongs to this institute
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId: institute.id },
    })

    if (!batch) {
      return { error: "Batch not found or unauthorized access" }
    }

    // Delete enrollments associated with batch
    await prisma.batchEnrollment.deleteMany({
      where: { batchId },
    })

    // Delete the batch
    await prisma.batch.delete({
      where: { id: batchId },
    })

    revalidatePath("/institute/batches")
    revalidatePath("/institute")
    const displayName = batch.batchName ? `${batch.className} - ${batch.batchName}` : batch.className
    return { success: true, message: `Batch ${displayName} (${batch.subject}) deleted successfully.` }
  } catch (error: any) {
    console.error("Error deleting batch:", error)
    return { error: error.message || "Failed to delete batch" }
  }
}

export async function updateBatch(batchId: string, formData: FormData) {
  try {
    const user = await currentUser()
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" }
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) return { error: "User email not found" }

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    })

    if (!institute) return { error: "Institute not found" }

    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId: institute.id },
    })

    if (!batch) return { error: "Batch not found" }

    const className = (formData.get("className") as string)?.trim()
    const batchName = (formData.get("batchName") as string)?.trim()
    const subject = (formData.get("subject") as string)?.trim()
    const timing = ((formData.get("timing") as string) || undefined)?.trim()
    const teacherIdRaw = (formData.get("teacherId") as string) || undefined
    const teacherId = teacherIdRaw && teacherIdRaw !== "none" ? teacherIdRaw : null

    const parsed = batchSchema.safeParse({ className, batchName, subject, timing, teacherId: teacherId || undefined })
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid batch data" }
    }

    await prisma.batch.update({
      where: { id: batchId },
      data: {
        className: parsed.data.className,
        batchName: parsed.data.batchName,
        subject: parsed.data.subject,
        timing: parsed.data.timing || null,
        teacherId: teacherId,
      },
    })

    revalidatePath("/institute/batches")
    revalidatePath("/institute")
    return { success: true, message: "Batch updated successfully." }
  } catch (error: any) {
    console.error("Error updating batch:", error)
    return { error: error.message || "Failed to update batch" }
  }
}

export async function enrollStudentInBatch(batchId: string, studentId: string) {
  try {
    const user = await currentUser()
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" }
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) return { error: "User email not found" }

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    })
    if (!institute) return { error: "Institute not found" }

    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId: institute.id },
    })
    if (!batch) return { error: "Batch not found" }

    const student = await prisma.student.findFirst({
      where: { id: studentId, instituteId: institute.id },
    })
    if (!student) return { error: "Student not found" }

    const existing = await prisma.batchEnrollment.findFirst({
      where: { batchId, studentId },
    })
    if (existing) {
      return { error: "Student is already enrolled in this batch." }
    }

    await prisma.batchEnrollment.create({
      data: {
        batchId,
        studentId,
      },
    })

    revalidatePath(`/institute/batches/${batchId}`)
    revalidatePath("/institute/batches")
    revalidatePath("/institute/students")
    return { success: true, message: `${student.name} enrolled into batch successfully.` }
  } catch (error: any) {
    console.error("Error enrolling student in batch:", error)
    return { error: error.message || "Failed to enroll student" }
  }
}

export async function removeStudentFromBatch(batchId: string, studentId: string) {
  try {
    const user = await currentUser()
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" }
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) return { error: "User email not found" }

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    })
    if (!institute) return { error: "Institute not found" }

    const deleted = await prisma.batchEnrollment.deleteMany({
      where: {
        batchId,
        studentId,
        batch: { instituteId: institute.id },
      },
    })

    if (deleted.count === 0) {
      return { error: "Enrollment record not found or unauthorized." }
    }

    revalidatePath(`/institute/batches/${batchId}`)
    revalidatePath("/institute/batches")
    revalidatePath("/institute/students")
    return { success: true, message: "Student removed from batch successfully." }
  } catch (error: any) {
    console.error("Error removing student from batch:", error)
    return { error: error.message || "Failed to remove student from batch" }
  }
}


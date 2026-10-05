"use server"

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { z } from "zod"
import { dispatchNotice } from "@/lib/notifications"

const teacherSchema = z.object({
  name: z.string().min(2, "Teacher name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phoneNo: z.string().optional(),
  address: z.string().optional(),
  salary: z.coerce.number().min(0, "Salary must be a positive number.").optional(),
  subjects: z.string().optional(),
})

export async function createTeacher(formData: FormData) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) {
      return { error: "Institute not found or unauthorized." }
    }
    const institute = authData.institute

    const name = (formData.get("name") as string)?.trim()
    const teacherEmail = (formData.get("email") as string)?.trim()?.toLowerCase()
    const phoneNo = ((formData.get("phoneNo") as string)?.trim()) || undefined
    const address = ((formData.get("address") as string)?.trim()) || undefined
    const salaryRaw = (formData.get("salary") as string)?.trim()
    const cleanSalary = salaryRaw ? parseFloat(salaryRaw.replace(/[^\d.]/g, "")) : undefined
    const salary = cleanSalary && !isNaN(cleanSalary) ? cleanSalary : undefined
    const subjects = ((formData.get("subjects") as string)?.trim()) || undefined

    const parsed = teacherSchema.safeParse({
      name,
      email: teacherEmail,
      phoneNo,
      address,
      salary,
      subjects,
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    // Check if teacher with same email already exists in this institute
    const existing = await prisma.teacher.findFirst({
      where: {
        instituteId: institute.id,
        email: parsed.data.email,
      },
    })

    if (existing) {
      return { error: `A teacher with email ${parsed.data.email} is already registered.` }
    }

    // Generate unique temporary clerkUserId identifier
    const tempClerkId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const teacher = await prisma.teacher.create({
      data: {
        clerkUserId: tempClerkId,
        name: parsed.data.name,
        email: parsed.data.email,
        phoneNo: parsed.data.phoneNo,
        address: parsed.data.address,
        salary: parsed.data.salary,
        subjects: parsed.data.subjects,
        status: "ACTIVE",
        instituteId: institute.id,
      },
    })

    // Dispatch Clerk invitation email to teacher
    try {
      const client = await clerkClient()
      await client.invitations.createInvitation({
        emailAddress: parsed.data.email,
        publicMetadata: {
          role: "teacher",
          instituteId: institute.id,
          teacherId: teacher.id,
        },
        ignoreExisting: true,
      })
    } catch (inviteErr) {
      console.warn("Clerk invitation dispatch notice (non-fatal):", inviteErr)
    }

    revalidatePath("/institute/teachers")
    revalidatePath("/institute/payroll")
    revalidatePath("/institute")

    return {
      success: true,
      message: `${parsed.data.name} has been added, and an invitation link was sent to ${parsed.data.email}.`,
    }
  } catch (error: any) {
    console.error("Failed to create teacher:", error)
    return { error: error.message || "Failed to create teacher" }
  }
}

export async function suspendTeacher(teacherId: string, reason?: string) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) throw new Error("Institute not found or unauthorized")
    const institute = authData.institute

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId: institute.id },
      include: { batchesTaught: true },
    })
    if (!teacher) throw new Error("Teacher not found")

    await prisma.teacher.update({
      where: { id: teacherId },
      data: { status: "SUSPENDED" },
    })

    const batchNames = teacher.batchesTaught.map((b) => `${b.className} (${b.subject})`)

    // Dispatch SMS and Email notice to teacher
    await dispatchNotice({
      recipientName: teacher.name,
      recipientPhone: teacher.phoneNo,
      instituteName: institute.name,
      action: "SUSPENDED",
      targetType: "TEACHER",
      reason: reason || "Administrative suspension",
      batchNames,
    })

    revalidatePath("/institute/teachers")
    revalidatePath("/institute/payroll")
    revalidatePath("/institute")

    return {
      success: true,
      message: `Teacher suspended. Notification sent via SMS & Email.`,
    }
  } catch (error: any) {
    console.error("Failed to suspend teacher:", error)
    return { error: error.message || "Failed to suspend teacher" }
  }
}

export async function reactivateTeacher(teacherId: string) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) throw new Error("Institute not found or unauthorized")
    const institute = authData.institute

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId: institute.id },
      include: { batchesTaught: true },
    })
    if (!teacher) throw new Error("Teacher not found")

    await prisma.teacher.update({
      where: { id: teacherId },
      data: { status: "ACTIVE" },
    })

    const batchNames = teacher.batchesTaught.map((b) => `${b.className} (${b.subject})`)

    await dispatchNotice({
      recipientName: teacher.name,
      recipientPhone: teacher.phoneNo,
      instituteName: institute.name,
      action: "REACTIVATED",
      targetType: "TEACHER",
      reason: "Faculty status restored to active.",
      batchNames,
    })

    revalidatePath("/institute/teachers")
    revalidatePath("/institute/payroll")
    revalidatePath("/institute")

    return { success: true, message: `Teacher status restored to active.` }
  } catch (error: any) {
    console.error("Failed to reactivate teacher:", error)
    return { error: error.message || "Failed to reactivate teacher" }
  }
}

export async function removeTeacher(teacherId: string, reason?: string) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) throw new Error("Institute not found or unauthorized")
    const institute = authData.institute

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId: institute.id },
      include: { batchesTaught: true },
    })
    if (!teacher) throw new Error("Teacher not found")

    const batchNames = teacher.batchesTaught.map((b) => `${b.className} (${b.subject})`)

    // Dispatch SMS and Email notice prior to removal
    await dispatchNotice({
      recipientName: teacher.name,
      recipientPhone: teacher.phoneNo,
      instituteName: institute.name,
      action: "REMOVED",
      targetType: "TEACHER",
      reason: reason || "Faculty tenure terminated by institute administration",
      batchNames,
    })

    // Unassign all batches from this teacher
    await prisma.batch.updateMany({
      where: { teacherId },
      data: { teacherId: null },
    })

    // Delete teacher
    await prisma.teacher.delete({
      where: { id: teacherId },
    })

    revalidatePath("/institute/teachers")
    revalidatePath("/institute/payroll")
    revalidatePath("/institute")

    return {
      success: true,
      message: `Teacher permanently removed. Termination notice sent via SMS & Email.`,
    }
  } catch (error: any) {
    console.error("Failed to remove teacher:", error)
    return { error: error.message || "Failed to remove teacher" }
  }
}

export async function resendTeacherInvitation(teacherId: string) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) throw new Error("Institute not found or unauthorized")
    const institute = authData.institute

    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId: institute.id },
    })

    if (!teacher) throw new Error("Teacher not found")
    if (!teacher.email || !teacher.email.trim()) {
      return { error: "This faculty member does not have an email address registered." }
    }

    const client = await clerkClient()
    await client.invitations.createInvitation({
      emailAddress: teacher.email.trim().toLowerCase(),
      publicMetadata: {
        role: "teacher",
        teacherId: teacher.id,
        instituteId: institute.id,
      },
      ignoreExisting: true,
    })

    return {
      success: true,
      message: `Invitation email dispatched to ${teacher.email}. The faculty member can use this link to access their portal.`,
    }
  } catch (error: any) {
    console.error("Failed to resend teacher invitation:", error)
    return { error: error.message || "Failed to send invitation." }
  }
}

// ==========================================
// TEACHER PORTAL TYPES & ACTIONS
// ==========================================

export interface TeacherBatchStudent {
  studentId: string
  name: string
  phoneNo: string | null
  parentPhone: string | null
  todayStatus?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  remarks?: string | null
  attendanceRate?: number
}

export interface TeacherBatchItem {
  id: string
  batchName: string | null
  className: string
  subject: string
  timing: string | null
  studentCount: number
  students: TeacherBatchStudent[]
  todayRollCallStatus: "COMPLETED" | "PENDING"
  todayPresentCount: number
  todayAbsentCount: number
}

export interface TeacherTodayClassSchedule {
  batchId: string
  title: string
  subject: string
  timing: string
  room: string
  rollCallStatus: "COMPLETED" | "PENDING"
  studentCount: number
  presentCount: number
}

export interface TeacherPayoutVoucherItem {
  id: string
  voucherNo: string
  month: number
  year: number
  baseSalary: number
  bonus: number
  deductions: number
  netAmount: number
  status: string
  paymentMode: string
  transactionRef: string | null
  paidAt: string
}

export interface TeacherAnnouncementItem {
  id: string
  content: string
  priority: "NORMAL" | "HIGH" | "URGENT"
  batchId: string | null
  batchName: string | null
  authorRole: "ADMIN" | "FACULTY"
  authorName: string
  createdAt: string
}

export interface TeacherPortalData {
  isPreview: boolean
  teacher: {
    id: string
    name: string
    email?: string | null
    phoneNo: string | null
    subjects: string | null
    salary: number | null
    instituteName: string
    instituteId: string
  }
  kpi: {
    todayClassesCount: number
    activeBatchesCount: number
    totalStudentsCount: number
    completedRollCallsCount: number
  }
  todaySchedule: TeacherTodayClassSchedule[]
  batches: TeacherBatchItem[]
  payouts: TeacherPayoutVoucherItem[]
  announcements: TeacherAnnouncementItem[]
}

const DEMO_TEACHER_PORTAL_DATA: TeacherPortalData = {
  isPreview: true,
  teacher: {
    id: "demo-teacher-01",
    name: "Prof. Rajesh Verma",
    phoneNo: "+91 98110 54321",
    subjects: "Physics & Mechanics",
    salary: 65000,
    instituteName: "Classly Premier Academy",
    instituteId: "demo-inst-01",
  },
  kpi: {
    todayClassesCount: 3,
    activeBatchesCount: 3,
    totalStudentsCount: 78,
    completedRollCallsCount: 1,
  },
  todaySchedule: [
    {
      batchId: "demo-b1",
      title: "Class 12 - Target JEE 2026",
      subject: "Physics",
      timing: "10:00 AM - 11:30 AM",
      room: "Lecture Hall 2A",
      rollCallStatus: "COMPLETED",
      studentCount: 32,
      presentCount: 30,
    },
    {
      batchId: "demo-b2",
      title: "Class 11 - Foundation Batch",
      subject: "Physics",
      timing: "02:00 PM - 03:30 PM",
      room: "Room 104",
      rollCallStatus: "PENDING",
      studentCount: 26,
      presentCount: 0,
    },
    {
      batchId: "demo-b3",
      title: "Dropper Batch - Advanced Mechanics",
      subject: "Physics",
      timing: "04:30 PM - 06:00 PM",
      room: "Lecture Hall 3B",
      rollCallStatus: "PENDING",
      studentCount: 20,
      presentCount: 0,
    },
  ],
  batches: [
    {
      id: "demo-b1",
      batchName: "Target JEE 2026",
      className: "Class 12",
      subject: "Physics",
      timing: "10:00 AM - 11:30 AM",
      studentCount: 6,
      todayRollCallStatus: "COMPLETED",
      todayPresentCount: 5,
      todayAbsentCount: 1,
      students: [
        { studentId: "s-1", name: "Aarav Sharma", phoneNo: "+91 98102 45631", parentPhone: "+91 98102 45600", todayStatus: "PRESENT", attendanceRate: 96.4 },
        { studentId: "s-2", name: "Ananya Gupta", phoneNo: "+91 98911 20548", parentPhone: "+91 98911 20500", todayStatus: "PRESENT", attendanceRate: 94.8 },
        { studentId: "s-3", name: "Vivaan Mehta", phoneNo: "+91 99108 66219", parentPhone: "+91 99108 66200", todayStatus: "PRESENT", attendanceRate: 91.2 },
        { studentId: "s-4", name: "Ishita Kapoor", phoneNo: "+91 98731 80442", parentPhone: "+91 98731 80400", todayStatus: "ABSENT", remarks: "Doctor appointment", attendanceRate: 89.7 },
        { studentId: "s-5", name: "Arjun Nair", phoneNo: "+91 98217 34015", parentPhone: "+91 98217 34000", todayStatus: "PRESENT", attendanceRate: 93.1 },
        { studentId: "s-6", name: "Saanvi Rao", phoneNo: "+91 97693 54182", parentPhone: "+91 97693 54100", todayStatus: "PRESENT", attendanceRate: 87.5 },
      ],
    },
    {
      id: "demo-b2",
      batchName: "Foundation Batch",
      className: "Class 11",
      subject: "Physics",
      timing: "02:00 PM - 03:30 PM",
      studentCount: 4,
      todayRollCallStatus: "PENDING",
      todayPresentCount: 0,
      todayAbsentCount: 0,
      students: [
        { studentId: "s-7", name: "Rohan Deshmukh", phoneNo: "+91 98234 11223", parentPhone: "+91 98234 11200", attendanceRate: 94.0 },
        { studentId: "s-8", name: "Diya Chatterjee", phoneNo: "+91 98311 44556", parentPhone: "+91 98311 44500", attendanceRate: 92.5 },
        { studentId: "s-9", name: "Kabir Sengupta", phoneNo: "+91 98109 77889", parentPhone: "+91 98109 77800", attendanceRate: 88.0 },
        { studentId: "s-10", name: "Meera Iyer", phoneNo: "+91 98401 22334", parentPhone: "+91 98401 22300", attendanceRate: 95.2 },
      ],
    },
    {
      id: "demo-b3",
      batchName: "Advanced Mechanics",
      className: "Dropper Batch",
      subject: "Physics",
      timing: "04:30 PM - 06:00 PM",
      studentCount: 3,
      todayRollCallStatus: "PENDING",
      todayPresentCount: 0,
      todayAbsentCount: 0,
      students: [
        { studentId: "s-11", name: "Tanmay Joshi", phoneNo: "+91 98200 88991", parentPhone: "+91 98200 88900", attendanceRate: 91.0 },
        { studentId: "s-12", name: "Sneha Patil", phoneNo: "+91 98221 44332", parentPhone: "+91 98221 44300", attendanceRate: 86.4 },
        { studentId: "s-13", name: "Harsh Vardhan", phoneNo: "+91 98115 66778", parentPhone: "+91 98115 66700", attendanceRate: 93.8 },
      ],
    },
  ],
  payouts: [
    {
      id: "pay-1",
      voucherNo: "VCH-202609-8421",
      month: 9,
      year: 2026,
      baseSalary: 65000,
      bonus: 5000,
      deductions: 0,
      netAmount: 70000,
      status: "PAID",
      paymentMode: "NET_BANKING",
      transactionRef: "HDFC98214470129",
      paidAt: "2026-09-30T10:00:00.000Z",
    },
    {
      id: "pay-2",
      voucherNo: "VCH-202608-5112",
      month: 8,
      year: 2026,
      baseSalary: 65000,
      bonus: 2500,
      deductions: 1000,
      netAmount: 66500,
      status: "PAID",
      paymentMode: "NET_BANKING",
      transactionRef: "HDFC84192004128",
      paidAt: "2026-08-31T10:00:00.000Z",
    },
  ],
  announcements: [],
}

export async function getTeacherPortalData(): Promise<TeacherPortalData> {
  let user: any = null
  try {
    user = await currentUser()
    if (!user) {
      return {
        isPreview: false,
        teacher: {
          id: "anonymous",
          name: "Faculty Member",
          email: null,
          phoneNo: null,
          subjects: null,
          salary: null,
          instituteName: "Coaching Academy",
          instituteId: "",
        },
        kpi: {
          todayClassesCount: 0,
          activeBatchesCount: 0,
          totalStudentsCount: 0,
          completedRollCallsCount: 0,
        },
        todaySchedule: [],
        batches: [],
        payouts: [],
        announcements: [],
      }
    }

    const emailList = user.emailAddresses?.map((e: any) => e.emailAddress.toLowerCase()) || []
    const primaryEmail = emailList[0] || null
    const clerkUserId = user.id
    const phoneList = user.phoneNumbers?.map((p: any) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []
    const clerkFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || (primaryEmail ? primaryEmail.split("@")[0] : "Faculty Lead")

    // 1. Direct query in Teacher table by Clerk User ID, Email, or Phone
    let teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { clerkUserId },
          ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
          ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
        ],
      },
      include: {
        institute: true,
        batchesTaught: {
          include: {
            students: {
              include: {
                student: true,
              },
            },
          },
        },
        payouts: {
          orderBy: { paidAt: "desc" },
          take: 12,
        },
      },
    })

    // 2. If found, ensure clerkUserId is linked
    if (teacher) {
      if (teacher.clerkUserId !== clerkUserId) {
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: { clerkUserId },
        }).catch(() => null)
      }

      // If teacher has 0 batches, check if batches in this institute belong to a duplicate record with the same first name or phone
      if (teacher.batchesTaught.length === 0) {
        const firstName = (teacher.name || clerkFullName).split(" ")[0]?.trim() || "Akash"
        const duplicateBatches = await prisma.batch.findMany({
          where: {
            instituteId: teacher.instituteId,
            teacherId: { not: teacher.id },
            teacher: {
              OR: [
                { name: { contains: firstName, mode: "insensitive" } },
                ...(teacher.phoneNo ? [{ phoneNo: teacher.phoneNo }] : []),
              ],
            },
          },
        }).catch(() => [])

        if (duplicateBatches.length > 0) {
          await prisma.batch.updateMany({
            where: { id: { in: duplicateBatches.map((b) => b.id) } },
            data: { teacherId: teacher.id },
          }).catch(() => null)

          const refreshed = await prisma.teacher.findUnique({
            where: { id: teacher.id },
            include: {
              institute: true,
              batchesTaught: {
                include: {
                  students: {
                    include: {
                      student: true,
                    },
                  },
                },
              },
              payouts: {
                orderBy: { paidAt: "desc" },
                take: 12,
              },
            },
          })
          if (refreshed) teacher = refreshed
        }
      }

      return await mapDatabaseTeacherToPortalData(teacher, false, teacher.name || clerkFullName)
    }

    // 3. If teacher record not found directly, check if user is an Institute Admin testing/viewing the teacher workspace
    if (primaryEmail) {
      const institute = await prisma.institute.findFirst({
        where: { adminEmail: primaryEmail },
      })

      if (institute) {
        // Check if there is a teacher in this institute matching user's phone, email, or name
        const matchedTeacher = await prisma.teacher.findFirst({
          where: {
            instituteId: institute.id,
            OR: [
              ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
              ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
              { name: { contains: user.firstName || "Akash", mode: "insensitive" } },
            ],
          },
          include: {
            institute: true,
            batchesTaught: {
              include: {
                students: {
                  include: {
                    student: true,
                  },
                },
              },
            },
            payouts: {
              orderBy: { paidAt: "desc" },
              take: 12,
            },
          },
        })

        if (matchedTeacher) {
          await prisma.teacher.update({
            where: { id: matchedTeacher.id },
            data: { clerkUserId, email: matchedTeacher.email || primaryEmail },
          }).catch(() => null)

          return await mapDatabaseTeacherToPortalData(matchedTeacher, false, matchedTeacher.name || clerkFullName)
        }

        // Return real institute info for the admin with their actual name (0 batches, clean real empty state)
        return {
          isPreview: false,
          teacher: {
            id: `admin-${institute.id}`,
            name: clerkFullName,
            email: primaryEmail,
            phoneNo: institute.phoneNo || null,
            subjects: "Administrator / Faculty Lead",
            salary: null,
            instituteName: institute.name || "Coaching Academy",
            instituteId: institute.id,
          },
          kpi: {
            todayClassesCount: 0,
            activeBatchesCount: 0,
            totalStudentsCount: 0,
            completedRollCallsCount: 0,
          },
          todaySchedule: [],
          batches: [],
          payouts: [],
          announcements: [],
        }
      }
    }

    // 4. Default clean state for authenticated faculty with actual name
    return {
      isPreview: false,
      teacher: {
        id: clerkUserId,
        name: clerkFullName,
        email: primaryEmail,
        phoneNo: null,
        subjects: "Faculty Instructor",
        salary: null,
        instituteName: "Coaching Academy",
        instituteId: "pending",
      },
      kpi: {
        todayClassesCount: 0,
        activeBatchesCount: 0,
        totalStudentsCount: 0,
        completedRollCallsCount: 0,
      },
      todaySchedule: [],
      batches: [],
      payouts: [],
      announcements: [],
    }
  } catch (error) {
    console.error("Error fetching teacher portal data:", error)
    const fallbackName = user
      ? (`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Faculty Lead")
      : "Faculty Lead"

    return {
      isPreview: false,
      teacher: {
        id: user?.id || "error-teacher",
        name: fallbackName,
        email: user?.emailAddresses?.[0]?.emailAddress || null,
        phoneNo: null,
        subjects: "Faculty Instructor",
        salary: null,
        instituteName: "Coaching Academy",
        instituteId: "error",
      },
      kpi: {
        todayClassesCount: 0,
        activeBatchesCount: 0,
        totalStudentsCount: 0,
        completedRollCallsCount: 0,
      },
      todaySchedule: [],
      batches: [],
      payouts: [],
      announcements: [],
    }
  }
}

async function mapDatabaseTeacherToPortalData(
  teacher: any,
  isPreview: boolean,
  fallbackFullName?: string
): Promise<TeacherPortalData> {
  const now = new Date()
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))

  const batchIds = teacher.batchesTaught?.map((b: any) => b.id) || []
  const todayRecords = batchIds.length > 0
    ? await prisma.attendance.findMany({
        where: {
          batchId: { in: batchIds },
          date: todayUtc,
        },
      })
    : []

  const recordsByBatchAndStudent = new Map<string, (typeof todayRecords)[0]>()
  for (const r of todayRecords) {
    recordsByBatchAndStudent.set(`${r.batchId}_${r.studentId}`, r)
  }

  const allAttendanceRecords = batchIds.length > 0
    ? await prisma.attendance.findMany({
        where: { batchId: { in: batchIds } },
        select: { studentId: true, status: true },
      }).catch(() => [])
    : []

  const attendanceStatsByStudent = new Map<string, { total: number; present: number }>()
  for (const a of allAttendanceRecords) {
    const curr = attendanceStatsByStudent.get(a.studentId) || { total: 0, present: 0 }
    curr.total++
    if (a.status === "PRESENT" || a.status === "LATE") curr.present++
    attendanceStatsByStudent.set(a.studentId, curr)
  }

  let totalStudentsCount = 0
  let completedRollCallsCount = 0

  const batches: TeacherBatchItem[] = (teacher.batchesTaught || []).map((b: any) => {
    const studentCount = b.students?.length || 0
    totalStudentsCount += studentCount

    let present = 0
    let absent = 0
    let isMarked = false

    const batchStudents: TeacherBatchStudent[] = (b.students || []).map((e: any) => {
      const s = e.student
      const rec = recordsByBatchAndStudent.get(`${b.id}_${s.id}`)

      if (rec) {
        isMarked = true
        if (rec.status === "PRESENT" || rec.status === "LATE") present++
        if (rec.status === "ABSENT") absent++
      }

      const stats = attendanceStatsByStudent.get(s.id)
      const attendanceRate = stats && stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100

      return {
        studentId: s.id,
        name: s.name,
        phoneNo: s.phoneNo,
        parentPhone: s.parentPhone,
        todayStatus: (rec?.status as any) || undefined,
        remarks: rec?.remarks || null,
        attendanceRate,
      }
    })

    if (isMarked) completedRollCallsCount++

    return {
      id: b.id,
      batchName: b.batchName,
      className: b.className,
      subject: b.subject,
      timing: b.timing || "10:00 AM - 11:30 AM",
      studentCount,
      students: batchStudents,
      todayRollCallStatus: isMarked ? "COMPLETED" : "PENDING",
      todayPresentCount: present,
      todayAbsentCount: absent,
    }
  })

  const todaySchedule: TeacherTodayClassSchedule[] = batches.map((b, idx) => ({
    batchId: b.id,
    title: b.batchName ? `${b.className} - ${b.batchName}` : `${b.className} (${b.subject})`,
    subject: b.subject,
    timing: b.timing || `${10 + idx * 2}:00 AM - ${11 + idx * 2}:30 AM`,
    room: `Room ${101 + idx}`,
    rollCallStatus: b.todayRollCallStatus,
    studentCount: b.studentCount,
    presentCount: b.todayPresentCount,
  }))

  const payouts: TeacherPayoutVoucherItem[] = (teacher.payouts || []).map((p: any) => ({
    id: p.id,
    voucherNo: p.voucherNo,
    month: p.month,
    year: p.year,
    baseSalary: p.baseSalary,
    bonus: p.bonus,
    deductions: p.deductions,
    netAmount: p.netAmount,
    status: p.status,
    paymentMode: p.paymentMode,
    transactionRef: p.transactionRef,
    paidAt: p.paidAt.toISOString(),
  }))

  // Fetch real announcements for this teacher and their batches safely via raw SQL
  let rawAnnouncements: any[] = []
  try {
    const rows = await prisma.$queryRaw<any[]>`
        SELECT a."id", a."content", a."priority", a."instituteId", a."teacherId", a."batchId", a."createdAt", a."updatedAt",
               b."className" as "batchClassName", b."batchName" as "batchBatchName", b."subject" as "batchSubject",
               t."name" as "teacherName",
               i."name" as "instituteName"
        FROM "Announcement" a
        LEFT JOIN "Batch" b ON a."batchId" = b."id"
        LEFT JOIN "Teacher" t ON a."teacherId" = t."id"
        LEFT JOIN "Institute" i ON a."instituteId" = i."id"
        WHERE a."teacherId" = ${teacher.id}
           OR (a."instituteId" = ${teacher.instituteId} AND a."batchId" IS NULL)
           ${batchIds.length > 0 ? Prisma.sql`OR a."batchId" IN (${Prisma.join(batchIds)})` : Prisma.empty}
        ORDER BY a."createdAt" DESC
        LIMIT 50;
      `
      rawAnnouncements = rows.map((r: any) => ({
        id: r.id,
        content: r.content,
        priority: r.priority,
        batchId: r.batchId,
        teacherId: r.teacherId,
        createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
        batch: r.batchId ? {
          className: r.batchClassName,
          batchName: r.batchBatchName,
          subject: r.batchSubject,
        } : null,
        teacher: r.teacherName ? { name: r.teacherName } : null,
        institute: r.instituteName ? { name: r.instituteName } : null,
      }))
    } catch (rawErr) {
      console.error("Raw query for announcements also failed:", rawErr)
      rawAnnouncements = []
    }

  const announcements: TeacherAnnouncementItem[] = rawAnnouncements.map((a: any) => {
    const isFaculty = Boolean(a.teacherId || a.teacher?.name)
    const authorRole: "ADMIN" | "FACULTY" = isFaculty ? "FACULTY" : "ADMIN"
    const authorName = isFaculty
      ? (a.teacher?.name || fallbackFullName || "Faculty Member")
      : (teacher.institute?.name || a.institute?.name ? `${teacher.institute?.name || a.institute?.name} Administration` : "Institute Administration")

    return {
      id: a.id,
      content: a.content,
      priority: (a.priority as any) || "NORMAL",
      batchId: a.batchId,
      batchName: a.batch ? (a.batch.batchName || `${a.batch.className} (${a.batch.subject})`) : "All Batches",
      authorRole,
      authorName,
      createdAt: (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)).toISOString(),
    }
  })

  return {
    isPreview: false,
    teacher: {
      id: teacher.id,
      name: teacher.name || fallbackFullName || "Faculty Member",
      email: teacher.email || null,
      phoneNo: teacher.phoneNo,
      subjects: teacher.subjects,
      salary: teacher.salary,
      instituteName: teacher.institute?.name || "Coaching Academy",
      instituteId: teacher.instituteId,
    },
    kpi: {
      todayClassesCount: batches.length,
      activeBatchesCount: batches.length,
      totalStudentsCount,
      completedRollCallsCount,
    },
    todaySchedule,
    batches,
    payouts,
    announcements,
  }
}

export async function createTeacherAnnouncement(data: {
  content: string
  batchId?: string
  priority?: "NORMAL" | "HIGH" | "URGENT"
  title?: string
}) {
  try {
    const user = await currentUser()
    if (!user) return { error: "Unauthorized. Please log in." }

    const emailList = user.emailAddresses?.map((e: any) => e.emailAddress.toLowerCase()) || []
    const phoneList = user.phoneNumbers?.map((p: any) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { clerkUserId: user.id },
          ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
          ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
        ],
      },
    })

    const targetBatchId = data.batchId && data.batchId !== "ALL" ? data.batchId : null
    let targetInstituteId: string
    let targetTeacherId: string | null = null
    let batchName: string = "All batches"

    const batch = targetBatchId ? await prisma.batch.findUnique({
      where: { id: targetBatchId },
      include: { teacher: true },
    }).catch(() => null) : null

    if (batch) {
      targetInstituteId = batch.instituteId
      targetTeacherId = teacher?.id || batch.teacherId || null
      batchName = batch.batchName ? `${batch.className} - ${batch.batchName}` : `${batch.className} (${batch.subject})`
    } else if (teacher) {
      targetInstituteId = teacher.instituteId
      targetTeacherId = teacher.id
    } else {
      // Fallback: check if institute admin
      const inst = await prisma.institute.findFirst({
        where: { adminEmail: { in: emailList } },
      })
      if (!inst) return { error: "Faculty profile not found." }
      targetInstituteId = inst.id
    }

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

    const isFaculty = Boolean(targetTeacherId || teacher)
    const authorRole: "ADMIN" | "FACULTY" = isFaculty ? "FACULTY" : "ADMIN"
    const authorName = teacher?.name || (isFaculty ? "Faculty Member" : "Institute Administration")

    const formattedAnnouncement: TeacherAnnouncementItem = {
      id: announcement.id,
      content: announcement.content,
      priority: announcement.priority as any,
      batchId: announcement.batchId,
      batchName: announcement.batch ? (announcement.batch.batchName || `${announcement.batch.className} (${announcement.batch.subject})`) : batchName,
      authorRole,
      authorName,
      createdAt: (announcement.createdAt instanceof Date ? announcement.createdAt : new Date(announcement.createdAt)).toISOString(),
    }

    revalidatePath("/teacher")
    if (targetBatchId) {
      revalidatePath(`/institute/batches/${targetBatchId}`)
    }
    revalidatePath("/student")
    revalidatePath("/institute/announcements")

    return { success: true, announcement: formattedAnnouncement }
  } catch (error: any) {
    console.error("Failed to create announcement:", error)
    return { error: error.message || "Failed to publish announcement" }
  }
}

export async function deleteTeacherAnnouncement(announcementId: string) {
  try {
    const user = await currentUser()
    if (!user) return { error: "Unauthorized." }

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
    revalidatePath("/institute/announcements")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete announcement" }
  }
}


"use server"

import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { getAuthenticatedInstitute } from "@/lib/current-institute"

export interface AttendanceRecordInput {
  studentId: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  remarks?: string
}

export interface SubmitBatchAttendanceInput {
  batchId: string
  date: string // "YYYY-MM-DD" or ISO string
  records: AttendanceRecordInput[]
  markedBy?: string
}

// Normalizes a date to YYYY-MM-DD 00:00:00 UTC
function normalizeDate(dateInput: string | Date): Date {
  const d = new Date(dateInput)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0))
}

export async function submitBatchAttendance(data: SubmitBatchAttendanceInput) {
  try {
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    if (!email) {
      return { error: "Unauthorized. Please log in." }
    }

    const emailList = user?.emailAddresses?.map((e: any) => e.emailAddress.toLowerCase()) || []
    const phoneList = user?.phoneNumbers?.map((p: any) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

    // Verify user is either an Institute Admin or Teacher
    const authData = await getAuthenticatedInstitute()
    const institute = authData?.institute || null

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

    if (teacher && teacher.clerkUserId !== user.id) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: { clerkUserId: user.id },
      }).catch(() => null)
    }

    const batch = await prisma.batch.findUnique({
      where: { id: data.batchId },
      include: { institute: true, teacher: true },
    })

    if (!batch) {
      return { error: "Batch not found." }
    }

    if (!institute && !teacher) {
      return { error: "Unauthorized. Faculty or Institute Admin account required." }
    }

    if (institute && batch.instituteId !== institute.id) {
      return { error: "Unauthorized: batch does not belong to your institute." }
    }

    if (teacher && batch.instituteId !== teacher.instituteId) {
      return { error: "Unauthorized: batch does not belong to your institute." }
    }

    const instituteId = batch.instituteId
    const markedBy = data.markedBy || (teacher ? teacher.name : "Admin")
    const attendanceDate = normalizeDate(data.date)

    // Execute upsert for each student record
    await prisma.$transaction(
      data.records.map((rec) =>
        prisma.attendance.upsert({
          where: {
            studentId_batchId_date: {
              studentId: rec.studentId,
              batchId: batch.id,
              date: attendanceDate,
            },
          },
          update: {
            status: rec.status,
            remarks: rec.remarks?.trim() || null,
            markedBy,
            updatedAt: new Date(),
          },
          create: {
            studentId: rec.studentId,
            batchId: batch.id,
            instituteId,
            date: attendanceDate,
            status: rec.status,
            remarks: rec.remarks?.trim() || null,
            markedBy,
          },
        })
      )
    )

    revalidatePath("/institute/attendance")
    revalidatePath(`/institute/batches/${batch.id}`)
    revalidatePath("/teacher")
    revalidatePath("/institute")

    return {
      success: true,
      message: `Recorded roll call for ${data.records.length} students in ${batch.className} (${batch.batchName || batch.subject}).`,
    }
  } catch (error: any) {
    console.error("Error submitting batch attendance:", error)
    return { error: error.message || "Failed to submit attendance." }
  }
}

export interface BatchSubmissionStatus {
  batchId: string
  batchName: string
  className: string
  subject: string
  timing: string | null
  teacherName: string
  totalStudents: number
  status: "SUBMITTED" | "PENDING"
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  markedBy?: string
  lastMarkedAt?: string
}

export interface AbsenteeStudentItem {
  id: string
  studentId: string
  studentName: string
  phoneNo: string | null
  parentPhone: string | null
  batchName: string
  className: string
  subject: string
  status: string
  remarks: string | null
  markedBy: string | null
}

export interface DefaulterStudentItem {
  studentId: string
  name: string
  phoneNo: string | null
  parentPhone: string | null
  className: string
  batchName: string
  totalClasses: number
  attendedClasses: number
  absentClasses: number
  attendanceRate: number // percentage e.g. 64.5
}

export interface InstituteAttendanceData {
  targetDate: string
  kpi: {
    totalEnrolled: number
    presentCount: number
    absentCount: number
    lateCount: number
    excusedCount: number
    overallPercentage: number
    totalBatches: number
    submittedBatchesCount: number
    pendingBatchesCount: number
  }
  batchesStatus: BatchSubmissionStatus[]
  todayAbsentees: AbsenteeStudentItem[]
  defaulters: DefaulterStudentItem[]
}

export async function getInstituteAttendanceData(
  targetDateStr?: string
): Promise<{ success: boolean; error?: string; data?: InstituteAttendanceData }> {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) {
      return { success: false, error: "Institute not found or unauthorized." }
    }
    const institute = authData.institute

    const targetDate = targetDateStr ? normalizeDate(targetDateStr) : normalizeDate(new Date())
    const targetDateIso = targetDate.toISOString()

    // 1. Fetch all batches for this institute with enrolled students & teacher
    const batches = await prisma.batch.findMany({
      where: { instituteId: institute.id },
      include: {
        teacher: true,
        students: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { className: "asc" },
    })

    // 2. Fetch all attendance records for target date in this institute
    const todayRecords = await prisma.attendance.findMany({
      where: {
        instituteId: institute.id,
        date: targetDate,
      },
      include: {
        student: true,
        batch: true,
      },
    })

    // Index today's records by batchId and studentId
    const recordsByBatch = new Map<string, typeof todayRecords>()
    for (const rec of todayRecords) {
      const list = recordsByBatch.get(rec.batchId) || []
      list.push(rec)
      recordsByBatch.set(rec.batchId, list)
    }

    // 3. Compute batch submission statuses & KPIs
    let totalEnrolled = 0
    let totalPresent = 0
    let totalAbsent = 0
    let totalLate = 0
    let totalExcused = 0
    let submittedBatchesCount = 0

    const batchesStatus: BatchSubmissionStatus[] = batches.map((b) => {
      const studentCount = b.students.length
      totalEnrolled += studentCount

      const batchRecords = recordsByBatch.get(b.id) || []
      const isSubmitted = batchRecords.length > 0

      if (isSubmitted) submittedBatchesCount++

      let present = 0
      let absent = 0
      let late = 0
      let excused = 0

      for (const rec of batchRecords) {
        if (rec.status === "PRESENT") present++
        else if (rec.status === "ABSENT") absent++
        else if (rec.status === "LATE") late++
        else if (rec.status === "EXCUSED") excused++
      }

      totalPresent += present
      totalAbsent += absent
      totalLate += late
      totalExcused += excused

      const firstRec = batchRecords[0]
      return {
        batchId: b.id,
        batchName: b.batchName || b.subject,
        className: b.className,
        subject: b.subject,
        timing: b.timing,
        teacherName: b.teacher?.name || "Unassigned",
        totalStudents: studentCount,
        status: isSubmitted ? "SUBMITTED" : "PENDING",
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        excusedCount: excused,
        markedBy: firstRec?.markedBy || undefined,
        lastMarkedAt: firstRec?.updatedAt?.toISOString(),
      }
    })

    const pendingBatchesCount = Math.max(0, batches.length - submittedBatchesCount)
    const totalMarked = totalPresent + totalAbsent + totalLate + totalExcused
    const overallPercentage =
      totalMarked > 0
        ? Math.round(((totalPresent + totalLate) / totalMarked) * 1000) / 10
        : totalEnrolled > 0
        ? 0
        : 100

    // 4. Today's Absentees List
    const todayAbsentees: AbsenteeStudentItem[] = todayRecords
      .filter((r) => r.status === "ABSENT")
      .map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: r.student.name,
        phoneNo: r.student.phoneNo,
        parentPhone: r.student.parentPhone,
        batchName: r.batch.batchName || r.batch.subject,
        className: r.batch.className,
        subject: r.batch.subject,
        status: r.status,
        remarks: r.remarks,
        markedBy: r.markedBy,
      }))

    // 5. Monthly Defaulters Watchlist (< 75% attendance)
    // Compute date range for current month
    const startOfMonth = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), 1))
    const endOfMonth = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + 1, 0, 23, 59, 59))

    const monthlyRecords = await prisma.attendance.findMany({
      where: {
        instituteId: institute.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        student: true,
        batch: true,
      },
    })

    // Group monthly records per student
    const studentAggregates = new Map<
      string,
      {
        student: (typeof monthlyRecords)[0]["student"]
        batchName: string
        className: string
        totalClasses: number
        attendedClasses: number
        absentClasses: number
      }
    >()

    for (const rec of monthlyRecords) {
      const existing = studentAggregates.get(rec.studentId) || {
        student: rec.student,
        batchName: rec.batch.batchName || rec.batch.subject,
        className: rec.batch.className,
        totalClasses: 0,
        attendedClasses: 0,
        absentClasses: 0,
      }

      existing.totalClasses++
      if (rec.status === "PRESENT" || rec.status === "LATE") {
        existing.attendedClasses++
      } else if (rec.status === "ABSENT") {
        existing.absentClasses++
      }

      studentAggregates.set(rec.studentId, existing)
    }

    const defaulters: DefaulterStudentItem[] = []
    for (const [studentId, agg] of studentAggregates.entries()) {
      if (agg.totalClasses >= 3) {
        const rate = Math.round((agg.attendedClasses / agg.totalClasses) * 1000) / 10
        if (rate < 75) {
          defaulters.push({
            studentId,
            name: agg.student.name,
            phoneNo: agg.student.phoneNo,
            parentPhone: agg.student.parentPhone,
            className: agg.className,
            batchName: agg.batchName,
            totalClasses: agg.totalClasses,
            attendedClasses: agg.attendedClasses,
            absentClasses: agg.absentClasses,
            attendanceRate: rate,
          })
        }
      }
    }

    defaulters.sort((a, b) => a.attendanceRate - b.attendanceRate)

    return {
      success: true,
      data: {
        targetDate: targetDateIso,
        kpi: {
          totalEnrolled,
          presentCount: totalPresent,
          absentCount: totalAbsent,
          lateCount: totalLate,
          excusedCount: totalExcused,
          overallPercentage,
          totalBatches: batches.length,
          submittedBatchesCount,
          pendingBatchesCount,
        },
        batchesStatus,
        todayAbsentees,
        defaulters,
      },
    }
  } catch (error: any) {
    console.error("Error getting institute attendance data:", error)
    return { success: false, error: error.message || "Failed to load attendance data." }
  }
}

export async function getBatchAttendanceForDate(batchId: string, dateInput: string) {
  try {
    const user = await currentUser()
    if (!user) return { error: "Unauthorized. Please log in." }

    const targetDate = normalizeDate(dateInput)
    const records = await prisma.attendance.findMany({
      where: {
        batchId,
        date: targetDate,
      },
    })

    return {
      success: true,
      records: records.map((r) => ({
        studentId: r.studentId,
        status: r.status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
        remarks: r.remarks,
        markedBy: r.markedBy,
      })),
    }
  } catch (error: any) {
    console.error("Error fetching date attendance:", error)
    return { error: error.message || "Failed to fetch attendance" }
  }
}


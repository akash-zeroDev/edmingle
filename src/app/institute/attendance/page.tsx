import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { getInstituteAttendanceData } from "@/actions/attendance"
import { AttendanceDashboardView } from "./components/attendance-dashboard-view"
import type { RollCallBatchOption } from "./components/admin-roll-call-sheet"

interface AttendancePageProps {
  searchParams: Promise<{
    date?: string
  }>
}

export default async function InstituteAttendancePage({
  searchParams,
}: AttendancePageProps) {
  const authData = await getAuthenticatedInstitute()
  if (!authData?.institute) redirect("/onboarding")
  const institute = authData.institute

  const resolvedParams = await searchParams
  const targetDateStr = resolvedParams.date || undefined

  // 1. Fetch metrics & attendance data
  const result = await getInstituteAttendanceData(targetDateStr)
  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        Failed to load attendance data. Please try again.
      </div>
    )
  }

  // 2. Fetch full batch enrollments for the Roll-Call sheet
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

  // Normalize date for matching existing records in the roll call sheet
  const targetDateObj = new Date(result.data.targetDate)
  const existingRecords = await prisma.attendance.findMany({
    where: {
      instituteId: institute.id,
      date: targetDateObj,
    },
  })

  const existingByBatchAndStudent = new Map<string, (typeof existingRecords)[0]>()
  for (const r of existingRecords) {
    existingByBatchAndStudent.set(`${r.batchId}_${r.studentId}`, r)
  }

  const batchesForRollCall: RollCallBatchOption[] = batches.map((b) => ({
    id: b.id,
    label: b.batchName || b.subject,
    className: b.className,
    subject: b.subject,
    teacherName: b.teacher?.name || "Unassigned",
    students: b.students.map((e) => {
      const rec = existingByBatchAndStudent.get(`${b.id}_${e.student.id}`)
      return {
        studentId: e.student.id,
        name: e.student.name,
        phoneNo: e.student.phoneNo,
        parentPhone: e.student.parentPhone,
        currentStatus: (rec?.status as any) || undefined,
        remarks: rec?.remarks || undefined,
      }
    }),
  }))

  return (
    <AttendanceDashboardView
      instituteName={institute.name}
      initialData={result.data}
      batchesForRollCall={batchesForRollCall}
    />
  )
}

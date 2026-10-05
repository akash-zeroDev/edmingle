"use client"

import React, { useState, useEffect, useTransition, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
  Layers3,
  IndianRupee,
  Receipt,
  RotateCcw,
  Save,
  GraduationCap,
  ArrowRight,
  Megaphone,
  Printer,
  Check,
  X,
  Send,
  Trash2,
  AlertCircle,
  Plus,
  BookOpen,
  ShieldCheck,
  Filter,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { DataTableCard } from "@/components/ui/data-table-card"
import { CustomSelect } from "@/components/ui/custom-select"
import {
  SalarySlipModal,
  type SalarySlipData,
} from "@/app/institute/payroll/components/salary-slip-modal"
import { submitBatchAttendance, getBatchAttendanceForDate } from "@/actions/attendance"
import {
  createTeacherAnnouncement,
  deleteTeacherAnnouncement,
  type TeacherPortalData,
  type TeacherAnnouncementItem,
} from "@/actions/teacher"
import { ChannelAnnouncementsWorkspace } from "@/components/announcements/channel-announcements-workspace"
import { TeacherSettingsTab } from "./teacher-settings-tab"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface TeacherPortalWorkspaceProps {
  portalData: TeacherPortalData
}

type StatusType = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"

export function TeacherPortalWorkspace({
  portalData,
}: TeacherPortalWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { teacher, kpi, todaySchedule, batches, payouts, announcements: initialAnnouncements = [] } = portalData

  // Read active section from query param (?tab=...)
  const activeTab = searchParams.get("tab") || "overview"

  // Roll-Call Attendance state
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches[0]?.id || ""
  )
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  )

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0]

  const [rosterStatus, setRosterStatus] = useState<Record<string, StatusType>>(() => {
    const map: Record<string, StatusType> = {}
    activeBatch?.students.forEach((s) => {
      map[s.studentId] = s.todayStatus || "PRESENT"
    })
    return map
  })

  const [rosterRemarks, setRosterRemarks] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    activeBatch?.students.forEach((s) => {
      if (s.remarks) map[s.studentId] = s.remarks
    })
    return map
  })

  const [isPending, startTransition] = useTransition()
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null)

  // Announcements state
  const [announcements, setAnnouncements] = useState<TeacherAnnouncementItem[]>(initialAnnouncements)

  useEffect(() => {
    setAnnouncements(initialAnnouncements)
  }, [initialAnnouncements])


  // Salary Slip Modal state
  const [slipModalOpen, setSlipModalOpen] = useState(false)
  const [activeSlip, setActiveSlip] = useState<SalarySlipData | null>(null)
  const [isLoadingDateRecords, setIsLoadingDateRecords] = useState(false)

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate)
    setSaveSuccessMsg(null)
    setSaveErrorMsg(null)
    if (!activeBatch) return

    setIsLoadingDateRecords(true)
    try {
      const res = await getBatchAttendanceForDate(activeBatch.id, newDate)
      if (res.success && res.records && res.records.length > 0) {
        const statusMap: Record<string, StatusType> = {}
        const remarksMap: Record<string, string> = {}
        res.records.forEach((r) => {
          statusMap[r.studentId] = r.status
          if (r.remarks) remarksMap[r.studentId] = r.remarks
        })
        activeBatch.students.forEach((s) => {
          if (!statusMap[s.studentId]) statusMap[s.studentId] = "PRESENT"
        })
        setRosterStatus(statusMap)
        setRosterRemarks(remarksMap)
      } else {
        const statusMap: Record<string, StatusType> = {}
        activeBatch.students.forEach((s) => {
          statusMap[s.studentId] = "PRESENT"
        })
        setRosterStatus(statusMap)
        setRosterRemarks({})
      }
    } catch (e) {
      console.error("Error loading date attendance:", e)
    } finally {
      setIsLoadingDateRecords(false)
    }
  }

  const handleBatchSelect = async (batchId: string) => {
    setSelectedBatchId(batchId)
    const target = batches.find((b) => b.id === batchId)
    if (!target) return
    setSaveSuccessMsg(null)
    setSaveErrorMsg(null)

    setIsLoadingDateRecords(true)
    try {
      const res = await getBatchAttendanceForDate(batchId, selectedDate)
      if (res.success && res.records && res.records.length > 0) {
        const statusMap: Record<string, StatusType> = {}
        const remarksMap: Record<string, string> = {}
        res.records.forEach((r) => {
          statusMap[r.studentId] = r.status
          if (r.remarks) remarksMap[r.studentId] = r.remarks
        })
        target.students.forEach((s) => {
          if (!statusMap[s.studentId]) statusMap[s.studentId] = "PRESENT"
        })
        setRosterStatus(statusMap)
        setRosterRemarks(remarksMap)
      } else {
        const newStatusMap: Record<string, StatusType> = {}
        const newRemarksMap: Record<string, string> = {}
        target.students.forEach((s) => {
          newStatusMap[s.studentId] = s.todayStatus || "PRESENT"
          if (s.remarks) newRemarksMap[s.studentId] = s.remarks
        })
        setRosterStatus(newStatusMap)
        setRosterRemarks(newRemarksMap)
      }
    } catch {
      const newStatusMap: Record<string, StatusType> = {}
      const newRemarksMap: Record<string, string> = {}
      target.students.forEach((s) => {
        newStatusMap[s.studentId] = s.todayStatus || "PRESENT"
        if (s.remarks) newRemarksMap[s.studentId] = s.remarks
      })
      setRosterStatus(newStatusMap)
      setRosterRemarks(newRemarksMap)
    } finally {
      setIsLoadingDateRecords(false)
    }
  }

  const handleSetStudentStatus = (studentId: string, status: StatusType) => {
    setRosterStatus((prev) => ({ ...prev, [studentId]: status }))
    setSaveSuccessMsg(null)
  }

  const handleSetStudentRemark = (studentId: string, text: string) => {
    setRosterRemarks((prev) => ({ ...prev, [studentId]: text }))
  }

  const handleMarkAllPresent = () => {
    if (!activeBatch) return
    const newMap: Record<string, StatusType> = {}
    activeBatch.students.forEach((s) => {
      newMap[s.studentId] = "PRESENT"
    })
    setRosterStatus(newMap)
    setSaveSuccessMsg(null)
  }

  const handleResetRoster = () => {
    if (!activeBatch) return
    const newMap: Record<string, StatusType> = {}
    activeBatch.students.forEach((s) => {
      newMap[s.studentId] = s.todayStatus || "PRESENT"
    })
    setRosterStatus(newMap)
    setSaveSuccessMsg(null)
    setSaveErrorMsg(null)
  }

  const handleSubmitRollCall = () => {
    if (!activeBatch) return
    setSaveSuccessMsg(null)
    setSaveErrorMsg(null)

    const payload = activeBatch.students.map((s) => ({
      studentId: s.studentId,
      status: rosterStatus[s.studentId] || "PRESENT",
      remarks: rosterRemarks[s.studentId] || undefined,
    }))

    startTransition(async () => {
      try {
        const res = await submitBatchAttendance({
          batchId: activeBatch.id,
          date: selectedDate,
          records: payload,
        })

        if (res.error) {
          setSaveErrorMsg(res.error)
          toast({ variant: "destructive", title: "Failed to save attendance", description: res.error })
        } else {
          setSaveSuccessMsg(`Attendance saved for ${activeBatch.className} (${payload.length} students).`)
          toast({ title: "Attendance saved", description: `${activeBatch.className} attendance saved.` })
          router.refresh()
        }
      } catch (err: any) {
        setSaveErrorMsg(err.message || "Failed to submit attendance")
        toast({ variant: "destructive", title: "Error", description: "Something went wrong." })
      }
    })
  }

  const handleTakeAttendanceFromSchedule = (batchId: string) => {
    handleBatchSelect(batchId)
    router.push("/teacher?tab=attendance")
  }

  const handleViewPayslip = (p: (typeof payouts)[0]) => {
    setActiveSlip({
      voucherNo: p.voucherNo,
      teacherName: teacher.name,
      teacherPhone: teacher.phoneNo,
      month: p.month,
      year: p.year,
      baseSalary: p.baseSalary,
      bonus: p.bonus,
      deductions: p.deductions,
      netAmount: p.netAmount,
      paymentMode: p.paymentMode,
      transactionRef: p.transactionRef,
      paidAt: p.paidAt,
      instituteName: teacher.instituteName,
    })
    setSlipModalOpen(true)
  }


  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: `${b.className} - ${b.batchName || b.subject} (${b.studentCount} students)`,
  }))





  const presentCount = Object.values(rosterStatus).filter((s) => s === "PRESENT").length
  const absentCount = Object.values(rosterStatus).filter((s) => s === "ABSENT").length
  const lateCount = Object.values(rosterStatus).filter((s) => s === "LATE").length
  const excusedCount = Object.values(rosterStatus).filter((s) => s === "EXCUSED").length
  const totalCount = activeBatch?.students.length || 0

  // Initials for avatar
  const initials = teacher.name ? teacher.name.substring(0, 2).toUpperCase() : "FA"

  // First pending batch
  const firstPendingSchedule = todaySchedule.find((s) => s.rollCallStatus === "PENDING")

  return (
    <div className={cn("min-w-0 w-full", activeTab === "announcements" ? "flex-1 flex flex-col min-h-0" : "space-y-6")}>

      {/* =========================================================================
          EMPTY STATE (If Teacher has 0 Batches Assigned)
         ========================================================================= */}
      {batches.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center max-w-xl mx-auto my-8">
          <div className="size-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
            <Layers3 className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No batches assigned</h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            You have not been assigned to any batches yet. Contact your institute administrator.
          </p>
        </div>
      )}

      {/* =========================================================================
          SECTION: OVERVIEW (Default Workspace View)
         ========================================================================= */}
      {activeTab === "overview" && batches.length > 0 && (
        <div className="space-y-6">
          {/* Faculty Profile & Daily Briefing Ribbon (Exclusively on Overview Dashboard) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Faculty Credentials & Live Status */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="size-12 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                      {teacher.name}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                    {teacher.email && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {teacher.email}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-foreground">{teacher.subjects || "Teacher"}</span>
                    <span>,</span>
                    <span>{teacher.instituteName}</span>
                  </p>
                </div>
              </div>

              {/* Action-Oriented Daily Progress Ribbon */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Roll-Call Progress Chip */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-muted/30 text-xs">
                  <CheckCircle2
                    className={cn(
                      "size-4 shrink-0",
                      batches.length > 0 && kpi.completedRollCallsCount === batches.length
                        ? "text-emerald-600"
                        : "text-amber-600"
                    )}
                  />
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
                      Today&apos;s attendance
                    </span>
                    <span className="font-bold text-foreground">
                      {batches.length === 0
                        ? "No batches"
                        : `${kpi.completedRollCallsCount} of ${batches.length} marked`}
                    </span>
                  </div>
                </div>

                {/* Teaching Load Chip */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-muted/30 text-xs">
                  <Users className="size-4 shrink-0 text-primary" />
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground">
                      Assigned batches
                    </span>
                    <span className="font-bold text-foreground">
                      {batches.length} {batches.length === 1 ? "batch" : "batches"}, {kpi.totalStudentsCount} students
                    </span>
                  </div>
                </div>

                {/* Quick Action Button */}
                {firstPendingSchedule ? (
                  <Button
                    onClick={() => handleTakeAttendanceFromSchedule(firstPendingSchedule.batchId)}
                    className="h-10 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
                  >
                    Take attendance
                  </Button>
                ) : batches.length > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/teacher?tab=attendance")}
                    className="h-10 px-4 rounded-xl text-xs font-semibold border-border cursor-pointer"
                  >
                    View attendance
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Today's Schedule Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-wider">
                  Today&apos;s schedule
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/teacher?tab=attendance")}
                className="text-xs h-8 border-border"
              >
                Take attendance
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {todaySchedule.map((cls) => {
                const isCompleted = cls.rollCallStatus === "COMPLETED"

                return (
                  <div
                    key={cls.batchId}
                    className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground border border-border">
                          {cls.timing}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {cls.room}
                        </span>
                      </div>

                      <h4 className="font-semibold text-sm text-foreground">
                        {cls.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {cls.subject}, {cls.studentCount} students
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          <span>Marked ({cls.presentCount}/{cls.studentCount} P)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                          <Clock className="size-3.5 text-amber-600" />
                          <span>Pending</span>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => handleTakeAttendanceFromSchedule(cls.batchId)}
                        className={
                          isCompleted
                            ? "h-7 px-2.5 text-xs rounded-lg"
                            : "h-7 px-2.5 text-xs rounded-lg bg-primary hover:bg-primary-hover text-white"
                        }
                      >
                        {isCompleted ? "Edit attendance" : "Take attendance"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Notice Preview on Overview */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 text-primary" />
                <h4 className="font-bold text-sm text-foreground">Announcements</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/teacher?tab=announcements")}
                className="text-xs h-7 text-primary hover:bg-primary-light"
              >
                View all ({announcements.length})
              </Button>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3">
                No announcements yet.
              </p>
            ) : (
              <div className="space-y-2">
                {announcements.slice(0, 2).map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-muted/40 border border-border text-xs flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-light text-primary font-medium">
                          {a.batchName || "All batches"}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          a.priority === "URGENT" ? "text-rose-600" :
                          a.priority === "HIGH" ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-foreground text-xs line-clamp-2 leading-relaxed">{a.content}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: TAKE ATTENDANCE (Roll-Call Grid)
         ========================================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-5">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Attendance
              </h1>
            </div>
            {batches.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-foreground border border-border">
                  {batches.length} {batches.length === 1 ? "batch" : "batches"}
                </span>
              </div>
            )}
          </div>

          {batches.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No batches assigned. Please contact your institute admin.
            </div>
          ) : (
            <>
              {/* Controls Strip */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card">
                {/* Batch & Date Picker */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
                  <div className="w-full sm:w-72">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Batch
                    </label>
                    <CustomSelect
                      options={batchOptions}
                      value={selectedBatchId}
                      onChange={handleBatchSelect}
                      placeholder="Select batch..."
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Date
                      </label>
                      {isLoadingDateRecords && (
                        <span className="text-[10px] text-primary animate-pulse font-medium">Loading...</span>
                      )}
                    </div>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      disabled={isLoadingDateRecords}
                      className="h-9 text-xs rounded-lg border-border"
                    />
                  </div>
                </div>

                {/* Fast Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllPresent}
                    className="h-9 px-3 text-xs rounded-lg border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/50 font-medium cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
                    Mark all present
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetRoster}
                    className="h-9 px-3 text-xs rounded-lg border-border cursor-pointer"
                  >
                    <RotateCcw className="size-3.5 mr-1" />
                    Reset
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmitRollCall}
                    disabled={isPending}
                    className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
                  >
                    <Save className="size-3.5 mr-1.5" />
                    {isPending ? "Saving..." : "Save attendance"}
                  </Button>
                </div>
              </div>

              {/* Status Alert Messages */}
              {saveSuccessMsg && (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                  <button type="button" onClick={() => setSaveSuccessMsg(null)} className="cursor-pointer text-emerald-700">
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              {saveErrorMsg && (
                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-rose-600" />
                    <span>{saveErrorMsg}</span>
                  </div>
                  <button type="button" onClick={() => setSaveErrorMsg(null)} className="cursor-pointer text-rose-700">
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              {/* Roster Table Card */}
              {activeBatch && (
                <DataTableCard
                  title={`${activeBatch.className} (${activeBatch.batchName || activeBatch.subject})`}
                  action={
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="text-emerald-700">{presentCount} Present</span>
                      <span className="text-rose-700">{absentCount} Absent</span>
                      <span className="text-amber-700">{lateCount} Late</span>
                      <span className="text-blue-700">{excusedCount} Excused</span>
                    </div>
                  }
                >
                  <Table className="table-fixed w-full border-collapse">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[30%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                          Student
                        </TableHead>
                        <TableHead className="w-[20%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                          Phone
                        </TableHead>
                        <TableHead className="w-[26%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                          Status
                        </TableHead>
                        <TableHead className="w-[24%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                          Remarks
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBatch.students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-12 text-center text-xs text-muted-foreground">
                            No students enrolled in this batch.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeBatch.students.map((student) => {
                          const currentStatus = rosterStatus[student.studentId] || "PRESENT"

                          return (
                            <TableRow key={student.studentId} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                                <div className="flex items-center gap-2.5">
                                  <div className="size-6 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {student.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <div className="font-semibold text-foreground truncate">
                                      {student.name}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                      Attendance: {student.attendanceRate}%
                                    </div>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="px-2.5 py-2.5 text-xs text-muted-foreground border-b border-border truncate font-mono">
                                {student.phoneNo || student.parentPhone || "—"}
                              </TableCell>

                              <TableCell className="px-2.5 py-2.5 border-b border-border">
                                <div className="flex items-center gap-1.5">
                                  {(
                                    [
                                      { key: "PRESENT", label: "P", color: "bg-emerald-600 text-white border-emerald-600" },
                                      { key: "ABSENT", label: "A", color: "bg-rose-600 text-white border-rose-600" },
                                      { key: "LATE", label: "L", color: "bg-amber-600 text-white border-amber-600" },
                                      { key: "EXCUSED", label: "E", color: "bg-blue-600 text-white border-blue-600" },
                                    ] as const
                                  ).map((item) => {
                                    const isSelected = currentStatus === item.key

                                    return (
                                      <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => handleSetStudentStatus(student.studentId, item.key)}
                                        className={cn(
                                          "size-6 rounded text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center",
                                          isSelected
                                            ? item.color
                                            : "border-border bg-card text-muted-foreground hover:bg-muted/60"
                                        )}
                                        title={item.key}
                                      >
                                        {item.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              </TableCell>

                              <TableCell className="px-3 py-2.5 border-b border-border">
                                <Input
                                  value={rosterRemarks[student.studentId] || ""}
                                  onChange={(e) => handleSetStudentRemark(student.studentId, e.target.value)}
                                  placeholder="e.g. sick, doctor visit..."
                                  className="h-7 text-[11px] rounded border-border"
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </DataTableCard>
              )}
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION: MY BATCHES & STUDENTS
         ========================================================================= */}
      {activeTab === "batches" && (
        <div className="space-y-5">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Batches
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-foreground border border-border">
                {batches.length} {batches.length === 1 ? "batch" : "batches"}, {kpi.totalStudentsCount} students
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary-light px-2 py-0.5 rounded">
                      {batch.subject}
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-1.5">
                      {batch.className} {batch.batchName ? `(${batch.batchName})` : ""}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Timing: {batch.timing || "—"}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-foreground border border-border shrink-0">
                    {batch.studentCount} students
                  </span>
                </div>

                {/* Enrolled Students preview list */}
                <div className="space-y-1.5 border-t border-border pt-3">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Students
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-border/60">
                    {batch.students.map((st) => (
                      <div key={st.studentId} className="flex items-center justify-between py-1.5 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-5 rounded-full bg-muted font-bold text-[9px] flex items-center justify-center shrink-0">
                            {st.name.substring(0, 2).toUpperCase()}
                          </span>
                          <span className="font-medium text-foreground truncate">{st.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {st.phoneNo || st.parentPhone || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTakeAttendanceFromSchedule(batch.id)}
                    className="text-xs h-8 border-border"
                  >
                    Take attendance
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: ANNOUNCEMENTS (Option B: Channel-First Live Broadcast)
         ========================================================================= */}
      {activeTab === "announcements" && (
        <div className="flex-1 flex flex-col min-h-0 min-w-0 space-y-3">
          {/* Page Header */}
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Announcements
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Broadcast updates to all batches or target a specific class
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0 min-w-0">
            <ChannelAnnouncementsWorkspace
            userRole="FACULTY"
            currentUserName={teacher.name}
            channels={[
              {
                id: null,
                name: "All batches",
                subtitle: "All students in your assigned batches",
                isGlobal: true,
              },
              ...batches.map((b) => ({
                id: b.id,
                name: `${b.className} - ${b.subject}`,
                subtitle: `${b.students.length} students`,
                studentCount: b.students.length,
              })),
            ]}
            initialAnnouncements={announcements}
            onPublish={async (data) => {
              const res = await createTeacherAnnouncement({
                batchId: data.batchId ?? undefined,
                content: data.content,
                priority: data.priority,
              })
              if (res.announcement) {
                setAnnouncements((prev) => {
                  const exists = prev.some((a) => a.id === res.announcement.id)
                  return exists ? prev : [res.announcement, ...prev]
                })
                router.refresh()
              }
              return res
            }}
            onDelete={async (id) => {
              const res = await deleteTeacherAnnouncement(id)
              if (res.success) {
                setAnnouncements((prev) => prev.filter((a) => a.id !== id))
                router.refresh()
              }
              return res
            }}
          />
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: MY SALARY & PAYSLIPS
         ========================================================================= */}
      {activeTab === "payroll" && (
        <div className="space-y-5">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Payroll
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>
          </div>

          {/* Compensation Snapshot */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly salary
              </span>
              <div className="text-2xl font-bold text-foreground mt-0.5">
                {teacher.salary ? `₹${teacher.salary.toLocaleString("en-IN")}` : "—"}
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          {/* Payslip History Table Card */}
          <DataTableCard
            title="Payslips"
          >
            <Table className="table-fixed w-full border-collapse">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[28%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                    Month
                  </TableHead>
                  <TableHead className="w-[18%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                    Base salary
                  </TableHead>
                  <TableHead className="w-[16%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                    Adjustments
                  </TableHead>
                  <TableHead className="w-[18%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                    Net salary
                  </TableHead>
                  <TableHead className="w-[20%] h-9 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                      No payslips found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((p) => {
                    const monthName = new Date(p.year, p.month - 1, 1).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })

                    return (
                      <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                          <div className="font-semibold text-foreground truncate">{monthName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {p.voucherNo}
                          </div>
                        </TableCell>

                        <TableCell className="px-2.5 py-2.5 text-xs text-muted-foreground border-b border-border">
                          ₹{p.baseSalary.toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell className="px-2.5 py-2.5 text-xs text-muted-foreground border-b border-border">
                          {p.bonus > 0 ? (
                            <span className="text-emerald-600 font-semibold">+₹{p.bonus}</span>
                          ) : p.deductions > 0 ? (
                            <span className="text-rose-600 font-semibold">-₹{p.deductions}</span>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        <TableCell className="px-2.5 py-2.5 text-xs font-bold text-foreground border-b border-border">
                          ₹{p.netAmount.toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell className="px-3 py-2.5 text-xs text-right border-b border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayslip(p)}
                            className="h-7 px-2.5 text-[11px] rounded-lg"
                          >
                            <Receipt className="size-3 mr-1" />
                            View payslip
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </DataTableCard>
        </div>
      )}

      {/* TAB: SETTINGS & PROFILE */}
      {activeTab === "settings" && (
        <TeacherSettingsTab teacher={teacher} />
      )}

      {/* Salary Slip Modal */}
      <SalarySlipModal
        open={slipModalOpen}
        onOpenChange={setSlipModalOpen}
        slip={activeSlip}
        instituteName={teacher.instituteName}
      />
    </div>
  )
}

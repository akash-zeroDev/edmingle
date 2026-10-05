"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock3,
  DollarSign,
  Download,
  Filter,
  GraduationCap,
  IndianRupee,
  Layers3,
  Megaphone,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  UserSquare2,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CustomSelect } from "@/components/ui/custom-select"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  fallbackStudents,
  mockFeeRows,
  type MockStudent,
} from "@/data/mock-batch-workspace"
import { enrollStudentInBatch, removeStudentFromBatch, enrollTeacherInBatch } from "@/actions/batch"
import {
  createBatchAnnouncement,
  deleteAnnouncement,
  type BatchAnnouncementItem,
} from "@/actions/announcement"
import { cn } from "@/lib/utils"

export interface BatchWorkspaceProps {
  batch: {
    id: string
    className: string
    batchName?: string | null
    subject: string
    timing: string | null
    teacher?: {
      id: string
      name: string
      phoneNo?: string | null
      subjects?: string | null
      email?: string | null
      status?: string | null
    } | null
    students: Array<{
      id: string
      studentId: string
      student: {
        id: string
        name: string
        phoneNo?: string | null
        parentPhone?: string | null
        email?: string | null
        status: string
        joinedAt: Date
      }
    }>
  }
  availableStudents: Array<{
    id: string
    name: string
    phoneNo?: string | null
    parentPhone?: string | null
  }>
  availableTeachers?: Array<{
    id: string
    name: string
    email?: string | null
    phoneNo?: string | null
    subjects?: string | null
    status?: string | null
  }>
  announcements?: BatchAnnouncementItem[]
}

type WorkspaceTab = "students" | "fees" | "curriculum" | "timetable" | "announcements"

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "Paid"
  const isDue = status === "Due"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border",
        isPaid && "bg-emerald-50 text-emerald-700 border-emerald-200",
        isDue && "bg-red-50 text-red-700 border-red-200",
        !isPaid && !isDue && "bg-amber-50 text-amber-700 border-amber-200"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isPaid && "bg-emerald-500",
          isDue && "bg-red-500",
          !isPaid && !isDue && "bg-amber-500"
        )}
      />
      {status}
    </span>
  )
}

export function BatchWorkspace({
  batch,
  availableStudents,
  availableTeachers = [],
  announcements = [],
}: BatchWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("students")
  const [isTabPending, startTabTransition] = useTransition()

  const handleTabChange = (val: string) => {
    startTabTransition(() => {
      setActiveTab(val as WorkspaceTab)
    })
  }

  const [enrollOpen, setEnrollOpen] = useState(false)
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<string>("")
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Teacher Enrollment State
  const [enrollTeacherOpen, setEnrollTeacherOpen] = useState(false)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(batch.teacher?.id || "")
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false)

  // Batch Live Announcements State (3-point synchronized network)
  const [announcementsList, setAnnouncementsList] = useState<BatchAnnouncementItem[]>(announcements)
  const [noticeMessage, setNoticeMessage] = useState("")
  const [noticeTitle, setNoticeTitle] = useState("")
  const [noticePriority, setNoticePriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL")
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false)
  const [isDeletingNoticeId, setIsDeletingNoticeId] = useState<string | null>(null)

  useEffect(() => {
    setAnnouncementsList(announcements)
  }, [announcements])

  const [rosterSearch, setRosterSearch] = useState("")
  const [feeFilter, setFeeFilter] = useState("All fees")

  const { toast } = useToast()

  const displayName = batch.batchName ? `${batch.className} - ${batch.batchName}` : batch.className
  const realStudentsCount = batch.students.length
  const hasRealStudents = realStudentsCount > 0

  // Combine real enrolled students with realistic fallback attributes for attendance & fee demo
  const displayedStudents = hasRealStudents
    ? batch.students.map((bs, idx) => ({
        roll: `B26-${String(idx + 1).padStart(3, "0")}`,
        name: bs.student.name,
        phone: bs.student.phoneNo || "N/A",
        parentPhone: bs.student.parentPhone || bs.student.phoneNo || "N/A",
        attendance: `${90 + (idx % 8)}%`,
        fees: (idx % 3 === 0 ? "Paid" : idx % 3 === 1 ? "Partially paid" : "Due") as "Paid" | "Partially paid" | "Due",
        studentId: bs.student.id,
      }))
    : fallbackStudents.map((fs) => ({
        ...fs,
        studentId: undefined,
      }))

  const filteredStudents = displayedStudents.filter((student) => {
    const q = rosterSearch.toLowerCase()
    const matchesSearch =
      student.name.toLowerCase().includes(q) ||
      student.roll.toLowerCase().includes(q) ||
      student.phone.toLowerCase().includes(q)
    const matchesFee = feeFilter === "All fees" || student.fees === feeFilter
    return matchesSearch && matchesFee
  })

  const handleEnrollSubmit = async () => {
    if (!selectedStudentToEnroll) {
      toast({ variant: "destructive", title: "Select a student", description: "Please choose an active student to enroll." })
      return
    }

    setIsEnrolling(true)
    const res = await enrollStudentInBatch(batch.id, selectedStudentToEnroll)
    setIsEnrolling(false)

    if (res.error) {
      toast({ variant: "destructive", title: "Enrollment failed", description: res.error })
    } else {
      toast({ title: "Student Enrolled", description: res.message })
      setSelectedStudentToEnroll("")
      setEnrollOpen(false)
      router.refresh()
    }
  }

  const handleUnenroll = async (studentId?: string, studentName?: string) => {
    if (!studentId) {
      toast({ title: "Preview Record", description: "This is a preview sample student. Enroll real students to manage live records." })
      return
    }

    const res = await removeStudentFromBatch(batch.id, studentId)
    if (res.error) {
      toast({ variant: "destructive", title: "Removal failed", description: res.error })
    } else {
      toast({ title: "Student Removed", description: `${studentName || "Student"} unenrolled from this batch.` })
      router.refresh()
    }
  }

  const handleEnrollTeacherSubmit = async () => {
    if (!selectedTeacherId) {
      toast({
        variant: "destructive",
        title: "Select a Faculty Member",
        description: "Please choose a teacher to enroll into this batch.",
      })
      return
    }

    setIsAssigningTeacher(true)
    const res = await enrollTeacherInBatch(batch.id, selectedTeacherId)
    setIsAssigningTeacher(false)

    if (res.error) {
      toast({ variant: "destructive", title: "Faculty Enrollment Failed", description: res.error })
    } else {
      toast({ title: "Faculty Enrolled", description: res.message })
      setEnrollTeacherOpen(false)
      router.refresh()
    }
  }

  const handleUnassignTeacher = async () => {
    setIsAssigningTeacher(true)
    const res = await enrollTeacherInBatch(batch.id, null)
    setIsAssigningTeacher(false)

    if (res.error) {
      toast({ variant: "destructive", title: "Unassign Failed", description: res.error })
    } else {
      toast({ title: "Faculty Removed", description: res.message })
      setSelectedTeacherId("")
      setEnrollTeacherOpen(false)
      router.refresh()
    }
  }

  const handlePostNotice = async () => {
    if (!noticeMessage.trim()) {
      toast({ variant: "destructive", title: "Incomplete Notice", description: "Please enter announcement text to broadcast." })
      return
    }

    setIsSubmittingNotice(true)
    const res = await createBatchAnnouncement({
      batchId: batch.id,
      content: noticeMessage.trim(),
      priority: noticePriority,
    })
    setIsSubmittingNotice(false)

    if (res.error) {
      toast({ variant: "destructive", title: "Broadcast Failed", description: res.error })
    } else {
      toast({
        title: "Notice Broadcasted Live",
        description: "Your notice is now live across student, faculty, and institute views.",
      })
      if (res.announcement) {
        setAnnouncementsList((prev) => [res.announcement as BatchAnnouncementItem, ...prev])
      }
      setNoticeMessage("")
      setNoticePriority("NORMAL")
      router.refresh()
    }
  }

  const handleDeleteNotice = async (noticeId: string) => {
    setIsDeletingNoticeId(noticeId)
    const res = await deleteAnnouncement(noticeId)
    setIsDeletingNoticeId(null)

    if (res.error) {
      toast({ variant: "destructive", title: "Failed to Delete", description: res.error })
    } else {
      toast({ title: "Notice Removed", description: "The announcement was deleted across all portals." })
      setAnnouncementsList((prev) => prev.filter((a) => a.id !== noticeId))
      router.refresh()
    }
  }

  return (
    <div className="max-w-[1600px] w-full p-4 md:p-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#5e6b63]">
        <Link
          href="/institute/batches"
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold"
        >
          <ArrowLeft className="size-3.5" />
          Back to Batches
        </Link>
        <span>/</span>
        <span>{batch.className}</span>
        <span>/</span>
        <span className="text-[#1a201c] font-bold">{displayName}</span>
      </div>

      {/* Header Workspace Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
            <Layers3 className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                {batch.subject}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-semibold">
                <GraduationCap className="size-3 text-slate-500" />
                {batch.className}
              </span>
              <span className="text-xs text-[#5e6b63]">
                Academic Session 2025–2026
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#15171b]">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-[#5e6b63]">
              {batch.teacher ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacherId(batch.teacher?.id || "")
                    setEnrollTeacherOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 font-medium text-[#1a201c] bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer group"
                  title="Click to manage faculty"
                >
                  <UserCheck className="size-3.5 text-emerald-700" />
                  <span className="text-emerald-900 font-semibold">{batch.teacher.name}</span>
                  {batch.teacher.subjects && (
                    <span className="text-emerald-700 font-normal">({batch.teacher.subjects})</span>
                  )}
                  <span className="text-[10px] text-emerald-800 underline underline-offset-2 ml-1 opacity-80 group-hover:opacity-100">
                    Manage
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacherId("")
                    setEnrollTeacherOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs group"
                  title="Click to enroll faculty"
                >
                  <UserPlus className="size-3.5 text-amber-700" />
                  <span>Unassigned Teacher</span>
                  <span className="text-[10px] font-semibold text-amber-900 underline underline-offset-2 ml-0.5">
                    + Enroll Teacher
                  </span>
                </button>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-[#8b9a90]" />
                {batch.timing || "Flexible (Not scheduled)"}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("announcements")
            }}
            className="h-10 px-3.5 text-xs font-semibold border-[#e3e8e5] rounded-xl hover:bg-[#fafbfc] focus:outline-none focus-visible:outline-none"
          >
            <Megaphone className="size-3.5 mr-2 text-primary" />
            Post Notice
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedTeacherId(batch.teacher?.id || "")
              setEnrollTeacherOpen(true)
            }}
            className="h-10 px-3.5 text-xs font-semibold border-[#e3e8e5] text-[#1a201c] rounded-xl hover:bg-[#fafbfc] hover:border-primary/40 focus:outline-none focus-visible:outline-none"
          >
            <UserCheck className="size-3.5 mr-1.5 text-primary" />
            {batch.teacher ? "Change Teacher" : "Enroll Teacher"}
          </Button>
          <Button
            onClick={() => setEnrollOpen(true)}
            className="h-10 px-3.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm focus:outline-none focus-visible:outline-none"
          >
            <Plus className="size-3.5 mr-1.5" />
            Enroll Student
          </Button>
        </div>
      </div>

      {/* 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Enrolled */}
        <div className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5e6b63]">Total Enrolled</span>
            <div className="size-8 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#15171b]">
            {hasRealStudents ? realStudentsCount : 48}
          </div>
          <div className="mt-1 text-xs text-[#5e6b63]">
            {hasRealStudents
              ? `${realStudentsCount} active students in batch`
              : "48 students (sample preview)"}
          </div>
        </div>

        {/* Metric 2: Batch Fee Collection */}
        <div className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5e6b63]">Batch Fee Status</span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#15171b]">
            ₹3.6L <span className="text-sm font-normal text-[#5e6b63]">/ ₹4.8L</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#f0f2f5] overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
            </div>
            <span className="text-[11px] font-bold text-primary">75% paid</span>
          </div>
        </div>

        {/* Metric 3: Batch Announcements */}
        <div className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5e6b63]">Announcements</span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Megaphone className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#15171b]">
            {announcementsList.length}
          </div>
          <p className="mt-2 text-[11px] text-[#5e6b63]">
            Active batch broadcasts
          </p>
        </div>

        {/* Metric 4: Average Attendance */}
        <div className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5e6b63]">Avg. Attendance</span>
            <div className="size-8 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#15171b]">
            91.4%
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
            <span>+1.8%</span>
            <span className="text-[#5e6b63] font-normal">compared to last month</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Tabs Container */}
      <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Tab Navigation Strip */}
          <div className="border-b border-[#e7e9ed] px-4 overflow-x-auto">
            <TabsList className="h-12 gap-6 bg-transparent">
              <TabsTrigger
                value="students"
                className="h-12 px-1 text-xs font-semibold"
              >
                Students ({displayedStudents.length})
              </TabsTrigger>
              <TabsTrigger
                value="fees"
                className="h-12 px-1 text-xs font-semibold"
              >
                Fee Dues & Payments
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className="h-12 px-1 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Curriculum</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">v2</span>
              </TabsTrigger>
              <TabsTrigger
                value="timetable"
                className="h-12 px-1 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Timetable</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">v2</span>
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="h-12 px-1 text-xs font-semibold"
              >
                Announcements ({announcementsList.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: STUDENTS ROSTER */}
          <TabsContent value="students" className={cn("p-0 animate-in fade-in duration-150", isTabPending && "opacity-60")}>
            {/* Filter & Search Header */}
            <div className="p-4 border-b border-[#e7e9ed] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b9a90]" />
                <Input
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search student, roll number, or phone..."
                  className="pl-9 h-10 border-[#e3e8e5] text-xs rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 text-xs border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
                    >
                      <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
                      {feeFilter}
                      <ChevronDown className="size-3 ml-2 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {["All fees", "Paid", "Partially paid", "Due"].map((f) => (
                      <DropdownMenuItem key={f} onClick={() => setFeeFilter(f)}>
                        {f}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  onClick={() => setEnrollOpen(true)}
                  className="h-10 px-3.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl"
                >
                  <Plus className="size-3.5 mr-1" />
                  Enroll Student
                </Button>
              </div>
            </div>

            {!hasRealStudents && (
              <div className="px-5 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <span>
                  Showing sample students. Use <strong>Enroll student</strong> to add students to this batch.
                </span>
                <span className="font-semibold text-primary">6 sample students</span>
              </div>
            )}

            {/* Students Table */}
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-[#fafafa]">
                  <TableRow>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                      Roll No.
                    </TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                      Student Name
                    </TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                      Contact Phone
                    </TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                      Attendance Rate
                    </TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                      Fee Status
                    </TableHead>
                    <TableHead className="h-10 px-5 text-right text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                        No students match the criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow
                        key={student.roll}
                        onClick={() =>
                          toast({
                            title: student.name,
                            description: `Roll ${student.roll}, Attendance: ${student.attendance}, Fees: ${student.fees}`,
                          })
                        }
                        className="hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                      >
                        <TableCell className="h-[54px] px-5 text-xs font-mono text-[#5e6b63] border-b border-[#f0f1f3]">
                          {student.roll}
                        </TableCell>
                        <TableCell className="h-[54px] px-5 text-xs font-semibold text-[#15171b] border-b border-[#f0f1f3]">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-[10px] group-hover:bg-primary group-hover:text-white transition-colors">
                              {student.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="group-hover:text-primary transition-colors">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="h-[54px] px-5 text-xs text-[#5e6b63] border-b border-[#f0f1f3]">
                          <span className="inline-flex items-center gap-1.5 font-mono">
                            <Phone className="size-3 text-[#8b9a90]" />
                            {student.phone}
                          </span>
                        </TableCell>
                        <TableCell className="h-[54px] px-5 text-xs font-semibold text-[#1a201c] border-b border-[#f0f1f3]">
                          <span className={cn(parseFloat(student.attendance) < 90 && "text-amber-700")}>
                            {student.attendance}
                          </span>
                        </TableCell>
                        <TableCell className="h-[54px] px-5 border-b border-[#f0f1f3]">
                          <StatusBadge status={student.fees} />
                        </TableCell>
                        <TableCell className="h-[54px] px-5 text-right border-b border-[#f0f1f3]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="size-8 p-0 text-[#8b9a90] hover:text-[#1a201c] rounded-lg focus:outline-none focus-visible:outline-none cursor-pointer"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={() => toast({ title: "Student Profile", description: `Viewing records for ${student.name}` })}
                              >
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toast({ title: "Attendance History", description: `Attendance record: ${student.attendance}` })}
                              >
                                Attendance History
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toast({ title: "Fee Ledger", description: `Status: ${student.fees}` })}
                              >
                                View Fee Ledger
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUnenroll(student.studentId, student.name)}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              >
                                Unenroll from Batch
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-[#e7e9ed] px-5 py-3 text-xs text-[#5e6b63]">
              <span>Showing {filteredStudents.length} of {displayedStudents.length} students</span>
            </div>
          </TabsContent>

          {/* TAB 2: FEE DUES & PAYMENTS */}
          <TabsContent value="fees" className={cn("p-6 space-y-6 animate-in fade-in duration-150", isTabPending && "opacity-60")}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">Batch fees</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Reminders sent",
                    description: "Sent fee reminders to students with pending dues.",
                  })
                }
                className="h-9 text-xs border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
              >
                <Send className="size-3.5 mr-1.5 text-primary" />
                Send reminders
              </Button>
            </div>

            <div className="overflow-x-auto border border-[#e7e9ed] rounded-xl">
              <Table className="w-full">
                <TableHeader className="bg-[#fafafa]">
                  <TableRow>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Student</TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Installment</TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Total Fee</TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Amount Paid</TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Outstanding Due</TableHead>
                    <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Due Date</TableHead>
                    <TableHead className="h-10 px-5 text-right text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFeeRows.map((row) => (
                    <TableRow
                      key={row.student}
                      onClick={() =>
                        toast({
                          title: row.student,
                          description: `Status: ${row.status}, Total: ${row.amount}, Paid: ${row.paid}, Due: ${row.due}`,
                        })
                      }
                      className="hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                    >
                      <TableCell className="h-[54px] px-5 text-xs font-semibold text-[#15171b] border-b border-[#f0f1f3]">
                        <span className="group-hover:text-primary transition-colors">{row.student}</span>
                      </TableCell>
                      <TableCell className="h-[54px] px-5 text-xs text-[#5e6b63] border-b border-[#f0f1f3]">
                        {row.installment}
                      </TableCell>
                      <TableCell className="h-[54px] px-5 text-xs font-semibold text-[#1a201c] border-b border-[#f0f1f3]">
                        {row.amount}
                      </TableCell>
                      <TableCell className="h-[54px] px-5 text-xs text-emerald-700 font-semibold border-b border-[#f0f1f3]">
                        {row.paid}
                      </TableCell>
                      <TableCell className="h-[54px] px-5 text-xs font-semibold border-b border-[#f0f1f3]">
                        <span className={cn(row.due !== "—" ? "text-red-600 font-bold" : "text-[#8b9a90]")}>
                          {row.due}
                        </span>
                      </TableCell>
                      <TableCell className="h-[54px] px-5 text-xs text-[#5e6b63] border-b border-[#f0f1f3]">
                        {row.date}
                      </TableCell>
                      <TableCell className="h-[54px] px-5 text-right border-b border-[#f0f1f3]">
                        <StatusBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 3: CURRICULUM / SYLLABUS (DEFERRED TO V2) */}
          <TabsContent value="curriculum" className={cn("p-8 animate-in fade-in duration-150", isTabPending && "opacity-60")}>
            <div className="max-w-3xl mx-auto rounded-2xl border border-dashed border-[#d0d7d2] bg-[#fbfcfb] p-8 text-center space-y-6">
              <div className="size-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto shadow-xs">
                <BookOpen className="size-7" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <Sparkles className="size-3.5" />
                  <span>Roadmap Feature · Scheduled for v2</span>
                </div>
                <h3 className="text-lg font-bold text-[#15171b]">
                  Curriculum & Syllabus Management Flow
                </h3>
                <p className="text-xs text-[#5e6b63] leading-relaxed">
                  We are building an end-to-end curriculum engine for {batch.className} ({batch.subject}). The full flow will allow custom chapter structuring, live lecture lesson logs, and automated student progress synchronisation.
                </p>
              </div>

              {/* Planned Capabilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
                <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white shadow-xs space-y-2">
                  <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Layers3 className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#15171b]">Chapter Architecture</h4>
                  <p className="text-[11px] text-[#5e6b63] leading-relaxed">
                    Break course syllabi into modular units, lecture hours, and custom milestones per subject.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white shadow-xs space-y-2">
                  <div className="size-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Clock className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#15171b]">Faculty Lesson Logging</h4>
                  <p className="text-[11px] text-[#5e6b63] leading-relaxed">
                    Assigned faculty ({batch.teacher ? batch.teacher.name : "Faculty"}) can mark topics taught with lecture notes and handouts.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white shadow-xs space-y-2">
                  <div className="size-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <GraduationCap className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#15171b]">Student Sync</h4>
                  <p className="text-[11px] text-[#5e6b63] leading-relaxed">
                    Live syllabus percentage automatically displayed on enrolled students&apos; dashboards.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#5e6b63] font-medium bg-white px-3 py-1.5 rounded-lg border border-[#e7e9ed]">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  Deferred for v2 release · Full interactive builder currently in design phase
                </span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: TIMETABLE & LECTURES (DEFERRED TO V2) */}
          <TabsContent value="timetable" className={cn("p-8 animate-in fade-in duration-150", isTabPending && "opacity-60")}>
            <div className="max-w-3xl mx-auto rounded-2xl border border-dashed border-[#d0d7d2] bg-[#fbfcfb] p-8 text-center space-y-6">
              <div className="size-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto shadow-xs">
                <CalendarDays className="size-7" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <Sparkles className="size-3.5" />
                  <span>Roadmap Feature · Scheduled for v2</span>
                </div>
                <h3 className="text-lg font-bold text-[#15171b]">
                  Weekly Timetable & Room Scheduler
                </h3>
                <p className="text-xs text-[#5e6b63] leading-relaxed">
                  The complete multi-batch timetable planner with conflict resolution and room assignment will launch in v2. In the meantime, use the Announcements tab to broadcast schedule updates.
                </p>
              </div>

              {/* Planned Capabilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
                <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white shadow-xs space-y-2">
                  <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CalendarDays className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#15171b]">Conflict Detection</h4>
                  <p className="text-[11px] text-[#5e6b63] leading-relaxed">
                    Automatic alerts prevent assigning the same teacher or classroom space to overlapping time slots.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white shadow-xs space-y-2">
                  <div className="size-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Megaphone className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#15171b]">Reschedule Alerts</h4>
                  <p className="text-[11px] text-[#5e6b63] leading-relaxed">
                    Instant notifications pushed to enrolled students whenever a class is rescheduled or cancelled.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white shadow-xs space-y-2">
                  <div className="size-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Users className="size-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#15171b]">Multi-Faculty Sync</h4>
                  <p className="text-[11px] text-[#5e6b63] leading-relaxed">
                    Personalized calendars automatically compiled for each teacher and student across all their batches.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#5e6b63] font-medium bg-white px-3 py-1.5 rounded-lg border border-[#e7e9ed]">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  Deferred for v2 release · Complete calendar drag-and-drop flow in development
                </span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: ANNOUNCEMENTS (Live 3-Point Synchronized Network) */}
          {/* TAB 5: ANNOUNCEMENTS */}
          <TabsContent value="announcements" className={cn("p-6 space-y-6 animate-in fade-in duration-150", isTabPending && "opacity-60")}>
            {/* Post Notice Composer */}
            <div className="p-5 rounded-2xl border border-[#e7e9ed] bg-[#f8fafc] space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#15171b]">
                <Megaphone className="size-4 text-primary" />
                <span>New announcement</span>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#1a201c] mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { key: "NORMAL", label: "Normal" },
                      { key: "HIGH", label: "Important" },
                      { key: "URGENT", label: "Urgent" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setNoticePriority(p.key)}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold",
                        noticePriority === p.key
                          ? "border-primary bg-primary text-white shadow-sm ring-1 ring-primary"
                          : "border-[#e3e8e5] bg-white text-[#5e6b63] hover:text-[#1a201c] hover:border-[#cfd5d0]"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="Write an announcement..."
                className="min-h-[90px] text-xs bg-white border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
              />
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={handlePostNotice}
                  disabled={isSubmittingNotice}
                  className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm focus:outline-none focus-visible:outline-none cursor-pointer shrink-0"
                >
                  <Send className="size-3.5 mr-1.5" />
                  {isSubmittingNotice ? "Posting..." : "Post announcement"}
                </Button>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5e6b63]">
                  Announcements ({announcementsList.length})
                </h3>
              </div>

              {announcementsList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e7e9ed] bg-white p-10 text-center space-y-2">
                  <div className="size-10 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-1">
                    <Megaphone className="size-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#15171b]">No announcements yet</h4>
                </div>
              ) : (
                <div className="divide-y divide-[#e7e9ed] border border-[#e7e9ed] rounded-xl bg-white overflow-hidden shadow-2xs">
                  {announcementsList.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-5 flex gap-4 hover:bg-[#fafbfc] transition-colors group"
                    >
                      <div className="size-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Megaphone className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                notice.priority === "URGENT"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : notice.priority === "HIGH"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              )}
                            >
                              {notice.priority}
                            </span>
                            {notice.authorRole === "ADMIN" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 uppercase tracking-wider">
                                <ShieldCheck className="size-3 text-purple-600" />
                                Admin, {notice.authorName}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                                <GraduationCap className="size-3 text-blue-600" />
                                Teacher, {notice.authorName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#8b9a90] font-mono">
                              {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isDeletingNoticeId === notice.id}
                              onClick={() => handleDeleteNotice(notice.id)}
                              className="size-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete announcement"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-[#45484f] leading-relaxed whitespace-pre-line">
                          {notice.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enroll Student Dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 bg-white rounded-2xl border border-[#e7e9ed]">
          <DialogHeader>
            <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-2">
              <Users className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#15171b]">
              Enroll Student into {displayName}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5e6b63]">
              Assign an existing active student to this batch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {availableStudents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#e3e8e5] bg-[#f8faf9] text-center space-y-2">
                <p className="text-xs text-[#5e6b63]">
                  All active students in your institute are already enrolled in this batch, or no registered students exist yet.
                </p>
                <Link
                  href="/institute/students/new"
                  className="inline-flex text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  + Register New Student
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1a201c]">
                  Select Student to Enroll *
                </label>
                <CustomSelect
                  value={selectedStudentToEnroll}
                  onChange={setSelectedStudentToEnroll}
                  options={availableStudents.map((s) => ({
                    value: s.id,
                    label: s.name,
                    description: s.phoneNo ? `Phone: ${s.phoneNo}` : undefined,
                  }))}
                  placeholder="-- Choose a student --"
                  searchPlaceholder="Search students by name or phone..."
                  searchable={true}
                  className="w-full"
                />
                <p className="text-[11px] text-[#8b9a90]">
                  {availableStudents.length} candidate students available for enrollment.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnrollOpen(false)}
              className="text-xs h-9 border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isEnrolling || !selectedStudentToEnroll}
              onClick={handleEnrollSubmit}
              className="text-xs h-9 bg-primary hover:bg-primary-hover text-white rounded-xl focus:outline-none focus-visible:outline-none"
            >
              {isEnrolling ? "Enrolling..." : "Confirm Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll / Change Faculty in Batch Dialog */}
      <Dialog open={enrollTeacherOpen} onOpenChange={setEnrollTeacherOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 bg-white rounded-2xl border border-[#e7e9ed] shadow-lg">
          <DialogHeader>
            <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-2">
              <GraduationCap className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#15171b]">
              {batch.teacher ? "Manage Batch Faculty" : `Enroll Teacher into ${displayName}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5e6b63]">
              Assign an active faculty teacher to lead this batch. This batch will automatically sync to their Teacher Portal.
            </DialogDescription>
          </DialogHeader>

          {/* Current Status Box if teacher assigned */}
          {batch.teacher ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {batch.teacher.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a201c]">{batch.teacher.name}</div>
                  <div className="text-[11px] text-[#5e6b63]">
                    {batch.teacher.subjects ? `Faculty for ${batch.teacher.subjects}` : "Assigned Faculty"}
                    {batch.teacher.email ? ` · ${batch.teacher.email}` : ""}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnassignTeacher}
                disabled={isAssigningTeacher}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 px-2.5 rounded-lg shrink-0"
              >
                Unassign
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
              <div className="size-2 rounded-full bg-amber-500 shrink-0" />
              <span>No faculty is currently assigned. Enrolling a teacher links their portal to this batch.</span>
            </div>
          )}

          <div className="space-y-4 py-2">
            {availableTeachers.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#e3e8e5] bg-[#f8faf9] text-center space-y-2">
                <GraduationCap className="size-8 mx-auto text-[#8b9a90] opacity-50" />
                <p className="text-xs font-semibold text-[#1a201c]">No Active Teachers Registered</p>
                <p className="text-[11px] text-[#5e6b63]">
                  Please add faculty members to your institute first before enrolling them into batches.
                </p>
                <Link
                  href="/institute/teachers"
                  className="inline-flex text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  + Add New Teacher in Faculty Directory
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1a201c]">
                  Select Faculty to Enroll *
                </label>
                <CustomSelect
                  value={selectedTeacherId}
                  onChange={setSelectedTeacherId}
                  options={availableTeachers.map((t) => ({
                    value: t.id,
                    label: t.name,
                    description: t.subjects
                      ? `Subjects: ${t.subjects}${t.email ? ` · ${t.email}` : t.phoneNo ? ` · ${t.phoneNo}` : ""}`
                      : t.email || t.phoneNo || undefined,
                  }))}
                  placeholder="-- Choose a faculty instructor --"
                  searchPlaceholder="Search faculty by name or subject..."
                  searchable={true}
                  className="w-full"
                />
                <p className="text-[11px] text-[#8b9a90]">
                  {availableTeachers.length} active faculty members registered in your institute.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnrollTeacherOpen(false)}
              className="text-xs h-9 border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={
                isAssigningTeacher ||
                !selectedTeacherId ||
                batch.teacher?.id === selectedTeacherId ||
                availableTeachers.length === 0
              }
              onClick={handleEnrollTeacherSubmit}
              className="text-xs h-9 bg-primary hover:bg-primary-hover text-white rounded-xl focus:outline-none focus-visible:outline-none"
            >
              {isAssigningTeacher ? "Enrolling..." : "Confirm Faculty Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

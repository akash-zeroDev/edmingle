"use client"

import { useState } from "react"
import Link from "next/link"
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
  Sparkles,
  Trash2,
  UserSquare2,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  mockModules,
  mockTimetable,
  mockAnnouncements,
  type MockStudent,
  type MockAnnouncement,
  type AnnouncementAudience,
} from "@/data/mock-batch-workspace"
import { enrollStudentInBatch, removeStudentFromBatch } from "@/actions/batch"
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

export function BatchWorkspace({ batch, availableStudents }: BatchWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("students")
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<string>("")
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [announcementsList, setAnnouncementsList] = useState<MockAnnouncement[]>(mockAnnouncements)
  const [noticeMessage, setNoticeMessage] = useState("")
  const [noticeTitle, setNoticeTitle] = useState("")
  const [noticeAudience, setNoticeAudience] = useState<AnnouncementAudience>("students")
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false)
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
    }
  }

  const handlePostNotice = () => {
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      toast({ variant: "destructive", title: "Incomplete Notice", description: "Please provide both a title and notice body." })
      return
    }

    setIsSubmittingNotice(true)
    const audienceLabels: Record<AnnouncementAudience, string> = {
      students: "Students Only",
      parents: "Parents Only",
      both: "Students & Parents",
    }

    const newNotice: MockAnnouncement = {
      id: `notice-${Date.now()}`,
      title: noticeTitle.trim(),
      meta: `Posted just now · ${audienceLabels[noticeAudience]}`,
      body: noticeMessage.trim(),
      targetAudience: noticeAudience,
    }

    setAnnouncementsList([newNotice, ...announcementsList])
    setNoticeTitle("")
    setNoticeMessage("")
    setNoticeAudience("students")
    setIsSubmittingNotice(false)
    toast({
      title: "Notice Broadcasted",
      description:
        noticeAudience === "students"
          ? "SMS and WhatsApp alerts queued for all enrolled students in this batch."
          : noticeAudience === "parents"
          ? "SMS and WhatsApp alerts queued for registered parents of this batch."
          : "SMS and WhatsApp alerts queued for both students and parents.",
    })
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
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-xs text-[#5e6b63]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#1a201c]">
                <UserSquare2 className="size-3.5 text-primary" />
                {batch.teacher ? batch.teacher.name : "Unassigned Teacher"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-[#8b9a90]" />
                {batch.timing || "Flexible (Not scheduled)"}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("announcements")
            }}
            className="h-10 px-4 text-xs font-semibold border-[#e3e8e5] rounded-xl hover:bg-[#fafbfc] focus:outline-none focus-visible:outline-none"
          >
            <Megaphone className="size-3.5 mr-2 text-primary" />
            Post Notice
          </Button>
          <Button
            onClick={() => setEnrollOpen(true)}
            className="h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm focus:outline-none focus-visible:outline-none"
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

        {/* Metric 3: Syllabus Progress */}
        <div className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5e6b63]">Syllabus Progress</span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#15171b]">
            68%
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#f0f2f5] overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: "68%" }} />
            </div>
            <span className="text-[11px] text-[#5e6b63]">42 of 62 topics</span>
          </div>
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
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as WorkspaceTab)}>
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
                className="h-12 px-1 text-xs font-semibold"
              >
                Curriculum
              </TabsTrigger>
              <TabsTrigger
                value="timetable"
                className="h-12 px-1 text-xs font-semibold"
              >
                Timetable
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
          <TabsContent value="students" className="p-0">
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
                  💡 <strong>Preview Mode</strong>: Showing sample student data. Use <strong>"Enroll Student"</strong> above to assign active institute students.
                </span>
                <span className="font-semibold text-primary">6 Preview Students</span>
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
                            description: `Roll: ${student.roll} • Attendance: ${student.attendance} • Fee Status: ${student.fees}`,
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
              <span>All student records synchronized</span>
            </div>
          </TabsContent>

          {/* TAB 2: FEE DUES & PAYMENTS */}
          <TabsContent value="fees" className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">Batch Fee Realization Summary</h3>
                <p className="text-xs text-[#5e6b63] mt-0.5">
                  Installment tracking for academic quarter dues across all batch students.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Fee Reminders Sent",
                    description: "Dispatched automated WhatsApp and SMS reminders to all students with pending dues.",
                  })
                }
                className="h-9 text-xs border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
              >
                <Send className="size-3.5 mr-1.5 text-primary" />
                Send Bulk Due Reminders
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
                          description: `Status: ${row.status} • Total: ${row.amount} • Paid: ${row.paid} • Due: ${row.due}`,
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

          {/* TAB 3: CURRICULUM / SYLLABUS */}
          <TabsContent value="curriculum" className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">Syllabus Progress & Chapters</h3>
                <p className="text-xs text-[#5e6b63] mt-0.5">
                  Track course modules, lecture coverage, and milestone completion for {batch.subject}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Syllabus Plan Updated",
                    description: "Module completion recorded.",
                  })
                }
                className="h-9 text-xs border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
              >
                <Plus className="size-3.5 mr-1.5" />
                Add Module
              </Button>
            </div>

            <div className="divide-y divide-[#e7e9ed] border border-[#e7e9ed] rounded-xl overflow-hidden bg-white">
              {mockModules.map((module, index) => (
                <div
                  key={module.name}
                  onClick={() =>
                    toast({
                      title: module.name,
                      description: `Progress: ${module.progress}% • ${module.topics}`,
                    })
                  }
                  className="grid gap-3 px-5 py-4.5 md:grid-cols-[40px_minmax(0,1fr)_220px] md:items-center hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                >
                  <span className="size-8 rounded-lg bg-primary-light text-primary text-xs font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#15171b] group-hover:text-primary transition-colors">{module.name}</h4>
                    <p className="text-xs text-[#5e6b63] mt-0.5">{module.topics}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#5e6b63]">Completion</span>
                      <span className="font-bold text-primary">{module.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#f0f2f5] overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: TIMETABLE & LECTURES */}
          <TabsContent value="timetable" className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">Weekly Lecture Schedule</h3>
                <p className="text-xs text-[#5e6b63] mt-0.5">
                  Allocated classroom lecture slots and weekly problem-solving labs.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                Assigned: {batch.teacher ? batch.teacher.name : "Faculty"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {mockTimetable.map((slot) => (
                <div
                  key={slot.day}
                  onClick={() =>
                    toast({
                      title: `${slot.day} · ${slot.topic}`,
                      description: `${slot.time} in ${slot.room} • Faculty: ${batch.teacher ? batch.teacher.name : "Assigned Faculty"}`,
                    })
                  }
                  className="p-5 rounded-xl border border-[#e7e9ed] bg-white shadow-sm flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                      {slot.day} · {slot.date}
                    </div>
                    <div className="mt-3 text-lg font-bold text-primary font-mono">
                      {slot.time}
                    </div>
                    <div className="mt-2 text-sm font-bold text-[#15171b]">
                      {slot.topic}
                    </div>
                    <div className="mt-1 text-xs text-[#5e6b63]">
                      {slot.room} · {batch.teacher ? batch.teacher.name : "Instructor"}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toast({
                        title: `${slot.day} Lecture Details`,
                        description: `Class scheduled for ${slot.time} in ${slot.room}.`,
                      })
                    }}
                    className="mt-4 w-full h-8 text-xs border-[#e3e8e5] rounded-lg focus:outline-none focus-visible:outline-none cursor-pointer"
                  >
                    View Lecture
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 5: ANNOUNCEMENTS */}
          <TabsContent value="announcements" className="p-6 space-y-6">
            {/* Post Notice Composer */}
            <div className="p-5 rounded-2xl border border-[#e7e9ed] bg-[#f8fafc] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#15171b]">
                  <Megaphone className="size-4 text-primary" />
                  <span>Post Batch Announcement</span>
                </div>
                <span className="text-xs text-[#5e6b63]">
                  Select recipient group before broadcasting
                </span>
              </div>

              {/* Recipient Audience Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#1a201c] mb-2">
                  Recipient Audience *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Students Only (Default) */}
                  <button
                    type="button"
                    onClick={() => setNoticeAudience("students")}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left",
                      noticeAudience === "students"
                        ? "border-primary bg-primary text-white shadow-sm ring-1 ring-primary"
                        : "border-[#e3e8e5] bg-white text-[#5e6b63] hover:text-[#1a201c] hover:border-[#cfd5d0]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className={cn("size-4 shrink-0", noticeAudience === "students" ? "text-white" : "text-primary")} />
                      <div>
                        <div className="font-bold">Students Only</div>
                        <div className={cn("text-[10px] font-normal", noticeAudience === "students" ? "text-white/80" : "text-muted-foreground")}>Default · Batch students</div>
                      </div>
                    </div>
                    <div className={cn("size-4 rounded-full border flex items-center justify-center shrink-0", noticeAudience === "students" ? "border-white bg-white text-primary" : "border-slate-300")}>
                      {noticeAudience === "students" && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                  </button>

                  {/* Option 2: Parents Only */}
                  <button
                    type="button"
                    onClick={() => setNoticeAudience("parents")}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left",
                      noticeAudience === "parents"
                        ? "border-primary bg-primary text-white shadow-sm ring-1 ring-primary"
                        : "border-[#e3e8e5] bg-white text-[#5e6b63] hover:text-[#1a201c] hover:border-[#cfd5d0]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserSquare2 className={cn("size-4 shrink-0", noticeAudience === "parents" ? "text-white" : "text-primary")} />
                      <div>
                        <div className="font-bold">Parents Only</div>
                        <div className={cn("text-[10px] font-normal", noticeAudience === "parents" ? "text-white/80" : "text-muted-foreground")}>Parent phone contacts</div>
                      </div>
                    </div>
                    <div className={cn("size-4 rounded-full border flex items-center justify-center shrink-0", noticeAudience === "parents" ? "border-white bg-white text-primary" : "border-slate-300")}>
                      {noticeAudience === "parents" && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                  </button>

                  {/* Option 3: Both Students & Parents */}
                  <button
                    type="button"
                    onClick={() => setNoticeAudience("both")}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left",
                      noticeAudience === "both"
                        ? "border-primary bg-primary text-white shadow-sm ring-1 ring-primary"
                        : "border-[#e3e8e5] bg-white text-[#5e6b63] hover:text-[#1a201c] hover:border-[#cfd5d0]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className={cn("size-4 shrink-0", noticeAudience === "both" ? "text-white" : "text-primary")} />
                      <div>
                        <div className="font-bold">Both (Students & Parents)</div>
                        <div className={cn("text-[10px] font-normal", noticeAudience === "both" ? "text-white/80" : "text-muted-foreground")}>All associated parties</div>
                      </div>
                    </div>
                    <div className={cn("size-4 rounded-full border flex items-center justify-center shrink-0", noticeAudience === "both" ? "border-white bg-white text-primary" : "border-slate-300")}>
                      {noticeAudience === "both" && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                </div>
              </div>

              <Input
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Notice headline (e.g. Extra Doubt Clearing Lecture on Saturday)"
                className="h-10 text-xs bg-white border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
              />
              <Textarea
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="Share an update or notice with students and parents of this batch..."
                className="min-h-[90px] text-xs bg-white border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-[#5e6b63]">
                  <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {noticeAudience === "students" && "Dispatches immediate SMS & WhatsApp alerts to enrolled batch students only."}
                    {noticeAudience === "parents" && "Dispatches immediate SMS & WhatsApp alerts to registered parents only."}
                    {noticeAudience === "both" && "Dispatches immediate SMS & WhatsApp alerts to all students and their parents."}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={handlePostNotice}
                  disabled={isSubmittingNotice}
                  className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm focus:outline-none focus-visible:outline-none cursor-pointer shrink-0"
                >
                  <Send className="size-3.5 mr-1.5" />
                  Post Notice
                </Button>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5e6b63]">
                Previous Batch Notices ({announcementsList.length})
              </h3>
              <div className="divide-y divide-[#e7e9ed] border border-[#e7e9ed] rounded-xl bg-white overflow-hidden">
                {announcementsList.map((notice) => {
                  const isBoth =
                    notice.targetAudience === "both" ||
                    (!notice.targetAudience &&
                      notice.meta.toLowerCase().includes("parent") &&
                      notice.meta.toLowerCase().includes("student"))
                  const isParents =
                    notice.targetAudience === "parents" ||
                    (!notice.targetAudience &&
                      notice.meta.toLowerCase().includes("parent") &&
                      !notice.meta.toLowerCase().includes("student"))
                  const isStudents =
                    notice.targetAudience === "students" ||
                    (!notice.targetAudience && !isBoth && !isParents)

                  return (
                    <div
                      key={notice.id}
                      onClick={() =>
                        toast({
                          title: notice.title,
                          description: `${notice.meta} — ${notice.body}`,
                        })
                      }
                      className="p-5 flex gap-4 hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                    >
                      <div className="size-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Megaphone className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-[#15171b] group-hover:text-primary transition-colors">
                            {notice.title}
                          </h4>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                              isStudents && "bg-blue-50 text-blue-700 border border-blue-200",
                              isParents && "bg-purple-50 text-purple-700 border border-purple-200",
                              isBoth && "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            )}
                          >
                            {isStudents && "Students Only"}
                            {isParents && "Parents Only"}
                            {isBoth && "Students & Parents"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8b9a90] mt-0.5">{notice.meta}</p>
                        <p className="text-xs text-[#45484f] mt-2 leading-relaxed">{notice.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
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
                <select
                  value={selectedStudentToEnroll}
                  onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#e3e8e5] rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/25 focus:border-primary transition-all text-[#1a201c] cursor-pointer"
                >
                  <option value="">-- Choose a student --</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.phoneNo ? `(${s.phoneNo})` : ""}
                    </option>
                  ))}
                </select>
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
    </div>
  )
}

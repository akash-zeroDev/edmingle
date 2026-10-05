"use client"

import { useState, useMemo } from "react"
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  IndianRupee,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Download,
  Info,
  ShieldCheck,
  Search,
  X,
  Layers3,
  Globe,
  Settings,
  Sparkles,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { BatchAnnouncementItem } from "@/actions/announcement"
import { PhoneChangeModal } from "@/components/settings/phone-change-modal"
import { FeeReceiptModal, type ReceiptData } from "@/app/institute/fees/components/fee-receipt-modal"

interface StudentPortalWorkspaceProps {
  student: any
  institute: any
  batches: any[]
  fees: any[]
  attendance: any[]
  announcements?: BatchAnnouncementItem[]
  isPreview?: boolean
}

export function StudentPortalWorkspace({
  student,
  institute,
  batches = [],
  fees = [],
  attendance = [],
  announcements = [],
  isPreview = false,
}: StudentPortalWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("batches")
  const { toast } = useToast()

  // Phone state & OTP verification modal
  const [currentPhone, setCurrentPhone] = useState(student.phoneNo || "+91 98102 45631")
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)

  // Receipt modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null)

  // Notification toggles
  const [notifyLectures, setNotifyLectures] = useState(true)
  const [notifyAttendance, setNotifyAttendance] = useState(true)
  const [notifyFees, setNotifyFees] = useState(true)

  // Fallback demo batches if none enrolled yet
  const displayBatches =
    batches.length > 0
      ? batches
      : [
          {
            id: "b-default-1",
            className: "Class 12",
            subject: "Physics (Advanced)",
            timing: "Mon, Wed, Fri · 04:30 PM - 06:00 PM",
            teacher: { name: "Dr. Arvind Raman" },
          },
          {
            id: "b-default-2",
            className: "Class 12",
            subject: "Mathematics (Calculus)",
            timing: "Tue, Thu, Sat · 06:15 PM - 07:45 PM",
            teacher: { name: "Prof. Rajesh Kumar" },
          },
        ]

  const [selectedBatchId, setSelectedBatchId] = useState<string>("ALL")
  const [noticeFilter, setNoticeFilter] = useState<"ALL" | "ADMIN" | "FACULTY">("ALL")
  const [noticeSearch, setNoticeSearch] = useState("")

  const adminNoticesCount = useMemo(
    () => announcements.filter((a) => a.authorRole === "ADMIN").length,
    [announcements]
  )
  const facultyNoticesCount = useMemo(
    () => announcements.filter((a) => a.authorRole === "FACULTY").length,
    [announcements]
  )

  const batchCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of announcements) {
      const key = a.batchId ?? "GLOBAL"
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [announcements])

  const filteredNotices = useMemo(() => {
    return announcements.filter((notice) => {
      // Filter by enrolled batch or global
      if (selectedBatchId === "GLOBAL") {
        if (notice.batchId !== null) return false
      } else if (selectedBatchId !== "ALL") {
        if (notice.batchId !== selectedBatchId) return false
      }

      // Filter by sender role
      if (noticeFilter === "ADMIN" && notice.authorRole !== "ADMIN") return false
      if (noticeFilter === "FACULTY" && notice.authorRole !== "FACULTY") return false

      // Search keyword
      if (noticeSearch.trim()) {
        const q = noticeSearch.toLowerCase()
        const matchContent = notice.content.toLowerCase().includes(q)
        const matchAuthor = notice.authorName.toLowerCase().includes(q)
        const matchBatch = notice.batchName?.toLowerCase().includes(q)
        if (!matchContent && !matchAuthor && !matchBatch) return false
      }
      return true
    })
  }, [announcements, selectedBatchId, noticeFilter, noticeSearch])

  // Extract all payment receipts
  const receiptList = useMemo<ReceiptData[]>(() => {
    const list: ReceiptData[] = []
    fees.forEach((f) => {
      f.payments?.forEach((p: any) => {
        list.push({
          receiptNo: p.receiptNo,
          studentName: student.name,
          batchName: displayBatches[0]
            ? `${displayBatches[0].className} - ${displayBatches[0].subject}`
            : "Coaching Batch",
          amount: p.amount,
          paymentMode: p.paymentMode || "UPI",
          remainingBalance: Math.max(0, (f.amountTotal || 0) - (f.amountPaid || 0)),
          paidAt: p.paidAt,
          cashierName: p.receivedBy || "Accounts Desk",
          instituteName: institute?.name || "Classly Coaching Institute",
        })
      })
    })
    if (list.length === 0) {
      list.push({
        receiptNo: "REC-2026-784",
        studentName: student.name || "Aarav Sharma",
        batchName: displayBatches[0]
          ? `${displayBatches[0].className} - ${displayBatches[0].subject}`
          : "Class 12 - Physics (Advanced)",
        amount: 25000,
        paymentMode: "UPI",
        remainingBalance: 0,
        paidAt: new Date().toISOString(),
        cashierName: "Accounts Desk",
        instituteName: institute?.name || "Classly Coaching Institute",
      })
    }
    return list
  }, [fees, student.name, displayBatches, institute?.name])

  // Fee calculation
  const totalFeeDue = fees.reduce(
    (acc, f) => acc + (f.amountTotal - (f.amountPaid || 0)),
    0
  )
  const isFeeClear = totalFeeDue === 0

  const studentInitials = student.name
    ? student.name.substring(0, 2).toUpperCase()
    : "ST"

  const rollNumber = student.id
    ? `EDM-${student.id.slice(-4).toUpperCase()}`
    : "EDM-2026-01"

  return (
    <div className="space-y-6">
      {/* Preview Mode Alert Banner */}
      {isPreview && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <Info className="size-4 shrink-0 text-amber-700" />
            <span>
              <strong>Preview mode</strong>: Viewing sample student data.
            </span>
          </div>
          <span className="font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
            Preview
          </span>
        </div>
      )}

      {/* Student Profile Header Card */}
      <div className="rounded-2xl border border-[#e7e9ed] bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-primary text-white font-bold text-2xl flex items-center justify-center shadow-sm">
              {studentInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-[#15171b]">
                  {student.name || "Student"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Roll: {rollNumber}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[#5e6b63]">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <GraduationCap className="size-3.5 text-primary" />
                  {institute?.name || "Classly"}
                </span>
                {student.phoneNo && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3 text-muted-foreground" />
                    {student.phoneNo}
                  </span>
                )}
                {student.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3 text-muted-foreground" />
                    {student.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("fees")
                toast({
                  title: "Fees",
                  description: isFeeClear
                    ? "All fee installments are paid."
                    : "Outstanding dues found.",
                })
              }}
              className="rounded-xl h-10 px-4 text-xs font-semibold border-[#e7e9ed] hover:bg-[#fafbfc] cursor-pointer"
            >
              <IndianRupee className="size-3.5 mr-1.5 text-primary" />
              {isFeeClear ? "Receipts" : "Fees"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setActiveTab("announcements")
              }}
              className="rounded-xl h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
            >
              <Megaphone className="size-3.5 mr-1.5" />
              Announcements
            </Button>
          </div>
        </div>
      </div>

      {/* 4-Metric KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Enrolled Batches */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Batches</span>
            <BookOpen className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            {displayBatches.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Assigned batches
          </p>
        </div>

        {/* Metric 2: Attendance Rate */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Attendance rate</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            94.5%
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[94.5%]" />
          </div>
        </div>

        {/* Metric 3: Announcements */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Announcements</span>
            <Megaphone className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            {announcements.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active institute notices
          </p>
        </div>

        {/* Metric 4: Fee Realization */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Fees pending</span>
            <IndianRupee className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            {isFeeClear ? "Paid" : `₹${totalFeeDue.toLocaleString("en-IN")}`}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isFeeClear ? "No pending payments" : "Payment due"}
          </p>
        </div>
      </div>

      {/* Main Tabbed Workspace */}
      <div className="rounded-2xl border border-[#e7e9ed] bg-white shadow-xs overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-[#e7e9ed] px-6 bg-[#fafbfc]">
            <TabsList className="h-12 gap-6 bg-transparent p-0">
              <TabsTrigger value="batches" className="gap-2 pb-3.5 pt-3">
                <BookOpen className="size-4" />
                <span>Batches</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="gap-2 pb-3.5 pt-3">
                <Calendar className="size-4" />
                <span>Timetable</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">v2</span>
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="gap-2 pb-3.5 pt-3">
                <GraduationCap className="size-4" />
                <span>Syllabus</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">v2</span>
              </TabsTrigger>
              <TabsTrigger value="fees" className="gap-2 pb-3.5 pt-3">
                <IndianRupee className="size-4" />
                <span>Fees</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="gap-2 pb-3.5 pt-3">
                <Megaphone className="size-4" />
                <span>Announcements</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 pb-3.5 pt-3">
                <Settings className="size-4" />
                <span>Settings & Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: MY BATCHES */}
          <TabsContent value="batches" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Batches
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayBatches.map((batch: any) => (
                <div
                  key={batch.id}
                  className="p-5 rounded-2xl border border-[#e7e9ed] bg-[#f8fafc] hover:border-primary/40 hover:bg-white transition-all space-y-3 cursor-pointer group"
                  onClick={() => {
                    toast({
                      title: `${batch.className} - ${batch.subject}`,
                      description: `Timing: ${batch.timing || "Flexible"} | Teacher: ${batch.teacher?.name || "Unassigned"}`,
                    })
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-200">
                      {batch.subject}
                    </span>
                    <span className="text-xs font-semibold text-[#5e6b63]">
                      {batch.className}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#15171b] group-hover:text-primary transition-colors">
                      {batch.batchName || `${batch.className} · ${batch.subject}`}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#5e6b63] mt-1">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span>{batch.timing || "Schedule"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center">
                        {(batch.teacher?.name || "T").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#1a201c]">
                        {batch.teacher?.name || "Teacher"}
                      </span>
                    </div>
                    <span className="text-[11px] text-primary font-semibold group-hover:underline">
                      View details
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: WEEKLY TIMETABLE (DEFERRED TO V2) */}
          <TabsContent value="timetable" className="p-8 space-y-4">
            <div className="max-w-2xl mx-auto rounded-2xl border border-dashed border-[#d0d7d2] bg-[#fbfcfb] p-8 text-center space-y-5">
              <div className="size-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto shadow-xs">
                <Calendar className="size-7" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <Sparkles className="size-3.5" />
                  <span>Roadmap Feature · Scheduled for v2</span>
                </div>
                <h3 className="text-base font-bold text-[#15171b]">
                  Interactive Class Schedule & Timetable
                </h3>
                <p className="text-xs text-[#5e6b63] leading-relaxed max-w-md mx-auto">
                  A personalized weekly timetable with live classroom locations, subject slots, and teacher schedules is being built for the next major release.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white text-left text-xs text-[#5e6b63] flex items-center gap-3">
                <Megaphone className="size-5 text-primary shrink-0" />
                <span>
                  Check the <strong>Announcements</strong> tab for daily lecture timings, holiday schedules, and special class notices posted by your teachers.
                </span>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("announcements")}
                  className="rounded-xl h-9 text-xs font-semibold cursor-pointer"
                >
                  View Announcements
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: CURRICULUM PROGRESS (DEFERRED TO V2) */}
          <TabsContent value="curriculum" className="p-8 space-y-4">
            <div className="max-w-2xl mx-auto rounded-2xl border border-dashed border-[#d0d7d2] bg-[#fbfcfb] p-8 text-center space-y-5">
              <div className="size-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto shadow-xs">
                <GraduationCap className="size-7" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <Sparkles className="size-3.5" />
                  <span>Roadmap Feature · Scheduled for v2</span>
                </div>
                <h3 className="text-base font-bold text-[#15171b]">
                  Course Syllabus & Chapter Tracker
                </h3>
                <p className="text-xs text-[#5e6b63] leading-relaxed max-w-md mx-auto">
                  Chapter-wise curriculum tracking, download links for study material, and topic progress percentages will be available in the upcoming v2 update.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#e7e9ed] bg-white text-left text-xs text-[#5e6b63] flex items-center gap-3">
                <BookOpen className="size-5 text-primary shrink-0" />
                <span>
                  All your active batch enrollments and subject details are available in the <strong>Batches</strong> tab.
                </span>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("batches")}
                  className="rounded-xl h-9 text-xs font-semibold cursor-pointer"
                >
                  View Enrolled Batches
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: FEE LEDGER */}
          <TabsContent value="fees" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Fees
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      Tuition fee (Quarter 1 & 2)
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Paid on 15 Jul 2026
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Receipt downloaded",
                      description: "Receipt REC-2026-784 saved.",
                    })
                  }}
                  className="rounded-xl h-8 px-3 text-xs font-semibold bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  <Download className="size-3 mr-1" />
                  Download receipt
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
                    <IndianRupee className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950">
                      Tuition fee (Quarter 3)
                    </div>
                    <div className="text-[11px] text-blue-700">
                      Due 15 Oct 2026
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Payment gateway",
                      description: "Opening payment gateway...",
                    })
                  }}
                  className="rounded-xl h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary-hover text-white cursor-pointer"
                >
                  Pay ₹40,000
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: ANNOUNCEMENTS */}
          <TabsContent value="announcements" className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Announcements
                </h3>
              </div>

              {/* Segmented Source Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted border border-border self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setNoticeFilter("ALL")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                    noticeFilter === "ALL"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({announcements.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeFilter("ADMIN")}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                    noticeFilter === "ADMIN"
                      ? "bg-purple-50 text-purple-800 shadow-xs ring-1 ring-purple-200"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ShieldCheck className="size-3 text-purple-600" />
                  Admin ({adminNoticesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeFilter("FACULTY")}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                    noticeFilter === "FACULTY"
                      ? "bg-blue-50 text-blue-800 shadow-xs ring-1 ring-blue-200"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <GraduationCap className="size-3 text-blue-600" />
                  Teachers ({facultyNoticesCount})
                </button>
              </div>
            </div>

            {/* Filter by Enrolled Batches Rail */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers3 className="size-3 text-primary" /> Batches
                </span>
                {selectedBatchId !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => setSelectedBatchId("ALL")}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  >
                    All batches
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatchId("ALL")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                    selectedBatchId === "ALL"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-white text-muted-foreground border-border hover:border-slate-300 hover:text-foreground"
                  )}
                >
                  <Layers3 className="size-3.5" />
                  All batches
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      selectedBatchId === "ALL" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {announcements.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBatchId("GLOBAL")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                    selectedBatchId === "GLOBAL"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-white text-muted-foreground border-border hover:border-slate-300 hover:text-foreground"
                  )}
                >
                  <Globe className="size-3.5" />
                  All batches
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      selectedBatchId === "GLOBAL" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {batchCounts["GLOBAL"] || 0}
                  </span>
                </button>

                {displayBatches.map((batch: any) => {
                  const count = batchCounts[batch.id] || 0
                  const label = `${batch.className} ${batch.batchName ? `(${batch.batchName})` : batch.subject ? `(${batch.subject})` : ""}`.trim()
                  const isSelected = selectedBatchId === batch.id
                  return (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => setSelectedBatchId(batch.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-white text-muted-foreground border-border hover:border-slate-300 hover:text-foreground"
                      )}
                    >
                      <BookOpen className="size-3.5" />
                      <span className="truncate max-w-[200px]">{label}</span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                          isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="Search announcements..."
                className="h-9 pl-9 pr-8 text-xs rounded-xl border-border bg-white"
              />
              {noticeSearch && (
                <button
                  type="button"
                  onClick={() => setNoticeSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Notices List */}
            <div className="space-y-3">
              {filteredNotices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e7e9ed] bg-white p-10 text-center">
                  <div className="size-10 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-2">
                    <Megaphone className="size-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#15171b]">
                    {announcements.length === 0
                      ? "No announcements yet"
                      : "No announcements match your search"}
                  </h4>
                  <p className="text-xs text-[#5e6b63] mt-1 max-w-sm mx-auto">
                    {announcements.length === 0
                      ? "Announcements from your teachers and institute will appear here."
                      : "Try resetting your search query or selecting a different batch."}
                  </p>
                  {(selectedBatchId !== "ALL" || noticeFilter !== "ALL" || noticeSearch) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBatchId("ALL")
                        setNoticeFilter("ALL")
                        setNoticeSearch("")
                      }}
                      className="mt-3 h-8 text-xs rounded-xl"
                    >
                      Reset filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-5 rounded-2xl border border-[#e7e9ed] bg-white hover:border-primary/40 transition-all space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
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

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {notice.batchName || "All batches"}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(notice.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="pt-0.5">
                      <p className="text-[13px] text-[#15171b] leading-relaxed whitespace-pre-line font-normal">
                        {notice.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB 6: SETTINGS & PROFILE */}
          <TabsContent value="settings" className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#15171b]">
                Student Profile & Account Settings
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your registered contact number, review enrolled guardian details, and access official fee receipts.
              </p>
            </div>

            {/* SECTION 1: REGISTERED MOBILE NUMBER & OTP VERIFICATION */}
            <div className="rounded-2xl border border-border bg-[#fafbfc] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#15171b]">
                    Registered Mobile Number
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Direct SMS destination for examination schedules, class cancellations, and fee receipts
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#15171b] font-mono">
                      {currentPhone}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Maximum 3 phone updates permitted per academic year with OTP verification.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="rounded-xl h-9 text-xs font-semibold border-border hover:bg-muted/40 cursor-pointer shrink-0"
                >
                  <ShieldCheck className="size-3.5 mr-1.5 text-primary" />
                  Change mobile number
                </Button>
              </div>
            </div>

            {/* SECTION 2: ACADEMIC & GUARDIAN PROFILE */}
            <div className="rounded-2xl border border-border bg-[#fafbfc] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                  <User className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#15171b]">
                    Enrollment & Guardian Information
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Official records registered with {institute?.name || "your coaching institute"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Student Full Name
                  </span>
                  <p className="text-xs font-bold text-[#15171b]">
                    {student.name || "Aarav Sharma"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Student Enrollment ID
                  </span>
                  <p className="text-xs font-mono font-bold text-[#15171b]">
                    {student.id ? student.id.slice(0, 16) : "STD-2026-0941"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Registered Email
                  </span>
                  <p className="text-xs font-mono text-[#15171b] truncate">
                    {student.email || "student@example.com"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Primary Guardian / Parent
                  </span>
                  <p className="text-xs font-bold text-[#15171b]">
                    Rajesh Sharma (Father)
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Parent Contact Number
                  </span>
                  <p className="text-xs font-mono text-[#15171b]">
                    {student.parentPhone || "+91 98102 99881"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Residential Address
                  </span>
                  <p className="text-xs text-[#15171b] truncate">
                    {student.address || "Connaught Place, New Delhi"}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3: OFFICIAL RECEIPTS & INVOICES ARCHIVE */}
            <div className="rounded-2xl border border-border bg-[#fafbfc] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#15171b]">
                    Fee Receipts & Document Archive
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Official tax and payment receipts generated for coaching tuition installments
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {receiptList.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-[#15171b]">
                            {r.receiptNo}
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-primary">
                            {r.paymentMode}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Paid: ₹{r.amount.toLocaleString("en-IN")} · {r.batchName}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveReceipt(r)
                        setReceiptModalOpen(true)
                      }}
                      className="rounded-xl h-8 px-3 text-xs font-semibold border-border hover:bg-muted/40 cursor-pointer shrink-0"
                    >
                      <Download className="size-3.5 mr-1 text-primary" />
                      View & print receipt
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: NOTIFICATION PREFERENCES */}
            <div className="rounded-2xl border border-border bg-[#fafbfc] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Megaphone className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#15171b]">
                    Notification Dispatch Channels
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Preferences for urgent class notices and automated communication
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl border border-border bg-white flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#15171b]">
                      Lecture Reschedule & Doubt Session Alerts
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Receive immediate SMS whenever batch timings are adjusted by faculty.
                    </p>
                  </div>
                  <Switch checked={notifyLectures} onCheckedChange={setNotifyLectures} />
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#15171b]">
                      Roll-Call Absentee Alert to Parent
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Dispatches daily alert to parent phone number if absent during roll call.
                    </p>
                  </div>
                  <Switch checked={notifyAttendance} onCheckedChange={setNotifyAttendance} />
                </div>

                <div className="p-3 rounded-xl border border-border bg-white flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#15171b]">
                      Installment Due Date Reminders
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Sends polite reminder notices 3 days prior to fee schedule due dates.
                    </p>
                  </div>
                  <Switch checked={notifyFees} onCheckedChange={setNotifyFees} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Phone Change OTP Verification Modal */}
      <PhoneChangeModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
        currentPhone={currentPhone}
        role="student"
        onSuccess={(newPhone) => {
          setCurrentPhone(newPhone)
        }}
      />

      {/* Fee Receipt View & Print Modal */}
      <FeeReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        receipt={activeReceipt}
        instituteName={institute?.name || "Classly Coaching Institute"}
      />
    </div>
  )
}


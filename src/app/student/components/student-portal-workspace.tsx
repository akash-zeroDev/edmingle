"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { mockModules, mockTimetable, mockAnnouncements } from "@/data/mock-batch-workspace"

interface StudentPortalWorkspaceProps {
  student: any
  institute: any
  batches: any[]
  fees: any[]
  attendance: any[]
  isPreview?: boolean
}

export function StudentPortalWorkspace({
  student,
  institute,
  batches = [],
  fees = [],
  attendance = [],
  isPreview = false,
}: StudentPortalWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("batches")
  const { toast } = useToast()

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
              <strong>Admin Preview Mode</strong>: You are viewing the Student Portal as an administrator. Enrolled student data is loaded in sample preview mode.
            </span>
          </div>
          <span className="font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
            Preview Active
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
                  {student.name || "Enrolled Student"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Enrollment
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Roll: {rollNumber}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[#5e6b63]">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <GraduationCap className="size-3.5 text-primary" />
                  {institute?.name || "Edmingle Coaching Institute"}
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
                  title: "Fee Portal",
                  description: isFeeClear
                    ? "All your tuition installments are completely up to date!"
                    : "Outstanding dues found. Review the fee ledger below.",
                })
              }}
              className="rounded-xl h-10 px-4 text-xs font-semibold border-[#e7e9ed] hover:bg-[#fafbfc] cursor-pointer"
            >
              <IndianRupee className="size-3.5 mr-1.5 text-primary" />
              {isFeeClear ? "Fee Receipts" : "View Dues"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setActiveTab("timetable")
              }}
              className="rounded-xl h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
            >
              <Calendar className="size-3.5 mr-1.5" />
              Weekly Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* 4-Metric KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Enrolled Batches */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Enrolled Batches</span>
            <BookOpen className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            {displayBatches.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active courses this academic term
          </p>
        </div>

        {/* Metric 2: Attendance Rate */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Attendance Rate</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            94.5%
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[94.5%]" />
          </div>
        </div>

        {/* Metric 3: Syllabus Progress */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Curriculum Progress</span>
            <GraduationCap className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            68%
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full w-[68%]" />
          </div>
        </div>

        {/* Metric 4: Fee Realization */}
        <div className="rounded-2xl border border-[#e7e9ed] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5e6b63] mb-2 font-medium">
            <span>Tuition Dues</span>
            <IndianRupee className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-[#15171b]">
            {isFeeClear ? "All Cleared" : `₹${totalFeeDue.toLocaleString("en-IN")}`}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isFeeClear ? "No pending payments" : "Quarterly installment due"}
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
                <span>My Batches</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="gap-2 pb-3.5 pt-3">
                <Calendar className="size-4" />
                <span>Weekly Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="gap-2 pb-3.5 pt-3">
                <GraduationCap className="size-4" />
                <span>Curriculum Progress</span>
              </TabsTrigger>
              <TabsTrigger value="fees" className="gap-2 pb-3.5 pt-3">
                <IndianRupee className="size-4" />
                <span>Fee Ledger & Receipts</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="gap-2 pb-3.5 pt-3">
                <Megaphone className="size-4" />
                <span>Notices & Broadcasts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: MY BATCHES */}
          <TabsContent value="batches" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Enrolled Academic Batches
                </h3>
                <p className="text-xs text-[#5e6b63]">
                  Your active courses, assigned teachers, and lecture timings.
                </p>
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
                      description: `Timing: ${batch.timing || "Flexible"} | Teacher: ${batch.teacher?.name || "Faculty"}`,
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
                      <span>{batch.timing || "Regular schedule"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center">
                        {(batch.teacher?.name || "T").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#1a201c]">
                        {batch.teacher?.name || "Assigned Teacher"}
                      </span>
                    </div>
                    <span className="text-[11px] text-primary font-semibold group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: WEEKLY TIMETABLE */}
          <TabsContent value="timetable" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Weekly Lecture Grid (Monday – Saturday)
                </h3>
                <p className="text-xs text-[#5e6b63]">
                  Scheduled lecture timings, room locations, and discussion topics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mockTimetable.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#e7e9ed] bg-white hover:border-primary/40 hover:shadow-xs transition-all space-y-2 cursor-pointer group"
                  onClick={() => {
                    toast({
                      title: slot.topic,
                      description: `${slot.day} · ${slot.time} in ${slot.room}`,
                    })
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary">{slot.day}</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {slot.room}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#15171b] group-hover:text-primary transition-colors">
                      {slot.topic}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                      <Clock className="size-3 text-slate-400" />
                      <span>{slot.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: CURRICULUM PROGRESS */}
          <TabsContent value="curriculum" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Syllabus Milestone Tracking
                </h3>
                <p className="text-xs text-[#5e6b63]">
                  Track completed chapters, ongoing lectures, and upcoming milestones.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mockModules.map((module, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#e7e9ed] bg-white hover:border-primary/30 transition-all space-y-2 cursor-pointer"
                  onClick={() => {
                    toast({
                      title: module.name,
                      description: `${module.topics} completed. Progress: ${module.progress}%`,
                    })
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#15171b]">
                      {module.name}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {module.progress}% Completed
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{module.topics}</span>
                    <span>
                      {module.progress === 100 ? "Finished" : "In Progress"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: FEE LEDGER */}
          <TabsContent value="fees" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Fee Schedule & Payment Receipts
                </h3>
                <p className="text-xs text-[#5e6b63]">
                  Track installments, clear outstanding dues, and download verified receipts.
                </p>
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
                      Quarter 1 & 2 Tuition Fee
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Paid on 15 Jul 2026 · Verified by Institute Accounts
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Receipt Downloaded",
                      description: "Official receipt #REC-2026-784 saved as PDF.",
                    })
                  }}
                  className="rounded-xl h-8 px-3 text-xs font-semibold bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  <Download className="size-3 mr-1" />
                  Download Receipt
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
                    <IndianRupee className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950">
                      Quarter 3 Academic Installment
                    </div>
                    <div className="text-[11px] text-blue-700">
                      Due Date: 15 Oct 2026 · Amount: ₹40,000
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Online Fee Gateway",
                      description: "Redirecting to Razorpay / UPI secure payment portal...",
                    })
                  }}
                  className="rounded-xl h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary-hover text-white cursor-pointer"
                >
                  Pay ₹40,000 Now
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: ANNOUNCEMENTS */}
          <TabsContent value="announcements" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#15171b]">
                  Institute Notices & Broadcasts
                </h3>
                <p className="text-xs text-[#5e6b63]">
                  Important announcements broadcasted to your enrolled batch.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mockAnnouncements.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 rounded-xl border border-[#e7e9ed] bg-white hover:border-primary/30 transition-all space-y-2 cursor-pointer group"
                  onClick={() => {
                    toast({
                      title: notice.title,
                      description: notice.body,
                    })
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#15171b] group-hover:text-primary transition-colors">
                      {notice.title}
                    </h5>
                    <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded">
                      Notice
                    </span>
                  </div>
                  <p className="text-xs text-[#5e6b63] leading-relaxed">
                    {notice.body}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>{notice.meta}</span>
                    <span className="text-primary font-medium">Click to read →</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

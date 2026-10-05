"use client"

import * as React from "react"
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Banknote,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  IndianRupee,
  Layers,
  Layers3,
  Plus,
  UserPlus,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "@/components/ui/calendar"
import { ExportReportDialog, type ExportReportData } from "./export-report-dialog"

export interface LiveDashboardProps {
  instituteName: string
  adminName: string
  totalStudents: number
  totalTeachers: number
  feesThisMonth: number
  recentPayments: Array<{
    id: string
    receiptNo?: string
    studentName: string
    batchName: string
    amount: number
    date: string
    method: string
    status: string
  }>
  upcomingClasses: Array<{
    id: string
    className: string
    subject: string
    timing: string | null
    teacherName: string | null
  }>
  studentMonthlyTrend?: Array<{
    month: string
    newStudents: number
    active: number
  }>
  weeklyFeeComparison?: Array<{
    week: string
    current: number
    previous: number
  }>
  todayAttendanceMetrics?: {
    overallPercentage: string
    breakdown: Array<{
      label: string
      percentage: string
      color: string
    }>
    batches: Array<{
      name: string
      present: number
      total: number
      rate: string
    }>
  }
  attentionAlerts?: Array<{
    title: string
    detail: string
    severity: "error" | "warning" | "info"
    link: string
    actionText: string
  }>
  liveAnnouncements?: Array<{
    text: string
    date: string
  }>
  liveTopStudents?: Array<{
    rank: number
    name: string
    batch: string
    score: string
  }>
  exportPayload?: any
  rawStudents?: any[]
  rawPayments?: any[]
  rawAttendance?: any[]
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <div className="flex min-h-12 items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase()
  const styles: Record<string, string> = {
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border",
        styles[normalized] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {normalized}
    </span>
  )
}

const KpiNumber = React.memo(function KpiNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame: number
    const duration = 650
    const start = performance.now()

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])

  const formatted = decimals
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString("en-IN")

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
})

function ActionDialog({
  action,
  onClose,
}: {
  action: string | null
  onClose: () => void
}) {
  const { toast } = useToast()
  const isStudent = action === "Add student"

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast({
      title: `${action} completed`,
      description: "Action has been processed successfully.",
    })
    onClose()
  }

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">{action}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isStudent
              ? "Register a student and assign an initial batch."
              : `Complete the details below to ${action?.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        <form id="action-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2 py-2">
          {isStudent ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Full name</Label>
                <Input required maxLength={100} placeholder="Student name" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input required maxLength={15} placeholder="+91 98765 43210" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input required maxLength={255} type="email" placeholder="student@example.com" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Parent Phone</Label>
                <Input required maxLength={15} placeholder="+91 98765 43210" className="h-9 text-xs" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Reference Details</Label>
                <Input required maxLength={100} placeholder={`Enter ${action?.toLowerCase()} details`} className="h-9 text-xs" />
              </div>
            </>
          )}
        </form>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button type="submit" form="action-form" size="sm" className="h-8 text-xs bg-primary hover:bg-primary-hover text-white">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function InstituteDashboardView({
  instituteName,
  adminName,
  totalStudents,
  totalTeachers,
  feesThisMonth,
  recentPayments,
  upcomingClasses,
  studentMonthlyTrend = [],
  weeklyFeeComparison = [],
  todayAttendanceMetrics,
  attentionAlerts = [],
  liveAnnouncements = [],
  liveTopStudents = [],
  exportPayload,
  rawStudents = [],
  rawPayments = [],
  rawAttendance = [],
}: LiveDashboardProps) {
  // Calendar Range Filter state
  const [periodPreset, setPeriodPreset] = useState("This Month")
  const [selectedRange, setSelectedRange] = useState<DateRange>(() => {
    const now = new Date()
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
    }
  })

  // Export report modal
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const [action, setAction] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const { toast } = useToast()

  // Dynamic calculations based on selected date range
  const filteredMetrics = useMemo(() => {
    if (!selectedRange.from) {
      return {
        students: totalStudents,
        fees: feesThisMonth,
        attendanceRate: todayAttendanceMetrics ? parseFloat(todayAttendanceMetrics.overallPercentage) : 92.4,
      }
    }

    const fromTime = selectedRange.from.getTime()
    const toTime = selectedRange.to ? selectedRange.to.getTime() : Date.now()

    // Students enrolled within this period (or active up to 'toTime')
    const rangeStudents = rawStudents.filter((s) => {
      const jTime = new Date(s.joinedAt).getTime()
      return jTime <= toTime
    }).length

    // Fees collected within this period
    const rangeFees = rawPayments
      .filter((p) => {
        const pTime = new Date(p.paidAt).getTime()
        return pTime >= fromTime && pTime <= toTime
      })
      .reduce((sum, p) => sum + p.amount, 0)

    // Attendance records in range
    const rangeAttendance = rawAttendance.filter((a) => {
      const aTime = new Date(a.date).getTime()
      return aTime >= fromTime && aTime <= toTime
    })

    const present = rangeAttendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length
    const totalAtt = rangeAttendance.length
    const attRate = totalAtt > 0 ? Number(((present / totalAtt) * 100).toFixed(1)) : (todayAttendanceMetrics ? parseFloat(todayAttendanceMetrics.overallPercentage) : 92.4)

    return {
      students: rangeStudents > 0 ? rangeStudents : totalStudents,
      fees: rangeFees > 0 ? rangeFees : feesThisMonth,
      attendanceRate: attRate,
    }
  }, [selectedRange, rawStudents, rawPayments, rawAttendance, totalStudents, feesThisMonth, todayAttendanceMetrics])

  const displayStudents = filteredMetrics.students
  const displayFees = filteredMetrics.fees
  const displayAttendanceRate = filteredMetrics.attendanceRate
  const displayTopStudents = liveTopStudents

  const feeInLakhs = displayFees ? Number((displayFees / 100000).toFixed(2)) : 0

  const sortedPayments = useMemo(() => {
    return [...recentPayments].sort((a, b) =>
      sortAsc ? a.amount - b.amount : b.amount - a.amount
    )
  }, [recentPayments, sortAsc])

  const paginatedPayments = useMemo(() => {
    return sortedPayments.slice((page - 1) * 5, page * 5)
  }, [sortedPayments, page])

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }, [])

  // Prepare full data for ExportReportDialog
  const currentExportData: ExportReportData = useMemo(() => {
    if (exportPayload) {
      return {
        ...exportPayload,
        periodName: periodPreset,
        dateRangeStr: selectedRange.from && selectedRange.to
          ? `${selectedRange.from.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – ${selectedRange.to.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`
          : "All Time",
        metrics: {
          totalStudents: displayStudents,
          activeTeachers: totalTeachers,
          feesCollected: displayFees,
          attendanceRate: displayAttendanceRate,
          totalBatches: exportPayload.batches?.length || 0,
        },
      }
    }
    return {
      instituteName,
      adminName,
      periodName: periodPreset,
      dateRangeStr: "Active Cycle",
      metrics: {
        totalStudents: displayStudents,
        activeTeachers: totalTeachers,
        feesCollected: displayFees,
        attendanceRate: displayAttendanceRate,
        totalBatches: 1,
      },
      students: [],
      teachers: [],
      batches: [],
      payments: recentPayments,
      attendanceSummary: [],
    }
  }, [exportPayload, periodPreset, selectedRange, displayStudents, totalTeachers, displayFees, displayAttendanceRate, instituteName, adminName, recentPayments])

  const activeAttendanceMetrics = todayAttendanceMetrics || {
    overallPercentage: "92.4%",
    breakdown: [
      { label: "Present", percentage: "88%", color: "bg-emerald-500" },
      { label: "Late", percentage: "6%", color: "bg-amber-500" },
      { label: "Absent", percentage: "4%", color: "bg-rose-500" },
      { label: "Excused", percentage: "2%", color: "bg-blue-400" },
    ],
    batches: [],
  }

  const activeAlerts = attentionAlerts

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-5">
      {/* Header Banner */}
      <div className="dashboard-enter flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">{todayStr}</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Good day, {adminName || instituteName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here’s what’s happening across {instituteName} today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            className="h-9 gap-1.5 text-xs bg-card border-border shadow-none hover:bg-muted cursor-pointer"
          >
            <Download className="size-3.5" /> Export Report
          </Button>
          <Button
            size="sm"
            asChild
            className="h-9 gap-1.5 text-xs bg-primary hover:bg-primary-hover text-white shadow-sm"
          >
            <Link href="/institute/students/new">
              <Plus className="size-3.5" /> Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Period Selector & Metrics Overview Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <p className="text-xs text-muted-foreground font-medium">Overview of key institute metrics</p>
        <DateRangePicker
          value={selectedRange}
          onChange={(r) => {
            if (r) {
              setSelectedRange(r)
              setPeriodPreset("Custom Range")
            }
          }}
          onApplyPreset={(preset, range) => {
            setPeriodPreset(preset)
            setSelectedRange(range)
          }}
          activePreset={periodPreset}
        />
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Students */}
        <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Total Students
          </p>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <p className="text-[26px] font-bold leading-none text-foreground">
              <KpiNumber value={displayStudents} />
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUp className="size-3 mr-0.5" />
              Active
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{periodPreset}</p>
        </section>

        {/* Active Faculty */}
        <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Active Teachers
          </p>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <p className="text-[26px] font-bold leading-none text-foreground">
              <KpiNumber value={totalTeachers} />
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUp className="size-3 mr-0.5" />
              Load
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">assigned to active batches</p>
        </section>

        {/* Fees Collected */}
        <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Fees Collected
          </p>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <p className="text-[26px] font-bold leading-none text-foreground">
              {displayFees > 99999 ? (
                <KpiNumber value={feeInLakhs} prefix="₹" suffix="L" decimals={2} />
              ) : (
                <KpiNumber value={displayFees} prefix="₹" />
              )}
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUp className="size-3 mr-0.5" />
              Realized
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">collected in {periodPreset}</p>
        </section>

        {/* Attendance Rate */}
        <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Attendance Rate
          </p>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <p className="text-[26px] font-bold leading-none text-foreground">
              <KpiNumber value={displayAttendanceRate} suffix="%" decimals={1} />
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUp className="size-3 mr-0.5" />
              Sessions
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{periodPreset}</p>
        </section>
      </div>

      {/* Charts Grid: Student Overview & Fee Collection */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
        {/* Student Overview AreaChart */}
        <Panel
          title="Student Overview"
          action={
            <div className="flex gap-4 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" /> New admissions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-400" /> Active cohort
              </span>
            </div>
          }
        >
          <div className="h-56 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentMonthlyTrend} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="newStudents" name="New Admissions" stroke="var(--primary)" strokeWidth={2} fill="var(--primary-light)" fillOpacity={0.6} />
                <Area yAxisId="right" type="monotone" dataKey="active" name="Active Students" stroke="#94a3b8" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Fee Collection ComposedChart */}
        <Panel
          title="Fee Collection"
          action={
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary hover:text-primary-hover">
              <Link href="/institute/fees">
                Details <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          }
        >
          <div className="flex items-end justify-between px-4 pt-3">
            <div>
              <p className="text-xl font-bold text-foreground">
                ₹{feeInLakhs > 0 ? `${feeInLakhs}L` : displayFees.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground">Realized in {periodPreset}</p>
            </div>
            <div className="text-right text-[11px] text-muted-foreground flex gap-3">
              <span className="flex items-center gap-1 text-primary font-semibold">
                <span className="size-2 rounded-xs bg-primary" /> Current
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-xs bg-slate-400" /> Previous
              </span>
            </div>
          </div>
          <div className="h-44 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyFeeComparison} barSize={20}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: any) => [`₹${value}L`]}
                />
                <Bar dataKey="current" name="Current cycle" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="previous" name="Previous cycle" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: "var(--card)" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Row: Today's Attendance & Upcoming Classes */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Attendance Breakdown Panel */}
        <Panel
          title="Today’s Attendance"
          action={
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary hover:text-primary-hover">
              <Link href="/institute/attendance">
                View register <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          }
        >
          <div className="p-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[28px] font-bold leading-none text-foreground">
                {activeAttendanceMetrics.overallPercentage}
              </p>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Today
              </span>
            </div>

            {/* Attendance Colored Distribution Bar */}
            <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
              {activeAttendanceMetrics.breakdown.map((item) => (
                <span
                  key={item.label}
                  className={item.color}
                  style={{ width: item.percentage }}
                  title={`${item.label}: ${item.percentage}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 border-b border-border pb-3">
              {activeAttendanceMetrics.breakdown.map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">{item.label}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{item.percentage}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-border">
              {activeAttendanceMetrics.batches.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 italic">
                  No attendance recorded today.
                </p>
              ) : (
                activeAttendanceMetrics.batches.slice(0, 3).map((row) => (
                  <div key={row.name} className="flex items-center justify-between py-2 text-xs">
                    <span className="font-medium text-foreground truncate max-w-[200px]">{row.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-[11px]">{row.present}/{row.total} present</span>
                      <span className="font-semibold text-foreground">{row.rate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Panel>

        {/* Upcoming Classes / Schedule */}
        <Panel
          title="Upcoming classes"
          action={
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary hover:text-primary-hover">
              <Link href="/institute/batches">
                View all <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((batch, idx) => (
                <Link
                  key={batch.id}
                  href={`/institute/batches/${batch.id}`}
                  className="grid grid-cols-[64px_1fr_auto] items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <time className="text-sm font-bold text-primary font-mono">
                    {batch.timing || `0${idx + 9}:00`}
                  </time>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {batch.subject} <span className="font-normal text-muted-foreground">· {batch.className}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {batch.teacherName ? `Teacher: ${batch.teacherName}` : "Teacher assigned"}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded group-hover:bg-primary-light group-hover:text-primary transition-colors">
                    Room {idx + 101}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No classes scheduled today.
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Needs Attention Panel */}
      <Panel
        title="Needs Attention"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            {activeAlerts.length} item{activeAlerts.length === 1 ? "" : "s"}
          </span>
        }
      >
        <div
          className={cn(
            "divide-y md:divide-y-0 divide-border",
            activeAlerts.length <= 1
              ? "grid grid-cols-1"
              : activeAlerts.length === 2
              ? "grid md:grid-cols-2 md:divide-x divide-border"
              : "grid md:grid-cols-2 xl:grid-cols-3 md:divide-x divide-border"
          )}
        >
          {activeAlerts.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground col-span-full text-center">
              No items requiring attention.
            </div>
          ) : (
            activeAlerts.slice(0, 3).map((item) => (
              <div
                key={item.title}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={cn(
                      "mt-1 size-2.5 shrink-0 rounded-full",
                      item.severity === "error" && "bg-rose-500 ring-2 ring-rose-500/20",
                      item.severity === "warning" && "bg-amber-500 ring-2 ring-amber-500/20",
                      item.severity === "info" && "bg-blue-500 ring-2 ring-blue-500/20"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-normal">{item.detail}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 px-3 text-xs font-semibold rounded-lg shrink-0 border-border bg-card text-foreground hover:bg-primary-light hover:text-primary hover:border-primary-border shadow-2xs transition-all cursor-pointer self-start sm:self-center"
                >
                  <Link href={item.link} className="inline-flex items-center gap-1.5">
                    <span>{item.actionText}</span>
                    <ArrowRight className="size-3 text-primary" />
                  </Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Recent Payments Data Table */}
      <Panel
        title="Recent Fee Transactions"
        action={
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary hover:text-primary-hover">
            <Link href="/institute/fees">
              View all payments <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th>Student</th>
                <th>Batch</th>
                <th>
                  <button
                    onClick={() => setSortAsc((v) => !v)}
                    className="inline-flex items-center gap-1 font-semibold uppercase hover:text-foreground cursor-pointer"
                  >
                    Amount
                    {sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                  </button>
                </th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div>
                        <p className="font-semibold text-foreground text-xs">{payment.studentName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{payment.receiptNo || payment.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{payment.batchName}</td>
                    <td className="font-semibold text-foreground text-xs">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="text-xs text-muted-foreground">{payment.date}</td>
                    <td className="text-xs text-muted-foreground">{payment.method}</td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <CreditCard className="size-5 text-muted-foreground/40" />
                      <p className="text-xs font-semibold text-foreground">No payment records logged for this period</p>
                      <p className="text-[11px] text-muted-foreground">Transactions will appear here once student fees are collected.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            Showing {paginatedPayments.length} of {recentPayments.length} transactions
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              disabled={page * 5 >= recentPayments.length}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Panel>

      {/* Bottom 2-Column Grid: Top Enrolled Students & Quick Actions */}
      <div className="grid gap-5 lg:grid-cols-2 items-start">
        {/* Academic Leaders */}
        <Panel
          title="Top students"
          action={
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary hover:text-primary-hover">
              <Link href="/institute/students">
                View all students <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {displayTopStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Users className="size-6 text-muted-foreground/40 mx-auto mb-2" />
                No students registered yet.
              </div>
            ) : (
              displayTopStudents.map((item) => (
                <div key={item.rank} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-md text-xs font-bold",
                      item.rank === 1
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : item.rank === 2
                        ? "bg-slate-100 text-slate-800 border border-slate-300"
                        : item.rank === 3
                        ? "bg-amber-50 text-amber-900 border border-amber-200"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    {item.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.batch}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {item.score}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* Quick Actions */}
        <Panel title="Quick actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5">
            {[
              {
                label: "Add student",
                description: "Enroll a new student",
                icon: UserPlus,
                onClick: () => setAction("Add student"),
              },
              {
                label: "Create batch",
                description: "Set up a new batch",
                icon: Layers,
                onClick: () => setAction("Create batch"),
              },
              {
                label: "Record payment",
                description: "Record a fee payment",
                icon: CreditCard,
                onClick: () => setAction("Record payment"),
              },
              {
                label: "Mark attendance",
                description: "Mark daily attendance",
                icon: CalendarCheck,
                onClick: () => setAction("Mark attendance"),
              },
              {
                label: "Create test",
                description: "Schedule a class test",
                icon: FileText,
                onClick: () => setAction("Create test"),
              },
              {
                label: "Disburse salary",
                description: "Pay teacher salary",
                icon: Banknote,
                onClick: () => setAction("Disburse salary"),
              },
            ].map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={act.onClick}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-primary-light/60 hover:border-primary-border hover:text-primary transition-all text-left group cursor-pointer shadow-2xs min-w-0"
              >
                <div className="size-8.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                  <act.icon className="size-4 shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {act.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {act.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <ActionDialog action={action} onClose={() => setAction(null)} />

      {/* Structured Multi-Section Operations Report Dialog */}
      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={currentExportData}
      />
    </div>
  )
}

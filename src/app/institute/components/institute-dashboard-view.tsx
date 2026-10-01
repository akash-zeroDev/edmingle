"use client"

import * as React from "react"
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  IndianRupee,
  Layers3,
  Plus,
  Users,
  GraduationCap,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import {
  studentMonthlyTrend,
  weeklyFeeComparison,
  todayAttendanceMetrics,
  attentionAlerts,
  mockAnnouncements,
  mockTopPerformers,
} from "@/lib/dashboard-mock-data"

export interface LiveDashboardProps {
  instituteName: string
  adminName: string
  totalStudents: number
  totalTeachers: number
  feesThisMonth: number
  recentPayments: Array<{
    id: string
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
  const isPaid = status.toLowerCase() === "paid"
  const isPending = status.toLowerCase() === "pending"

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
        isPaid && "bg-emerald-50 text-emerald-700 border border-emerald-200",
        isPending && "bg-amber-50 text-amber-700 border border-amber-200",
        !isPaid && !isPending && "bg-rose-50 text-rose-700 border border-rose-200"
      )}
    >
      {status}
    </span>
  )
}

function KpiNumber({
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
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / 450, 1)
      setDisplay(value * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
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
}

function ActionDialog({
  action,
  onClose,
}: {
  action: string | null
  onClose: () => void
}) {
  const { toast } = useToast()
  const isStudent = action === "Add Student"

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
              ? "Register a student to your institute roster and assign initial batch."
              : `Complete the details below to ${action?.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        <form id="action-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2 py-2">
          {isStudent ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
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
}: LiveDashboardProps) {
  const [period, setPeriod] = useState("This Month")
  const [action, setAction] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const { toast } = useToast()

  // Format fee in Lakhs or thousands
  const feeInLakhs = feesThisMonth ? Number((feesThisMonth / 100000).toFixed(2)) : 0

  const sortedPayments = useMemo(() => {
    return [...recentPayments].sort((a, b) =>
      sortAsc ? a.amount - b.amount : b.amount - a.amount
    )
  }, [recentPayments, sortAsc])

  const paginatedPayments = useMemo(() => {
    return sortedPayments.slice((page - 1) * 5, page * 5)
  }, [sortedPayments, page])

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }, [])

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
            onClick={() =>
              toast({
                title: "Report exported",
                description: `Operational summary for ${instituteName} generated.`,
              })
            }
            className="h-9 gap-1.5 text-xs bg-card border-border shadow-none"
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">Overview of key institute metrics</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 bg-card border-border shadow-none text-xs gap-1.5">
              <CalendarDays className="size-3.5" />
              {period}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-popover border-border">
            <DropdownMenuRadioGroup value={period} onValueChange={setPeriod}>
              {["Today", "This Week", "This Month", "Last Month", "Custom Range"].map((option) => (
                <DropdownMenuRadioItem key={option} value={option} className="text-xs">
                  {option}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
              <KpiNumber value={totalStudents} />
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUp className="size-3 mr-0.5" />
              +8.2%
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">vs last month</p>
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
              +3.4%
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
              {feesThisMonth > 99999 ? (
                <KpiNumber value={feeInLakhs} prefix="₹" suffix="L" decimals={2} />
              ) : (
                <KpiNumber value={feesThisMonth} prefix="₹" />
              )}
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUp className="size-3 mr-0.5" />
              +12.6%
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">collected this month</p>
        </section>

        {/* Attendance Rate */}
        <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Attendance Rate
          </p>
          <div className="mt-1.5 flex items-end justify-between gap-3">
            <p className="text-[26px] font-bold leading-none text-foreground">
              <KpiNumber value={91.8} suffix="%" decimals={1} />
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUp className="size-3 mr-0.5" />
              +2.1%
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">average this week</p>
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
                <span className="size-2 rounded-full bg-primary" /> New students
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-400" /> Active students
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
                <Area yAxisId="left" type="monotone" dataKey="newStudents" name="New Students" stroke="var(--primary)" strokeWidth={2} fill="var(--primary-light)" fillOpacity={0.6} />
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
                ₹{feeInLakhs > 0 ? `${feeInLakhs}L` : feesThisMonth.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">Collected this month</p>
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
                <Bar dataKey="current" name="Current month" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="previous" name="Previous month" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: "var(--card)" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Row: Today's Attendance & Upcoming Classes */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Attendance Breakdown Panel */}
        <Panel title="Today’s Attendance" action={<span className="text-xs text-muted-foreground">2,331 students registered</span>}>
          <div className="p-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[28px] font-bold leading-none text-foreground">
                {todayAttendanceMetrics.overallPercentage}
              </p>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                High Attendance
              </span>
            </div>

            {/* Attendance Colored Distribution Bar */}
            <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
              {todayAttendanceMetrics.breakdown.map((item) => (
                <span
                  key={item.label}
                  className={item.color}
                  style={{ width: item.percentage }}
                  title={`${item.label}: ${item.percentage}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 border-b border-border pb-3">
              {todayAttendanceMetrics.breakdown.map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">{item.label}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{item.percentage}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-border">
              {todayAttendanceMetrics.batches.slice(0, 3).map((row) => (
                <div key={row.name} className="flex items-center justify-between py-2 text-xs">
                  <span className="font-medium text-foreground">{row.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-[11px]">{row.present}/{row.total} present</span>
                    <span className="font-semibold text-foreground">{row.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Upcoming Classes / Schedule */}
        <Panel
          title="Upcoming Classes & Batches"
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
                      {batch.teacherName ? `Faculty: ${batch.teacherName}` : "Faculty Assigned"}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded group-hover:bg-primary-light group-hover:text-primary transition-colors">
                    Room {idx + 101}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No classes scheduled for today. Start by creating batches in the Batches tab.
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Needs Attention Panel */}
      <Panel title="Needs Attention" action={<span className="text-xs text-muted-foreground">5 open items</span>}>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {attentionAlerts.slice(0, 3).map((item) => (
            <div key={item.title} className="flex min-h-20 items-start gap-3 p-4">
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full",
                  item.severity === "error" && "bg-rose-500",
                  item.severity === "warning" && "bg-amber-500",
                  item.severity === "info" && "bg-blue-500"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.detail}</p>
              </div>
              <Button variant="link" size="sm" asChild className="h-auto shrink-0 p-0 text-xs text-primary font-medium">
                <Link href={item.link}>
                  {item.actionText} <ArrowRight className="size-3 ml-0.5" />
                </Link>
              </Button>
            </div>
          ))}
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
                    className="inline-flex items-center gap-1 font-semibold uppercase hover:text-foreground"
                  >
                    Amount {sortAsc ? <ArrowUp className="size-3 text-primary" /> : <ArrowDown className="size-3 text-primary" />}
                  </button>
                </th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map((row) => (
                <tr
                  key={row.id}
                  onClick={() =>
                    toast({
                      title: `Payment: ${row.studentName}`,
                      description: `₹${row.amount.toLocaleString("en-IN")} via ${row.method} for ${row.batchName} (${row.status}).`,
                    })
                  }
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                >
                  <td className="font-semibold text-foreground group-hover:text-primary transition-colors">{row.studentName}</td>
                  <td className="text-muted-foreground">{row.batchName}</td>
                  <td className="font-bold text-foreground">₹{row.amount.toLocaleString("en-IN")}</td>
                  <td className="text-muted-foreground text-xs">{row.date}</td>
                  <td className="text-muted-foreground text-xs">{row.method}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * 5 + 1}–{Math.min(page * 5, recentPayments.length)} of {recentPayments.length} transactions
          </p>
          <div className="flex gap-1">
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
              variant={page === 1 ? "default" : "outline"}
              size="icon"
              className="size-7 text-xs"
              onClick={() => setPage(1)}
            >
              1
            </Button>
            {recentPayments.length > 5 && (
              <Button
                variant={page === 2 ? "default" : "outline"}
                size="icon"
                className="size-7 text-xs"
                onClick={() => setPage(2)}
              >
                2
              </Button>
            )}
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

      {/* Bottom 3-Column Footer Grid: Top Performing, Quick Actions, Announcements */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_1fr]">
        {/* Academic Leaders */}
        <Panel title="Top Performing Students">
          <div className="divide-y divide-border">
            {mockTopPerformers.map((item) => (
              <div key={item.rank} className="grid grid-cols-[28px_1fr_auto] items-center gap-2 px-4 py-3">
                <span className="grid size-6 place-items-center rounded-md bg-secondary text-xs font-bold text-foreground">
                  {item.rank}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.batch}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Quick Actions */}
        <Panel title="Quick Actions">
          <div className="grid grid-cols-2 gap-2 p-3">
            {["Add Student", "Create Batch", "Record Payment", "Mark Attendance", "Create Test"].map((label) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                className="justify-start shadow-none text-xs border-border h-9 last:col-span-2 hover:bg-primary-light hover:text-primary hover:border-primary-border"
                onClick={() => setAction(label)}
              >
                <Plus className="size-3.5 mr-1.5 text-primary" />
                {label}
              </Button>
            ))}
          </div>
        </Panel>

        {/* Circulars & Announcements */}
        <Panel
          title="Announcements"
          action={
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary-hover">
              View all
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {mockAnnouncements.map((item) => (
              <div
                key={item.text}
                onClick={() =>
                  toast({
                    title: "Notice Details",
                    description: `${item.text} (Published: ${item.date})`,
                  })
                }
                className="px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer group"
              >
                <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{item.text}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{item.date}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <ActionDialog action={action} onClose={() => setAction(null)} />
    </div>
  )
}

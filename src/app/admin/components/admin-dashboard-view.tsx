"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Building2,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  Download,
  Plus,
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers3,
  Sparkles,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { AddInstituteDialog } from "@/app/admin/institutes/components/add-institute-dialog"
import { cn } from "@/lib/utils"

export interface AdminDashboardProps {
  adminName: string
  institutesCount: number
  activeInstitutesCount: number
  studentsCount: number
  teachersCount: number
  batchesCount: number
  totalRevenue: number
  pendingRevenue: number
  overdueRevenue: number
  overdueCount: number
  revenueGrowth: {
    percentage: number
    isPositive: boolean
    label: string
  }
  monthlyRevenueData: Array<{
    month: string
    revenue: number
    institutes: number
  }>
  subscriptionDistribution: {
    pro: number
    enterprise: number
    free: number
  }
  recentInstitutes: Array<{
    id: string
    name: string
    adminEmail: string
    phoneNo: string | null
    subscriptionType: string
    paymentStatus: string
    isActive: boolean
    studentsCount: number
    teachersCount: number
    batchesCount: number
    joinedAt: string
  }>
  recentInvoices: Array<{
    id: string
    instituteName: string
    subscriptionType?: string
    amount: number
    status: string
    dueDate: string
    createdAt: string
  }>
}

const KpiNumber = React.memo(function KpiNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number
  prefix?: string
  suffix?: string
}) {
  const [display, setDisplay] = useState(value)
  const isFirstRender = React.useRef(true)

  useEffect(() => {
    if (!isFirstRender.current) {
      setDisplay(value)
      return
    }
    isFirstRender.current = false
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

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      {suffix}
    </span>
  )
})

export function AdminDashboardView({
  adminName,
  institutesCount,
  activeInstitutesCount,
  studentsCount,
  teachersCount,
  batchesCount,
  totalRevenue,
  pendingRevenue,
  overdueRevenue,
  overdueCount,
  revenueGrowth,
  monthlyRevenueData,
  subscriptionDistribution,
  recentInstitutes,
  recentInvoices,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"institutes" | "invoices">("institutes")
  const [isTabPending, startTabTransition] = React.useTransition()

  const handleTabChange = (tab: "institutes" | "invoices") => {
    startTabTransition(() => {
      setActiveTab(tab)
    })
  }

  const totalInvoicedYTD = totalRevenue + pendingRevenue + overdueRevenue
  const collectionPercentage =
    totalInvoicedYTD > 0 ? Math.round((totalRevenue / totalInvoicedYTD) * 100) : 100

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AddInstituteDialog />
          <Button variant="outline" size="sm" asChild className="h-9 text-xs border-border bg-card">
            <Link href="/admin/institutes">
              <Building2 className="size-3.5 mr-1.5 text-primary" />
              Manage Institutes
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total revenue
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary">
              <IndianRupee className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            <KpiNumber value={totalRevenue} prefix="₹" />
          </div>
          <div
            className={cn(
              "mt-2 flex items-center gap-1.5 text-[11px] font-medium",
              revenueGrowth.isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {revenueGrowth.isPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            <span>{revenueGrowth.percentage >= 0 ? `+${revenueGrowth.percentage}%` : `${revenueGrowth.percentage}%`}</span>
            <span className="text-muted-foreground">{revenueGrowth.label}</span>
          </div>
        </div>

        {/* Registered Institutes */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Institutes
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            <KpiNumber value={institutesCount} />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            <span>{activeInstitutesCount} Active centers</span>
            <span className="text-muted-foreground">across regions</span>
          </div>
        </div>

        {/* Platform Students */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Platform Students
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            <KpiNumber value={studentsCount} />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
            <TrendingUp className="size-3.5" />
            <span>Learners enrolled</span>
          </div>
        </div>

        {/* Platform Faculty */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Faculty & Teachers
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary">
              <GraduationCap className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            <KpiNumber value={teachersCount} />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-purple-600">
            <ShieldCheck className="size-3.5" />
            <span>Teachers ({batchesCount} batches)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Index Chart & Platform Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Column (2 cols) */}
        <div className="rounded-lg border border-border bg-card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Platform Revenue Growth</h2>
              <p className="text-[11px] text-muted-foreground">Monthly subscription receipts</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              Calendar 2026
            </span>
          </div>
          <div className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Collected Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#adminRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Platform Health & Actions Column */}
        <div className="rounded-lg border border-border bg-card flex flex-col justify-between overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Platform Subscription Health</h2>
            <p className="text-[11px] text-muted-foreground">Compliance & billing overview</p>
          </div>

          <div className="p-4 space-y-4 flex-1">
            <div className="rounded-lg bg-muted/40 p-3.5 border border-border/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground">Total Invoiced (YTD)</span>
                <span className="text-xs font-bold text-foreground">
                  ₹{totalInvoicedYTD.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${collectionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-primary" /> Paid: ₹{totalRevenue.toLocaleString("en-IN")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-400" /> Pending/Due: ₹{(pendingRevenue + overdueRevenue).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </h3>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span className="text-xs font-medium text-foreground">Active Institutes</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeInstitutesCount} / {institutesCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-amber-600" />
                  <span className="text-xs font-medium text-foreground">Overdue Invoices</span>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {overdueCount} {overdueCount === 1 ? "Invoice" : "Invoices"} {overdueRevenue > 0 ? `(₹${overdueRevenue.toLocaleString("en-IN")})` : ""}
                </span>
              </div>
            </div>

            {/* Active Subscriptions Breakdown */}
            <div className="pt-2 border-t border-border/60">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Subscription plans
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-light text-primary border border-primary/20">
                  PRO: {subscriptionDistribution.pro}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  ENTERPRISE: {subscriptionDistribution.enterprise}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  FREE: {subscriptionDistribution.free}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-3 bg-muted/20">
            <Link
              href="/admin/institutes"
              className="flex items-center justify-between text-xs font-medium text-primary hover:underline"
            >
              <span>View all institutes</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs and Data Tables: Recent Institutes & Platform Invoices */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange("institutes")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === "institutes"
                  ? "bg-primary-light text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Recent Institutes ({recentInstitutes.length})
            </button>
            <button
              onClick={() => handleTabChange("invoices")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === "invoices"
                  ? "bg-primary-light text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Recent Invoices ({recentInvoices.length})
            </button>
          </div>
          <Link
            href="/admin/institutes"
            prefetch={true}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all ({institutesCount})</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>

        <div className={cn("transition-opacity duration-150", isTabPending ? "opacity-60" : "opacity-100")}>
          {activeTab === "institutes" ? (
            <div className="overflow-x-auto animate-in fade-in duration-150">
              <table className="w-full table-fixed min-w-[900px] border-collapse text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="w-[30%] min-w-[200px] h-9 px-4 text-left font-medium">Institute</th>
                    <th className="w-[18%] min-w-[150px] h-9 px-4 text-left font-medium">Admin Email</th>
                    <th className="w-[7%] h-9 px-3 text-center font-medium">Students</th>
                    <th className="w-[7%] h-9 px-3 text-center font-medium">Teachers</th>
                    <th className="w-[7%] h-9 px-3 text-center font-medium">Batches</th>
                    <th className="w-[7%] h-9 px-3 text-left font-medium">Plan</th>
                    <th className="w-[8%] h-9 px-3 text-left font-medium">Status</th>
                    <th className="w-[8%] h-9 px-3 text-left font-medium">Billing</th>
                    <th className="w-[8%] h-9 px-4 text-right font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentInstitutes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No institutes registered yet.
                      </td>
                    </tr>
                  ) : (
                    recentInstitutes.map((inst) => (
                      <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-foreground align-middle">
                          <Link
                            href={`/admin/institutes`}
                            title={inst.name}
                            className="hover:text-primary transition-colors block break-words whitespace-normal leading-snug"
                          >
                            {inst.name}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground align-middle">
                          <span
                            className="block truncate text-xs font-normal max-w-[170px]"
                            title={inst.adminEmail}
                          >
                            {inst.adminEmail}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-foreground font-medium text-center align-middle">{inst.studentsCount}</td>
                        <td className="py-2.5 px-3 text-foreground font-medium text-center align-middle">{inst.teachersCount}</td>
                        <td className="py-2.5 px-3 text-foreground font-medium text-center align-middle">{inst.batchesCount}</td>
                        <td className="py-2.5 px-3 align-middle">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-light text-primary border border-primary/20">
                            {inst.subscriptionType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 align-middle">
                          {inst.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 align-middle">
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                              inst.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            )}
                          >
                            {inst.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground align-middle whitespace-nowrap">{inst.joinedAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto animate-in fade-in duration-150">
              <table className="w-full table-fixed min-w-[850px] border-collapse text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="w-[16%] h-9 px-4 text-left font-medium">Invoice ID</th>
                    <th className="w-[30%] min-w-[200px] h-9 px-4 text-left font-medium">Institute</th>
                    <th className="w-[10%] h-9 px-4 text-left font-medium">Plan</th>
                    <th className="w-[14%] h-9 px-4 text-left font-medium">Amount</th>
                    <th className="w-[10%] h-9 px-4 text-left font-medium">Status</th>
                    <th className="w-[10%] h-9 px-4 text-left font-medium">Due Date</th>
                    <th className="w-[10%] h-9 px-4 text-right font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No invoices generated yet.
                      </td>
                    </tr>
                  ) : (
                    recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-foreground align-middle">
                          #{inv.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-foreground align-middle">
                          <span
                            title={inv.instituteName}
                            className="block break-words whitespace-normal leading-snug"
                          >
                            {inv.instituteName}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 align-middle">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground border border-border">
                            {inv.subscriptionType || "PRO"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-foreground align-middle">₹{inv.amount.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-4 align-middle">
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                              inv.status === "PAID" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                              inv.status === "PENDING" && "bg-amber-50 text-amber-700 border border-amber-200",
                              inv.status === "OVERDUE" && "bg-rose-50 text-rose-700 border border-rose-200"
                            )}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground align-middle whitespace-nowrap">{inv.dueDate}</td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground align-middle whitespace-nowrap">{inv.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

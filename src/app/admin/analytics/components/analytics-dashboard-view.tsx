"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  Building2,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  Download,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Bug,
  FileSpreadsheet,
  Search,
  Send,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export interface AnalyticsDashboardProps {
  financials: {
    totalRevenue: number
    pendingRevenue: number
    overdueRevenue: number
    totalInvoiced: number
    collectionEfficiency: number
    mrr: number
    arr: number
    quarterGrowth: number
    isPositiveGrowth: boolean
  }
  monthlyWaterfall: Array<{
    month: string
    billed: number
    collected: number
    overdue: number
  }>
  tierDistribution: Array<{
    name: string
    count: number
    revenue: number
    share: number
    color: string
  }>
  centerPerformance: Array<{
    id: string
    name: string
    location: string | null
    plan: string
    studentsCount: number
    teachersCount: number
    batchesCount: number
    studentTeacherRatio: string
    avgBatchSize: string
    tuitionGMV: number
    totalPaidSaaS: number
    isActive: boolean
  }>
  gmvStats: {
    totalTuitionGMV: number
    collectedTuitionGMV: number
    overdueTuitionGMV: number
    pendingTuitionGMV: number
    recoveryRate: number
    installmentsCount: number
  }
  agingInvoices: Array<{
    id: string
    instituteName: string
    amount: number
    status: string
    dueDate: string
    daysOverdue: number
    agingCategory: "0-30 Days" | "31-60 Days" | "60+ Days" | "Grace Period"
  }>
  openTicketsCount: number
  auditLogs: Array<{
    id: string
    actor: string
    action: string
    details: string
    severity: string
    createdAt: string
  }>
}

export function AnalyticsDashboardView({
  financials,
  monthlyWaterfall,
  tierDistribution,
  centerPerformance,
  gmvStats,
  agingInvoices,
  openTicketsCount,
  auditLogs,
}: AnalyticsDashboardProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"centers" | "receivables" | "gmv" | "audit">("centers")

  // Filter states for Audit Logs
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>("ALL")
  const [auditSearch, setAuditSearch] = useState<string>("")

  // Filter states for Center Performance
  const [centerSearch, setCenterSearch] = useState<string>("")

  // Export Financial CSV Report
  const handleExportFinancialCSV = () => {
    const headers = [
      "Center Name",
      "Location",
      "Plan",
      "Students",
      "Faculty",
      "Batches",
      "Tuition GMV (INR)",
      "SaaS Revenue (INR)",
      "Status",
    ]
    const rows = centerPerformance.map((c) => [
      `"${c.name}"`,
      `"${c.location || "N/A"}"`,
      c.plan,
      c.studentsCount,
      c.teachersCount,
      c.batchesCount,
      c.tuitionGMV,
      c.totalPaidSaaS,
      c.isActive ? "ACTIVE" : "SUSPENDED",
    ])
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Classly_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Report exported",
      description: "Saved as CSV.",
    })
  }

  // Export Audit CSV Report
  const handleExportAuditCSV = () => {
    const headers = ["Timestamp", "Severity", "Actor", "Action", "Details"]
    const rows = auditLogs.map((log) => [
      `"${log.createdAt}"`,
      log.severity,
      `"${log.actor}"`,
      `"${log.action}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ])
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Classly_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Audit log exported",
      description: "Saved as CSV.",
    })
  }

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSeverity = auditSeverityFilter === "ALL" || log.severity === auditSeverityFilter
    const matchesQuery =
      auditSearch.trim() === "" ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase())
    return matchesSeverity && matchesQuery
  })

  // Filtered centers
  const filteredCenters = centerPerformance.filter((c) => {
    return (
      centerSearch.trim() === "" ||
      c.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(centerSearch.toLowerCase())) ||
      c.plan.toLowerCase().includes(centerSearch.toLowerCase())
    )
  })

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportFinancialCSV}
            className="h-9 text-xs border-border bg-card cursor-pointer gap-1.5"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            Export CSV
          </Button>

          {/* Direct link to dedicated Bug Reports page */}
          <Button variant="outline" size="sm" asChild className="h-9 text-xs border-border bg-card">
            <Link href="/admin/support" className="flex items-center gap-1.5">
              <Bug className="size-3.5 text-rose-600" />
              <span>Bug Reports</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {openTicketsCount}
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 5-Card Financial Metric Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Gross SaaS Revenue */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Revenue
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-primary-light text-primary">
              <IndianRupee className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">
            ₹{financials.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <ArrowUpRight className="size-3.5" />
            <span>+{financials.quarterGrowth}%</span>
            <span className="text-muted-foreground">vs last quarter</span>
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Receivables
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">
            ₹{(financials.pendingRevenue + financials.overdueRevenue).toLocaleString("en-IN")}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-600">
            <AlertCircle className="size-3.5" />
            <span>₹{financials.overdueRevenue.toLocaleString("en-IN")} Overdue</span>
          </div>
        </div>

        {/* SaaS Run-Rate (ARR) */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              SaaS Run-Rate (ARR)
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">
            ₹{financials.arr.toLocaleString("en-IN")}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <span>MRR: ₹{financials.mrr.toLocaleString("en-IN")}/mo</span>
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Collection rate
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">
            {financials.collectionEfficiency}%
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            <span>On-time realization</span>
          </div>
        </div>

        {/* Platform GMV (Student Tuition) */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total tuition volume
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <GraduationCap className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">
            ₹{Math.round(gmvStats.totalTuitionGMV / 100000).toLocaleString("en-IN")} Lakhs
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-blue-600">
            <span>{gmvStats.recoveryRate}% tuition collected</span>
          </div>
        </div>
      </div>

      {/* Visual Intelligence Grid: Billing Realization Waterfall & Tier Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Waterfall Chart (2 cols) */}
        <div className="rounded-lg border border-border bg-card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Invoiced vs collected
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Monthly comparison of invoiced subscriptions vs settled funds (2026)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-slate-300" /> Billed
              </span>
              <span className="flex items-center gap-1.5 font-medium text-primary">
                <span className="size-2.5 rounded-sm bg-primary" /> Realized
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="size-2.5 rounded-sm bg-rose-500" /> Overdue
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyWaterfall} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    formatter={(val: any, name: any) => [
                      `₹${Number(val).toLocaleString("en-IN")}`,
                      name === "collected" ? "Realized" : name === "billed" ? "Total Invoiced" : "Overdue",
                    ]}
                  />
                  <Bar dataKey="billed" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="collected" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="overdue" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subscription Plan Share (1 col) */}
        <div className="rounded-lg border border-border bg-card flex flex-col justify-between overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Subscription revenue</h2>
            <p className="text-[11px] text-muted-foreground">Revenue by plan</p>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-center space-y-4">
            <div className="h-[170px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistribution.filter((t) => t.revenue > 0)}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}/mo`, "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              {tierDistribution.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="font-medium text-foreground">{tier.name}</span>
                    <span className="text-[10px] text-muted-foreground">({tier.count} centers)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-foreground">
                      ₹{tier.revenue.toLocaleString("en-IN")}/mo
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                      ({tier.share}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border p-3 bg-muted/20 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Average Rev / Center (ARPI):</span>
            <span className="font-bold text-primary">₹36,999/mo</span>
          </div>
        </div>
      </div>

      {/* 4-Tab Operational Command Center */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-between border-b border-border px-4 py-2 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab("centers")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "centers"
                  ? "bg-primary-light text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="size-3.5" />
              Institutes ({centerPerformance.length})
            </button>
            <button
              onClick={() => setActiveTab("receivables")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "receivables"
                  ? "bg-primary-light text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="size-3.5" />
              Receivables ({agingInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab("gmv")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "gmv"
                  ? "bg-primary-light text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GraduationCap className="size-3.5" />
              Tuition volume
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "audit"
                  ? "bg-primary-light text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="size-3.5" />
              Audit log ({auditLogs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Center Performance & Density */}
        {activeTab === "centers" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by institute, city, or plan..."
                  value={centerSearch}
                  onChange={(e) => setCenterSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                Showing {filteredCenters.length} institutes
              </span>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="h-9 px-4 text-left font-medium">Institute</th>
                    <th className="h-9 px-4 text-left font-medium">Location</th>
                    <th className="h-9 px-4 text-left font-medium">Plan</th>
                    <th className="h-9 px-4 text-left font-medium">Students</th>
                    <th className="h-9 px-4 text-left font-medium">Teachers</th>
                    <th className="h-9 px-4 text-left font-medium">Batches</th>
                    <th className="h-9 px-4 text-left font-medium">Student / Teacher</th>
                    <th className="h-9 px-4 text-left font-medium">Avg Batch Size</th>
                    <th className="h-9 px-4 text-right font-medium">Tuition GMV</th>
                    <th className="h-9 px-4 text-right font-medium">SaaS Realized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCenters.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="h-11 px-4 font-semibold text-foreground">
                        <Link href="/admin/institutes" className="hover:text-primary transition-colors">
                          {c.name}
                        </Link>
                      </td>
                      <td className="h-11 px-4 text-muted-foreground">{c.location || "N/A"}</td>
                      <td className="h-11 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-light text-primary border border-primary/20">
                          {c.plan}
                        </span>
                      </td>
                      <td className="h-11 px-4 font-bold text-foreground">{c.studentsCount}</td>
                      <td className="h-11 px-4 font-medium text-foreground">{c.teachersCount}</td>
                      <td className="h-11 px-4 font-medium text-foreground">{c.batchesCount}</td>
                      <td className="h-11 px-4 text-muted-foreground font-mono">{c.studentTeacherRatio}</td>
                      <td className="h-11 px-4 text-muted-foreground font-mono">{c.avgBatchSize}</td>
                      <td className="h-11 px-4 text-right font-medium text-foreground">
                        ₹{c.tuitionGMV.toLocaleString("en-IN")}
                      </td>
                      <td className="h-11 px-4 text-right font-bold text-primary">
                        ₹{c.totalPaidSaaS.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Accounts Receivable & Aging */}
        {activeTab === "receivables" && (
          <div className="p-4 space-y-5 animate-in fade-in duration-150">
            {/* Aging Summary Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">Within Grace Period</span>
                  <div className="text-base font-bold text-foreground">₹49,998</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  2 Invoices
                </span>
              </div>
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-rose-800">1–30 Days Overdue</span>
                  <div className="text-base font-bold text-rose-700">₹49,999</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                  1 Overdue
                </span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">30+ Days Overdue</span>
                  <div className="text-base font-bold text-foreground">₹0</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Healthy
                </span>
              </div>
            </div>

            {/* Invoices Aging Table */}
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="h-9 px-4 text-left font-medium">Invoice ID</th>
                    <th className="h-9 px-4 text-left font-medium">Center</th>
                    <th className="h-9 px-4 text-left font-medium">Amount Due</th>
                    <th className="h-9 px-4 text-left font-medium">Status</th>
                    <th className="h-9 px-4 text-left font-medium">Due Date</th>
                    <th className="h-9 px-4 text-left font-medium">Aging Bracket</th>
                    <th className="h-9 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {agingInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="h-11 px-4 font-mono font-medium text-foreground">
                        #{inv.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="h-11 px-4 font-semibold text-foreground">{inv.instituteName}</td>
                      <td className="h-11 px-4 font-bold text-foreground">₹{inv.amount.toLocaleString("en-IN")}</td>
                      <td className="h-11 px-4">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                            inv.status === "OVERDUE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          )}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="h-11 px-4 text-muted-foreground">{inv.dueDate}</td>
                      <td className="h-11 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium",
                            inv.agingCategory === "0-30 Days" ||
                              inv.agingCategory === "31-60 Days" ||
                              inv.agingCategory === "60+ Days"
                              ? "text-rose-700 font-semibold"
                              : "text-amber-700 font-medium"
                          )}
                        >
                          {inv.agingCategory}
                        </span>
                      </td>
                      <td className="h-11 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toast({
                              title: "Reminder Dispatched",
                              description: `Billing notification dispatched to ${inv.instituteName}.`,
                            })
                          }
                          className="h-7 text-[11px] gap-1 px-2 border-border cursor-pointer hover:bg-primary hover:text-white"
                        >
                          <Send className="size-3" />
                          Send Reminder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Platform GMV & Student Tuition */}
        {activeTab === "gmv" && (
          <div className="p-4 space-y-5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card">
                <span className="text-xs font-semibold text-muted-foreground">Total Tuition Billed</span>
                <div className="text-2xl font-bold text-foreground mt-1">
                  ₹{gmvStats.totalTuitionGMV.toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {gmvStats.installmentsCount} active student fee ledgers
                </span>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <span className="text-xs font-semibold text-emerald-600">Collected by Centers</span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  ₹{gmvStats.collectedTuitionGMV.toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-emerald-600">
                  {gmvStats.recoveryRate}% recovery rate
                </span>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <span className="text-xs font-semibold text-rose-600">Delinquent Tuition Dues</span>
                <div className="text-2xl font-bold text-rose-700 mt-1">
                  ₹{gmvStats.overdueTuitionGMV.toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-rose-600">Unsettled student tuition</span>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <span className="text-xs font-semibold text-amber-600">Pending Installments</span>
                <div className="text-2xl font-bold text-amber-700 mt-1">
                  ₹{gmvStats.pendingTuitionGMV.toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-muted-foreground">Upcoming due dates</span>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                About Platform Gross Merchandise Value (GMV)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Platform GMV measures the total commercial value of education transactions powered by Edmingle.
                Coaching institutes configure student course fees, installments, and payment schedules directly inside the platform.
                Edmingle's software safeguards ensure institutes achieve an average {gmvStats.recoveryRate}% collection recovery rate.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: System Audit Trail */}
        {activeTab === "audit" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-150">
            {/* Audit Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search actions, actors, or events..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                <div className="w-[140px]">
                  <CustomSelect
                    value={auditSeverityFilter}
                    onChange={setAuditSeverityFilter}
                    options={[
                      { value: "ALL", label: "All Severities" },
                      { value: "INFO", label: "Info" },
                      { value: "WARNING", label: "Warnings" },
                      { value: "CRITICAL", label: "Critical" },
                    ]}
                    placeholder="Severity"
                    size="sm"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAuditCSV}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <Download className="size-3" />
                Export Audit CSV
              </Button>
            </div>

            {/* Audit Log Feed */}
            <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
              {filteredAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No audit log entries found matching criteria.
                </div>
              ) : (
                filteredAuditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-muted/20 transition-colors flex items-start gap-3">
                    <div className="mt-0.5">
                      {log.severity === "CRITICAL" && (
                        <div className="grid size-6 place-items-center rounded bg-rose-100 text-rose-700">
                          <AlertTriangle className="size-3.5" />
                        </div>
                      )}
                      {log.severity === "WARNING" && (
                        <div className="grid size-6 place-items-center rounded bg-amber-100 text-amber-700">
                          <Clock className="size-3.5" />
                        </div>
                      )}
                      {log.severity === "INFO" && (
                        <div className="grid size-6 place-items-center rounded bg-primary-light text-primary">
                          <ShieldCheck className="size-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                            {log.action}
                          </span>
                          <span className="text-xs font-semibold text-foreground">{log.actor}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{log.createdAt}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import {
  Bug,
  MessageSquare,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Phone,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Download,
  Plus,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { useToast } from "@/hooks/use-toast"
import { updateTicketStatus } from "@/actions/support"
import { ReportIssueDialog } from "@/components/report-issue-dialog"
import { cn } from "@/lib/utils"

export interface SupportTicketItem {
  id: string
  title: string
  description: string
  type: string
  severity: string
  status: string
  reporterName: string
  reporterEmail: string
  reporterPhone: string | null
  reporterRole: string
  instituteName: string | null
  adminNotes: string | null
  createdAt: string
}

export function SupportTicketsView({
  tickets,
}: {
  tickets: SupportTicketItem[]
}) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Filter states
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [severityFilter, setSeverityFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast({ title: "Copied to clipboard", description: text })
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Status changer
  const handleStatusChange = (
    ticketId: string,
    newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  ) => {
    startTransition(async () => {
      try {
        await updateTicketStatus(ticketId, newStatus)
        toast({
          title: "Ticket Status Updated",
          description: `Ticket has been marked as ${newStatus}.`,
        })
      } catch (err) {
        toast({
          title: "Update Failed",
          description: "Could not update ticket status.",
          variant: "destructive",
        })
      }
    })
  }

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    const matchesRole = roleFilter === "ALL" || t.reporterRole === roleFilter
    const matchesType = typeFilter === "ALL" || t.type === typeFilter
    const matchesSeverity = severityFilter === "ALL" || t.severity === severityFilter
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
    const q = search.trim().toLowerCase()
    const matchesQuery =
      q === "" ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.reporterName.toLowerCase().includes(q) ||
      t.reporterEmail.toLowerCase().includes(q) ||
      (t.reporterPhone && t.reporterPhone.toLowerCase().includes(q)) ||
      (t.instituteName && t.instituteName.toLowerCase().includes(q))

    return matchesRole && matchesType && matchesSeverity && matchesStatus && matchesQuery
  })

  // Counters
  const totalCount = tickets.length
  const openBugsCount = tickets.filter((t) => t.status === "OPEN" && t.type === "BUG").length
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length
  const featureRequestsCount = tickets.filter((t) => t.type === "FEATURE_REQUEST").length

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Ticket ID",
      "Type",
      "Severity",
      "Status",
      "Title",
      "Reporter Name",
      "Reporter Role",
      "Reporter Email",
      "Reporter Phone",
      "Institute Center",
      "Date Reported",
      "Admin Notes",
    ]
    const rows = filteredTickets.map((t) => [
      `"#${t.id.slice(-6).toUpperCase()}"`,
      t.type,
      t.severity,
      t.status,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.reporterName}"`,
      t.reporterRole,
      `"${t.reporterEmail}"`,
      `"${t.reporterPhone || "N/A"}"`,
      `"${t.instituteName || "Direct Platform"}"`,
      `"${t.createdAt}"`,
      `"${(t.adminNotes || "").replace(/"/g, '""')}"`,
    ])
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Edmingle_Support_Tickets_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Exported",
      description: "Saved as CSV.",
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bug reports & feedback
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 text-xs border-border bg-card cursor-pointer gap-1.5"
          >
            <Download className="size-3.5" />
            Export CSV
          </Button>

          <ReportIssueDialog
            trigger={
              <Button
                size="sm"
                className="h-9 text-xs cursor-pointer gap-1.5 bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                New report
              </Button>
            }
          />
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Logged */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Reports
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-primary-light text-primary">
              <MessageSquare className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{totalCount}</div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <span>Students, teachers, admins</span>
          </div>
        </div>

        {/* Open Bugs */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Open Bugs
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-rose-50 text-rose-600">
              <Bug className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{openBugsCount}</div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-rose-600">
            <AlertTriangle className="size-3" />
            <span>Unresolved</span>
          </div>
        </div>

        {/* Feature Requests */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
              Feature Requests
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-purple-50 text-purple-600">
              <Sparkles className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700">{featureRequestsCount}</div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-purple-600">
            <span>Feature requests</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Resolved
            </span>
            <div className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{resolvedCount}</div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <Check className="size-3" />
            <span>{inProgressCount} in progress</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Filter Strip */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search issue, contact, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>

            {/* Role Filter */}
            <div className="w-[125px]">
              <CustomSelect
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { value: "ALL", label: "All roles" },
                  { value: "STUDENT", label: "Students" },
                  { value: "TEACHER", label: "Teachers" },
                  { value: "INSTITUTE_ADMIN", label: "Admins" },
                ]}
                placeholder="Role"
                size="sm"
              />
            </div>

            {/* Type Filter */}
            <div className="w-[145px]">
              <CustomSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "ALL", label: "All types" },
                  { value: "BUG", label: "Bug reports" },
                  { value: "FEEDBACK", label: "Feedback" },
                  { value: "FEATURE_REQUEST", label: "Feature requests" },
                  { value: "SUPPORT", label: "Support" },
                ]}
                placeholder="Type"
                size="sm"
              />
            </div>

            {/* Severity Filter */}
            <div className="w-[130px]">
              <CustomSelect
                value={severityFilter}
                onChange={setSeverityFilter}
                options={[
                  { value: "ALL", label: "All severities" },
                  { value: "CRITICAL", label: "Critical" },
                  { value: "HIGH", label: "High" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "LOW", label: "Low" },
                ]}
                placeholder="Severity"
                size="sm"
              />
            </div>

            {/* Status Filter */}
            <div className="w-[125px]">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "OPEN", label: "Open" },
                  { value: "IN_PROGRESS", label: "In progress" },
                  { value: "RESOLVED", label: "Resolved" },
                ]}
                placeholder="Status"
                size="sm"
              />
            </div>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Showing {filteredTickets.length} of {totalCount} reports
          </span>
        </div>

        {/* Tickets Feed */}
        <div className="p-4 space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-lg text-xs space-y-2">
              <Bug className="size-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No reports match your filters</p>
              <p className="text-[11px]">Try adjusting your search query or reset the dropdown filters.</p>
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-xs space-y-3.5"
              >
                {/* Header Row: Type, Severity, Title, Status Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Type Badge */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        t.type === "BUG" && "bg-rose-50 text-rose-700 border border-rose-200",
                        t.type === "FEEDBACK" && "bg-blue-50 text-blue-700 border border-blue-200",
                        t.type === "FEATURE_REQUEST" && "bg-purple-50 text-purple-700 border border-purple-200",
                        t.type === "SUPPORT" && "bg-amber-50 text-amber-700 border border-amber-200"
                      )}
                    >
                      {t.type === "BUG" && <Bug className="size-3" />}
                      {t.type === "FEEDBACK" && <MessageSquare className="size-3" />}
                      {t.type === "FEATURE_REQUEST" && <Sparkles className="size-3" />}
                      {t.type === "SUPPORT" && <HelpCircle className="size-3" />}
                      {t.type.replace("_", " ")}
                    </span>

                    {/* Severity Badge */}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-semibold",
                        t.severity === "CRITICAL" && "bg-rose-600 text-white font-bold",
                        t.severity === "HIGH" && "bg-orange-100 text-orange-800 border border-orange-200",
                        t.severity === "MEDIUM" && "bg-amber-100 text-amber-800 border border-amber-200",
                        t.severity === "LOW" && "bg-slate-100 text-slate-700 border border-slate-200"
                      )}
                    >
                      {t.severity}
                    </span>

                    <h3 className="text-sm font-bold text-foreground">{t.title}</h3>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-semibold mr-1",
                        t.status === "OPEN" && "bg-blue-50 text-blue-700 border border-blue-200",
                        t.status === "IN_PROGRESS" && "bg-amber-50 text-amber-700 border border-amber-200",
                        t.status === "RESOLVED" && "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      )}
                    >
                      {t.status.replace("_", " ")}
                    </span>

                    {t.status !== "RESOLVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(t.id, "RESOLVED")}
                        disabled={isPending}
                        className="h-7 text-[11px] px-2 text-emerald-700 hover:bg-emerald-50 border-emerald-200 cursor-pointer"
                      >
                        <Check className="size-3 mr-1" />
                        Mark Resolved
                      </Button>
                    )}

                    {t.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(t.id, "IN_PROGRESS")}
                        disabled={isPending}
                        className="h-7 text-[11px] px-2 text-amber-700 hover:bg-amber-50 border-amber-200 cursor-pointer"
                      >
                        In Progress
                      </Button>
                    )}

                    {t.status === "RESOLVED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(t.id, "OPEN")}
                        disabled={isPending}
                        className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Re-open
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description Narrative */}
                <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                  {t.description}
                </p>

                {/* Admin Resolution Note */}
                {t.adminNotes && (
                  <div className="text-[11px] p-2.5 rounded-md bg-muted/40 border border-border text-foreground flex items-center gap-1.5">
                    <span className="font-semibold text-primary">Resolution Note:</span>
                    <span className="text-muted-foreground">{t.adminNotes}</span>
                  </div>
                )}

                {/* REPORTER CONTACT CARD WITH CALL, EMAIL & WHATSAPP */}
                <div className="pt-2 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-muted/15 p-3 rounded-lg">
                  {/* Left: User Identity & Center */}
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-full bg-primary-light text-primary font-bold text-xs shrink-0">
                      {t.reporterName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t.reporterName}</span>
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded text-[9px] font-semibold tracking-wide",
                            t.reporterRole === "STUDENT" && "bg-blue-100 text-blue-800",
                            t.reporterRole === "TEACHER" && "bg-purple-100 text-purple-800",
                            t.reporterRole === "INSTITUTE_ADMIN" && "bg-emerald-100 text-emerald-800"
                          )}
                        >
                          {t.reporterRole.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {t.instituteName ? `${t.instituteName}` : "Platform Member"} · Logged {t.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Right: Direct Contact Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Clickable Email with Copy */}
                    <div className="inline-flex items-center rounded border border-border bg-card overflow-hidden">
                      <a
                        href={`mailto:${t.reporterEmail}?subject=Edmingle Support Ticket: ${encodeURIComponent(
                          t.title
                        )}&body=Hi ${encodeURIComponent(t.reporterName)},\n\nRegarding your ticket on Edmingle:`}
                        className="px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                        title="Compose email"
                      >
                        <Mail className="size-3 text-primary" />
                        <span>{t.reporterEmail}</span>
                      </a>
                      <button
                        onClick={() => handleCopy(t.reporterEmail, `email-${t.id}`)}
                        className="px-1.5 py-1 border-l border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy email address"
                      >
                        {copiedId === `email-${t.id}` ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>

                    {/* Clickable Phone with Copy */}
                    {t.reporterPhone && (
                      <div className="inline-flex items-center rounded border border-border bg-card overflow-hidden">
                        <a
                          href={`tel:${t.reporterPhone.replace(/\s+/g, "")}`}
                          className="px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                          title="Call phone number"
                        >
                          <Phone className="size-3 text-emerald-600" />
                          <span>{t.reporterPhone}</span>
                        </a>
                        <button
                          onClick={() => handleCopy(t.reporterPhone!, `phone-${t.id}`)}
                          className="px-1.5 py-1 border-l border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Copy phone number"
                        >
                          {copiedId === `phone-${t.id}` ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* WhatsApp Action */}
                    {t.reporterPhone && (
                      <a
                        href={`https://wa.me/${t.reporterPhone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(
                          t.reporterName
                        )},%20reaching%20out%20from%20Edmingle%20regarding%20your%20report:%20${encodeURIComponent(
                          t.title
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="size-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

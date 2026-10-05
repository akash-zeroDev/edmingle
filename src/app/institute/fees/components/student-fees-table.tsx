"use client"

import React, { useState } from "react"
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  CreditCard,
  Loader2,
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
import { sendFeeReminder } from "@/actions/fee"
import { useToast } from "@/hooks/use-toast"

export interface StudentFeeRow {
  id: string
  name: string
  phoneNo?: string | null
  parentPhone?: string | null
  email?: string | null
  batchName: string
  batchId?: string
  totalFee: number
  amountPaid: number
  status: string
  dueDate: string
  feeId?: string
  lastReceiptNo?: string | null
  paymentsCount: number
}

interface StudentFeesTableProps {
  students: StudentFeeRow[]
  onPayClick: (student: StudentFeeRow) => void
}

export function StudentFeesTable({ students, onPayClick }: StudentFeesTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [batchFilter, setBatchFilter] = useState<string>("ALL")
  const [remindingStudentId, setRemindingStudentId] = useState<string | null>(null)
  const { toast } = useToast()

  const uniqueBatches = Array.from(new Set(students.map((s) => s.batchName).filter(Boolean)))

  const filtered = students.filter((s) => {
    const q = search.toLowerCase()
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      (s.phoneNo && s.phoneNo.includes(q)) ||
      (s.parentPhone && s.parentPhone.includes(q)) ||
      s.batchName.toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PAID" && s.status === "PAID") ||
      (statusFilter === "PARTIAL" && (s.status === "PARTIAL" || s.status === "PARTIALLY_PAID")) ||
      (statusFilter === "OVERDUE" && s.status === "OVERDUE") ||
      (statusFilter === "PENDING" && s.status === "PENDING")

    const matchesBatch = batchFilter === "ALL" || s.batchName === batchFilter

    return matchesSearch && matchesStatus && matchesBatch
  })

  const handleRemind = async (student: StudentFeeRow) => {
    setRemindingStudentId(student.id)
    try {
      const res = await sendFeeReminder(student.id)
      if (res.error) {
        toast({ variant: "destructive", title: "Reminder Failed", description: res.error })
      } else {
        toast({
          title: "Reminder Sent",
          description: res.message,
        })
      }
    } finally {
      setRemindingStudentId(null)
    }
  }

  const getStatusBadge = (status: string, balance: number) => {
    if (status === "PAID" || balance <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="size-2.5" />
          Paid in Full
        </span>
      )
    }
    if (status === "OVERDUE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          <AlertTriangle className="size-2.5" />
          Overdue
        </span>
      )
    }
    if (status === "PARTIAL" || status === "PARTIALLY_PAID") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          <Clock className="size-2.5" />
          Partially Paid
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
        <Clock className="size-2.5" />
        Due Soon
      </span>
    )
  }

  return (
    <div className="space-y-3.5">
      {/* Search & Status Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, parent phone, or batch..."
            className="pl-9 h-9 text-xs rounded-lg border-border"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center p-0.5 bg-muted rounded-lg text-xs">
            {[
              { id: "ALL", label: "All" },
              { id: "PAID", label: "Paid" },
              { id: "PARTIAL", label: "Partial" },
              { id: "OVERDUE", label: "Overdue" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? "bg-white text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Batch Selector */}
          {uniqueBatches.length > 0 && (
            <div className="w-full sm:w-[200px]">
              <CustomSelect
                value={batchFilter}
                onChange={setBatchFilter}
                options={[
                  { value: "ALL", label: "All Batches" },
                  ...uniqueBatches.map((b) => ({ value: b, label: b })),
                ]}
                placeholder="All Batches"
                searchPlaceholder="Search batches..."
                size="sm"
                searchable={uniqueBatches.length > 5}
              />
            </div>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <DataTableCard
        title="Student Fee Roster"
        subtitle={`Showing ${filtered.length} of ${students.length} student records`}
      >
        <Table className="w-full table-fixed border-collapse">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[23%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Student
              </TableHead>
              <TableHead className="w-[15%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Batch
              </TableHead>
              <TableHead className="w-[11%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Total Fee
              </TableHead>
              <TableHead className="w-[11%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Paid
              </TableHead>
              <TableHead className="w-[11%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Balance Due
              </TableHead>
              <TableHead className="w-[14%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Status & Due Date
              </TableHead>
              <TableHead className="w-[15%] h-9 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                  No fee records match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const balance = Math.max(0, s.totalFee - s.amountPaid)
                const isPaidInFull = balance === 0
                const isReminding = remindingStudentId === s.id

                return (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    {/* Student Avatar & Name */}
                    <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6.5 shrink-0 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-[10px]">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate">{s.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            Parent: {s.parentPhone || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Batch */}
                    <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                      <span className="inline-block max-w-full truncate px-2 py-0.5 rounded bg-muted text-foreground text-[10px] font-medium" title={s.batchName}>
                        {s.batchName}
                      </span>
                    </TableCell>

                    {/* Total Fee */}
                    <TableCell className="px-2.5 py-2.5 text-xs font-medium text-foreground border-b border-border whitespace-nowrap">
                      ₹{s.totalFee.toLocaleString("en-IN")}
                    </TableCell>

                    {/* Amount Paid */}
                    <TableCell className="px-2.5 py-2.5 text-xs font-semibold text-emerald-700 border-b border-border whitespace-nowrap">
                      ₹{s.amountPaid.toLocaleString("en-IN")}
                    </TableCell>

                    {/* Balance Due */}
                    <TableCell className="px-2.5 py-2.5 text-xs border-b border-border whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          balance > 0 ? "text-rose-600 font-bold" : "text-emerald-700"
                        }`}
                      >
                        ₹{balance.toLocaleString("en-IN")}
                      </span>
                    </TableCell>

                    {/* Status & Due Date */}
                    <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                      <div className="space-y-0.5">
                        <div>{getStatusBadge(s.status, balance)}</div>
                        <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                          Due: {s.dueDate}
                        </div>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-3 py-2.5 text-right border-b border-border">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Remind Button */}
                        {!isPaidInFull && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isReminding}
                            onClick={() => handleRemind(s)}
                            className="h-7 w-7 p-0 rounded-lg border-border text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                            title="Send WhatsApp Reminder"
                          >
                            {isReminding ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Send className="size-3" />
                            )}
                          </Button>
                        )}

                        {/* Pay Fee Button */}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onPayClick(s)}
                          className={`h-7 px-2.5 text-[11px] font-medium rounded-lg cursor-pointer shrink-0 ${
                            isPaidInFull
                              ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
                              : "bg-primary hover:bg-primary-hover text-white shadow-xs"
                          }`}
                        >
                          <CreditCard className="size-3 mr-1 shrink-0" />
                          <span>{isPaidInFull ? "Add Fee" : "Pay Fee"}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import {
  Search,
  CheckCircle2,
  Clock,
  Banknote,
  Receipt,
  GraduationCap,
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
import { Skeleton } from "@/components/ui/skeleton"
import type { TeacherPayrollItem } from "./disburse-salary-modal"

interface PayrollLedgerTableProps {
  teachers: TeacherPayrollItem[]
  onDisburseClick: (teacher: TeacherPayrollItem) => void
  onViewSlipClick: (teacher: TeacherPayrollItem) => void
  isLoading?: boolean
}

export function PayrollLedgerTable({
  teachers,
  onDisburseClick,
  onViewSlipClick,
  isLoading = false,
}: PayrollLedgerTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL")

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase()
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      (t.phoneNo && t.phoneNo.includes(q)) ||
      (t.subjects && t.subjects.toLowerCase().includes(q)) ||
      t.batchNames.some((b) => b.toLowerCase().includes(q))

    const isPaid = Boolean(t.payout && t.payout.status === "PAID")
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PAID" && isPaid) ||
      (statusFilter === "PENDING" && !isPaid)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-3.5">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty name, subject, or batch..."
            className="pl-9 h-9 text-xs rounded-lg border-border"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center p-0.5 bg-muted rounded-lg text-xs">
          {[
            { id: "ALL" as const, label: "All" },
            { id: "PAID" as const, label: "Disbursed" },
            { id: "PENDING" as const, label: "Pending" },
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
      </div>

      {/* Main Ledger Table Card */}
      <DataTableCard
        title="Faculty Payroll Ledger"
        subtitle={`Showing ${filtered.length} of ${teachers.length} faculty members`}
      >
        <Table className="w-full table-fixed border-collapse">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[24%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Faculty Member
              </TableHead>
              <TableHead className="w-[18%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Batches Taught
              </TableHead>
              <TableHead className="w-[13%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Base Retainer
              </TableHead>
              <TableHead className="w-[11%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Adjustments
              </TableHead>
              <TableHead className="w-[12%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Net Payable
              </TableHead>
              <TableHead className="w-[10%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Status
              </TableHead>
              <TableHead className="w-[12%] h-9 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell className="px-3 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-6.5 rounded-full bg-slate-200/80 shrink-0" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3 w-28 bg-slate-200/90 rounded" />
                        <Skeleton className="h-2.5 w-20 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2.5 py-3 border-b border-border">
                    <Skeleton className="h-4 w-24 bg-slate-100 rounded" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3 border-b border-border">
                    <Skeleton className="h-3.5 w-16 bg-slate-200/80 rounded" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3 border-b border-border">
                    <Skeleton className="h-3.5 w-12 bg-slate-100 rounded" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3 border-b border-border">
                    <Skeleton className="h-4 w-16 bg-slate-200/90 rounded font-bold" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3 border-b border-border">
                    <Skeleton className="h-5 w-16 bg-slate-100 rounded-full" />
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right border-b border-border">
                    <Skeleton className="h-7 w-20 bg-slate-200/80 rounded-lg ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                  <div className="size-10 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-2 text-primary">
                    <GraduationCap className="size-5" />
                  </div>
                  No faculty records match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => {
                const isPaid = Boolean(t.payout && t.payout.status === "PAID")
                const netAmount = t.payout ? t.payout.netAmount : t.salary || 45000
                const bonus = t.payout ? t.payout.bonus : 0
                const deductions = t.payout ? t.payout.deductions : 0
                const adjustmentDiff = bonus - deductions

                return (
                  <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                    {/* Faculty Member Avatar & Name */}
                    <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6.5 shrink-0 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-[10px]">
                          {t.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate">{t.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {t.subjects || "General Faculty"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Batches Taught */}
                    <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                      {t.batchNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                          {t.batchNames.slice(0, 2).map((b, i) => (
                            <span
                              key={i}
                              className="inline-block truncate max-w-full px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-medium"
                              title={b}
                            >
                              {b}
                            </span>
                          ))}
                          {t.batchNames.length > 2 && (
                            <span className="text-[10px] text-muted-foreground font-medium self-center">
                              +{t.batchNames.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px] italic">None</span>
                      )}
                    </TableCell>

                    {/* Base Retainer */}
                    <TableCell className="px-2.5 py-2.5 text-xs font-medium text-foreground border-b border-border whitespace-nowrap">
                      ₹{(t.salary || 45000).toLocaleString("en-IN")}
                    </TableCell>

                    {/* Adjustments */}
                    <TableCell className="px-2.5 py-2.5 text-xs border-b border-border whitespace-nowrap">
                      {adjustmentDiff > 0 ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">
                          +₹{adjustmentDiff.toLocaleString("en-IN")}
                        </span>
                      ) : adjustmentDiff < 0 ? (
                        <span className="text-rose-600 font-semibold text-[11px]">
                          -₹{Math.abs(adjustmentDiff).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </TableCell>

                    {/* Net Payable */}
                    <TableCell className="px-2.5 py-2.5 text-xs font-bold text-foreground border-b border-border whitespace-nowrap">
                      ₹{netAmount.toLocaleString("en-IN")}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-2.5 py-2.5 text-xs border-b border-border whitespace-nowrap">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-2.5" />
                          Disbursed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="size-2.5" />
                          Pending
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-3 py-2.5 text-right border-b border-border">
                      {isPaid ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onViewSlipClick(t)}
                          className="h-7 px-2.5 text-[11px] font-medium rounded-lg border-border text-foreground hover:bg-muted cursor-pointer shrink-0"
                        >
                          <Receipt className="size-3 mr-1 text-muted-foreground" />
                          <span>View Slip</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onDisburseClick(t)}
                          className="h-7 px-2.5 text-[11px] font-medium rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer shrink-0"
                        >
                          <Banknote className="size-3 mr-1" />
                          <span>Pay Salary</span>
                        </Button>
                      )}
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

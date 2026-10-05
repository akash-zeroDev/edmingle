"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Banknote,
  CalendarDays,
  IndianRupee,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { KpiGrid, KpiCard } from "@/components/ui/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomSelect } from "@/components/ui/custom-select"
import { PayrollLedgerTable } from "./payroll-ledger-table"
import {
  DisburseSalaryModal,
  type TeacherPayrollItem,
} from "./disburse-salary-modal"
import {
  SalarySlipModal,
  type SalarySlipData,
} from "./salary-slip-modal"

export interface PayrollKpiData {
  totalBudget: number
  totalDisbursed: number
  totalPending: number
  paidCount: number
  pendingCount: number
  facultyCount: number
}

interface PayrollDashboardViewProps {
  instituteName: string
  activeMonth: number
  activeYear: number
  kpiData: PayrollKpiData
  teachers: TeacherPayrollItem[]
}

export function PayrollDashboardView({
  instituteName,
  activeMonth,
  activeYear,
  kpiData,
  teachers,
}: PayrollDashboardViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Modal states
  const [disburseModalOpen, setDisburseModalOpen] = useState(false)
  const [selectedTeacherForDisburse, setSelectedTeacherForDisburse] = useState<TeacherPayrollItem | null>(null)

  const [slipModalOpen, setSlipModalOpen] = useState(false)
  const [activeSlipData, setActiveSlipData] = useState<SalarySlipData | null>(null)

  // Cycle selector options: strictly last 1 year (12 months from current cycle)
  const cycleOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    return { value: `${y}-${m}`, label }
  })

  const currentCycleValue = `${activeYear}-${activeMonth}`

  const handleCycleChange = (val: string) => {
    const [y, m] = val.split("-")
    startTransition(() => {
      router.push(`/institute/payroll?year=${y}&month=${m}`)
    })
  }

  const handleOpenDisburse = (teacher: TeacherPayrollItem) => {
    setSelectedTeacherForDisburse(teacher)
    setDisburseModalOpen(true)
  }

  const handleOpenViewSlip = (teacher: TeacherPayrollItem) => {
    if (teacher.payout) {
      setActiveSlipData({
        voucherNo: teacher.payout.voucherNo,
        teacherName: teacher.name,
        teacherPhone: teacher.phoneNo,
        month: teacher.payout.month,
        year: teacher.payout.year,
        baseSalary: teacher.payout.baseSalary,
        bonus: teacher.payout.bonus,
        deductions: teacher.payout.deductions,
        netAmount: teacher.payout.netAmount,
        paymentMode: teacher.payout.paymentMode,
        transactionRef: teacher.payout.transactionRef,
        paidAt: teacher.payout.paidAt,
        instituteName,
      })
      setSlipModalOpen(true)
    }
  }

  const handleDisbursementSuccess = (payout: any) => {
    setActiveSlipData({
      voucherNo: payout.voucherNo,
      teacherName: payout.teacherName,
      teacherPhone: payout.teacherPhone,
      month: payout.month,
      year: payout.year,
      baseSalary: payout.baseSalary,
      bonus: payout.bonus,
      deductions: payout.deductions,
      netAmount: payout.netAmount,
      paymentMode: payout.paymentMode,
      transactionRef: payout.transactionRef,
      paidAt: payout.paidAt,
      instituteName,
    })
    setSlipModalOpen(true)
  }

  const disbursedPercent = kpiData.totalBudget > 0
    ? ((kpiData.totalDisbursed / kpiData.totalBudget) * 100).toFixed(0)
    : "0"

  const formatLakhsOrThousands = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`
    }
    return `₹${val.toLocaleString("en-IN")}`
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6 relative">
      {/* Top Transition Progress Bar */}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-20 rounded-full">
          <div className="h-full bg-primary animate-pulse w-full duration-300" />
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Faculty Payroll</span>
            {isPending && (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">
                <Loader2 className="size-3 animate-spin" />
                Updating...
              </span>
            )}
          </h1>
        </div>

        {/* Cycle Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cycle Dropdown */}
          <div className="w-[190px]">
            <CustomSelect
              value={currentCycleValue}
              onChange={handleCycleChange}
              options={cycleOptions}
              placeholder="Payroll month"
              size="sm"
            />
          </div>

          {/* Disburse Salary Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const firstPending = teachers.find((t) => !t.payout)
              setSelectedTeacherForDisburse(firstPending || teachers[0] || null)
              setDisburseModalOpen(true)
            }}
            className="h-9 gap-1.5 text-xs bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            Disburse salary
          </Button>
        </div>
      </div>

      {/* 2. Top-line 4 KPI Cards with Skeleton Loading State */}
      <KpiGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3 animate-pulse shadow-xs">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24 bg-slate-100 rounded" />
                <Skeleton className="size-7 rounded-lg bg-slate-200/80" />
              </div>
              <Skeleton className="h-7 w-28 bg-slate-200/90 rounded-md" />
              <Skeleton className="h-3 w-36 bg-slate-100 rounded" />
            </div>
          ))
        ) : (
          <>
            <KpiCard
              title="Total budget"
              value={formatLakhsOrThousands(kpiData.totalBudget)}
              subtitle="For this cycle"
              icon={IndianRupee}
            />

            <KpiCard
              title="Disbursed"
              value={formatLakhsOrThousands(kpiData.totalDisbursed)}
              subtitle={`${kpiData.paidCount} of ${kpiData.facultyCount} teachers paid`}
              trend={{
                value: `${disbursedPercent}%`,
                isPositive: true,
                label: "completed",
              }}
              icon={CheckCircle2}
            />

            <KpiCard
              title="Pending"
              value={formatLakhsOrThousands(kpiData.totalPending)}
              subtitle="Awaiting payment"
              trend={{
                value: `${kpiData.pendingCount} pending`,
                isPositive: kpiData.pendingCount === 0,
                label: "teachers",
              }}
              icon={Clock}
            />

            <KpiCard
              title="Teachers"
              value={kpiData.facultyCount}
              subtitle="Assigned to batches"
              icon={Users}
            />
          </>
        )}
      </KpiGrid>

      {/* 3. Faculty Payroll Ledger Table */}
      <PayrollLedgerTable
        teachers={teachers}
        onDisburseClick={handleOpenDisburse}
        onViewSlipClick={handleOpenViewSlip}
        isLoading={isPending}
      />

      {/* Modal 1: Disburse Salary Counter Modal */}
      <DisburseSalaryModal
        open={disburseModalOpen}
        onOpenChange={setDisburseModalOpen}
        teacher={selectedTeacherForDisburse}
        teachers={teachers}
        month={activeMonth}
        year={activeYear}
        instituteName={instituteName}
        onDisbursementSuccess={handleDisbursementSuccess}
      />

      {/* Modal 2: Printable Faculty Salary Voucher / Slip */}
      <SalarySlipModal
        open={slipModalOpen}
        onOpenChange={setSlipModalOpen}
        slip={activeSlipData}
        instituteName={instituteName}
      />
    </div>
  )
}

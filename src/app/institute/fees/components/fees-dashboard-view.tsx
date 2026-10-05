"use client"

import React, { useState } from "react"
import { Plus, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeesKpiStrip, type FeesKpiData } from "./fees-kpi-strip"
import { FeesChartsGrid, type RealizationSlice, type BatchFeeStat, type AgingBucket } from "./fees-charts-grid"
import { BatchFeesStrip, type BatchFeeSummary } from "./batch-fees-strip"
import { StudentFeesTable, type StudentFeeRow } from "./student-fees-table"
import { CollectFeeModal, type StudentOption } from "./collect-fee-modal"
import { FeeReceiptModal, type ReceiptData } from "./fee-receipt-modal"
import { CashierSummaryModal, type CashierTransaction } from "./cashier-summary-modal"

export interface FeesDashboardViewProps {
  instituteName: string
  kpiData: FeesKpiData
  realizationSlices: RealizationSlice[]
  batchStats: BatchFeeStat[]
  agingBuckets: AgingBucket[]
  realizationRate: number
  batchSummaries: BatchFeeSummary[]
  students: StudentFeeRow[]
  todayTransactions: CashierTransaction[]
}

export function FeesDashboardView({
  instituteName,
  kpiData,
  realizationSlices,
  batchStats,
  agingBuckets,
  realizationRate,
  batchSummaries,
  students,
  todayTransactions,
}: FeesDashboardViewProps) {
  // Modal states
  const [collectModalOpen, setCollectModalOpen] = useState(false)
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<string | null>(null)

  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null)

  const [cashierModalOpen, setCashierModalOpen] = useState(false)

  // Map students to StudentOption format for CollectFeeModal
  const studentOptions: StudentOption[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    phoneNo: s.phoneNo,
    parentPhone: s.parentPhone,
    email: s.email,
    batchName: s.batchName,
    totalFee: s.totalFee,
    amountPaid: s.amountPaid,
    status: s.status,
    feeId: s.feeId,
  }))

  const handlePayForStudent = (student: StudentFeeRow) => {
    setSelectedStudentForPay(student.id)
    setCollectModalOpen(true)
  }

  const handleOpenGeneralCollect = () => {
    setSelectedStudentForPay(null)
    setCollectModalOpen(true)
  }

  const handlePaymentSuccess = (paymentResult: any) => {
    setActiveReceipt({
      receiptNo: paymentResult.receiptNo,
      studentName: paymentResult.studentName,
      batchName: paymentResult.batchName,
      amount: paymentResult.amount,
      paymentMode: paymentResult.paymentMode,
      remainingBalance: paymentResult.remainingBalance,
      paidAt: paymentResult.paidAt,
      cashierName: paymentResult.cashierName,
      instituteName,
      whatsappMessage: paymentResult.whatsappMessage,
    })
    setReceiptModalOpen(true)
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Fees & Payments
          </h1>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day-End Counter Closing */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCashierModalOpen(true)}
            className="h-9 gap-1.5 text-xs bg-card border-border shadow-xs"
          >
            <CalendarDays className="size-3.5 text-muted-foreground" />
            Counter closing
          </Button>

          {/* Primary Quick Collect Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleOpenGeneralCollect}
            className="h-9 gap-1.5 text-xs bg-primary hover:bg-primary-hover text-white shadow-xs"
          >
            <Plus className="size-3.5" />
            Collect fee
          </Button>
        </div>
      </div>

      {/* 2. Top-line 5 Financial KPI Cards Strip */}
      <FeesKpiStrip data={kpiData} />

      {/* 3. Recharts Financial Visualizations Grid (Donut, Stacked Bar, Aging Histogram) */}
      <FeesChartsGrid
        realizationData={realizationSlices}
        batchData={batchStats}
        agingData={agingBuckets}
        realizationRate={realizationRate}
      />

      {/* 4. Batch-Wise Fee Progress Cards */}
      <BatchFeesStrip batches={batchSummaries} />

      {/* 5. Main Student Fee Ledger Table */}
      <StudentFeesTable students={students} onPayClick={handlePayForStudent} />

      {/* MODAL 1: Front-Desk Reception Checkout */}
      <CollectFeeModal
        open={collectModalOpen}
        onOpenChange={setCollectModalOpen}
        students={studentOptions}
        initialStudentId={selectedStudentForPay}
        instituteName={instituteName}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* MODAL 2: Official Printable & Downloadable Fee Receipt */}
      <FeeReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        receipt={activeReceipt}
        instituteName={instituteName}
      />

      {/* MODAL 3: Day-End Cashier Counter Closing Ledger */}
      <CashierSummaryModal
        open={cashierModalOpen}
        onOpenChange={setCashierModalOpen}
        transactions={todayTransactions}
        instituteName={instituteName}
      />
    </div>
  )
}

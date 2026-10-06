"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  CheckCircle2,
  Users,
  AlertCircle,
  Clock,
  Layers3,
  ShieldAlert,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KpiGrid, KpiCard } from "@/components/ui/kpi-card"
import { BatchStatusTable } from "./batch-status-table"
import { AbsenteesTable } from "./absentees-table"
import {
  AdminRollCallSheet,
  type RollCallBatchOption,
} from "./admin-roll-call-sheet"
import { DefaultersTable } from "./defaulters-table"
import type { InstituteAttendanceData } from "@/actions/attendance"

interface AttendanceDashboardViewProps {
  instituteName: string
  initialData: InstituteAttendanceData
  batchesForRollCall: RollCallBatchOption[]
}

export function AttendanceDashboardView({
  instituteName,
  initialData,
  batchesForRollCall,
}: AttendanceDashboardViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"TODAY" | "ROLL_CALL" | "DEFAULTERS">("TODAY")
  const [selectedBatchIdForRollCall, setSelectedBatchIdForRollCall] = useState<string>(
    batchesForRollCall[0]?.id || ""
  )

  const dateObj = new Date(initialData.targetDate)
  const dateFormatted = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const monthFormatted = dateObj.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const dateInputVal = initialData.targetDate.substring(0, 10)

  const handleDateChange = (newDateStr: string) => {
    if (!newDateStr) return
    router.push(`/institute/attendance?date=${newDateStr}`)
  }

  const handleTakeBatchAttendanceFromTable = (batchId: string) => {
    setSelectedBatchIdForRollCall(batchId)
    setActiveTab("ROLL_CALL")
  }

  const { kpi, batchesStatus, todayAbsentees, defaulters } = initialData

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Attendance
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-light text-primary border border-primary/20">
              {instituteName}
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs shadow-2xs">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{dateFormatted}</span>
          </div>
          <Input
            type="date"
            value={dateInputVal}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-8 text-xs w-36 rounded-lg border-border"
          />
        </div>
      </div>

      {/* 4-Card KPI Strip Reusing Standard KpiGrid & KpiCard */}
      <KpiGrid>
        <KpiCard
          title="Attendance rate"
          value={`${kpi.overallPercentage}%`}
          subtitle={`${kpi.presentCount} of ${kpi.totalEnrolled} students present`}
          trend={
            kpi.overallPercentage >= 85
              ? { value: "Healthy", isPositive: true, label: "> 85% target" }
              : { value: "Low", isPositive: false, label: "below 85% target" }
          }
          icon={CheckCircle2}
        />

        <KpiCard
          title="Students present"
          value={kpi.presentCount}
          subtitle={`Across ${kpi.totalBatches} active batches`}
          trend={{ value: `${kpi.lateCount}`, isPositive: true, label: "marked late" }}
          icon={Users}
        />

        <KpiCard
          title="Absentees"
          value={kpi.absentCount}
          subtitle={
            kpi.absentCount > 0
              ? `${kpi.absentCount} absentees logged today`
              : "0 absentees logged today"
          }
          trend={
            kpi.absentCount > 0
              ? { value: "Review", isPositive: false, label: "parent notices ready" }
              : { value: "100%", isPositive: true, label: "full attendance" }
          }
          icon={AlertCircle}
        />

        <KpiCard
          title="Batch attendance"
          value={`${kpi.submittedBatchesCount}/${kpi.totalBatches}`}
          subtitle={`${kpi.pendingBatchesCount} ${kpi.pendingBatchesCount === 1 ? "batch" : "batches"} pending`}
          trend={
            kpi.pendingBatchesCount === 0
              ? { value: "Complete", isPositive: true, label: "all batches marked" }
              : { value: `${kpi.pendingBatchesCount}`, isPositive: false, label: "batches pending" }
          }
          icon={Layers3}
        />
      </KpiGrid>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("TODAY")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "TODAY"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="size-3.5" />
          <span>Today&apos;s attendance</span>
          {kpi.absentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
              {kpi.absentCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ROLL_CALL")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "ROLL_CALL"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-3.5" />
          <span>Mark attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DEFAULTERS")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "DEFAULTERS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="size-3.5" />
          <span>Defaulters (&lt; 75%)</span>
          {defaulters.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
              {defaulters.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Today's Overview & Absentees */}
      {activeTab === "TODAY" && (
        <div className="space-y-6">
          {/* Batch Submission Status Tracker */}
          <BatchStatusTable
            batches={batchesStatus}
            onTakeAttendanceClick={handleTakeBatchAttendanceFromTable}
          />

          {/* Today's Absentees Watchlist with WhatsApp notification trigger */}
          <AbsenteesTable
            absentees={todayAbsentees}
            dateLabel={dateFormatted}
          />
        </div>
      )}

      {/* TAB 2: Interactive Admin Roll-Call Sheet */}
      {activeTab === "ROLL_CALL" && (
        <AdminRollCallSheet
          batches={batchesForRollCall}
          initialBatchId={selectedBatchIdForRollCall}
          initialDate={dateInputVal}
        />
      )}

      {/* TAB 3: Defaulters (< 75%) & Monthly Register */}
      {activeTab === "DEFAULTERS" && (
        <DefaultersTable
          defaulters={defaulters}
          monthLabel={monthFormatted}
        />
      )}
    </div>
  )
}

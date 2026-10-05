"use client"

import React, { useState, useTransition } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Save,
  Check,
  X,
  Clock,
  Coffee,
  RotateCcw,
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
import { submitBatchAttendance } from "@/actions/attendance"

export interface RosterStudent {
  studentId: string
  name: string
  phoneNo: string | null
  parentPhone: string | null
  currentStatus?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  remarks?: string
}

export interface RollCallBatchOption {
  id: string
  label: string
  className: string
  subject: string
  teacherName: string
  students: RosterStudent[]
}

interface AdminRollCallSheetProps {
  batches: RollCallBatchOption[]
  initialBatchId?: string
  initialDate: string // YYYY-MM-DD
}

type StatusType = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"

export function AdminRollCallSheet({
  batches,
  initialBatchId,
  initialDate,
}: AdminRollCallSheetProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || batches[0]?.id || ""
  )
  const [selectedDate, setSelectedDate] = useState<string>(initialDate)
  const [isPending, startTransition] = useTransition()
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0]

  // Local state for student statuses & remarks
  const [rosterStatus, setRosterStatus] = useState<Record<string, StatusType>>(() => {
    const map: Record<string, StatusType> = {}
    activeBatch?.students.forEach((s) => {
      map[s.studentId] = s.currentStatus || "PRESENT"
    })
    return map
  })

  const [rosterRemarks, setRosterRemarks] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    activeBatch?.students.forEach((s) => {
      if (s.remarks) map[s.studentId] = s.remarks
    })
    return map
  })

  // When changing batch, reset local state
  const handleBatchSelect = (batchId: string) => {
    setSelectedBatchId(batchId)
    const target = batches.find((b) => b.id === batchId)
    const newStatusMap: Record<string, StatusType> = {}
    const newRemarksMap: Record<string, string> = {}
    target?.students.forEach((s) => {
      newStatusMap[s.studentId] = s.currentStatus || "PRESENT"
      if (s.remarks) newRemarksMap[s.studentId] = s.remarks
    })
    setRosterStatus(newStatusMap)
    setRosterRemarks(newRemarksMap)
    setSaveSuccessMessage(null)
    setSaveErrorMessage(null)
  }

  // Quick 1-click helpers
  const handleMarkAllPresent = () => {
    if (!activeBatch) return
    const map: Record<string, StatusType> = {}
    activeBatch.students.forEach((s) => {
      map[s.studentId] = "PRESENT"
    })
    setRosterStatus(map)
  }

  const handleResetStatuses = () => {
    if (!activeBatch) return
    const map: Record<string, StatusType> = {}
    activeBatch.students.forEach((s) => {
      map[s.studentId] = s.currentStatus || "PRESENT"
    })
    setRosterStatus(map)
  }

  const handleSetStudentStatus = (studentId: string, status: StatusType) => {
    setRosterStatus((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRosterRemarks((prev) => ({ ...prev, [studentId]: remark }))
  }

  const handleSaveAttendance = () => {
    if (!activeBatch) return
    setSaveSuccessMessage(null)
    setSaveErrorMessage(null)

    const records = activeBatch.students.map((s) => ({
      studentId: s.studentId,
      status: rosterStatus[s.studentId] || "PRESENT",
      remarks: rosterRemarks[s.studentId] || undefined,
    }))

    startTransition(async () => {
      const res = await submitBatchAttendance({
        batchId: activeBatch.id,
        date: selectedDate,
        records,
        markedBy: "Admin",
      })

      if (res.success) {
        setSaveSuccessMessage(res.message || "Attendance saved successfully!")
      } else {
        setSaveErrorMessage(res.error || "Failed to save attendance.")
      }
    })
  }

  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: `${b.className} - ${b.label} (${b.teacherName})`,
  }))

  const presentCount = Object.values(rosterStatus).filter((s) => s === "PRESENT").length
  const absentCount = Object.values(rosterStatus).filter((s) => s === "ABSENT").length
  const lateCount = Object.values(rosterStatus).filter((s) => s === "LATE").length
  const excusedCount = Object.values(rosterStatus).filter((s) => s === "EXCUSED").length
  const totalCount = activeBatch?.students.length || 0

  return (
    <div className="space-y-4">
      {/* Selector & Action Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card">
        {/* Batch & Date Picker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
          <div className="w-full sm:w-72">
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Select Batch
            </label>
            <CustomSelect
              options={batchOptions}
              value={selectedBatchId}
              onChange={handleBatchSelect}
              placeholder="Select a batch..."
            />
          </div>

          <div className="w-full sm:w-44">
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Attendance date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs rounded-lg border-border"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            className="h-8 text-xs rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
            Mark all present
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetStatuses}
            className="h-8 text-xs rounded-lg"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveAttendance}
            disabled={isPending || totalCount === 0}
            className="h-8 text-xs rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs"
          >
            <Save className="size-3.5 mr-1" />
            {isPending ? "Saving..." : "Save attendance"}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {saveErrorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <X className="size-4 shrink-0 text-rose-600" />
          <span>{saveErrorMessage}</span>
        </div>
      )}

      {/* Roster Table Card */}
      <DataTableCard
        title={activeBatch ? `${activeBatch.className} - ${activeBatch.label}` : "Attendance roster"}
        subtitle={`${totalCount} enrolled`}
        action={
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-600 font-semibold">{presentCount} Present</span>
            <span className="text-rose-600 font-semibold">{absentCount} Absent</span>
            <span className="text-amber-600 font-semibold">{lateCount} Late</span>
            <span className="text-blue-600 font-semibold">{excusedCount} Excused</span>
          </div>
        }
      >
        <Table className="table-fixed w-full border-collapse">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[32%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Student
              </TableHead>
              <TableHead className="w-[18%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Contact
              </TableHead>
              <TableHead className="w-[28%] h-9 px-2.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Attendance Status
              </TableHead>
              <TableHead className="w-[22%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Remarks / Notes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!activeBatch || activeBatch.students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-xs text-muted-foreground">
                  No students are enrolled in this batch yet.
                </TableCell>
              </TableRow>
            ) : (
              activeBatch.students.map((student) => {
                const currentStatus = rosterStatus[student.studentId] || "PRESENT"
                const currentRemark = rosterRemarks[student.studentId] || ""

                return (
                  <TableRow key={student.studentId} className="hover:bg-muted/30 transition-colors">
                    {/* Student Avatar & Name */}
                    <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6.5 shrink-0 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-[10px]">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate">{student.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            Roll ID: {student.studentId.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-2.5 py-2.5 text-xs text-muted-foreground border-b border-border">
                      <span className="truncate">{student.phoneNo || "—"}</span>
                    </TableCell>

                    {/* Status Toggles: [P] [A] [L] [E] */}
                    <TableCell className="px-2.5 py-2.5 text-xs text-center border-b border-border">
                      <div className="inline-flex items-center p-0.5 rounded-lg bg-muted border border-border">
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.studentId, "PRESENT")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            currentStatus === "PRESENT"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          P
                        </button>

                        {/* Absent */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.studentId, "ABSENT")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            currentStatus === "ABSENT"
                              ? "bg-rose-600 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          A
                        </button>

                        {/* Late */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.studentId, "LATE")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            currentStatus === "LATE"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          L
                        </button>

                        {/* Excused */}
                        <button
                          type="button"
                          onClick={() => handleSetStudentStatus(student.studentId, "EXCUSED")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            currentStatus === "EXCUSED"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          E
                        </button>
                      </div>
                    </TableCell>

                    {/* Remarks Input */}
                    <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                      <Input
                        value={currentRemark}
                        onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                        placeholder="Optional remarks..."
                        className="h-7 text-xs rounded-md border-border bg-background"
                      />
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

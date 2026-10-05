"use client"

import React, { useState } from "react"
import {
  AlertTriangle,
  Download,
  Search,
  MessageSquare,
  ShieldAlert,
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
import type { DefaulterStudentItem } from "@/actions/attendance"

interface DefaultersTableProps {
  defaulters: DefaulterStudentItem[]
  monthLabel: string
}

export function DefaultersTable({
  defaulters,
  monthLabel,
}: DefaultersTableProps) {
  const [search, setSearch] = useState("")

  const filtered = defaulters.filter((d) => {
    const q = search.toLowerCase()
    return (
      d.name.toLowerCase().includes(q) ||
      (d.phoneNo && d.phoneNo.includes(q)) ||
      (d.parentPhone && d.parentPhone.includes(q)) ||
      d.className.toLowerCase().includes(q) ||
      d.batchName.toLowerCase().includes(q)
    )
  })

  const handleExportCsv = () => {
    if (defaulters.length === 0) {
      alert("No defaulter records to export.")
      return
    }

    const headers = [
      "Student Name",
      "Class",
      "Batch",
      "Total Classes",
      "Attended",
      "Absent",
      "Attendance %",
      "Parent Contact",
    ]
    const rows = defaulters.map((d) => [
      `"${d.name}"`,
      `"${d.className}"`,
      `"${d.batchName}"`,
      d.totalClasses,
      d.attendedClasses,
      d.absentClasses,
      `"${d.attendanceRate}%"`,
      `"${d.parentPhone || d.phoneNo || ""}"`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Defaulters_List_${monthLabel.replace(/\s+/g, "_")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAlertParent = (item: DefaulterStudentItem) => {
    const phone = item.parentPhone || item.phoneNo
    if (!phone) {
      alert("No parent phone number registered.")
      return
    }
    const cleanPhone = phone.replace(/[^\d]/g, "")
    const message = encodeURIComponent(
      `Dear Parent, this is an important academic notice regarding ${item.name}. Your ward's current attendance rate is ${item.attendanceRate}% (${item.attendedClasses}/${item.totalClasses} classes attended) for ${item.className} in ${monthLabel}, which is below our 75% minimum policy. Kindly contact faculty counseling.`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-950">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="size-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">
              Low Attendance Watchlist (&lt; 75% Policy)
            </h4>
            <p className="text-rose-800/80 text-[11px] mt-0.5">
              Identifies students falling below 75% classroom presence in {monthLabel}. Immediate intervention helps prevent dropout risk and exam disqualification.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="shrink-0 h-8 text-xs rounded-lg border-rose-300 text-rose-800 hover:bg-rose-100/60"
        >
          <Download className="size-3.5 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Defaulters Table Card */}
      <DataTableCard
        title={`Academic Defaulters List (${monthLabel})`}
        subtitle={`${defaulters.length} At Risk`}
        action={
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or class..."
              className="pl-8 h-8 text-xs rounded-lg border-border"
            />
          </div>
        }
      >
        <Table className="table-fixed w-full border-collapse">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[28%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Student Name
              </TableHead>
              <TableHead className="w-[24%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Class & Batch
              </TableHead>
              <TableHead className="w-[18%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Attendance %
              </TableHead>
              <TableHead className="w-[16%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Sessions (Attended/Held)
              </TableHead>
              <TableHead className="w-[14%] h-9 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                  <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="size-4" />
                  </div>
                  {defaulters.length === 0
                    ? "Excellent! No students have attendance below 75% for this cycle."
                    : "No defaulters match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.studentId} className="hover:bg-muted/30 transition-colors">
                  {/* Student */}
                  <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                    <div className="font-semibold text-foreground truncate">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Parent: {d.parentPhone || d.phoneNo || "No number logged"}
                    </div>
                  </TableCell>

                  {/* Batch */}
                  <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                    <div className="text-foreground font-medium truncate">{d.className}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{d.batchName}</div>
                  </TableCell>

                  {/* Attendance Rate */}
                  <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600">{d.attendanceRate}%</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                        Critical
                      </span>
                    </div>
                  </TableCell>

                  {/* Sessions */}
                  <TableCell className="px-2.5 py-2.5 text-xs text-muted-foreground border-b border-border">
                    <span className="truncate">
                      {d.attendedClasses} / {d.totalClasses} classes
                    </span>
                  </TableCell>

                  {/* WhatsApp Action */}
                  <TableCell className="px-3 py-2.5 text-xs text-right border-b border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertParent(d)}
                      className="h-7 px-2 text-[11px] rounded-lg border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      <MessageSquare className="size-3 mr-1 text-rose-600" />
                      Alert Parent
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  )
}

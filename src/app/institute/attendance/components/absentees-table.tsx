"use client"

import React, { useState } from "react"
import { Search, MessageSquare, AlertCircle, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { DataTableCard } from "@/components/ui/data-table-card"
import type { AbsenteeStudentItem } from "@/actions/attendance"

interface AbsenteesTableProps {
  absentees: AbsenteeStudentItem[]
  dateLabel: string
}

export function AbsenteesTable({ absentees, dateLabel }: AbsenteesTableProps) {
  const [search, setSearch] = useState("")

  const filtered = absentees.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.studentName.toLowerCase().includes(q) ||
      (s.phoneNo && s.phoneNo.includes(q)) ||
      (s.parentPhone && s.parentPhone.includes(q)) ||
      s.batchName.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q)
    )
  })

  const handleSendWhatsAppNotice = (item: AbsenteeStudentItem) => {
    const phone = item.parentPhone || item.phoneNo
    if (!phone) {
      alert("No parent phone number registered for this student.")
      return
    }
    const cleanPhone = phone.replace(/[^\d]/g, "")
    const message = encodeURIComponent(
      `Dear Parent, this is an official update regarding ${item.studentName}. Your ward was marked ABSENT for ${item.className} (${item.batchName}) today, ${dateLabel}. Kindly contact the institute office if this was unplanned.`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  return (
    <DataTableCard
      title="Today's Absentee Watchlist & Alerts"
      subtitle={`${absentees.length} Flagged`}
      action={
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search absentee or parent..."
            className="pl-8 h-8 text-xs rounded-lg border-border"
          />
        </div>
      }
    >
      <Table className="table-fixed w-full border-collapse">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[28%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Student Details
            </TableHead>
            <TableHead className="w-[24%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Class & Batch
            </TableHead>
            <TableHead className="w-[20%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Parent Contact
            </TableHead>
            <TableHead className="w-[14%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Remarks
            </TableHead>
            <TableHead className="w-[14%] h-9 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Parent Notice
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="size-4" />
                </div>
                {absentees.length === 0
                  ? "Great news! Zero absentees flagged for the selected date."
                  : "No absentees match your search query."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                {/* Student */}
                <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6.5 shrink-0 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-[10px]">
                      {item.studentName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate">
                        {item.studentName}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {item.phoneNo || "No personal phone"}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Batch */}
                <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {item.className}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {item.batchName} ({item.subject})
                    </div>
                  </div>
                </TableCell>

                {/* Parent Contact */}
                <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs min-w-0">
                    <Phone className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.parentPhone || "Not provided"}</span>
                  </div>
                </TableCell>

                {/* Remarks */}
                <TableCell className="px-2.5 py-2.5 text-xs text-muted-foreground border-b border-border">
                  <span className="truncate italic">
                    {item.remarks || "No remarks logged"}
                  </span>
                </TableCell>

                {/* WhatsApp Notice Button */}
                <TableCell className="px-3 py-2.5 text-xs text-right border-b border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendWhatsAppNotice(item)}
                    className="h-7 px-2 text-[11px] rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <MessageSquare className="size-3 mr-1 text-emerald-600" />
                    WhatsApp
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableCard>
  )
}

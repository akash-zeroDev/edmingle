"use client"

import React from "react"
import { CheckCircle2, Clock, Users, ArrowRight } from "lucide-react"
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
import type { BatchSubmissionStatus } from "@/actions/attendance"

interface BatchStatusTableProps {
  batches: BatchSubmissionStatus[]
  onTakeAttendanceClick: (batchId: string) => void
}

export function BatchStatusTable({
  batches,
  onTakeAttendanceClick,
}: BatchStatusTableProps) {
  return (
    <DataTableCard
      title="Batch attendance"
      subtitle={`${batches.filter((b) => b.status === "SUBMITTED").length}/${batches.length} submitted`}
    >
      <Table className="table-fixed w-full border-collapse">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[30%] h-9 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Batch
            </TableHead>
            <TableHead className="w-[22%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Teacher
            </TableHead>
            <TableHead className="w-[15%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Timing
            </TableHead>
            <TableHead className="w-[18%] h-9 px-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Status
            </TableHead>
            <TableHead className="w-[15%] h-9 px-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.05em] border-b border-border">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                No active batches found in your institute.
              </TableCell>
            </TableRow>
          ) : (
            batches.map((b) => {
              const isSubmitted = b.status === "SUBMITTED"

              return (
                <TableRow key={b.batchId} className="hover:bg-muted/30 transition-colors">
                  {/* Batch & Subject */}
                  <TableCell className="px-3 py-2.5 text-xs border-b border-border">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {b.className} - {b.batchName}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {b.subject}, {b.totalStudents} students
                      </div>
                    </div>
                  </TableCell>

                  {/* Assigned Faculty */}
                  <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                    <div className="text-foreground font-medium truncate">
                      {b.teacherName}
                    </div>
                  </TableCell>

                  {/* Lecture Timing */}
                  <TableCell className="px-2.5 py-2.5 text-xs text-muted-foreground border-b border-border">
                    <span className="truncate">{b.timing || "Regular Slot"}</span>
                  </TableCell>

                  {/* Submission Status */}
                  <TableCell className="px-2.5 py-2.5 text-xs border-b border-border">
                    {isSubmitted ? (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-3 shrink-0" />
                          <span>Submitted</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          ({b.presentCount}/{b.totalStudents} P)
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="size-3 shrink-0" />
                        <span>Pending</span>
                      </span>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-3 py-2.5 text-xs text-right border-b border-border">
                    <Button
                      variant={isSubmitted ? "outline" : "default"}
                      size="sm"
                      onClick={() => onTakeAttendanceClick(b.batchId)}
                      className={
                        isSubmitted
                          ? "h-7 px-2.5 text-[11px] rounded-lg"
                          : "h-7 px-2.5 text-[11px] rounded-lg bg-primary hover:bg-primary-hover text-white"
                      }
                    >
                      {isSubmitted ? "Edit" : "Mark as Admin"}
                      <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </DataTableCard>
  )
}

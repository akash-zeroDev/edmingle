"use client"

import React, { useState } from "react"
import { Layers3, User, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { broadcastBatchFeeReminder } from "@/actions/fee"
import { useToast } from "@/hooks/use-toast"

export interface BatchFeeSummary {
  id: string
  className: string
  subject: string
  batchName?: string | null
  teacherName?: string | null
  enrolledStudents: number
  totalTarget: number
  totalCollected: number
  pendingBalance: number
}

interface BatchFeesStripProps {
  batches: BatchFeeSummary[]
}

export function BatchFeesStrip({ batches }: BatchFeesStripProps) {
  const [remindingBatchId, setRemindingBatchId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleBroadcast = async (batchId: string) => {
    setRemindingBatchId(batchId)
    try {
      const res = await broadcastBatchFeeReminder(batchId)
      if (res.error) {
        toast({ variant: "destructive", title: "Broadcast Failed", description: res.error })
      } else {
        toast({
          title: "Batch Reminders Sent",
          description: res.message,
        })
      }
    } finally {
      setRemindingBatchId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Batch fee collection</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {batches.length} active batches
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {batches.map((b) => {
          const realizationRate = b.totalTarget > 0 ? (b.totalCollected / b.totalTarget) * 100 : 0
          const isReminding = remindingBatchId === b.id
          const displayName = b.batchName || `${b.className} - ${b.subject}`

          return (
            <div
              key={b.id}
              className="p-4 rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                      <Layers3 className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-foreground truncate" title={displayName}>
                        {displayName}
                      </h4>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                        <User className="size-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{b.teacherName || "Unassigned"}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                    {b.enrolledStudents} students
                  </span>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-muted/40 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Collected</span>
                    <div className="font-semibold text-emerald-700">
                      ₹{b.totalCollected.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">Pending</span>
                    <div className="font-semibold text-rose-600">
                      ₹{b.pendingBalance.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Collection</span>
                    <span className="font-semibold text-foreground">{realizationRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, realizationRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isReminding || b.pendingBalance === 0}
                onClick={() => handleBroadcast(b.id)}
                className="w-full h-8 text-xs font-medium rounded-lg border-border text-foreground hover:bg-muted"
              >
                {isReminding ? (
                  <>
                    <Loader2 className="size-3 mr-1.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-3 mr-1.5 text-muted-foreground" />
                    Send fee reminders
                  </>
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

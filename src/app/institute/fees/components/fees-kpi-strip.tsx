"use client"

import React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

export interface FeesKpiData {
  totalTarget: number
  totalCollected: number
  pendingBalance: number
  overdueAmount: number
  overdueCount: number
  todayCollected: number
}

export function FeesKpiStrip({ data }: { data: FeesKpiData }) {
  const realizationPercent = data.totalTarget > 0
    ? ((data.totalCollected / data.totalTarget) * 100).toFixed(1)
    : "0.0"

  const formatLakhsOrThousands = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`
    }
    return `₹${val.toLocaleString("en-IN")}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Total Target */}
      <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Total billed
        </p>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="text-[26px] font-bold leading-none text-foreground">
            {formatLakhsOrThousands(data.totalTarget)}
          </p>
        </div>
      </section>

      {/* 2. Total Collected */}
      <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Collected
        </p>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="text-[26px] font-bold leading-none text-foreground">
            {formatLakhsOrThousands(data.totalCollected)}
          </p>
          <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            {realizationPercent}%
          </span>
        </div>
      </section>

      {/* 3. Pending Receivables */}
      <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Pending
        </p>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="text-[26px] font-bold leading-none text-foreground">
            {formatLakhsOrThousands(data.pendingBalance)}
          </p>
        </div>
      </section>

      {/* 4. Overdue Amount */}
      <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs">
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Overdue
        </p>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="text-[26px] font-bold leading-none text-rose-600">
            {formatLakhsOrThousands(data.overdueAmount)}
          </p>
          {data.overdueCount > 0 && (
            <span className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              {data.overdueCount} due
            </span>
          )}
        </div>
      </section>

      {/* 5. Today at Reception Counter */}
      <section className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-xs sm:col-span-2 lg:col-span-1">
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Today's collection
        </p>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="text-[26px] font-bold leading-none text-foreground">
            {formatLakhsOrThousands(data.todayCollected)}
          </p>
        </div>
      </section>
    </div>
  )
}

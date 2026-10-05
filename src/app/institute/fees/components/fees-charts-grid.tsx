"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export interface RealizationSlice {
  name: string
  value: number
  color: string
  count: number
}

export interface BatchFeeStat {
  batchName: string
  collected: number
  pending: number
}

export interface AgingBucket {
  range: string
  amount: number
  count: number
}

interface FeesChartsGridProps {
  realizationData: RealizationSlice[]
  batchData: BatchFeeStat[]
  agingData: AgingBucket[]
  realizationRate: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground p-2.5 rounded-lg border border-border shadow-md text-xs space-y-1">
        <div className="font-semibold text-foreground">{label || payload[0]?.name}</div>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-semibold text-foreground">₹{p.value.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function FeesChartsGrid({
  realizationData,
  batchData,
  agingData,
  realizationRate,
}: FeesChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Circular Realization Donut Gauge */}
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between">
        <div className="flex min-h-12 items-center justify-between border-b border-border px-4 py-2.5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Collection rate</h2>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {realizationRate.toFixed(1)}% collected
          </span>
        </div>

        <div className="relative h-52 flex items-center justify-center p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={realizationData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {realizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Percentage Stat */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground">{realizationRate.toFixed(1)}%</span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Collected</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 px-4 py-3 border-t border-border bg-muted/20">
          {realizationData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground truncate text-[11px]">{item.name}</span>
              </div>
              <span className="font-semibold text-foreground text-[11px] ml-1">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Batch-Wise Fee Comparison (Stacked Bar) */}
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between">
        <div className="flex min-h-12 items-center justify-between border-b border-border px-4 py-2.5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Batch collection</h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Top Batches</span>
        </div>

        <div className="h-52 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={batchData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="batchName"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                width={70}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="collected" name="Collected" stackId="a" fill="var(--primary)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#cbd5e1" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-xs bg-primary" />
            <span className="text-[11px]">Collected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-xs bg-slate-300" />
            <span className="text-[11px]">Pending</span>
          </div>
        </div>
      </section>

      {/* 3. Dues Aging Histogram */}
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between">
        <div className="flex min-h-12 items-center justify-between border-b border-border px-4 py-2.5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Overdue by age</h2>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Aging
          </span>
        </div>

        <div className="h-52 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={agingData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name="Overdue Amount" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
          <span>Short-term (1–15d): WhatsApp reminder</span>
          <span className="text-amber-700 font-medium">30d+: Call required</span>
        </div>
      </section>
    </div>
  )
}

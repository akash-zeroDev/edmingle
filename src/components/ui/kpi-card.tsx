import * as React from "react"
import { cn } from "@/lib/utils"

export interface KpiCardProps {
  title: string
  value: string | number
  subValue?: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  className?: string
}

export function KpiCard({
  title,
  value,
  subValue,
  subtitle,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary">
            <Icon className="size-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {subValue && (
          <span className="text-xs font-normal text-muted-foreground">{subValue}</span>
        )}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold",
              trend.isPositive !== false
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            )}
          >
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}

      {subtitle && (
        <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}

export function KpiGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}

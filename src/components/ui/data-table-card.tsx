import * as React from "react"
import { cn } from "@/lib/utils"

export interface DataTableCardProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DataTableCard({
  title,
  subtitle,
  action,
  children,
  className,
}: DataTableCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#e7e9ed] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden w-full",
        className
      )}
    >
      <div className="flex justify-between items-center px-5 min-h-[64px] border-b border-[#e7e9ed]">
        <div>
          <div className="text-[14px] font-bold text-[#1a201c]">{title}</div>
          {subtitle && (
            <div className="text-[11px] text-[#5e6b63] mt-0.5">{subtitle}</div>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

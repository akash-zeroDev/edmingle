"use client"

import * as React from "react"
import { useState } from "react"
import { CalendarDays, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar, type DateRange } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  onApplyPreset?: (presetName: string, range: DateRange) => void
  activePreset?: string
  className?: string
  align?: "start" | "center" | "end"
}

export function DateRangePicker({
  value,
  onChange,
  onApplyPreset,
  activePreset = "This Month",
  className,
  align = "end",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(value || {})

  // Keep temp range in sync when opening
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && value) {
      setTempRange(value)
    }
    setOpen(nextOpen)
  }

  const handleApply = () => {
    if (onChange) {
      onChange(tempRange)
    }
    setOpen(false)
  }

  const handlePresetSelect = (name: string) => {
    const now = new Date()
    let from: Date
    let to: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    if (name === "Today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    } else if (name === "Yesterday") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0)
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59)
    } else if (name === "This Week") {
      const day = now.getDay()
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1), 0, 0, 0)
    } else if (name === "This Month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    } else if (name === "Last Month") {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0)
      to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    } else if (name === "Last 30 Days") {
      from = new Date(now.getTime() - 30 * 86400000)
    } else if (name === "Year to Date") {
      from = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    }

    const range = { from, to }
    setTempRange(range)
    if (onApplyPreset) {
      onApplyPreset(name, range)
    } else if (onChange) {
      onChange(range)
    }
    setOpen(false)
  }

  const formatDisplay = () => {
    if (activePreset && activePreset !== "Custom Range") {
      return activePreset
    }
    if (value?.from && value?.to) {
      const fromStr = value.from.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      const toStr = value.to.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      return `${fromStr} – ${toStr}`
    }
    if (value?.from) {
      return `From ${value.from.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`
    }
    return "Select Date Range"
  }

  const presets = [
    "Today",
    "This Week",
    "This Month",
    "Last Month",
    "Last 30 Days",
    "Year to Date",
  ]

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8.5 gap-2 px-3 text-xs bg-card border-border hover:bg-muted font-medium shadow-2xs transition-all",
            className
          )}
        >
          <CalendarDays className="size-3.5 text-primary" />
          <span>{formatDisplay()}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-auto p-0 bg-card border-border shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Quick Presets Sidebar */}
          <div className="w-full md:w-36 p-2 bg-muted/30 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
              Presets
            </span>
            {presets.map((preset) => {
              const isSelected = activePreset === preset
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap",
                    isSelected
                      ? "bg-primary text-white font-semibold shadow-2xs"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span>{preset}</span>
                  {isSelected && <Check className="size-3 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Calendar Area */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={(r) => r && setTempRange(r as DateRange)}
              className="w-72"
            />

            {/* Inputs & Action Bar */}
            <div className="pt-3 border-t border-border mt-2 space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={tempRange.from ? tempRange.from.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const d = new Date(e.target.value)
                        setTempRange((prev) => ({ ...prev, from: d }))
                      }
                    }}
                    className="h-7 text-xs rounded-lg border-border"
                  />
                </div>
                <span className="text-muted-foreground mt-3">→</span>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={tempRange.to ? tempRange.to.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const d = new Date(e.target.value)
                        setTempRange((prev) => ({ ...prev, to: d }))
                      }
                    }}
                    className="h-7 text-xs rounded-lg border-border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-7 text-xs rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  disabled={!tempRange.from}
                  className="h-7 px-3 text-xs rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold cursor-pointer"
                >
                  Apply Range
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

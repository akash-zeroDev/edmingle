"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface DateRange {
  from?: Date
  to?: Date
}

export interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date | DateRange
  onSelect?: (date: Date | DateRange | undefined) => void
  initialMonth?: Date
  className?: string
  minDate?: Date
  maxDate?: Date
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  initialMonth,
  className,
  minDate,
  maxDate,
}: CalendarProps) {
  // Current viewing month
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (initialMonth) return new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
    if (selected instanceof Date) return new Date(selected.getFullYear(), selected.getMonth(), 1)
    if (selected && "from" in selected && selected.from) {
      return new Date(selected.from.getFullYear(), selected.from.getMonth(), 1)
    }
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const selectedRange = useMemo<DateRange>(() => {
    if (!selected) return {}
    if (selected instanceof Date) return { from: selected, to: selected }
    return selected
  }, [selected])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // Days matrix for the month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days: Array<{
      date: Date
      isCurrentMonth: boolean
      isPrevMonth: boolean
      isNextMonth: boolean
    }> = []

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        isPrevMonth: false,
        isNextMonth: false,
      })
    }

    // Next month padding to reach 35 or 42 cells (5 or 6 weeks)
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true,
      })
    }

    return days
  }, [year, month])

  const isSameDay = (d1?: Date, d2?: Date) => {
    if (!d1 || !d2) return false
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  const isBeforeDay = (d1: Date, d2: Date) => {
    const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
    const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
    return a < b
  }

  const handleDateClick = (date: Date) => {
    if (!onSelect) return

    if (mode === "single") {
      onSelect(date)
      return
    }

    // Range mode
    const from = selectedRange.from
    const to = selectedRange.to

    if (!from || (from && to)) {
      // Starting a new selection
      onSelect({ from: date, to: undefined })
    } else if (from && !to) {
      if (isBeforeDay(date, from)) {
        // Clicked date is before 'from', set as new 'from'
        onSelect({ from: date, to: from })
      } else {
        onSelect({ from, to: date })
      }
    }
  }

  return (
    <div className={cn("p-3 select-none w-72 bg-card text-foreground", className)}>
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between pb-3">
        <h4 className="text-xs font-bold tracking-tight text-foreground">
          {MONTH_NAMES[month]} {year}
        </h4>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="size-7 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="size-7 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="text-[10px] font-semibold text-muted-foreground uppercase">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center text-xs">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const isFrom = isSameDay(date, selectedRange.from)
          const isTo = isSameDay(date, selectedRange.to)
          const isSelected = isFrom || isTo

          // Determine if in between selected range
          let isInRange = false
          if (selectedRange.from && selectedRange.to) {
            isInRange =
              isBeforeDay(selectedRange.from, date) &&
              isBeforeDay(date, selectedRange.to)
          } else if (selectedRange.from && !selectedRange.to && hoverDate) {
            if (isBeforeDay(selectedRange.from, hoverDate)) {
              isInRange =
                isBeforeDay(selectedRange.from, date) &&
                isBeforeDay(date, hoverDate)
            } else {
              isInRange =
                isBeforeDay(hoverDate, date) &&
                isBeforeDay(date, selectedRange.from)
            }
          }

          const isToday = isSameDay(date, new Date())

          const isDisabled =
            (minDate && isBeforeDay(date, minDate)) ||
            (maxDate && isBeforeDay(maxDate, date))

          return (
            <div
              key={idx}
              className={cn(
                "h-8 flex items-center justify-center transition-colors relative",
                isInRange && "bg-primary-light/60",
                isFrom && selectedRange.to && "rounded-l-lg bg-primary-light/60",
                isTo && selectedRange.from && "rounded-r-lg bg-primary-light/60"
              )}
              onMouseEnter={() => mode === "range" && setHoverDate(date)}
            >
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateClick(date)}
                className={cn(
                  "size-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative z-10",
                  !isCurrentMonth && "text-muted-foreground/40",
                  isCurrentMonth && !isSelected && !isInRange && "text-foreground hover:bg-muted",
                  isInRange && !isSelected && "text-primary font-semibold",
                  isSelected && "bg-primary text-white font-bold shadow-xs hover:bg-primary-hover",
                  isToday && !isSelected && "border border-primary/40 font-bold text-primary",
                  isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                )}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

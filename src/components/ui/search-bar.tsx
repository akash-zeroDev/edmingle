"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  totalCount?: number
  filteredCount?: number
  countLabel?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  totalCount,
  filteredCount,
  countLabel = "items",
  className,
}: SearchBarProps) {
  const hasCount = totalCount !== undefined

  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", className)}>
      <div className="relative w-full sm:w-[340px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-8 text-xs bg-white border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/25 focus:border-primary transition-all shadow-sm text-foreground placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted outline-none focus:outline-none focus-visible:outline-none cursor-pointer"
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {hasCount && (
        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredCount ?? totalCount}</strong> of {totalCount} {countLabel}
        </div>
      )}
    </div>
  )
}

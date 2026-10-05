"use client"

import React, { useState, useEffect } from "react"
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Filter,
  GraduationCap,
  Megaphone,
  RotateCcw,
  Search,
  ShieldCheck,
  UserPlus,
  X,
  Clock,
  Layers,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getActivityHistory, type ActivityItem } from "@/actions/activity"
import { cn } from "@/lib/utils"

interface ActivitiesHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dismissedIds: string[]
  onDismissId: (id: string) => void
  onClearAll: (activityIds: string[]) => void
  onRestoreAll?: () => void
}

type CategoryFilter = "ALL" | "PAYMENT" | "ATTENDANCE" | "ADMISSION" | "ANNOUNCEMENT" | "SECURITY"

export function ActivitiesHistoryDialog({
  open,
  onOpenChange,
  dismissedIds,
  onDismissId,
  onClearAll,
  onRestoreAll,
}: ActivitiesHistoryDialogProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL")

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      getActivityHistory()
        .then((data) => setActivities(data))
        .finally(() => setIsLoading(false))
    }
  }, [open])

  const handleClearAll = () => {
    const allIds = activities.map((a) => a.id)
    onClearAll(allIds)
  }

  // Filter out dismissed items
  const activeActivities = activities.filter((a) => !dismissedIds.includes(a.id))

  // Filter by category and search
  const filtered = activeActivities.filter((a) => {
    const matchesCategory = activeCategory === "ALL" || a.category === activeCategory
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.details.toLowerCase().includes(q) ||
      a.actor.toLowerCase().includes(q) ||
      (a.targetName && a.targetName.toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (category: ActivityItem["category"]) => {
    switch (category) {
      case "PAYMENT":
        return <DollarSign className="size-3.5 text-emerald-600" />
      case "ATTENDANCE":
        return <CalendarDays className="size-3.5 text-blue-600" />
      case "ADMISSION":
        return <UserPlus className="size-3.5 text-purple-600" />
      case "ANNOUNCEMENT":
        return <Megaphone className="size-3.5 text-amber-600" />
      case "SECURITY":
        return <ShieldCheck className="size-3.5 text-rose-600" />
      default:
        return <Activity className="size-3.5 text-slate-600" />
    }
  }

  const getCategoryBadgeClass = (category: ActivityItem["category"]) => {
    switch (category) {
      case "PAYMENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "ATTENDANCE":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "ADMISSION":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "ANNOUNCEMENT":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "SECURITY":
        return "bg-rose-50 text-rose-700 border-rose-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl max-h-[85vh] p-0 flex flex-col bg-card border border-border overflow-hidden rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Activity className="size-4.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  Activity log
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                  Recent activities and notifications.
                </DialogDescription>
              </div>
            </div>

            {/* Actions: Clear History + Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              {activeActivities.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs h-8 text-rose-600 border-rose-200/80 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 font-medium cursor-pointer transition-colors"
                >
                  Clear all
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                title="Close (Esc)"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Search bar & Category filters */}
          <div className="space-y-2.5 pt-1">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="pl-8 h-9 text-xs bg-background border-border rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { key: "ALL", label: "All Activities" },
                  { key: "PAYMENT", label: "Payments" },
                  { key: "ATTENDANCE", label: "Attendance" },
                  { key: "ADMISSION", label: "Admissions" },
                  { key: "ANNOUNCEMENT", label: "Announcements" },
                  { key: "SECURITY", label: "Security" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border",
                    activeCategory === cat.key
                      ? "bg-primary text-white border-primary shadow-2xs"
                      : "bg-background text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-border/40">
          {isLoading ? (
            <div className="py-16 text-center space-y-2">
              <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Loading activity history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <CheckCircle2 className="size-8 text-muted-foreground/60 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">
                {activeActivities.length === 0 ? "All Activities Cleared" : "No Activities Found"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeActivities.length === 0
                  ? "All audit history and notifications have been cleared."
                  : "No events match the selected filter or search keyword."}
              </p>
              {activeActivities.length === 0 && onRestoreAll && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onRestoreAll()
                      setIsLoading(true)
                      getActivityHistory()
                        .then((data) => setActivities(data))
                        .finally(() => setIsLoading(false))
                    }}
                    className="text-xs h-8 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground border-border rounded-xl"
                  >
                    <RotateCcw className="size-3.5" />
                    Restore Activity History
                  </Button>
                </div>
              )}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="group relative pt-2.5 first:pt-0 flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                      getCategoryBadgeClass(item.category)
                    )}
                  >
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                          getCategoryBadgeClass(item.category)
                        )}
                      >
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/85 leading-relaxed break-words">
                      {item.details}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="size-3" />
                        {item.timeAgo}, {item.timestamp}
                      </span>
                      <span>By {item.actor}</span>
                      {item.targetName && (
                        <span className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border/80">
                          {item.targetName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close Button on Hover */}
                <button
                  type="button"
                  onClick={() => onDismissId(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                  title="Dismiss activity"
                  aria-label="Dismiss activity"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filtered.length} of {activeActivities.length} activities
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 border-border rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

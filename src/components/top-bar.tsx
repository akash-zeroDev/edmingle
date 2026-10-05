"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Bell,
  CircleHelp,
  Menu,
  Search,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { UserDropdown } from "@/components/user-dropdown"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "@/components/app-sidebar"
import { ReportIssueDialog } from "@/components/report-issue-dialog"
import { ActivitiesHistoryDialog } from "@/components/activities-history-dialog"
import { searchIndex } from "@/lib/dashboard-mock-data"
import { cn } from "@/lib/utils"

function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState("")

  const filtered = query
    ? searchIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.detail.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : searchIndex

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-md overflow-hidden bg-card border border-border">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <div className="flex items-center border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground mr-2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a student name, batch, teacher, or payment..."
            className="h-11 border-0 shadow-none text-xs focus-visible:ring-0 placeholder:text-muted-foreground bg-transparent"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <Link
                key={item.title + item.detail}
                href={item.link}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-xs transition-colors hover:bg-muted/80"
              >
                <span>
                  <span className="block text-xs font-semibold text-foreground">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.category} · {item.detail}
                  </span>
                </span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No results found for “{query}”.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface QuickNotification {
  id: string
  title: string
  details?: string
  time: string
}

const INITIAL_QUICK_NOTIFICATIONS: QuickNotification[] = [
  { id: "notif_1", title: "Fee payment received", details: "₹18,500 collected via UPI for Akash", time: "2 min ago" },
  { id: "notif_2", title: "Attendance marked for Batch A", details: "24 Present, 1 Absent recorded", time: "18 min ago" },
  { id: "notif_3", title: "New student enrolled", details: "Akash joined Class 12 - JEET", time: "1 hr ago" },
]

export function TopBar({
  title = "Dashboard",
  subtitle = "Overview",
  instituteName = "Delhi Scholars Academy",
  mode = "institute",
}: {
  title?: string
  subtitle?: string
  instituteName?: string
  mode?: "institute" | "admin" | "teacher"
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<QuickNotification[]>(INITIAL_QUICK_NOTIFICATIONS)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem("edmingle_dismissed_activity_ids")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setDismissedIds(parsed)
          setNotifications((prev) => prev.filter((n) => !parsed.includes(n.id)))
        }
      }
    } catch {}

    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setDismissedIds((prev) => {
      const next = [...prev, id]
      try {
        localStorage.setItem("edmingle_dismissed_activity_ids", JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const handleClearAll = (activityIds?: string[]) => {
    const notifIds = notifications.map((n) => n.id)
    const extra = activityIds || []
    setNotifications([])
    setDismissedIds((prev) => {
      const next = [...new Set([...prev, ...notifIds, ...extra])]
      try {
        localStorage.setItem("edmingle_dismissed_activity_ids", JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const handleRestoreAll = () => {
    setNotifications(INITIAL_QUICK_NOTIFICATIONS)
    setDismissedIds([])
    try {
      localStorage.removeItem("edmingle_dismissed_activity_ids")
    } catch {}
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/90 md:px-6">
      {/* Mobile Navigation Sheet */}
      <Sheet>
        <SheetTrigger className="mr-2 inline-flex lg:hidden size-8 items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors" aria-label="Open navigation">
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border">
          <SheetTitle className="sr-only">Navigation Drawer</SheetTitle>
          <AppSidebar mode={mode} instituteName={instituteName} adminName={subtitle} />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb Path */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground hidden sm:inline">{subtitle}</span>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Global Search Button */}
        <Button
          variant="outline"
          onClick={() => setSearchOpen(true)}
          className="hidden h-8 w-56 justify-start text-muted-foreground shadow-none md:flex text-xs border-border bg-card hover:bg-muted/50"
        >
          <Search className="size-3.5 mr-2" />
          <span className="text-[12px]">Search...</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-mono">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden size-8"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8 cursor-pointer" aria-label="Notifications">
              <Bell className="size-4 text-muted-foreground" />
              {notifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 bg-popover border border-border shadow-lg rounded-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              {notifications.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {notifications.length} new
                </span>
              )}
            </div>

            <div className="p-1 space-y-0.5">
              {notifications.length === 0 ? (
                <div className="py-6 px-4 text-center space-y-1">
                  <CheckCircle2 className="size-5 text-muted-foreground/60 mx-auto" />
                  <p className="text-xs text-muted-foreground">No new notifications</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex items-start justify-between p-2 rounded-lg text-xs hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => {
                      setDropdownOpen(false)
                      setHistoryOpen(true)
                    }}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-1 flex-1">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground truncate">{item.title}</span>
                        {item.details && (
                          <span className="block text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5">{item.details}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">{item.time}</span>
                      </div>
                    </div>

                    {/* Close button shown on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleDismissNotification(item.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-600 cursor-pointer shrink-0"
                      title="Dismiss notification"
                      aria-label="Dismiss notification"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <DropdownMenuSeparator className="m-0" />
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false)
                setHistoryOpen(true)
              }}
              className="w-full text-center py-2.5 text-[11px] font-semibold text-primary hover:bg-muted/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Activity log</span>
              <ArrowRight className="size-3" />
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help / Bug & Feedback Reporter */}
        <ReportIssueDialog />

        {/* User Account Dropdown */}
        <div className="ml-1 flex items-center justify-center min-w-[32px] min-h-[32px]" suppressHydrationWarning>
          {mounted ? (
            <UserDropdown align="end" side="bottom" sideOffset={8} />
          ) : (
            <div className="size-8 rounded-full bg-slate-200 animate-pulse ring-2 ring-primary/10" />
          )}
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <ActivitiesHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        dismissedIds={dismissedIds}
        onDismissId={handleDismissNotification}
        onClearAll={handleClearAll}
        onRestoreAll={handleRestoreAll}
      />
    </header>
  )
}

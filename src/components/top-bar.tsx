"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Bell,
  CircleHelp,
  Menu,
  Search,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
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

export function TopBar({
  title = "Dashboard",
  subtitle = "Overview",
  instituteName = "Delhi Scholars Academy",
  mode = "institute",
}: {
  title?: string
  subtitle?: string
  instituteName?: string
  mode?: "institute" | "admin"
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/90 md:px-6">
      {/* Mobile Navigation Sheet */}
      <Sheet>
        <SheetTrigger className="mr-2 inline-flex lg:hidden size-8 items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors" aria-label="Open navigation">
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border">
          <SheetTitle className="sr-only">Navigation Drawer</SheetTitle>
          <AppSidebar mode={mode} instituteName={instituteName} />
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
          <span className="text-[12px]">Search anything...</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8" aria-label="Notifications">
              <Bell className="size-4 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 bg-popover border border-border">
            <DropdownMenuLabel className="border-b border-border px-4 py-2.5 text-xs font-semibold">
              Notifications
            </DropdownMenuLabel>
            <div className="p-1 space-y-0.5">
              {[
                ["Fee payment received", "2 min ago"],
                ["Attendance marked for Batch A", "18 min ago"],
                ["New student enrolled", "1 hr ago"],
              ].map(([t, time]) => (
                <DropdownMenuItem key={t} className="items-start px-3 py-2 text-xs">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary mr-2" />
                  <span>
                    <span className="block font-medium text-foreground">{t}</span>
                    <span className="text-[10px] text-muted-foreground">{time}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <Link href="/institute/fees" className="block text-center py-2 text-[11px] font-semibold text-primary hover:bg-muted transition-colors">
              View all activities
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help button */}
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex size-8" aria-label="Help">
          <CircleHelp className="size-4 text-muted-foreground" />
        </Button>

        {/* User Button */}
        <div className="ml-1">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-8 rounded-full ring-2 ring-primary/20",
              },
            }}
          />
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}

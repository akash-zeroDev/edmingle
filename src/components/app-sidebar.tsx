"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers3,
  ClipboardCheck,
  IndianRupee,
  Banknote,
  Settings,
  Building2,
  BarChart3,
  ShieldAlert,
  Bug,
  Megaphone,
} from "lucide-react"
import { UserDropdown } from "@/components/user-dropdown"
import { cn } from "@/lib/utils"

export type NavItem = {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

const instituteNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", url: "/institute", icon: LayoutDashboard }],
  },
  {
    label: "Academic",
    items: [
      { name: "Students", url: "/institute/students", icon: Users },
      { name: "Teachers", url: "/institute/teachers", icon: GraduationCap },
      { name: "Batches", url: "/institute/batches", icon: Layers3 },
      { name: "Announcements", url: "/institute/announcements", icon: Megaphone },
      { name: "Attendance", url: "/institute/attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Fees & Payments", url: "/institute/fees", icon: IndianRupee },
      { name: "Faculty Payroll", url: "/institute/payroll", icon: Banknote },
    ],
  },
  {
    label: "System",
    items: [{ name: "Settings", url: "/institute/settings", icon: Settings }],
  },
]

const adminNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", url: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Platform",
    items: [{ name: "Institutes", url: "/admin/institutes", icon: Building2 }],
  },
  {
    label: "Management",
    items: [
      { name: "Analytics", url: "/admin/analytics", icon: BarChart3 },
      { name: "Bug reports & feedback", url: "/admin/support", icon: Bug },
      { name: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
]

const teacherNavigation: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { name: "Overview", url: "/teacher", icon: LayoutDashboard },
      { name: "Attendance", url: "/teacher?tab=attendance", icon: ClipboardCheck },
      { name: "Batches", url: "/teacher?tab=batches", icon: Layers3 },
      { name: "Announcements", url: "/teacher?tab=announcements", icon: Megaphone },
      { name: "Payroll", url: "/teacher?tab=payroll", icon: Banknote },
      { name: "Settings", url: "/teacher?tab=settings", icon: Settings },
    ],
  },
]

export function ProductMark() {
  return (
    <div
      className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20"
      aria-hidden="true"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="4" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </svg>
    </div>
  )
}

export function AppSidebar({
  mode = "institute",
  instituteName = "Institute",
  adminName = "Administrator",
  isBlocked = false,
  onNavigate,
}: {
  mode?: "institute" | "admin" | "teacher"
  instituteName?: string
  adminName?: string
  isBlocked?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const navigation =
    mode === "admin"
      ? adminNavigation
      : mode === "teacher"
      ? teacherNavigation
      : instituteNavigation

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isItemSelected = (itemUrl: string) => {
    if (mode === "teacher") {
      if (itemUrl === "/teacher") {
        return pathname === "/teacher" && activeTab === "overview"
      }
      const matchTab = itemUrl.split("tab=")[1]
      return pathname === "/teacher" && activeTab === matchTab
    }
    return pathname === itemUrl
  }

  return (
    <aside
      className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar select-none"
      aria-label="Sidebar navigation"
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-4 border-b border-sidebar-border/60">
        <ProductMark />
        <div className="flex flex-col">
          <span className="text-[16px] font-bold tracking-tight text-sidebar-foreground">
            Classly
          </span>
          <span className="text-[10px] font-medium text-muted-foreground -mt-0.5">
            {mode === "admin" ? "Platform admin" : mode === "teacher" ? "Teacher portal" : "Institute"}
          </span>
        </div>
      </div>

      {/* Primary Grouped Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Primary navigation">
        {isBlocked && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs font-semibold">
            <ShieldAlert className="size-4 shrink-0 text-red-600" />
            <span>Account suspended</span>
          </div>
        )}

        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const selected = isItemSelected(item.url)
                const isItemDisabled = isBlocked && item.url !== "/institute/settings"

                return (
                  <Link
                    key={item.name}
                    href={isItemDisabled ? "#" : item.url}
                    prefetch={true}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0 border-0 select-none cursor-pointer",
                      selected
                        ? "bg-primary-light font-semibold text-primary hover:bg-primary-light hover:text-primary border-0 ring-0 shadow-none"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border-0 ring-0",
                      isItemDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                    aria-current={selected ? "page" : undefined}
                  >
                    <Icon className={cn("size-4 shrink-0", selected ? "text-primary stroke-[2.2]" : "text-muted-foreground")} />
                    <span>{item.name}</span>
                    {selected && (
                      <span className="ml-auto size-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-sidebar-accent transition-colors" suppressHydrationWarning>
          {mounted ? (
            <UserDropdown
              align="start"
              side="top"
              sideOffset={10}
              showName={true}
              subtitle={mode === "admin" ? "Admin" : mode === "teacher" ? `Teacher, ${instituteName}` : instituteName}
            />
          ) : (
            <div className="flex items-center gap-2.5 p-1 w-full">
              <div className="size-8 rounded-full bg-sidebar-accent animate-pulse ring-2 ring-primary/10 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="h-3 w-20 bg-sidebar-accent rounded animate-pulse" />
                <div className="h-2 w-28 bg-sidebar-accent rounded animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

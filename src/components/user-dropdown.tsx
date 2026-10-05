"use client"

import * as React from "react"
import { useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface UserDropdownProps {
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  showName?: boolean
  subtitle?: string
  className?: string
}

export function UserDropdown({
  align = "end",
  side = "bottom",
  sideOffset = 8,
  showName = false,
  subtitle,
  className,
}: UserDropdownProps) {
  const { user, isLoaded } = useUser()
  const clerk = useClerk()
  const [imgError, setImgError] = useState(false)

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    (user?.primaryEmailAddress?.emailAddress
      ? user.primaryEmailAddress.emailAddress.split("@")[0]
      : "User")

  const email = user?.primaryEmailAddress?.emailAddress || ""
  const initial = displayName.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User account menu"
          className={cn(
            "group flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer select-none transition-all active:scale-95 text-left",
            showName && "rounded-lg p-1 hover:bg-muted/70 w-full",
            className
          )}
        >
          {/* Avatar circle */}
          <div className="relative size-8 shrink-0 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all overflow-hidden flex items-center justify-center bg-primary/10">
            {user?.imageUrl && !imgError ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="size-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="size-full bg-gradient-to-tr from-primary to-blue-500 text-white font-bold text-xs flex items-center justify-center">
                {initial}
              </div>
            )}
          </div>

          {/* Optional inline name & subtitle for sidebar trigger */}
          {showName && (
            <div className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">
                {displayName}
              </span>
              {subtitle && (
                <span className="block text-[10px] text-muted-foreground truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="w-72 p-1.5 bg-card border border-border shadow-2xl rounded-2xl"
      >
        {/* User Identity Header Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 mb-1">
          <div className="relative size-10 shrink-0 rounded-full ring-1 ring-border overflow-hidden flex items-center justify-center bg-primary/10">
            {user?.imageUrl && !imgError ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-gradient-to-tr from-primary to-blue-500 text-white font-bold text-sm flex items-center justify-center">
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-[11px] text-muted-foreground truncate font-normal mt-0.5">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        {/* Action 1: Manage Account */}
        <DropdownMenuItem
          onClick={() => clerk.openUserProfile()}
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-foreground hover:bg-muted cursor-pointer transition-colors"
        >
          <Settings className="size-4 text-muted-foreground shrink-0" />
          <span>Manage account</span>
        </DropdownMenuItem>

        {/* Action 2: Sign Out */}
        <DropdownMenuItem
          onClick={() => clerk.signOut({ redirectUrl: "/sign-in" })}
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

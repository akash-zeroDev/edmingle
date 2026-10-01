"use client"

import { AppSidebar } from "@/components/app-sidebar"

export function InstituteSidebar({
  instituteName = "Delhi Scholars Academy",
  isBlocked = false,
}: {
  instituteName?: string
  isBlocked?: boolean
}) {
  return (
    <AppSidebar
      mode="institute"
      instituteName={instituteName}
      isBlocked={isBlocked}
    />
  )
}

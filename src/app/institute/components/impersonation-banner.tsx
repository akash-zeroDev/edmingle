"use client"

import React, { useTransition } from "react"
import { Eye, LogOut, Loader2 } from "lucide-react"
import { stopImpersonating } from "@/actions/institute"

export function ImpersonationBanner({
  instituteName,
  adminEmail,
}: {
  instituteName: string
  adminEmail: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleExit = () => {
    startTransition(async () => {
      await stopImpersonating()
      window.location.href = "/admin/institutes"
    })
  }

  return (
    <div className="bg-amber-500 text-amber-950 px-4 sm:px-6 py-2.5 text-xs font-semibold flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-sm border-b border-amber-600/30">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="grid size-6 place-items-center rounded-md bg-amber-600/30 text-amber-950 shrink-0">
          <Eye className="size-3.5" />
        </span>
        <div className="min-w-0 truncate">
          <span className="font-bold uppercase tracking-wider text-[10px] mr-1.5 bg-amber-600/20 px-1.5 py-0.5 rounded">
            Admin session
          </span>
          <span>
            Impersonating <strong>{instituteName}</strong> ({adminEmail}).
          </span>
        </div>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleExit}
        className="bg-amber-950 text-amber-100 hover:bg-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
      >
        {isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <LogOut className="size-3" />
        )}
        <span>Stop impersonating</span>
      </button>
    </div>
  )
}

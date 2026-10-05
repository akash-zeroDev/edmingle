"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InstituteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Institute Error Boundary]:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-6 shadow-xs">
        <AlertCircle className="size-8" />
      </div>

      <span className="inline-flex items-center rounded-full bg-rose-100/60 px-3 py-1 text-xs font-semibold text-rose-700 mb-3 border border-rose-200">
        Workspace Error
      </span>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Something went wrong
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
        An unexpected error occurred while loading this section. Your database and data remain completely safe.
      </p>

      {error?.digest && (
        <p className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
          Digest: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="sm"
          className="h-9 px-4 text-xs bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Try Again</span>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs rounded-xl border-slate-200">
          <Link href="/institute">
            <Home className="size-3.5 mr-1.5 text-slate-500" />
            <span>Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

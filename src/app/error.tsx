"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Global Error]:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#e7e9ed] shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-5">
          <AlertCircle className="size-7" />
        </div>

        <span className="inline-flex items-center rounded-full bg-rose-100/60 px-3 py-1 text-xs font-semibold text-rose-700 mb-3 border border-rose-200">
          Application Error
        </span>

        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Unexpected application error
        </h1>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          An error occurred while rendering this page. You can try refreshing or return to your main dashboard.
        </p>

        {error?.digest && (
          <p className="mt-3 text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            Digest: {error.digest}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            onClick={() => reset()}
            size="sm"
            className="h-9 px-4 text-xs bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Try Again</span>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs rounded-xl border-slate-200">
            <Link href="/">
              <Home className="size-3.5 mr-1.5 text-slate-500" />
              <span>Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

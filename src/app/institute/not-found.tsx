import Link from "next/link"
import { Layers, ArrowLeft, Users, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InstituteNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-6 shadow-xs">
        <Layers className="size-8" />
      </div>

      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-3">
        404 · Not Found
      </span>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Resource could not be found
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
        The batch, student, or section you requested doesn't exist in your institute, was removed, or you don't have permission to access it.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs rounded-xl border-slate-200">
          <Link href="/institute">
            <Home className="size-3.5 mr-1.5 text-slate-500" />
            Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-9 px-4 text-xs rounded-xl border-slate-200">
          <Link href="/institute/batches">
            <Layers className="size-3.5 mr-1.5 text-slate-500" />
            All Batches
          </Link>
        </Button>
        <Button asChild size="sm" className="h-9 px-4 text-xs bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xs">
          <Link href="/institute/students">
            <Users className="size-3.5 mr-1.5" />
            All Students
          </Link>
        </Button>
      </div>
    </div>
  )
}

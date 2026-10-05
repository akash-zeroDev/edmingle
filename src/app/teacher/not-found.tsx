import Link from "next/link"
import { GraduationCap, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TeacherNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-6 shadow-xs">
        <GraduationCap className="size-8" />
      </div>

      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-3">
        404 · Faculty Resource Not Found
      </span>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Lecture or batch not found
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
        The batch or attendance sheet you are attempting to view is not assigned to your faculty profile or has been archived.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button asChild size="sm" className="h-9 px-4 text-xs bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xs">
          <Link href="/teacher">
            <Home className="size-3.5 mr-1.5" />
            Teacher Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}

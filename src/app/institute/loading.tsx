import { Skeleton } from "@/components/ui/skeleton"

export default function InstituteLoading() {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Greeting & Date Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40 bg-slate-200/80 rounded" />
          <Skeleton className="h-8 w-72 bg-slate-200/90 rounded-lg" />
          <Skeleton className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg bg-slate-200/80" />
        </div>
      </div>

      {/* 2. KPI Cards Strip Skeleton (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28 bg-slate-100 rounded" />
              <Skeleton className="size-8 rounded-lg bg-slate-200/80" />
            </div>
            <Skeleton className="h-8 w-24 bg-slate-200/90 rounded-md" />
            <Skeleton className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Operational Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Classes (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <Skeleton className="h-5 w-44 bg-slate-200/80 rounded" />
            <Skeleton className="h-4 w-20 bg-slate-100 rounded" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-40 bg-slate-200/80 rounded" />
                    <Skeleton className="h-4 w-16 bg-slate-100 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-60 bg-slate-100 rounded" />
                </div>
                <Skeleton className="h-7 w-20 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Activity / Actions (1 col) */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <Skeleton className="h-5 w-36 bg-slate-200/80 rounded" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-24 bg-slate-200/80 rounded" />
                  <Skeleton className="h-3 w-16 bg-slate-100 rounded" />
                </div>
                <Skeleton className="h-3 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

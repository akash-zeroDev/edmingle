import { Skeleton } from "@/components/ui/skeleton"

export default function PayrollLoading() {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Actions Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-56 bg-slate-200/90 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full bg-slate-100 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-44 rounded-xl bg-slate-200/80" />
          <Skeleton className="h-9 w-32 rounded-xl bg-primary/20" />
        </div>
      </div>

      {/* 2. Top-line 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28 bg-slate-100 rounded" />
              <Skeleton className="size-8 rounded-lg bg-slate-200/70" />
            </div>
            <Skeleton className="h-8 w-32 bg-slate-200/90 rounded-md" />
            <Skeleton className="h-3 w-44 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Skeleton className="h-9 w-80 max-w-full rounded-xl bg-slate-200/70" />
        <Skeleton className="h-9 w-48 rounded-xl bg-slate-100" />
      </div>

      {/* 4. Ledger Table Skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="space-y-1">
            <Skeleton className="h-4 w-40 bg-slate-200/80 rounded" />
            <Skeleton className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        </div>

        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-[200px]">
                <Skeleton className="size-8 rounded-full bg-slate-200/80 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-32 bg-slate-200/90 rounded" />
                  <Skeleton className="h-2.5 w-24 bg-slate-100 rounded" />
                </div>
              </div>

              <Skeleton className="h-4 w-28 bg-slate-100 rounded hidden md:block" />
              <Skeleton className="h-4 w-20 bg-slate-200/80 rounded" />
              <Skeleton className="h-4 w-14 bg-slate-100 rounded hidden sm:block" />
              <Skeleton className="h-5 w-20 bg-slate-200/90 rounded" />
              <Skeleton className="h-5 w-16 bg-slate-100 rounded-full" />
              <Skeleton className="h-8 w-20 bg-primary/20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

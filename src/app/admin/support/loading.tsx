import { Skeleton } from "@/components/ui/skeleton"

export default function SupportLoading() {
  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg bg-slate-200/80" />
          <Skeleton className="h-4 w-96 rounded-md bg-slate-100" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg bg-slate-200/80" />
        </div>
      </div>

      {/* 2. KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card space-y-2.5">
            <Skeleton className="h-3 w-28 bg-slate-100 rounded" />
            <Skeleton className="h-7 w-20 bg-slate-200/80 rounded" />
            <Skeleton className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Filter Bar Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64 rounded-md bg-white border border-border" />
        <Skeleton className="h-9 w-32 rounded-md bg-white border border-border" />
        <Skeleton className="h-9 w-32 rounded-md bg-white border border-border" />
      </div>

      {/* 4. Ticket Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded bg-slate-200/80" />
                <Skeleton className="h-5 w-14 rounded bg-slate-100" />
                <Skeleton className="h-5 w-60 rounded bg-slate-200/80" />
              </div>
              <Skeleton className="h-6 w-24 rounded bg-slate-100" />
            </div>
            <Skeleton className="h-4 w-full bg-slate-100 rounded" />
            <div className="pt-2 border-t border-border flex justify-between">
              <Skeleton className="h-4 w-48 bg-slate-100 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-32 rounded bg-slate-100" />
                <Skeleton className="h-7 w-24 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

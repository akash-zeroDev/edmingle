import { Skeleton } from "@/components/ui/skeleton"

export default function FeesLoading() {
  return (
    <div className="max-w-[1600px] w-full p-4 md:p-8 space-y-7 animate-in fade-in duration-200">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-52 bg-slate-200/90 rounded-lg" />
          <Skeleton className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-36 rounded-xl bg-slate-100" />
          <Skeleton className="h-10 w-44 rounded-xl bg-slate-200/80" />
        </div>
      </div>

      {/* 2. 5 KPI Cards Strip Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 bg-slate-100 rounded" />
              <Skeleton className="size-8 rounded-xl bg-slate-200/80" />
            </div>
            <Skeleton className="h-7 w-20 bg-slate-200/90 rounded-md" />
            <Skeleton className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. 3 Chart Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40 bg-slate-200/80 rounded" />
              <Skeleton className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
            <Skeleton className="h-4 w-60 bg-slate-100 rounded" />
            <Skeleton className="h-52 w-full bg-slate-100/60 rounded-xl" />
          </div>
        ))}
      </div>

      {/* 4. Batch Cards Strip Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 bg-slate-200/80 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] space-y-3"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-xl bg-slate-200/80" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32 bg-slate-200/90 rounded" />
                  <Skeleton className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <Skeleton className="h-12 w-full bg-slate-50 rounded-xl" />
              <Skeleton className="h-8 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Table Skeleton */}
      <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
        <div className="p-5 border-b border-[#e7e9ed] bg-[#fafbfc] flex justify-between items-center">
          <Skeleton className="h-5 w-48 bg-slate-200/90 rounded" />
          <Skeleton className="h-9 w-64 bg-slate-100 rounded-xl" />
        </div>
        <div className="divide-y divide-[#f0f1f3]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[60px] px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 w-1/4">
                <Skeleton className="size-7 rounded-full bg-slate-200/80" />
                <Skeleton className="h-4 w-32 bg-slate-200/90 rounded" />
              </div>
              <Skeleton className="h-5 w-24 bg-slate-100 rounded" />
              <Skeleton className="h-4 w-16 bg-slate-100 rounded" />
              <Skeleton className="h-4 w-16 bg-emerald-50 rounded" />
              <Skeleton className="h-4 w-16 bg-rose-50 rounded" />
              <Skeleton className="h-5 w-20 bg-slate-100 rounded-full" />
              <Skeleton className="h-8 w-20 bg-slate-200/80 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

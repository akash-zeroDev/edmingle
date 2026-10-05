import { Skeleton } from "@/components/ui/skeleton"

export default function BatchesLoading() {
  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-32 bg-slate-200/90 rounded-lg" />
          <Skeleton className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-slate-200/80" />
      </div>

      {/* 3 KPI Overview Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 bg-slate-100 rounded" />
              <Skeleton className="size-8 rounded-xl bg-slate-200/80" />
            </div>
            <Skeleton className="h-7 w-16 bg-slate-200/90 rounded-md" />
            <Skeleton className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Search Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Skeleton className="h-10 w-full sm:w-96 rounded-xl bg-slate-200/70" />
        <Skeleton className="h-4 w-24 bg-slate-100 rounded" />
      </div>

      {/* Batches Table Card Skeleton */}
      <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
        {/* Card Header */}
        <div className="p-5 border-b border-[#e7e9ed] flex justify-between items-center bg-[#fafbfc]">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36 bg-slate-200/90 rounded" />
            <Skeleton className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Table Content Skeleton */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table Header Row */}
            <div className="h-10 px-5 bg-[#fafafa] border-b border-[#e7e9ed] flex items-center justify-between">
              <Skeleton className="h-3 w-24 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-16 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-28 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-20 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-28 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-16 bg-slate-200/80 rounded" />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#f0f1f3]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-[60px] px-5 flex items-center justify-between">
                  {/* Batch / Class Name */}
                  <div className="flex items-center gap-2.5 w-1/5">
                    <Skeleton className="size-8 rounded-xl bg-slate-200/80" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28 bg-slate-200/90 rounded" />
                      <Skeleton className="h-2.5 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                  {/* Subject */}
                  <div className="w-1/6">
                    <Skeleton className="h-5 w-20 rounded-md bg-blue-50/80" />
                  </div>
                  {/* Assigned Teacher */}
                  <div className="w-1/5">
                    <Skeleton className="h-4 w-32 bg-slate-200/80 rounded" />
                  </div>
                  {/* Schedule */}
                  <div className="w-1/6">
                    <Skeleton className="h-5 w-24 rounded bg-slate-100" />
                  </div>
                  {/* Enrolled Students */}
                  <div className="w-1/6">
                    <Skeleton className="h-4 w-16 bg-slate-100 rounded" />
                  </div>
                  {/* Actions */}
                  <div className="w-1/12 flex justify-end">
                    <Skeleton className="size-8 rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

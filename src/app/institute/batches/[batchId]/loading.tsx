import { Skeleton } from "@/components/ui/skeleton"

export default function BatchDetailLoading() {
  return (
    <div className="max-w-[1600px] w-full p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-28 bg-slate-200/80 rounded" />
        <Skeleton className="h-4 w-3 bg-slate-200/50 rounded" />
        <Skeleton className="h-4 w-20 bg-slate-200/80 rounded" />
        <Skeleton className="h-4 w-3 bg-slate-200/50 rounded" />
        <Skeleton className="h-4 w-36 bg-slate-200/90 rounded" />
      </div>

      {/* Header Workspace Banner Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div className="flex items-start gap-4">
          <Skeleton className="size-12 rounded-2xl bg-slate-200/80 shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full bg-blue-50" />
              <Skeleton className="h-5 w-20 rounded-full bg-slate-100" />
              <Skeleton className="h-4 w-40 bg-slate-100 rounded" />
            </div>
            <Skeleton className="h-7 w-64 bg-slate-200/90 rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-48 bg-slate-100 rounded" />
              <Skeleton className="h-4 w-36 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-200/80" />
          <Skeleton className="h-10 w-28 rounded-xl bg-slate-100" />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 bg-slate-100 rounded" />
              <Skeleton className="size-8 rounded-xl bg-slate-200/80" />
            </div>
            <Skeleton className="h-7 w-20 bg-slate-200/90 rounded-md" />
            <Skeleton className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Workspace Tabs Container Skeleton */}
      <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
        {/* Tab Navigation Strip Skeleton */}
        <div className="border-b border-[#e7e9ed] px-4 flex gap-6 h-12 items-center">
          <Skeleton className="h-5 w-24 bg-slate-200/90 rounded" />
          <Skeleton className="h-5 w-32 bg-slate-100 rounded" />
          <Skeleton className="h-5 w-20 bg-slate-100 rounded" />
          <Skeleton className="h-5 w-20 bg-slate-100 rounded" />
          <Skeleton className="h-5 w-32 bg-slate-100 rounded" />
        </div>

        {/* Toolbar Skeleton */}
        <div className="p-4 border-b border-[#e7e9ed] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Skeleton className="h-10 w-full sm:w-[320px] rounded-xl bg-slate-200/70" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-xl bg-slate-100" />
            <Skeleton className="h-10 w-32 rounded-xl bg-slate-200/80" />
          </div>
        </div>

        {/* Table Content Skeleton */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table Header */}
            <div className="h-10 px-5 bg-[#fafafa] border-b border-[#e7e9ed] flex items-center justify-between">
              <Skeleton className="h-3 w-16 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-28 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-24 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-20 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-20 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-10 bg-slate-200/80 rounded" />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#f0f1f3]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[54px] px-5 flex items-center justify-between">
                  <Skeleton className="h-4 w-16 bg-slate-100 rounded" />
                  <Skeleton className="h-4 w-36 bg-slate-200/90 rounded" />
                  <Skeleton className="h-4 w-24 bg-slate-100 rounded" />
                  <Skeleton className="h-5 w-16 rounded-md bg-emerald-50/80" />
                  <Skeleton className="h-5 w-16 rounded-md bg-slate-100" />
                  <Skeleton className="size-7 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

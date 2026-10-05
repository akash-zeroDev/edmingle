import { Skeleton } from "@/components/ui/skeleton"

export default function TeachersLoading() {
  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 bg-slate-200/90 rounded-lg" />
          <Skeleton className="h-4 w-80 bg-slate-100 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl bg-slate-200/80" />
      </div>

      {/* Search Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Skeleton className="h-10 w-full sm:w-96 rounded-xl bg-slate-200/70" />
        <Skeleton className="h-4 w-28 bg-slate-100 rounded" />
      </div>

      {/* Faculty Table Card Skeleton */}
      <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
        {/* Card Header */}
        <div className="p-5 border-b border-[#e7e9ed] flex justify-between items-center bg-[#fafbfc]">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40 bg-slate-200/90 rounded" />
            <Skeleton className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Table Content Skeleton */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table Header Row */}
            <div className="h-10 px-5 bg-[#fafafa] border-b border-[#e7e9ed] flex items-center justify-between">
              <Skeleton className="h-3 w-28 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-16 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-24 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-28 bg-slate-200/80 rounded" />
              <Skeleton className="h-3 w-16 bg-slate-200/80 rounded" />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#f0f1f3]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[58px] px-5 flex items-center justify-between">
                  {/* Teacher Avatar & Name */}
                  <div className="flex items-center gap-2.5 w-1/4">
                    <Skeleton className="size-[26px] rounded-full bg-slate-200/80" />
                    <Skeleton className="h-4 w-32 bg-slate-200/90 rounded" />
                  </div>
                  {/* Status Badge */}
                  <div className="w-1/6">
                    <Skeleton className="h-5 w-16 rounded-full bg-emerald-50/80" />
                  </div>
                  {/* Subjects Tag */}
                  <div className="w-1/5">
                    <Skeleton className="h-5 w-24 rounded bg-slate-100" />
                  </div>
                  {/* Assigned Batches */}
                  <div className="w-1/5">
                    <Skeleton className="h-5 w-28 rounded bg-slate-100" />
                  </div>
                  {/* Phone */}
                  <div className="w-1/6">
                    <Skeleton className="h-3.5 w-24 bg-slate-100 rounded" />
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

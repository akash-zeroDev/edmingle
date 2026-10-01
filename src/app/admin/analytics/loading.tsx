import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2 mb-7">
        <Skeleton className="h-8 w-44 rounded-lg bg-slate-200/80" />
        <Skeleton className="h-4 w-72 rounded-md bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-[#e7e9ed] bg-white space-y-3">
            <Skeleton className="h-3 w-28 rounded bg-slate-100" />
            <Skeleton className="h-7 w-20 rounded bg-slate-200/80" />
            <Skeleton className="h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl border border-[#e7e9ed] bg-white space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-44 rounded bg-slate-200/80" />
          <Skeleton className="h-8 w-28 rounded bg-slate-100" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl bg-slate-50" />
      </div>
    </div>
  )
}

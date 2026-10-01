import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2 mb-7">
        <Skeleton className="h-8 w-44 rounded-lg bg-slate-200/80" />
        <Skeleton className="h-4 w-72 rounded-md bg-slate-100" />
      </div>

      <div className="space-y-6 max-w-3xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-[#e7e9ed] bg-white space-y-4">
            <Skeleton className="h-4 w-40 rounded bg-slate-200/80" />
            <Skeleton className="h-3 w-64 rounded bg-slate-100" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
              <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

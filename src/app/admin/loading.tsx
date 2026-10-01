import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-8 animate-in fade-in duration-200">
      {/* 1. Header Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-lg bg-slate-200/80" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md bg-slate-100" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl bg-slate-200/80" />
          <Skeleton className="h-9 w-36 rounded-xl bg-slate-200/80" />
        </div>
      </div>

      {/* 2. 4-Metric KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4 space-y-2 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 w-28 rounded bg-slate-100" />
              <Skeleton className="size-8 rounded-lg bg-slate-100" />
            </div>
            <Skeleton className="h-7 w-32 rounded-md bg-slate-200/80" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-3 w-12 rounded bg-slate-100" />
              <Skeleton className="h-3 w-20 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Platform Growth Chart & Health Breakdown Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Revenue & Growth Chart Card Skeleton */}
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44 rounded bg-slate-200/80" />
              <Skeleton className="h-3 w-64 rounded bg-slate-100" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28 rounded bg-slate-100" />
              <Skeleton className="h-4 w-28 rounded bg-slate-100" />
            </div>
          </div>
          {/* Chart Wireframe Canvas */}
          <div className="h-[280px] w-full rounded-xl bg-slate-50/80 border border-dashed border-slate-200/80 flex flex-col justify-end p-4 space-y-3">
            <div className="flex items-end justify-between gap-2 h-44 w-full">
              {[40, 65, 55, 80, 70, 90, 85, 100, 95, 110, 105, 120].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-slate-200/60 rounded-t-sm"
                    style={{ height: `${h}%` }}
                  />
                  <Skeleton className="h-2 w-4 rounded-xs bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Platform Health & Safeguards Skeleton */}
        <div className="rounded-lg border border-border bg-card flex flex-col justify-between overflow-hidden shadow-xs">
          <div className="p-5 space-y-5">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded bg-slate-200/80" />
              <Skeleton className="h-3 w-48 rounded bg-slate-100" />
            </div>

            {/* Health Meter Skeleton */}
            <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-28 rounded bg-slate-200" />
                <Skeleton className="h-3 w-10 rounded bg-slate-200" />
              </div>
              <Skeleton className="w-full h-2 rounded-full bg-slate-200" />
              <div className="flex justify-between pt-1">
                <Skeleton className="h-2.5 w-16 rounded bg-slate-100" />
                <Skeleton className="h-2.5 w-20 rounded bg-slate-100" />
              </div>
            </div>

            {/* Safeguards Skeletons */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded bg-slate-100" />
              <div className="p-2.5 rounded-lg border border-border bg-background flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded bg-slate-200" />
                  <Skeleton className="h-3 w-24 rounded bg-slate-200" />
                </div>
                <Skeleton className="h-4 w-12 rounded bg-slate-200" />
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-background flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded bg-slate-200" />
                  <Skeleton className="h-3 w-24 rounded bg-slate-200" />
                </div>
                <Skeleton className="h-4 w-16 rounded bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="border-t border-border p-3 bg-muted/20">
            <Skeleton className="h-4 w-40 rounded bg-slate-200" />
          </div>
        </div>
      </div>

      {/* 4. Tabbed Table Grid Skeleton */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/30">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-36 rounded-md bg-slate-200/80" />
            <Skeleton className="h-7 w-36 rounded-md bg-slate-100" />
          </div>
          <Skeleton className="h-4 w-28 rounded bg-slate-200" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {["Institute", "Admin Email", "Students", "Faculty", "Status", "Billing", "Joined"].map((col, idx) => (
                  <th key={idx} className="h-9 px-4 text-left font-medium">
                    <Skeleton className="h-3 w-16 rounded bg-slate-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="h-11">
                  <td className="px-4">
                    <Skeleton className="h-3.5 w-32 rounded bg-slate-200/80" />
                  </td>
                  <td className="px-4">
                    <Skeleton className="h-3 w-40 rounded bg-slate-100" />
                  </td>
                  <td className="px-4">
                    <Skeleton className="h-3 w-8 rounded bg-slate-100" />
                  </td>
                  <td className="px-4">
                    <Skeleton className="h-3 w-8 rounded bg-slate-100" />
                  </td>
                  <td className="px-4">
                    <Skeleton className="h-5 w-14 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-4">
                    <Skeleton className="h-5 w-14 rounded-full bg-slate-100" />
                  </td>
                  <td className="px-4">
                    <Skeleton className="h-3 w-16 rounded bg-slate-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

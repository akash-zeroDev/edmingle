import { Skeleton } from "@/components/ui/skeleton"

export default function InstitutesLoading() {
  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* 1. Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 rounded-lg bg-slate-200/80" />
          <Skeleton className="h-4 w-72 rounded-md bg-slate-100" />
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Skeleton className="h-10 w-36 rounded-xl bg-slate-200/80" />
        </div>
      </div>

      {/* 2. Client Filters Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Skeleton className="h-10 w-full rounded-lg bg-white border border-[#e7e9ed]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-lg bg-white border border-[#e7e9ed]" />
        </div>
      </div>

      {/* 3. Institutes Table Card Skeleton */}
      <div className="bg-white border border-[#e7e9ed] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden w-full">
        {/* Table Header Bar */}
        <div className="flex justify-between items-center px-5 min-h-[64px] border-b border-[#e7e9ed]">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40 rounded bg-slate-200/80" />
            <Skeleton className="h-3 w-28 rounded bg-slate-100" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead className="bg-[#fafafa]">
              <tr>
                {["Institute", "Contact", "Students", "Plan", "Status", "Created"].map((header, idx) => (
                  <th
                    key={idx}
                    className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]"
                  >
                    <Skeleton className="h-3 w-16 rounded bg-slate-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-[#f0f1f3]">
                  {/* Institute info */}
                  <td className="h-[58px] px-5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-[30px] h-[30px] rounded-[7px] bg-slate-200/80 shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-36 rounded bg-slate-200/80" />
                        <Skeleton className="h-2.5 w-44 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="h-[58px] px-5">
                    <Skeleton className="h-3 w-28 rounded bg-slate-100" />
                  </td>
                  {/* Students */}
                  <td className="h-[58px] px-5">
                    <Skeleton className="h-3 w-12 rounded bg-slate-100" />
                  </td>
                  {/* Plan */}
                  <td className="h-[58px] px-5">
                    <Skeleton className="h-5 w-16 rounded-md bg-slate-100" />
                  </td>
                  {/* Status */}
                  <td className="h-[58px] px-5">
                    <Skeleton className="h-5 w-20 rounded-md bg-slate-100" />
                  </td>
                  {/* Created Date */}
                  <td className="h-[58px] px-5">
                    <Skeleton className="h-3 w-20 rounded bg-slate-100" />
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

import { Skeleton } from "@/components/ui/skeleton"

export default function EnrollStudentLoading() {
  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-7 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 bg-slate-200/80 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-56 bg-slate-200/90 rounded-lg" />
          <Skeleton className="h-4 w-80 bg-slate-100 rounded-md" />
        </div>
      </div>

      {/* Form Skeleton Container */}
      <div className="max-w-[800px] flex flex-col gap-8">
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e7e9ed] bg-[#fafbfc]">
            <Skeleton className="h-5 w-44 bg-slate-200/90 rounded" />
            <Skeleton className="h-3.5 w-64 bg-slate-100 rounded mt-1" />
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 bg-slate-200/80 rounded" />
              <Skeleton className="h-11 w-full bg-slate-100 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-slate-200/80 rounded" />
                <Skeleton className="h-11 w-full bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-slate-200/80 rounded" />
                <Skeleton className="h-11 w-full bg-slate-100 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 bg-slate-200/80 rounded" />
              <Skeleton className="h-11 w-full bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 bg-slate-200/80 rounded" />
              <Skeleton className="h-20 w-full bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Section 2: Batch Assignment */}
        <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e7e9ed] bg-[#fafbfc]">
            <Skeleton className="h-5 w-40 bg-slate-200/90 rounded" />
            <Skeleton className="h-3.5 w-56 bg-slate-100 rounded mt-1" />
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-slate-200/80 rounded" />
                <Skeleton className="h-11 w-full bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-slate-200/80 rounded" />
                <Skeleton className="h-11 w-full bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="flex justify-end gap-3">
          <Skeleton className="h-11 w-24 rounded-xl bg-slate-100" />
          <Skeleton className="h-11 w-36 rounded-xl bg-slate-200/80" />
        </div>
      </div>
    </div>
  )
}

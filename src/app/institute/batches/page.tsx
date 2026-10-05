import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { AddBatchDialog } from "./components/add-batch-dialog"
import { BatchesTable } from "./components/batches-table"

export default async function BatchesPage() {
  const authData = await getAuthenticatedInstitute()
  if (!authData?.institute) redirect("/onboarding")
  const institute = authData.institute

  // Fetch batches with teacher details and student counts
  const batches = await prisma.batch.findMany({
    where: { instituteId: institute.id },
    include: {
      teacher: {
        select: { id: true, name: true, phoneNo: true, subjects: true },
      },
      _count: {
        select: { students: true },
      },
    },
    orderBy: { className: "asc" },
  })

  // Fetch active teachers for the Add Batch faculty selection
  const teachers = await prisma.teacher.findMany({
    where: { instituteId: institute.id, status: "ACTIVE" },
    select: { id: true, name: true, subjects: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#15171b] leading-tight">
            Batches
          </h1>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <AddBatchDialog teachers={teachers} />
        </div>
      </div>

      {/* Batches Table & Drawer View */}
      <BatchesTable batches={batches} />
    </div>
  )
}

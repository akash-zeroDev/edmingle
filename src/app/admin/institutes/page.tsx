import prisma from "@/lib/prisma"
import { Building2, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClientFilters } from "./components/client-filters"
import { AddInstituteDialog } from "./components/add-institute-dialog"
import { InstitutesTable } from "./components/institutes-table"

export default async function InstitutesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  // Build Prisma where clause
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { adminEmail: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (status && status !== 'ALL') {
    where.paymentStatus = status;
  }

  // Fetch institutes based on filters, now including invoices
  const institutes = await prisma.institute.findMany({
    where,
    orderBy: { joinedAt: 'desc' },
    include: {
      _count: { select: { students: true } },
      invoices: { orderBy: { createdAt: 'desc' } }
    }
  });

  // WORKAROUND FOR PRISMA CLIENT CACHING
  // Manually fetch isActive directly from Postgres and merge it into the objects
  // This ensures that even if Prisma's internal schema cache drops the column, we force it in.
  const rawStatuses: any[] = await prisma.$queryRaw`SELECT id, "isActive" FROM "Institute"`;
  const statusMap = new Map(rawStatuses.map((row) => [row.id, row.isActive]));

  const mergedInstitutes = institutes.map((inst) => ({
    ...inst,
    isActive: statusMap.has(inst.id) ? statusMap.get(inst.id) : true
  }));

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#15171b] leading-tight">
            Institutes
          </h1>
          <p className="text-[13px] text-[#5f636d] mt-1.5">
            Manage all coaching centers and software fees.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <AddInstituteDialog />
        </div>
      </div>

      {/* FILTERS */}
      <ClientFilters />

      {/* INSTITUTES TABLE WITH SIDECARD */}
      <InstitutesTable institutes={mergedInstitutes} />
    </div>
  );
}

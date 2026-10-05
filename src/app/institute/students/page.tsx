import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StudentsTable } from "./components/students-table"
import { getAuthenticatedInstitute } from "@/lib/current-institute"

export default async function StudentsPage() {
  const authData = await getAuthenticatedInstitute();
  if (!authData?.institute) redirect("/onboarding");
  const institute = authData.institute;

  // Fetch students securely scoped to this institute with full live relations for sidecard
  const students = await prisma.student.findMany({
    where: { instituteId: institute.id },
    include: {
      batches: {
        include: {
          batch: {
            include: {
              teacher: { select: { name: true } },
            },
          },
        },
      },
      fees: {
        include: {
          payments: { orderBy: { paidAt: "desc" } },
        },
      },
      attendance: {
        take: 10,
        orderBy: { date: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#15171b] leading-tight">
            Students
          </h1>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Link href="/institute/students/new">
            <Button className="h-10 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Add student
            </Button>
          </Link>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <StudentsTable students={students} />
    </div>
  );
}

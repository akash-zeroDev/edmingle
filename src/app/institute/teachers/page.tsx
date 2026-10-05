import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TeachersTable } from "./components/teachers-table"
import { AddTeacherDialog } from "./components/add-teacher-dialog"
import { getAuthenticatedInstitute } from "@/lib/current-institute"

export default async function TeachersPage() {
  const authData = await getAuthenticatedInstitute();
  if (!authData?.institute) redirect("/onboarding");
  const institute = authData.institute;

  // Fetch all teachers registered to this institute
  const teachers = await prisma.teacher.findMany({
    where: { instituteId: institute.id },
    include: {
      batchesTaught: {
        include: {
          _count: {
            select: { students: true },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Fetch all batches in the institute for direct linking
  const batches = await prisma.batch.findMany({
    where: { instituteId: institute.id },
    include: {
      teacher: {
        select: { id: true, name: true },
      },
      _count: {
        select: { students: true },
      },
    },
    orderBy: [{ className: "asc" }, { batchName: "asc" }],
  });

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#15171b] leading-tight">
            Teachers
          </h1>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <AddTeacherDialog />
        </div>
      </div>

      {/* TEACHERS TABLE */}
      <TeachersTable teachers={teachers} batches={batches} />
    </div>
  );
}

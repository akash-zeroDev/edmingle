import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TeachersTable } from "./components/teachers-table"
import { AddTeacherDialog } from "./components/add-teacher-dialog"

export default async function TeachersPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) redirect("/");

  const institute = await prisma.institute.findFirst({
    where: { adminEmail: email },
  });

  if (!institute) redirect("/onboarding");

  // Fetch all teachers registered to this institute
  const teachers = await prisma.teacher.findMany({
    where: { instituteId: institute.id },
    include: {
      batchesTaught: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#15171b] leading-tight">
            Teachers & Faculty
          </h1>
          <p className="text-[13px] text-[#5f636d] mt-1.5">
            Manage your coaching faculty, assigned batches, and compensation.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <AddTeacherDialog />
        </div>
      </div>

      {/* TEACHERS TABLE */}
      <TeachersTable teachers={teachers} />
    </div>
  );
}

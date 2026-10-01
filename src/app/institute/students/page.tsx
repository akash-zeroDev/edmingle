import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StudentsTable } from "./components/students-table"

export default async function StudentsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  
  if (!email) redirect("/");

  const institute = await prisma.institute.findFirst({
    where: { adminEmail: email }
  });

  if (!institute) redirect("/onboarding");

  // Fetch students securely scoped to this institute
  const students = await prisma.student.findMany({
    where: { instituteId: institute.id },
    include: {
      batches: {
        include: {
          batch: true
        }
      }
    }
  });

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#15171b] leading-tight">
            Students
          </h1>
          <p className="text-[13px] text-[#5f636d] mt-1.5">
            Manage student registrations, profiles, and enrollments.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Link href="/institute/students/new">
            <Button className="h-10 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <StudentsTable students={students} />
    </div>
  );
}

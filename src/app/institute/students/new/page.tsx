import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { EnrollStudentForm } from "./components/enroll-student-form"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function EnrollStudentPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  
  if (!email) redirect("/");

  const institute = await prisma.institute.findFirst({
    where: { adminEmail: email }
  });

  if (!institute) redirect("/onboarding");

  // Fetch all batches for this institute so we can populate the dropdowns
  const batches = await prisma.batch.findMany({
    where: { instituteId: institute.id },
    orderBy: [{ className: 'asc' }, { subject: 'asc' }]
  });

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8">
      
      {/* PAGE HEADER */}
      <div className="mb-7">
        <Link href="/institute/students" className="inline-flex items-center text-[12px] font-semibold text-[#8b9a90] hover:text-primary transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Students
        </Link>
        <h1 className="text-[25px] font-bold tracking-tight text-[#15171b] leading-tight">
          Enroll New Student
        </h1>
        <p className="text-[13px] text-[#5f636d] mt-1.5">
          Enter the student's personal details and assign them to a batch.
        </p>
      </div>

      <EnrollStudentForm batches={batches} />
    </div>
  );
}

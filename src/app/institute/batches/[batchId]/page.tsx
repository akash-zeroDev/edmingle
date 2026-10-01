import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { BatchWorkspace } from "./components/batch-workspace"

interface BatchDetailPageProps {
  params: Promise<{
    batchId: string
  }>
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const { batchId } = await params
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  if (!email) redirect("/")

  const institute = await prisma.institute.findFirst({
    where: { adminEmail: email },
  })

  if (!institute) redirect("/onboarding")

  // Load batch with teacher and enrolled students
  const batch = await prisma.batch.findFirst({
    where: {
      id: batchId,
      instituteId: institute.id,
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          phoneNo: true,
          subjects: true,
          status: true,
        },
      },
      students: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phoneNo: true,
              parentPhone: true,
              email: true,
              status: true,
              joinedAt: true,
            },
          },
        },
      },
    },
  })

  if (!batch) {
    notFound()
  }

  // Load institute students who are not yet enrolled in this batch
  const enrolledStudentIds = batch.students.map((s) => s.studentId)
  const availableStudents = await prisma.student.findMany({
    where: {
      instituteId: institute.id,
      status: "ACTIVE",
      id: { notIn: enrolledStudentIds },
    },
    select: {
      id: true,
      name: true,
      phoneNo: true,
      parentPhone: true,
    },
    orderBy: { name: "asc" },
  })

  return <BatchWorkspace batch={batch} availableStudents={availableStudents} />
}

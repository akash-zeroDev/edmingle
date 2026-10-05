import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { BatchWorkspace } from "./components/batch-workspace"
import { getAnnouncementsForBatch } from "@/actions/announcement"

interface BatchDetailPageProps {
  params: Promise<{
    batchId: string
  }>
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const { batchId } = await params
  const authData = await getAuthenticatedInstitute()
  if (!authData?.institute) redirect("/onboarding")
  const institute = authData.institute

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
          email: true,
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

  // Load institute teachers available for assignment
  const availableTeachers = await prisma.teacher.findMany({
    where: {
      instituteId: institute.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNo: true,
      subjects: true,
      status: true,
    },
    orderBy: { name: "asc" },
  })

  // Load batch announcements from database
  const announcements = await getAnnouncementsForBatch(batchId, institute.id)

  return (
    <BatchWorkspace
      batch={batch}
      availableStudents={availableStudents}
      availableTeachers={availableTeachers}
      announcements={announcements}
    />
  )
}

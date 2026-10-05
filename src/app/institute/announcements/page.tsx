import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { getAnnouncementsForInstitute } from "@/actions/announcement"
import { InstituteAnnouncementsView } from "./components/institute-announcements-view"
import type { AnnouncementChannel, AnnouncementMessage } from "@/components/announcements/channel-announcements-workspace"

export default async function InstituteAnnouncementsPage() {
  const authData = await getAuthenticatedInstitute()
  if (!authData?.institute) redirect("/onboarding")
  const institute = authData.institute

  const [batches, rawAnnouncements] = await Promise.all([
    prisma.batch.findMany({
      where: { instituteId: institute.id },
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { className: "asc" },
    }),
    getAnnouncementsForInstitute(institute.id, 100),
  ])

  const channels: AnnouncementChannel[] = [
    {
      id: null,
      name: "All batches",
      subtitle: "All students and teachers",
      isGlobal: true,
    },
    ...batches.map((b) => ({
      id: b.id,
      name: `${b.className} (${b.batchName || b.subject})`,
      subtitle: b.subject ? `Subject: ${b.subject}` : undefined,
      studentCount: b._count.students,
      isGlobal: false,
    })),
  ]

  const initialAnnouncements: AnnouncementMessage[] = rawAnnouncements.map((a) => ({
    id: a.id,
    content: a.content,
    priority: a.priority,
    batchId: a.batchId,
    batchName: a.batchName,
    authorRole: a.authorRole,
    authorName: a.authorName,
    createdAt: a.createdAt,
  }))

  return (
    <div className="max-w-[1500px] w-full p-3 sm:p-4 md:p-6 space-y-4 min-w-0 flex flex-col flex-1">
      <InstituteAnnouncementsView
        instituteName={institute.name}
        channels={channels}
        initialAnnouncements={initialAnnouncements}
      />
    </div>
  )
}

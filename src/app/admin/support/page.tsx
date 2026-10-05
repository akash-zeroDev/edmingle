import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SupportTicketsView } from "./components/support-tickets-view"

export default async function SupportPage() {
  const user = await currentUser()
  if (user?.publicMetadata?.role !== "superadmin") {
    redirect("/")
  }

  const dbTickets = await prisma.supportTicket.findMany({
    include: {
      institute: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const tickets = dbTickets.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    type: t.type,
    severity: t.severity,
    status: t.status,
    reporterName: t.reporterName,
    reporterEmail: t.reporterEmail,
    reporterPhone: t.reporterPhone,
    reporterRole: t.reporterRole,
    instituteName: t.institute?.name || null,
    adminNotes: t.adminNotes,
    createdAt: t.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))

  return <SupportTicketsView tickets={tickets} />
}

"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"

export interface SubmitTicketInput {
  title: string
  description: string
  type?: "BUG" | "FEEDBACK" | "FEATURE_REQUEST" | "SUPPORT"
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  reporterName: string
  reporterEmail: string
  reporterPhone?: string
  reporterRole: "INSTITUTE_ADMIN" | "TEACHER" | "STUDENT"
  instituteId?: string
}

export async function submitSupportTicket(data: SubmitTicketInput) {
  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type || "BUG",
        severity: data.severity || "MEDIUM",
        status: "OPEN",
        reporterName: data.reporterName,
        reporterEmail: data.reporterEmail,
        reporterPhone: data.reporterPhone || null,
        reporterRole: data.reporterRole,
        instituteId: data.instituteId || null,
      },
    })

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actor: `${data.reporterName} (${data.reporterRole})`,
        action: `TICKET_${ticket.type}_CREATED`,
        details: `Report filed: "${ticket.title}" [${ticket.severity} priority].`,
        severity: ticket.severity === "CRITICAL" ? "WARNING" : "INFO",
        targetId: ticket.id,
        targetType: "SupportTicket",
      },
    })

    revalidatePath("/admin/analytics")
    return { success: true, ticket }
  } catch (error) {
    console.error("Failed to submit support ticket:", error)
    throw error
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
  adminNotes?: string
) {
  try {
    const user = await currentUser()
    const actorName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "Super Admin"

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        adminNotes: adminNotes || undefined,
        resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
      },
    })

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        actor: actorName,
        action: "TICKET_STATUS_UPDATED",
        details: `Ticket #${ticketId.slice(-6).toUpperCase()} marked ${status}${
          adminNotes ? ` (Notes: ${adminNotes})` : ""
        }.`,
        severity: "INFO",
        targetId: ticketId,
        targetType: "SupportTicket",
      },
    })

    revalidatePath("/admin/analytics")
    return { success: true, ticket }
  } catch (error) {
    console.error("Failed to update ticket status:", error)
    throw error
  }
}

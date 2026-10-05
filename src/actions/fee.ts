"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { dispatchFeeReceiptNotice, dispatchFeeReminderNotice } from "@/lib/notifications"

export interface RecordPaymentInput {
  studentId: string
  feeId?: string
  amount: number
  paymentMode: "UPI" | "CASH" | "CARD" | "CHEQUE" | "NET_BANKING"
  transactionRef?: string
  notes?: string
  discountAmount?: number
  discountReason?: string
}

export async function recordFeePayment(input: RecordPaymentInput) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) throw new Error("Unauthorized or institute not found")
    const { institute, user } = authData
    const adminEmail = user.emailAddresses[0]?.emailAddress || institute.adminEmail

    // Verify student belongs to this institute
    const student = await prisma.student.findFirst({
      where: {
        id: input.studentId,
        instituteId: institute.id,
      },
      include: {
        batches: {
          include: {
            batch: true,
          },
        },
        fees: true,
      },
    })

    if (!student) throw new Error("Student not found in your institute")

    // Find or create active Fee record
    let fee = student.fees[0]
    if (!fee) {
      fee = await prisma.fee.create({
        data: {
          studentId: student.id,
          amountTotal: 40000,
          amountPaid: 0,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: "PENDING",
        },
      })
    }

    // Apply concession/discount if provided
    let newAmountTotal = fee.amountTotal
    if (input.discountAmount && input.discountAmount > 0) {
      newAmountTotal = Math.max(0, fee.amountTotal - input.discountAmount)
    }

    const newAmountPaid = fee.amountPaid + input.amount
    const isFullyPaid = newAmountPaid >= newAmountTotal
    const newStatus = isFullyPaid ? "PAID" : "PARTIAL"

    // Generate unique sequential-style receipt number
    const year = new Date().getFullYear()
    const randomHex = Math.floor(100000 + Math.random() * 900000)
    const receiptNo = `REC-${year}-${randomHex}`

    const cashierName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Front Desk Reception"

    // Create payment transaction and update fee record atomically
    const [paymentRecord, updatedFee] = await prisma.$transaction([
      prisma.feePayment.create({
        data: {
          receiptNo,
          amount: input.amount,
          paymentMode: input.paymentMode,
          transactionRef: input.transactionRef || (input.paymentMode === "CASH" ? "CASH-COUNTER" : null),
          notes: input.notes || (input.discountReason ? `Discount: ${input.discountReason}` : null),
          receivedBy: cashierName,
          feeId: fee.id,
          studentId: student.id,
        },
      }),
      prisma.fee.update({
        where: { id: fee.id },
        data: {
          amountTotal: newAmountTotal,
          amountPaid: newAmountPaid,
          status: newStatus,
          paidAt: new Date(),
        },
      }),
    ])

    // Log security audit trail entry
    await prisma.auditLog.create({
      data: {
        actor: adminEmail || cashierName,
        action: "FEE_PAYMENT_COLLECTED",
        details: `Collected ₹${input.amount.toLocaleString("en-IN")} via ${input.paymentMode} for student ${student.name} (Receipt: ${receiptNo})`,
        severity: "INFO",
        targetId: paymentRecord.id,
        targetType: "FeePayment",
      },
    })

    const batchName = student.batches[0]?.batch?.className
      ? `${student.batches[0].batch.className} - ${student.batches[0].batch.subject}`
      : "General Coaching Batch"

    const remainingBalance = Math.max(0, newAmountTotal - newAmountPaid)

    // Trigger automated WhatsApp/SMS/Email notifications
    const noticeResult = await dispatchFeeReceiptNotice({
      studentName: student.name,
      parentPhone: student.parentPhone,
      studentPhone: student.phoneNo,
      parentEmail: student.email,
      instituteName: institute.name,
      receiptNo,
      amount: input.amount,
      paymentMode: input.paymentMode,
      remainingBalance,
      batchName,
    })

    revalidatePath("/institute/fees")
    revalidatePath("/institute/students")

    return {
      success: true,
      receiptNo,
      paymentId: paymentRecord.id,
      amount: input.amount,
      paymentMode: input.paymentMode,
      studentName: student.name,
      batchName,
      remainingBalance,
      paidAt: paymentRecord.paidAt.toISOString(),
      cashierName,
      whatsappMessage: noticeResult.whatsappMessage,
      smsMessage: noticeResult.smsMessage,
      message: `Payment of ₹${input.amount.toLocaleString("en-IN")} recorded successfully. Receipt #${receiptNo} issued.`,
    }
  } catch (error: any) {
    console.error("Error in recordFeePayment:", error)
    return {
      error: error?.message || "Failed to record payment. Please try again.",
    }
  }
}

export async function sendFeeReminder(studentId: string) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) throw new Error("Unauthorized or institute not found")
    const { institute, user } = authData
    const adminEmail = user.emailAddresses[0]?.emailAddress || institute.adminEmail

    const student = await prisma.student.findFirst({
      where: { id: studentId, instituteId: institute.id },
      include: {
        batches: { include: { batch: true } },
        fees: true,
      },
    })

    if (!student) throw new Error("Student not found")

    const fee = student.fees[0]
    const amountDue = fee ? Math.max(0, fee.amountTotal - fee.amountPaid) : 40000
    const dueDateStr = fee
      ? new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "Immediately"

    const batchName = student.batches[0]?.batch?.className
      ? `${student.batches[0].batch.className} - ${student.batches[0].batch.subject}`
      : "Regular Batch"

    const notice = await dispatchFeeReminderNotice({
      studentName: student.name,
      parentPhone: student.parentPhone,
      studentPhone: student.phoneNo,
      instituteName: institute.name,
      amountDue,
      dueDate: dueDateStr,
      batchName,
    })

    await prisma.auditLog.create({
      data: {
        actor: adminEmail || "Institute Admin",
        action: "FEE_REMINDER_SENT",
        details: `Sent fee reminder of ₹${amountDue.toLocaleString("en-IN")} for ${student.name} to parent phone ${student.parentPhone || "N/A"}`,
        severity: "INFO",
        targetId: student.id,
        targetType: "Student",
      },
    })

    return {
      success: true,
      message: `Reminder sent to ${student.name}'s parent (${student.parentPhone || "registered contact"}).`,
      whatsappMessage: notice.whatsappMessage,
      parentPhone: student.parentPhone,
    }
  } catch (error: any) {
    console.error("Error in sendFeeReminder:", error)
    return { error: error?.message || "Failed to send reminder" }
  }
}

export async function broadcastBatchFeeReminder(batchId: string) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) throw new Error("Unauthorized or institute not found")
    const { institute, user } = authData
    const adminEmail = user.emailAddresses[0]?.emailAddress || institute.adminEmail

    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId: institute.id },
      include: {
        students: {
          include: {
            student: {
              include: {
                fees: true,
              },
            },
          },
        },
      },
    })

    if (!batch) throw new Error("Batch not found")

    let dispatchedCount = 0
    for (const enrollment of batch.students) {
      const student = enrollment.student
      const fee = student.fees[0]
      const amountDue = fee ? fee.amountTotal - fee.amountPaid : 40000

      if (amountDue > 0) {
        await dispatchFeeReminderNotice({
          studentName: student.name,
          parentPhone: student.parentPhone,
          studentPhone: student.phoneNo,
          instituteName: institute.name,
          amountDue,
          dueDate: fee ? new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Soon",
          batchName: `${batch.className} - ${batch.subject}`,
        })
        dispatchedCount++
      }
    }

    await prisma.auditLog.create({
      data: {
        actor: adminEmail || "Institute Admin",
        action: "BATCH_FEE_REMINDERS_BROADCAST",
        details: `Dispatched ${dispatchedCount} fee reminders for batch ${batch.className} - ${batch.subject}`,
        severity: "INFO",
        targetId: batch.id,
        targetType: "Batch",
      },
    })

    return {
      success: true,
      count: dispatchedCount,
      message: `Broadcast complete: ${dispatchedCount} parent reminders dispatched for ${batch.className} - ${batch.subject}.`,
    }
  } catch (error: any) {
    console.error("Error in broadcastBatchFeeReminder:", error)
    return { error: error?.message || "Failed to broadcast batch reminders" }
  }
}

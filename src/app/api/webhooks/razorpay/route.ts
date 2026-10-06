import { headers } from "next/headers"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { readPlatformSettings } from "@/lib/platform-settings"
import { dispatchFeeReceiptNotice } from "@/lib/notifications"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const headerPayload = await headers()
    const razorpaySignature = headerPayload.get("x-razorpay-signature")

    const settings = await readPlatformSettings()
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || settings.razorpay?.webhookSecret || ""

    // Validate signature if webhookSecret is configured
    if (webhookSecret && !webhookSecret.includes("whsec_edmingle_platform_prod")) {
      if (!razorpaySignature) {
        return new Response("Missing x-razorpay-signature header", { status: 400 })
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex")

      if (expectedSignature !== razorpaySignature) {
        console.error("[Razorpay Webhook] Invalid signature")
        return new Response("Invalid signature", { status: 400 })
      }
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event

    console.log(`[Razorpay Webhook] Received event: ${eventType} (${event.payload?.payment?.entity?.id || "N/A"})`)

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity
      const orderEntity = event.payload?.order?.entity
      const paymentId = paymentEntity?.id
      const orderId = paymentEntity?.order_id || orderEntity?.id
      const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0
      const notes = paymentEntity?.notes || orderEntity?.notes || {}
      const feeId = notes.feeId
      const studentId = notes.studentId

      if (paymentId) {
        // Idempotency: verify if already recorded
        const existingPayment = await prisma.feePayment.findFirst({
          where: { transactionRef: paymentId },
        })

        if (!existingPayment && (studentId || feeId)) {
          let student = null
          if (studentId) {
            student = await prisma.student.findUnique({
              where: { id: studentId },
              include: { institute: true, batches: { include: { batch: true } }, fees: true },
            })
          }

          if (student) {
            let targetFee = feeId ? student.fees.find((f) => f.id === feeId) : student.fees[0]
            const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`

            await prisma.$transaction(async (tx) => {
              let feeIdToUse = targetFee?.id
              if (!feeIdToUse) {
                const createdFee = await tx.fee.create({
                  data: {
                    studentId: student.id,
                    amountTotal: Math.max(amount, 40000),
                    amountPaid: 0,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: "PENDING",
                  },
                })
                feeIdToUse = createdFee.id
                targetFee = createdFee
              }

              await tx.feePayment.create({
                data: {
                  feeId: feeIdToUse,
                  studentId: student.id,
                  receiptNo: receiptNumber,
                  amount,
                  paymentMode: paymentEntity?.method?.toUpperCase() || "UPI",
                  transactionRef: paymentId,
                  receivedBy: "Razorpay Webhook",
                  notes: `Auto-reconciled order ${orderId}`,
                  paidAt: new Date(),
                },
              })

              const currentPaid = targetFee ? targetFee.amountPaid : 0
              const totalAmount = targetFee ? targetFee.amountTotal : amount
              const newAmountPaid = currentPaid + amount

              await tx.fee.update({
                where: { id: feeIdToUse },
                data: {
                  amountPaid: newAmountPaid,
                  status: newAmountPaid >= totalAmount ? "PAID" : "PARTIAL",
                  paidAt: newAmountPaid >= totalAmount ? new Date() : undefined,
                },
              })
            })

            console.log(`[Razorpay Webhook] Successfully reconciled payment ${paymentId} for ${student.name}`)
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("[Razorpay Webhook Error]:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

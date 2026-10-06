"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import crypto from "crypto"
import { readPlatformSettings } from "@/lib/platform-settings"
import { dispatchFeeReceiptNotice } from "@/lib/notifications"

// Internal helper to get active Razorpay credentials
async function getRazorpayCredentials() {
  const settings = await readPlatformSettings()
  const keyId = process.env.RAZORPAY_KEY_ID || settings.razorpay?.keyId || ""
  const keySecret = process.env.RAZORPAY_KEY_SECRET || settings.razorpay?.keySecret || ""
  const isActive = settings.razorpay?.isActive ?? true
  const environment = settings.razorpay?.environment || "TEST"

  // Check if keys are official format rather than masked/placeholders
  const isRealKey =
    keyId.startsWith("rzp_") &&
    keySecret.length >= 10 &&
    !keySecret.includes("masked")

  return { keyId, keySecret, isActive, environment, isRealKey }
}

/**
 * Creates a Razorpay Order for tuition fee payment.
 * Returns order details to the client to initialize the Checkout popup.
 */
export async function createFeePaymentOrder(input: {
  feeId?: string
  amount: number
  studentId?: string
}) {
  try {
    const user = await currentUser().catch(() => null)
    const userId = user?.id || input.studentId || "student_session"

    if (!input.amount || input.amount <= 0) {
      return { success: false, error: "Invalid payment amount." }
    }

    const { keyId, keySecret, isActive, isRealKey } = await getRazorpayCredentials()

    if (!isActive) {
      return { success: false, error: "Online fee payments are currently disabled by administration." }
    }

    // Amount in paise for Razorpay
    const amountInPaise = Math.round(input.amount * 100)

    // If valid live/test credentials exist, call the official Razorpay REST API
    if (isRealKey) {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
      const orderPayload = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${input.feeId ? input.feeId.slice(-8) : Date.now().toString().slice(-8)}`,
        notes: {
          feeId: input.feeId || "",
          studentId: input.studentId || "",
          userId: userId,
        },
      }

      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
        cache: "no-store",
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        const errorDesc = errJson?.error?.description || `Razorpay order creation failed (HTTP ${res.status})`
        console.error("[Razorpay Order Error]:", errorDesc)
        return { success: false, error: errorDesc }
      }

      const orderData = await res.json()
      return {
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId,
        isSimulated: false,
      }
    }

    // Fallback: simulated order for preview mode or sandbox testing without live keys
    const simOrderId = `order_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
    return {
      success: true,
      orderId: simOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId || "rzp_test_simulated",
      isSimulated: true,
    }
  } catch (error: any) {
    console.error("Error in createFeePaymentOrder:", error)
    return { success: false, error: error.message || "Unable to initiate payment order." }
  }
}

/**
 * Cryptographically verifies Razorpay payment signature and records the transaction in Prisma.
 */
export async function verifyAndRecordRazorpayPayment(input: {
  feeId?: string
  studentId?: string
  amount: number
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature?: string
  isSimulated?: boolean
}) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Authentication required." }
    }

    const { keySecret, isRealKey } = await getRazorpayCredentials()

    // Cryptographic signature check for real Razorpay checkouts
    if (!input.isSimulated && isRealKey) {
      if (!input.razorpaySignature) {
        return { success: false, error: "Missing cryptographic payment signature." }
      }

      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex")

      if (expectedSignature !== input.razorpaySignature) {
        console.error("[Razorpay Security] Signature mismatch!", {
          expected: expectedSignature,
          received: input.razorpaySignature,
        })
        return { success: false, error: "Payment verification failed: Signature mismatch." }
      }
    }

    // Locate student and fee record
    let student = null
    if (input.studentId) {
      student = await prisma.student.findUnique({
        where: { id: input.studentId },
        include: { institute: true, batches: { include: { batch: true } }, fees: true },
      })
    } else {
      student = await prisma.student.findFirst({
        where: { clerkUserId: user.id },
        include: { institute: true, batches: { include: { batch: true } }, fees: true },
      })
    }

    // If preview mode (unlinked account), return valid simulated receipt for UI
    if (!student) {
      const mockReceiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
      return {
        success: true,
        isSimulated: true,
        receiptNo: mockReceiptNo,
        amount: input.amount,
        paidAt: new Date().toISOString(),
        paymentMode: "UPI",
        transactionRef: input.razorpayPaymentId,
        message: "Payment recorded successfully in preview mode.",
      }
    }

    // Find target Fee record or select first fee
    let targetFee: any = null
    if (input.feeId) {
      targetFee = student.fees.find((f) => f.id === input.feeId)
    }
    if (!targetFee && student.fees.length > 0) {
      targetFee = student.fees[0]
    }

    const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const paymentAmount = Number(input.amount)

    // Atomic transaction: create payment, update fee, write audit log
    const result = await prisma.$transaction(async (tx) => {
      let feeIdToUse = targetFee?.id
      if (!feeIdToUse) {
        const createdFee = await tx.fee.create({
          data: {
            studentId: student.id,
            amountTotal: Math.max(paymentAmount, 40000),
            amountPaid: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: "PENDING",
          },
        })
        feeIdToUse = createdFee.id
        targetFee = createdFee
      }

      // Create payment record
      const payment = await tx.feePayment.create({
        data: {
          feeId: feeIdToUse,
          studentId: student.id,
          receiptNo: receiptNumber,
          amount: paymentAmount,
          paymentMode: "UPI",
          transactionRef: input.razorpayPaymentId,
          receivedBy: "Razorpay Gateway",
          notes: `Razorpay Order: ${input.razorpayOrderId}`,
          paidAt: new Date(),
        },
      })

      // Update fee status
      const currentPaid = targetFee ? targetFee.amountPaid : 0
      const totalAmount = targetFee ? targetFee.amountTotal : paymentAmount
      const newAmountPaid = currentPaid + paymentAmount
      const isFull = newAmountPaid >= totalAmount

      const updatedFee = await tx.fee.update({
        where: { id: feeIdToUse },
        data: {
          amountPaid: newAmountPaid,
          status: isFull ? "PAID" : "PARTIAL",
          paidAt: isFull ? new Date() : undefined,
        },
      })

      // Audit log entry
      await tx.auditLog.create({
        data: {
          actor: student.name,
          action: "ONLINE_FEE_PAYMENT_COLLECTED",
          details: `Collected ₹${paymentAmount.toLocaleString("en-IN")} via Razorpay (${input.razorpayPaymentId}) for ${student.name}`,
          severity: "INFO",
          targetType: "FeePayment",
        },
      })

      return { payment, updatedFee }
    })

    // Dispatch notification
    const primaryBatchName = student.batches[0]?.batch?.className
      ? `${student.batches[0].batch.className} - ${student.batches[0].batch.subject}`
      : "General Coaching Batch"

    const remaining = Math.max(0, result.updatedFee.amountTotal - result.updatedFee.amountPaid)

    await dispatchFeeReceiptNotice({
      studentName: student.name,
      parentPhone: student.parentPhone,
      studentPhone: student.phoneNo,
      parentEmail: student.email,
      instituteName: student.institute.name,
      receiptNo: receiptNumber,
      amount: paymentAmount,
      paymentMode: "Razorpay (UPI / Card)",
      remainingBalance: remaining,
      batchName: primaryBatchName,
    })

    revalidatePath("/student")
    revalidatePath("/institute/fees")

    return {
      success: true,
      receiptNo: receiptNumber,
      payment: result.payment,
      updatedFee: result.updatedFee,
    }
  } catch (error: any) {
    console.error("Error in verifyAndRecordRazorpayPayment:", error)
    return { success: false, error: error.message || "Failed to record payment." }
  }
}

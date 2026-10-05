"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAuthenticatedInstitute } from "@/lib/current-institute"

export interface DisburseSalaryInput {
  teacherId: string
  month: number // 1 - 12
  year: number
  baseSalary: number
  bonus?: number
  deductions?: number
  paymentMode: string // "NET_BANKING" | "UPI" | "CHEQUE" | "CASH"
  transactionRef?: string
  notes?: string
}

export async function disburseTeacherSalary(data: DisburseSalaryInput) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) {
      return { error: "Institute not found or unauthorized." }
    }
    const institute = authData.institute

    const teacher = await prisma.teacher.findFirst({
      where: {
        id: data.teacherId,
        instituteId: institute.id,
      },
    })

    if (!teacher) {
      return { error: "Teacher not found in your institute." }
    }

    const bonus = Number(data.bonus) || 0
    const deductions = Number(data.deductions) || 0
    const baseSalary = Number(data.baseSalary) || Number(teacher.salary) || 0
    const netAmount = Math.max(0, baseSalary + bonus - deductions)

    // Generate unique Voucher Number: VCH-YYYYMM-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const monthStr = data.month.toString().padStart(2, "0")
    const voucherNo = `VCH-${data.year}${monthStr}-${randomSuffix}`

    // Check if payout already exists for this teacher, month, and year
    const existingPayout = await prisma.teacherPayout.findFirst({
      where: {
        teacherId: teacher.id,
        month: data.month,
        year: data.year,
      },
    })

    let payout
    if (existingPayout) {
      payout = await prisma.teacherPayout.update({
        where: { id: existingPayout.id },
        data: {
          baseSalary,
          bonus,
          deductions,
          netAmount,
          paymentMode: data.paymentMode,
          transactionRef: data.transactionRef?.trim() || null,
          notes: data.notes?.trim() || null,
          status: "PAID",
          paidAt: new Date(),
        },
      })
    } else {
      payout = await prisma.teacherPayout.create({
        data: {
          teacherId: teacher.id,
          instituteId: institute.id,
          month: data.month,
          year: data.year,
          baseSalary,
          bonus,
          deductions,
          netAmount,
          paymentMode: data.paymentMode,
          transactionRef: data.transactionRef?.trim() || null,
          notes: data.notes?.trim() || null,
          voucherNo,
          status: "PAID",
          paidAt: new Date(),
        },
      })
    }

    revalidatePath("/institute/payroll")
    revalidatePath("/teacher")
    revalidatePath("/institute/teachers")
    return {
      success: true,
      message: `Salary of ₹${netAmount.toLocaleString("en-IN")} disbursed to ${teacher.name}.`,
      payout: {
        id: payout.id,
        voucherNo: payout.voucherNo,
        teacherName: teacher.name,
        teacherPhone: teacher.phoneNo,
        month: payout.month,
        year: payout.year,
        baseSalary: payout.baseSalary,
        bonus: payout.bonus,
        deductions: payout.deductions,
        netAmount: payout.netAmount,
        paymentMode: payout.paymentMode,
        transactionRef: payout.transactionRef,
        paidAt: payout.paidAt.toISOString(),
        instituteName: institute.name,
      },
    }
  } catch (error: any) {
    console.error("Error disbursing teacher salary:", error)
    return { error: error.message || "Failed to disburse salary." }
  }
}

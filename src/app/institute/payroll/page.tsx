import prisma from "@/lib/prisma" // Refreshed client instance
import { redirect } from "next/navigation"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { PayrollDashboardView } from "./components/payroll-dashboard-view"
import type { TeacherPayrollItem } from "./components/disburse-salary-modal"
import type { PayrollKpiData } from "./components/payroll-dashboard-view"

interface PayrollPageProps {
  searchParams: Promise<{
    month?: string
    year?: string
  }>
}

export default async function PayrollPage({ searchParams }: PayrollPageProps) {
  const authData = await getAuthenticatedInstitute()
  if (!authData?.institute) redirect("/onboarding")
  const institute = authData.institute

  const resolvedParams = await searchParams
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // 1-Year Restriction Boundary: institute admin can only view transactions within the past 12 months
  const oneYearAgo = new Date(currentYear - 1, currentMonth - 1, 1)

  let activeMonth = resolvedParams.month
    ? parseInt(resolvedParams.month, 10)
    : currentMonth
  let activeYear = resolvedParams.year
    ? parseInt(resolvedParams.year, 10)
    : currentYear

  if (isNaN(activeMonth) || activeMonth < 1 || activeMonth > 12) activeMonth = currentMonth
  if (isNaN(activeYear)) activeYear = currentYear

  const requestedDate = new Date(activeYear, activeMonth - 1, 1)
  const maxAllowedFuture = new Date(currentYear, currentMonth, 1)

  // If the admin attempts to access data older than 1 year, clamp and redirect to current month
  if (requestedDate < oneYearAgo || requestedDate > maxAllowedFuture) {
    redirect(`/institute/payroll?year=${currentYear}&month=${currentMonth}`)
  }

  // Fetch all teachers in this institute with payouts strictly within the 1-year allowable window
  const teachers = await prisma.teacher.findMany({
    where: { instituteId: institute.id },
    include: {
      batchesTaught: {
        select: {
          className: true,
          batchName: true,
          subject: true,
        },
      },
      payouts: {
        where: {
          month: activeMonth,
          year: activeYear,
          paidAt: {
            gte: oneYearAgo,
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  // Compute payroll summary metrics
  let totalBudget = 0
  let totalDisbursed = 0
  let paidCount = 0

  const teacherPayrollItems: TeacherPayrollItem[] = teachers.map((t) => {
    const baseRetainer = t.salary || 45000
    totalBudget += baseRetainer

    const currentPayout = t.payouts[0] || null
    if (currentPayout && currentPayout.status === "PAID") {
      totalDisbursed += currentPayout.netAmount
      paidCount++
    }

    const batchNames = t.batchesTaught.map((b) =>
      b.batchName ? `${b.className} - ${b.batchName}` : `${b.className} (${b.subject})`
    )

    return {
      id: t.id,
      name: t.name,
      phoneNo: t.phoneNo,
      salary: baseRetainer,
      subjects: t.subjects,
      batchesCount: t.batchesTaught.length,
      batchNames,
      payout: currentPayout
        ? {
            id: currentPayout.id,
            voucherNo: currentPayout.voucherNo,
            month: currentPayout.month,
            year: currentPayout.year,
            baseSalary: currentPayout.baseSalary,
            bonus: currentPayout.bonus,
            deductions: currentPayout.deductions,
            netAmount: currentPayout.netAmount,
            status: currentPayout.status,
            paymentMode: currentPayout.paymentMode,
            transactionRef: currentPayout.transactionRef,
            paidAt: currentPayout.paidAt.toISOString(),
            notes: currentPayout.notes,
          }
        : null,
    }
  })

  const facultyCount = teachers.length
  const pendingCount = Math.max(0, facultyCount - paidCount)
  const totalPending = Math.max(0, totalBudget - totalDisbursed)

  const kpiData: PayrollKpiData = {
    totalBudget,
    totalDisbursed,
    totalPending,
    paidCount,
    pendingCount,
    facultyCount,
  }

  return (
    <PayrollDashboardView
      instituteName={institute.name}
      activeMonth={activeMonth}
      activeYear={activeYear}
      kpiData={kpiData}
      teachers={teacherPayrollItems}
    />
  )
}

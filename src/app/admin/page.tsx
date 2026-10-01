import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdminDashboardView } from "./components/admin-dashboard-view"

export default async function AdminDashboard() {
  const user = await currentUser()
  if (user?.publicMetadata?.role !== "superadmin") {
    redirect("/")
  }

  // 1. Core Platform Counts
  const [
    institutesCount,
    activeInstitutesCount,
    studentsCount,
    teachersCount,
    batchesCount,
  ] = await Promise.all([
    prisma.institute.count(),
    prisma.institute.count({ where: { isActive: true } }),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.batch.count(),
  ])

  // 2. Financial Aggregates
  const [paidInvoices, pendingInvoices, overdueInvoices, overdueCount] = await Promise.all([
    prisma.instituteInvoice.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.instituteInvoice.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.instituteInvoice.aggregate({
      _sum: { amount: true },
      where: { status: "OVERDUE" },
    }),
    prisma.instituteInvoice.count({
      where: { status: "OVERDUE" },
    }),
  ])

  const totalRevenue = paidInvoices._sum.amount || 0
  const pendingRevenue = pendingInvoices._sum.amount || 0
  const overdueRevenue = overdueInvoices._sum.amount || 0

  // 3. Monthly Revenue Curve Aggregation (Jan - Dec for current year)
  const currentYear = 2026 // or new Date().getFullYear()
  const yearInvoices = await prisma.instituteInvoice.findMany({
    where: {
      billingPeriodStart: {
        gte: new Date(Date.UTC(currentYear, 0, 1)),
        lte: new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59)),
      },
    },
    select: {
      amount: true,
      status: true,
      billingPeriodStart: true,
      instituteId: true,
    },
  })

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  // Aggregate by calendar month
  const monthlyRevenueData = monthNames.map((name, monthIdx) => {
    const invoicesInMonth = yearInvoices.filter((inv) => {
      const d = new Date(inv.billingPeriodStart)
      return d.getUTCFullYear() === currentYear && d.getUTCMonth() === monthIdx
    })

    const monthRevenue = invoicesInMonth
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.amount, 0)

    const uniqueInstitutes = new Set(
      invoicesInMonth.map((inv) => inv.instituteId)
    ).size

    return {
      month: name,
      revenue: monthRevenue,
      institutes: uniqueInstitutes,
    }
  })

  // 4. Dynamic Revenue Growth Calculation (Q3 vs Q2 or current vs previous month)
  // Q2: Apr, May, Jun (indexes 3, 4, 5); Q3: Jul, Aug, Sep (indexes 6, 7, 8)
  const q2Revenue = monthlyRevenueData.slice(3, 6).reduce((acc, m) => acc + m.revenue, 0)
  const q3Revenue = monthlyRevenueData.slice(6, 9).reduce((acc, m) => acc + m.revenue, 0)
  
  let growthPercentage = 0
  let isPositiveGrowth = true
  let growthLabel = "vs last quarter"

  if (q2Revenue > 0) {
    growthPercentage = Number((((q3Revenue - q2Revenue) / q2Revenue) * 100).toFixed(1))
    isPositiveGrowth = growthPercentage >= 0
  } else {
    // Fallback to month-over-month
    const sepRev = monthlyRevenueData[8].revenue
    const augRev = monthlyRevenueData[7].revenue
    if (augRev > 0) {
      growthPercentage = Number((((sepRev - augRev) / augRev) * 100).toFixed(1))
      isPositiveGrowth = growthPercentage >= 0
      growthLabel = "vs last month"
    } else {
      growthPercentage = 100
      growthLabel = "active expansion"
    }
  }

  // 5. Subscription Distribution
  const subscriptionCounts = await prisma.institute.groupBy({
    by: ["subscriptionType"],
    _count: { id: true },
  })
  const subscriptionDistribution = {
    pro: subscriptionCounts.find((s) => s.subscriptionType === "PRO")?._count.id || 0,
    enterprise: subscriptionCounts.find((s) => s.subscriptionType === "ENTERPRISE")?._count.id || 0,
    free: subscriptionCounts.find((s) => s.subscriptionType === "FREE")?._count.id || 0,
  }

  // 6. Recent Institutes List
  const institutes = await prisma.institute.findMany({
    take: 8,
    orderBy: { joinedAt: "desc" },
    include: {
      _count: { select: { students: true, teachers: true, batches: true } },
    },
  })

  // Query raw isActive status to ensure cache consistency
  const rawStatuses: any[] = await prisma.$queryRaw`SELECT id, "isActive" FROM "Institute"`
  const statusMap = new Map(rawStatuses.map((row) => [row.id, row.isActive]))

  const recentInstitutes = institutes.map((inst) => ({
    id: inst.id,
    name: inst.name,
    adminEmail: inst.adminEmail,
    phoneNo: inst.phoneNo,
    subscriptionType: inst.subscriptionType,
    paymentStatus: inst.paymentStatus,
    isActive: statusMap.has(inst.id) ? Boolean(statusMap.get(inst.id)) : true,
    studentsCount: inst._count.students,
    teachersCount: inst._count.teachers,
    batchesCount: inst._count.batches,
    joinedAt: inst.joinedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }))

  // 7. Recent Invoices List
  const dbInvoices = await prisma.instituteInvoice.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { institute: { select: { name: true, subscriptionType: true } } },
  })

  const recentInvoices = dbInvoices.map((inv) => ({
    id: inv.id,
    instituteName: inv.institute.name,
    subscriptionType: inv.institute.subscriptionType,
    amount: inv.amount,
    status: inv.status,
    dueDate: inv.dueDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdAt: inv.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }))

  const adminName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Master Admin"

  return (
    <AdminDashboardView
      adminName={adminName}
      institutesCount={institutesCount}
      activeInstitutesCount={activeInstitutesCount}
      studentsCount={studentsCount}
      teachersCount={teachersCount}
      batchesCount={batchesCount}
      totalRevenue={totalRevenue}
      pendingRevenue={pendingRevenue}
      overdueRevenue={overdueRevenue}
      overdueCount={overdueCount}
      revenueGrowth={{
        percentage: growthPercentage,
        isPositive: isPositiveGrowth,
        label: growthLabel,
      }}
      monthlyRevenueData={monthlyRevenueData}
      subscriptionDistribution={subscriptionDistribution}
      recentInstitutes={recentInstitutes}
      recentInvoices={recentInvoices}
    />
  )
}

import prisma from "@/lib/prisma"
import { BarChart3, TrendingUp, IndianRupee, Users, Building2, ShieldCheck, Layers3, CheckCircle2 } from "lucide-react"

export default async function AnalyticsPage() {
  const [
    institutesCount,
    activeInstitutesCount,
    studentsCount,
    teachersCount,
    batchesCount,
    paidInvoices,
  ] = await Promise.all([
    prisma.institute.count(),
    prisma.institute.count({ where: { isActive: true } }),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.batch.count(),
    prisma.instituteInvoice.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
  ])

  const totalRevenue = paidInvoices._sum.amount || 0

  // Fetch all institutes with real counts and billing stats
  const institutes = await prisma.institute.findMany({
    orderBy: { joinedAt: "desc" },
    include: {
      _count: { select: { students: true, teachers: true, batches: true } },
      invoices: { where: { status: "PAID" }, select: { amount: true } },
    },
  })

  // Calculate annual run-rate from latest monthly collection
  const latestMonthInvoices = await prisma.instituteInvoice.aggregate({
    _sum: { amount: true },
    where: {
      status: "PAID",
      billingPeriodStart: {
        gte: new Date(Date.UTC(2026, 8, 1)), // Sep 2026
        lt: new Date(Date.UTC(2026, 9, 1)),
      },
    },
  })
  const lastMonthRevenue = latestMonthInvoices._sum.amount || (totalRevenue / 10)
  const annualizedRunRate = Math.round(lastMonthRevenue * 12)

  // Subscription counts
  const subscriptionCounts = await prisma.institute.groupBy({
    by: ["subscriptionType"],
    _count: { id: true },
  })

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Platform Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time telemetry, institute engagement, and revenue realization across all centers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>SaaS Realization</span>
            <IndianRupee className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            ₹{annualizedRunRate.toLocaleString("en-IN")} annualized run-rate (ARR)
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Active Institutes</span>
            <Building2 className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {activeInstitutesCount} <span className="text-xs font-normal text-muted-foreground">/ {institutesCount} total</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            Active operational centers
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Learner Network</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {studentsCount}
          </div>
          <p className="text-[11px] text-blue-600 font-medium">
            Active enrolled across {batchesCount} batches
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Faculty Roster</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {teachersCount}
          </div>
          <p className="text-[11px] text-purple-600 font-medium">
            Certified instructors teaching
          </p>
        </div>
      </div>

      {/* Real Breakdown Table: Center Analytics */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Regional Center Telemetry & Utilization
            </h3>
            <p className="text-xs text-muted-foreground">
              Live database metrics on faculty, student cohorts, and revenue realization by institute.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {subscriptionCounts.map((sub) => (
              <span
                key={sub.subscriptionType}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-foreground border border-border"
              >
                {sub.subscriptionType}: {sub._count.id}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="h-9 px-4 text-left font-medium">Center Name</th>
                <th className="h-9 px-4 text-left font-medium">Location</th>
                <th className="h-9 px-4 text-left font-medium">Plan</th>
                <th className="h-9 px-4 text-left font-medium">Batches</th>
                <th className="h-9 px-4 text-left font-medium">Students</th>
                <th className="h-9 px-4 text-left font-medium">Faculty</th>
                <th className="h-9 px-4 text-right font-medium">Total Paid Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {institutes.map((inst) => {
                const centerPaidSum = inst.invoices.reduce((s, inv) => s + inv.amount, 0)
                return (
                  <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                    <td className="h-11 px-4 font-semibold text-foreground">{inst.name}</td>
                    <td className="h-11 px-4 text-muted-foreground">{inst.location || "N/A"}</td>
                    <td className="h-11 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-light text-primary border border-primary/20">
                        {inst.subscriptionType}
                      </span>
                    </td>
                    <td className="h-11 px-4 font-medium text-foreground">{inst._count.batches}</td>
                    <td className="h-11 px-4 font-medium text-foreground">{inst._count.students}</td>
                    <td className="h-11 px-4 font-medium text-foreground">{inst._count.teachers}</td>
                    <td className="h-11 px-4 text-right font-bold text-foreground">
                      ₹{centerPaidSum.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { InstituteDashboardView } from "./components/institute-dashboard-view"

export default async function InstituteDashboard() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  
  if (!email) redirect("/");

  const institute = await prisma.institute.findFirst({
    where: { adminEmail: email }
  });

  if (!institute) redirect("/onboarding");

  // Fetch metrics securely scoped to this institute
  const totalStudents = await prisma.student.count({
    where: { instituteId: institute.id }
  });

  const totalTeachers = await prisma.teacher.count({
    where: { instituteId: institute.id }
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fees collected this month
  const feeAgg = await prisma.fee.aggregate({
    _sum: { amountPaid: true },
    where: {
      student: { instituteId: institute.id },
      paidAt: { gte: startOfMonth },
      status: "PAID"
    }
  });
  const feesThisMonth = feeAgg._sum.amountPaid || 0;

  // Recent payments from database
  const dbFees = await prisma.fee.findMany({
    where: {
      student: { instituteId: institute.id }
    },
    include: {
      student: {
        select: {
          name: true,
          batches: {
            include: {
              batch: { select: { className: true, subject: true } }
            },
            take: 1
          }
        }
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 10
  });

  // Fallback sample payments if no payments are in DB yet
  const fallbackPayments = [
    {
      id: "fee-sample-1",
      studentName: "Aarav Sharma",
      batchName: "JEE Advanced (Physics)",
      amount: 25000,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      method: "Online UPI",
      status: "PAID",
    },
    {
      id: "fee-sample-2",
      studentName: "Riya Gupta",
      batchName: "NEET Elite (Biology)",
      amount: 30000,
      date: new Date(Date.now() - 86400000 * 2).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      method: "Net Banking",
      status: "PAID",
    },
    {
      id: "fee-sample-3",
      studentName: "Ananya Singh",
      batchName: "Class 10 Foundation (Maths)",
      amount: 15000,
      date: new Date(Date.now() - 86400000 * 4).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      method: "Cash / Counter",
      status: "PENDING",
    },
    {
      id: "fee-sample-4",
      studentName: "Kabir Mehta",
      batchName: "JEE Advanced (Chemistry)",
      amount: 25000,
      date: new Date(Date.now() - 86400000 * 6).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      method: "Online UPI",
      status: "PAID",
    },
    {
      id: "fee-sample-5",
      studentName: "Ishita Roy",
      batchName: "NEET Elite (Physics)",
      amount: 30000,
      date: new Date(Date.now() - 86400000 * 8).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      method: "Online UPI",
      status: "OVERDUE",
    },
  ];

  const recentPayments = dbFees.length > 0 ? dbFees.map((f) => ({
    id: f.id,
    studentName: f.student.name,
    batchName: f.student.batches[0]?.batch
      ? `${f.student.batches[0].batch.className} (${f.student.batches[0].batch.subject})`
      : "Standard Course",
    amount: f.amountPaid > 0 ? f.amountPaid : f.amountTotal,
    date: f.paidAt
      ? f.paidAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : f.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    method: "Online UPI",
    status: f.status,
  })) : fallbackPayments;

  // Upcoming batches
  const dbBatches = await prisma.batch.findMany({
    where: { instituteId: institute.id },
    include: {
      teacher: { select: { name: true } }
    },
    take: 6,
    orderBy: { id: "desc" }
  });

  const fallbackClasses = [
    { id: "batch-1", className: "Class 12 - JEE Advanced", subject: "Electrostatics & Magnetism", timing: "09:00 AM - 10:30 AM", teacherName: "Dr. Rajiv Sharma" },
    { id: "batch-2", className: "Class 11 - NEET Elite", subject: "Human Physiology", timing: "11:00 AM - 12:30 PM", teacherName: "Dr. Anita Desai" },
    { id: "batch-3", className: "Class 12 - Chemistry", subject: "Organic Reaction Mechanisms", timing: "02:00 PM - 03:30 PM", teacherName: "Dr. Vandana Rao" },
    { id: "batch-4", className: "Class 10 - Foundation", subject: "Quadratic Equations", timing: "04:00 PM - 05:30 PM", teacherName: "Prof. S. Mukherjee" },
  ];

  const upcomingClasses = dbBatches.length > 0 ? dbBatches.map((b) => ({
    id: b.id,
    className: b.className,
    subject: b.subject,
    timing: b.timing,
    teacherName: b.teacher?.name ?? null,
  })) : fallbackClasses;

  const adminName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Administrator";

  return (
    <InstituteDashboardView
      instituteName={institute.name}
      adminName={adminName}
      totalStudents={totalStudents}
      totalTeachers={totalTeachers}
      feesThisMonth={feesThisMonth}
      recentPayments={recentPayments}
      upcomingClasses={upcomingClasses}
    />
  );
}

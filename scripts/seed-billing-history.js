import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("💳 Seeding authentic 2026 monthly billing history...");

  const institutes = await prisma.institute.findMany();
  console.log(`Found ${institutes.length} institutes in database.`);

  // Clean up any old duplicate or small test invoices (e.g. 99 or 299)
  const deletedOld = await prisma.instituteInvoice.deleteMany({
    where: {
      amount: { in: [99, 299] }
    }
  });
  console.log(`Cleaned up ${deletedOld.count} old test invoices.`);

  const currentYear = 2026;
  // Month index: 0 = Jan, 1 = Feb, ..., 9 = Oct
  const currentMonthIdx = 9; // October 2026

  const instituteBillingConfigs = [
    {
      nameMatch: "Apex IIT-JEE",
      monthlyAmount: 24999.0,
      startMonth: 0, // Jan
      overdueMonths: [],
    },
    {
      nameMatch: "Resonance",
      monthlyAmount: 59999.0,
      startMonth: 2, // Mar
      overdueMonths: [],
    },
    {
      nameMatch: "Pioneer",
      monthlyAmount: 49999.0,
      startMonth: 3, // Apr
      overdueMonths: [9], // Oct is overdue
    },
    {
      nameMatch: "Visionary",
      monthlyAmount: 19999.0,
      startMonth: 4, // May
      overdueMonths: [],
    },
    {
      nameMatch: "Narayana",
      monthlyAmount: 29999.0,
      startMonth: 5, // Jun
      overdueMonths: [],
    },
  ];

  for (const cfg of instituteBillingConfigs) {
    const inst = institutes.find(i => i.name.toLowerCase().includes(cfg.nameMatch.toLowerCase()));
    if (!inst) {
      console.log(`⚠️ Institute matching "${cfg.nameMatch}" not found, skipping.`);
      continue;
    }

    console.log(`\nGenerating monthly billing for ${inst.name} (${inst.subscriptionType} - ₹${cfg.monthlyAmount}/mo):`);

    for (let m = cfg.startMonth; m <= currentMonthIdx; m++) {
      const billingStart = new Date(Date.UTC(currentYear, m, 1, 0, 0, 0));
      const billingEnd = new Date(Date.UTC(currentYear, m + 1, 0, 23, 59, 59));
      const dueDate = new Date(Date.UTC(currentYear, m, 10, 18, 0, 0));
      const isOverdue = cfg.overdueMonths.includes(m);
      const isPending = m === currentMonthIdx && !isOverdue && Math.random() > 0.6;
      const status = isOverdue ? "OVERDUE" : (isPending ? "PENDING" : "PAID");
      const paidAt = status === "PAID" ? new Date(Date.UTC(currentYear, m, 5 + (m % 3), 14, 30, 0)) : null;

      // Check if invoice already exists for this institute and month
      const existing = await prisma.instituteInvoice.findFirst({
        where: {
          instituteId: inst.id,
          billingPeriodStart: {
            gte: new Date(Date.UTC(currentYear, m, 1)),
            lt: new Date(Date.UTC(currentYear, m + 1, 1))
          }
        }
      });

      if (existing) {
        await prisma.instituteInvoice.update({
          where: { id: existing.id },
          data: {
            amount: cfg.monthlyAmount,
            status,
            dueDate,
            paidAt,
            billingPeriodStart: billingStart,
            billingPeriodEnd: billingEnd,
          }
        });
        console.log(`  Updated ${billingStart.toLocaleString('en-US', { month: 'short' })}: ₹${cfg.monthlyAmount} [${status}]`);
      } else {
        await prisma.instituteInvoice.create({
          data: {
            instituteId: inst.id,
            amount: cfg.monthlyAmount,
            status,
            dueDate,
            paidAt,
            billingPeriodStart: billingStart,
            billingPeriodEnd: billingEnd,
            createdAt: billingStart,
          }
        });
        console.log(`  Created ${billingStart.toLocaleString('en-US', { month: 'short' })}: ₹${cfg.monthlyAmount} [${status}]`);
      }
    }
  }

  console.log("\n✅ Billing history successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

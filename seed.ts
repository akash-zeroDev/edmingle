import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create some Institutes
  const inst1 = await prisma.institute.create({
    data: {
      clerkOrgId: 'org_12345',
      name: 'Apex Coaching Centre',
      adminEmail: 'admin@apex.com',
      phoneNo: '+91 9876543210',
      subscriptionType: 'PRO',
      paymentStatus: 'PAID',
      joinedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)), // 2 months ago
      invoices: {
        create: [
          {
            amount: 99.0,
            status: 'PAID',
            billingPeriodStart: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            billingPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            dueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            paidAt: new Date(new Date().setMonth(new Date().getMonth() - 1, 5))
          },
          {
            amount: 99.0,
            status: 'PAID',
            billingPeriodStart: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            billingPeriodEnd: new Date(),
            dueDate: new Date(),
            paidAt: new Date()
          }
        ]
      }
    }
  });

  const inst2 = await prisma.institute.create({
    data: {
      clerkOrgId: 'org_67890',
      name: 'Pioneer Academy',
      adminEmail: 'hello@pioneer.in',
      phoneNo: '+91 9123456780',
      subscriptionType: 'ENTERPRISE',
      paymentStatus: 'OVERDUE',
      joinedAt: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
      invoices: {
        create: [
          {
            amount: 299.0,
            status: 'OVERDUE',
            billingPeriodStart: new Date(new Date().setDate(new Date().getDate() - 5)),
            billingPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 25)),
            dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
          }
        ]
      }
    }
  });

  const inst3 = await prisma.institute.create({
    data: {
      clerkOrgId: 'org_54321',
      name: 'Visionary Institute',
      adminEmail: 'billing@visionary.com',
      phoneNo: '+91 9988776655',
      subscriptionType: 'FREE',
      paymentStatus: 'PAID',
      joinedAt: new Date()
    }
  });

  // Create some students to show stats
  await prisma.student.createMany({
    data: Array.from({ length: 45 }).map((_, i) => ({
      name: `Student ${i}`,
      instituteId: i % 2 === 0 ? inst1.id : inst2.id
    }))
  });

  console.log("Seeding completed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

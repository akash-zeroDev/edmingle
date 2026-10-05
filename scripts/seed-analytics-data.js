import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Seeding live Audit Logs and Support Tickets...");

  const institutes = await prisma.institute.findMany();
  console.log(`Found ${institutes.length} institutes in database.`);

  const apex = institutes.find(i => i.name.includes("Apex"));
  const pioneer = institutes.find(i => i.name.includes("Pioneer"));
  const resonance = institutes.find(i => i.name.includes("Resonance"));
  const visionary = institutes.find(i => i.name.includes("Visionary"));
  const narayana = institutes.find(i => i.name.includes("Narayana"));

  // 1. Clean existing sample audit logs and tickets
  await prisma.auditLog.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  console.log("Cleaned old audit logs and support tickets.");

  // 2. Seed Chronological Audit Logs
  const auditLogs = [
    {
      actor: "Master Admin (system)",
      action: "CENTER_ONBOARDED",
      details: "Resonance Career Institute registered on Enterprise SaaS plan (Kota, Rajasthan).",
      severity: "INFO",
      targetId: resonance?.id,
      targetType: "Institute",
      createdAt: new Date("2026-03-01T09:30:00Z"),
    },
    {
      actor: "Master Admin (system)",
      action: "CENTER_ONBOARDED",
      details: "Pioneer Science Academy registered on Enterprise SaaS plan (Bengaluru, Karnataka).",
      severity: "INFO",
      targetId: pioneer?.id,
      targetType: "Institute",
      createdAt: new Date("2026-04-01T11:00:00Z"),
    },
    {
      actor: "Master Admin (system)",
      action: "CENTER_ONBOARDED",
      details: "Apex IIT-JEE & Medical Academy onboarded on Pro plan (Connaught Place, New Delhi).",
      severity: "INFO",
      targetId: apex?.id,
      targetType: "Institute",
      createdAt: new Date("2026-05-01T14:15:00Z"),
    },
    {
      actor: "Billing Automation",
      action: "INVOICE_GENERATED",
      details: "Invoice #INV-SEP-RES issued for ₹59,999 to Resonance Career Institute.",
      severity: "INFO",
      targetId: resonance?.id,
      targetType: "InstituteInvoice",
      createdAt: new Date("2026-09-01T00:05:00Z"),
    },
    {
      actor: "Payment Gateway",
      action: "PAYMENT_RECONCILED",
      details: "Payment of ₹59,999 received from Resonance Career Institute (Ref: TXN_982931).",
      severity: "INFO",
      targetId: resonance?.id,
      targetType: "InstituteInvoice",
      createdAt: new Date("2026-09-05T14:30:00Z"),
    },
    {
      actor: "Billing Automation",
      action: "BILLING_OVERDUE_SAFEGUARD",
      details: "Pioneer Science Academy invoice #INV-OCT-PIO (₹49,999) marked OVERDUE. Grace period expired.",
      severity: "WARNING",
      targetId: pioneer?.id,
      targetType: "InstituteInvoice",
      createdAt: new Date("2026-10-01T00:01:00Z"),
    },
    {
      actor: "Super Admin",
      action: "SECURITY_TELEMETRY",
      details: "Super Administrator authenticated via Clerk SSO from verified IP (macOS, Chrome 128).",
      severity: "INFO",
      targetId: null,
      targetType: "Security",
      createdAt: new Date("2026-10-01T07:15:00Z"),
    },
    {
      actor: "Super Admin",
      action: "STATUS_VERIFIED",
      details: "Platform safeguards audit executed: 7/7 active centers verified normal.",
      severity: "INFO",
      targetId: null,
      targetType: "Platform",
      createdAt: new Date("2026-10-01T09:45:00Z"),
    },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }
  console.log(`✅ Seeded ${auditLogs.length} audit log entries.`);

  // 3. Seed Realistic Support Tickets with Full Contact Info
  const tickets = [
    {
      title: "Fee receipt PDF download fails on mobile Safari browser",
      description: "When tapping 'Download Official Fee Receipt' from the student fee ledger tab on iOS Safari, the tab opens blank instead of generating the PDF invoice.",
      type: "BUG",
      severity: "HIGH",
      status: "OPEN",
      reporterName: "Aarav Sharma",
      reporterEmail: "aarav.sharma@studentmail.com",
      reporterPhone: "+91 98000 10000",
      reporterRole: "STUDENT",
      instituteId: apex?.id || null,
      createdAt: new Date("2026-10-01T08:30:00Z"),
    },
    {
      title: "Attendance multi-select lags on 40+ student batches",
      description: "Taking daily attendance for the Class 12 Karnataka CET batch experiences 200ms input delay per student toggle on larger rosters.",
      type: "BUG",
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      reporterName: "Prof. K. V. Sharma",
      reporterEmail: "prof.kvsharma@pioneer.in",
      reporterPhone: "+91 97111 88990",
      reporterRole: "TEACHER",
      instituteId: pioneer?.id || null,
      adminNotes: "Investigating React state batching and memoizing row components.",
      createdAt: new Date("2026-09-28T11:20:00Z"),
    },
    {
      title: "Need bulk WhatsApp automated reminder for monthly fees",
      description: "Parents frequently ask for WhatsApp payment links rather than SMS. Can we enable automated WhatsApp reminders 3 days before fee due dates?",
      type: "FEATURE_REQUEST",
      severity: "LOW",
      status: "OPEN",
      reporterName: "Manoj Agrawal",
      reporterEmail: "admissions@resonance-kota.com",
      reporterPhone: "+91 98290 12345",
      reporterRole: "INSTITUTE_ADMIN",
      instituteId: resonance?.id || null,
      createdAt: new Date("2026-09-25T16:45:00Z"),
    },
    {
      title: "Student Portal UI is very smooth! Loving the deep blue workspace",
      description: "Just wanted to share feedback that the new timetable and syllabus tracker are super helpful for tracking JEE revision milestones.",
      type: "FEEDBACK",
      severity: "LOW",
      status: "RESOLVED",
      reporterName: "Vivaan Mehta",
      reporterEmail: "vivaan.mehta@studentmail.com",
      reporterPhone: "+91 98200 10123",
      reporterRole: "STUDENT",
      instituteId: visionary?.id || null,
      adminNotes: "Thanked student via WhatsApp and logged positive feedback.",
      resolvedAt: new Date("2026-09-30T10:00:00Z"),
      createdAt: new Date("2026-09-29T14:10:00Z"),
    },
    {
      title: "Payment gateway confirmation delayed for Enterprise invoice",
      description: "Attempted to settle the September invoice via corporate netbanking. Receipt took 2 hours to update to PAID status in our dashboard.",
      type: "SUPPORT",
      severity: "CRITICAL",
      status: "RESOLVED",
      reporterName: "Dr. Preeti Nambiar",
      reporterEmail: "hello@pioneer.in",
      reporterPhone: "+91 91234 56780",
      reporterRole: "INSTITUTE_ADMIN",
      instituteId: pioneer?.id || null,
      adminNotes: "Webhook retry mechanism verified and reconciled with bank server.",
      resolvedAt: new Date("2026-09-20T18:00:00Z"),
      createdAt: new Date("2026-09-20T12:00:00Z"),
    },
    {
      title: "Option to attach PDF lecture notes to weekly timetable slots",
      description: "Teachers want to upload problem sheet PDFs directly to their scheduled lecture slots so students can download them before class.",
      type: "FEATURE_REQUEST",
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      reporterName: "Dr. Sunita Mehra",
      reporterEmail: "sunita.mehra@apex.com",
      reporterPhone: "+91 98333 44556",
      reporterRole: "TEACHER",
      instituteId: apex?.id || null,
      adminNotes: "Added to Q4 Batch Command Center roadmap.",
      createdAt: new Date("2026-09-22T09:15:00Z"),
    },
  ];

  for (const t of tickets) {
    await prisma.supportTicket.create({ data: t });
  }
  console.log(`✅ Seeded ${tickets.length} support tickets with verified contact info.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

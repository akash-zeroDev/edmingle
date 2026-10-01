import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleIndianNames = [
  "Aarav Sharma", "Ananya Gupta", "Vivaan Mehta", "Ishita Kapoor", "Arjun Nair",
  "Saanvi Rao", "Rohan Verma", "Priyansh Joshi", "Diya Patel", "Kabir Sen",
  "Aditi Deshmukh", "Shaurya Singh", "Meera Kulkarni", "Devansh Bhatia", "Rhea Pillai",
  "Dhruv Chawla", "Tara Srinivasan", "Aryan Saxena", "Navya Nambiar", "Yash Singhal",
  "Anushka Trivedi", "Kunal Goswami", "Tanvi Sengupta", "Samarth Kaushik", "Bhavya Agarwal",
  "Ritvik Chauhan", "Kavya Menon", "Aadi Sundaram", "Prisha Reddy", "Siddharth Jain",
  "Aayush Bhatt", "Sneha Mukherjee", "Madhav Tiwari", "Avani Iyer", "Harshvardhan Rao",
  "Anika Goel", "Manish Pandey", "Pooja Hegde", "Varun Chopra", "Simran Bhasin"
];

async function main() {
  console.log("🌱 Starting realistic platform database seed...");

  // 1. Fetch all existing institutes
  const existingInstitutes = await prisma.institute.findMany({
    include: { teachers: true, batches: true, students: true }
  });
  console.log(`Found ${existingInstitutes.length} existing institutes in database.`);

  // 2. Define our high-fidelity institutes template
  const instituteTemplates = [
    {
      name: "Apex IIT-JEE & Medical Academy",
      location: "Connaught Place, New Delhi",
      adminEmail: "admin@apex.com",
      phoneNo: "+91 98765 43210",
      subscriptionType: "PRO",
      paymentStatus: "PAID",
      invoiceAmount: 24999.0,
      teachers: [
        { name: "Dr. Arvind Raman", subjects: "Physics", phoneNo: "+91 98111 22334", salary: 125000 },
        { name: "Prof. Rajesh Kumar", subjects: "Mathematics", phoneNo: "+91 98222 33445", salary: 115000 },
        { name: "Dr. Sunita Mehra", subjects: "Chemistry", phoneNo: "+91 98333 44556", salary: 110000 },
        { name: "Anita Desai", subjects: "Biology", phoneNo: "+91 98444 55667", salary: 95000 },
      ],
      batches: [
        { className: "Class 12", subject: "Physics", batchName: "Class 12 - Target JEE 2026", timing: "Mon, Wed, Fri · 04:30 PM - 06:00 PM", teacherIdx: 0 },
        { className: "Class 12", subject: "Mathematics", batchName: "Class 12 - Advanced Calculus", timing: "Tue, Thu, Sat · 06:15 PM - 07:45 PM", teacherIdx: 1 },
        { className: "Class 11", subject: "Biology", batchName: "Class 11 - NEET Elite 2027", timing: "Mon, Wed, Fri · 03:00 PM - 04:30 PM", teacherIdx: 3 },
        { className: "Class 10", subject: "Chemistry", batchName: "Class 10 - Science Foundation", timing: "Sat, Sun · 10:00 AM - 12:00 PM", teacherIdx: 2 },
      ],
      studentCount: 28,
    },
    {
      name: "Pioneer Science Academy",
      location: "Koramangala, Bengaluru",
      adminEmail: "hello@pioneer.in",
      phoneNo: "+91 91234 56780",
      subscriptionType: "ENTERPRISE",
      paymentStatus: "OVERDUE",
      invoiceAmount: 49999.0,
      invoiceStatus: "OVERDUE",
      teachers: [
        { name: "Prof. K. V. Sharma", subjects: "Physics", phoneNo: "+91 97111 88990", salary: 130000 },
        { name: "Dr. Preeti Nambiar", subjects: "Chemistry", phoneNo: "+91 97222 77889", salary: 105000 },
        { name: "Anand Mohan", subjects: "Mathematics", phoneNo: "+91 97333 66778", salary: 100000 },
      ],
      batches: [
        { className: "Class 12", subject: "Physics", batchName: "Class 12 - Karnataka CET Batch", timing: "Mon, Thu · 05:00 PM - 07:00 PM", teacherIdx: 0 },
        { className: "Class 11", subject: "Physics", batchName: "Class 11 - Pre-University Physics", timing: "Tue, Fri · 04:00 PM - 06:00 PM", teacherIdx: 0 },
        { className: "Class 12", subject: "Chemistry", batchName: "Class 12 - Organic Chemistry Sprint", timing: "Wed, Sat · 04:30 PM - 06:30 PM", teacherIdx: 1 },
      ],
      studentCount: 22,
    },
    {
      name: "Visionary Learning Hub",
      location: "Andheri West, Mumbai",
      adminEmail: "billing@visionary.com",
      phoneNo: "+91 99887 76655",
      subscriptionType: "PRO",
      paymentStatus: "PAID",
      invoiceAmount: 19999.0,
      teachers: [
        { name: "Vikramaditya Deshmukh", subjects: "Mathematics", phoneNo: "+91 96111 33441", salary: 110000 },
        { name: "Ritu Singhania", subjects: "English & Reasoning", phoneNo: "+91 96222 44552", salary: 85000 },
      ],
      batches: [
        { className: "Class 11", subject: "Mathematics", batchName: "Class 11 - Applied Mathematics", timing: "Mon, Wed, Fri · 03:30 PM - 05:00 PM", teacherIdx: 0 },
        { className: "Class 12", subject: "Mathematics", batchName: "Class 12 - Board Toppers", timing: "Tue, Thu, Sat · 05:00 PM - 06:30 PM", teacherIdx: 0 },
      ],
      studentCount: 18,
    },
    {
      name: "Resonance Career Institute",
      location: "Vigyan Nagar, Kota",
      adminEmail: "admissions@resonance-kota.com",
      phoneNo: "+91 98290 12345",
      subscriptionType: "ENTERPRISE",
      paymentStatus: "PAID",
      invoiceAmount: 59999.0,
      teachers: [
        { name: "Manoj Agrawal", subjects: "Chemistry", phoneNo: "+91 98291 00112", salary: 150000 },
        { name: "Sanjeev Bansal", subjects: "Mathematics", phoneNo: "+91 98292 11223", salary: 145000 },
      ],
      batches: [
        { className: "Dropper", subject: "Chemistry", batchName: "Dropper Batch - JEE Rank Booster", timing: "Mon-Fri · 09:00 AM - 12:30 PM", teacherIdx: 0 },
        { className: "Class 11", subject: "Mathematics", batchName: "Class 11 - Olympiad Sprint", timing: "Mon-Fri · 02:00 PM - 04:30 PM", teacherIdx: 1 },
      ],
      studentCount: 30,
    },
    {
      name: "Narayana Coaching Academy",
      location: "Madhapur, Hyderabad",
      adminEmail: "contact@narayana-hyd.edu",
      phoneNo: "+91 94401 98765",
      subscriptionType: "PRO",
      paymentStatus: "PAID",
      invoiceAmount: 29999.0,
      teachers: [
        { name: "Dr. T. Ramamurthy", subjects: "Biology", phoneNo: "+91 94402 12345", salary: 120000 },
        { name: "Dr. S. K. Reddy", subjects: "Chemistry", phoneNo: "+91 94403 23456", salary: 110000 },
      ],
      batches: [
        { className: "Class 12", subject: "Biology", batchName: "Class 12 - NEET Fastrack", timing: "Mon, Wed, Fri · 08:00 AM - 10:30 AM", teacherIdx: 0 },
        { className: "Class 11", subject: "Chemistry", batchName: "Class 11 - Medical Foundation", timing: "Tue, Thu, Sat · 09:00 AM - 11:30 AM", teacherIdx: 1 },
      ],
      studentCount: 24,
    }
  ];

  // 3. Process each template
  for (let idx = 0; idx < instituteTemplates.length; idx++) {
    const tmpl = instituteTemplates[idx];
    
    // Find matching existing institute by adminEmail or name
    let institute = existingInstitutes.find(
      i => i.adminEmail.toLowerCase() === tmpl.adminEmail.toLowerCase() ||
           i.name.toLowerCase() === tmpl.name.toLowerCase() ||
           (tmpl.adminEmail === "admin@apex.com" && (i.name.includes("Apex") || i.name === "Apexxxxx")) ||
           (tmpl.adminEmail === "hello@pioneer.in" && i.name.includes("Pioneer")) ||
           (tmpl.adminEmail === "billing@visionary.com" && i.name.includes("Visionary"))
    );

    if (institute) {
      console.log(`Updating existing institute: ${institute.name} -> ${tmpl.name}`);
      institute = await prisma.institute.update({
        where: { id: institute.id },
        data: {
          name: tmpl.name,
          location: tmpl.location,
          phoneNo: tmpl.phoneNo,
          subscriptionType: tmpl.subscriptionType,
          paymentStatus: tmpl.paymentStatus,
          isActive: true,
        }
      });
    } else {
      console.log(`Creating new institute: ${tmpl.name}`);
      institute = await prisma.institute.create({
        data: {
          clerkOrgId: `org_seed_${idx + 1}_${Math.random().toString(36).substring(2, 8)}`,
          name: tmpl.name,
          location: tmpl.location,
          adminEmail: tmpl.adminEmail,
          phoneNo: tmpl.phoneNo,
          subscriptionType: tmpl.subscriptionType,
          paymentStatus: tmpl.paymentStatus,
          isActive: true,
          joinedAt: new Date(Date.now() - (idx + 1) * 15 * 86400000),
        }
      });
    }

    // 4. Ensure Institute has at least one Invoice
    const existingInvoices = await prisma.instituteInvoice.findMany({ where: { instituteId: institute.id } });
    if (existingInvoices.length === 0) {
      await prisma.instituteInvoice.create({
        data: {
          instituteId: institute.id,
          amount: tmpl.invoiceAmount,
          status: tmpl.invoiceStatus || "PAID",
          billingPeriodStart: new Date(Date.now() - 30 * 86400000),
          billingPeriodEnd: new Date(),
          dueDate: new Date(Date.now() + 5 * 86400000),
          paidAt: tmpl.invoiceStatus === "OVERDUE" ? null : new Date(),
        }
      });
    }

    // 5. Seed Teachers for this institute
    const createdTeachers = [];
    for (const t of tmpl.teachers) {
      let teacher = await prisma.teacher.findFirst({
        where: { instituteId: institute.id, name: t.name }
      });
      if (!teacher) {
        teacher = await prisma.teacher.create({
          data: {
            clerkUserId: `teacher_${institute.id.slice(-4)}_${Math.random().toString(36).substring(2, 9)}`,
            instituteId: institute.id,
            name: t.name,
            subjects: t.subjects,
            phoneNo: t.phoneNo,
            salary: t.salary,
            status: "ACTIVE",
          }
        });
      }
      createdTeachers.push(teacher);
    }
    console.log(`  Added ${createdTeachers.length} teachers to ${tmpl.name}`);

    // 6. Seed Batches
    const createdBatches = [];
    for (const b of tmpl.batches) {
      let batch = await prisma.batch.findFirst({
        where: { instituteId: institute.id, batchName: b.batchName }
      });
      const assignedTeacher = createdTeachers[b.teacherIdx] || createdTeachers[0];
      if (!batch) {
        batch = await prisma.batch.create({
          data: {
            instituteId: institute.id,
            batchName: b.batchName,
            className: b.className,
            subject: b.subject,
            timing: b.timing,
            teacherId: assignedTeacher ? assignedTeacher.id : null,
          }
        });
      }
      createdBatches.push(batch);
    }
    console.log(`  Added ${createdBatches.length} batches to ${tmpl.name}`);

    // 7. Seed Students & Enrollments
    const existingStudentCount = await prisma.student.count({ where: { instituteId: institute.id } });
    const studentsNeeded = Math.max(0, tmpl.studentCount - existingStudentCount);

    if (studentsNeeded > 0) {
      console.log(`  Adding ${studentsNeeded} students to ${tmpl.name}...`);
      for (let s = 0; s < studentsNeeded; s++) {
        const studentName = sampleIndianNames[(idx * 7 + s) % sampleIndianNames.length];
        const studentPhone = `+91 ${98000 + idx * 100 + s} ${10000 + s * 123}`;
        const parentPhone = `+91 ${98000 + idx * 100 + s} 00000`;
        const emailSlug = studentName.toLowerCase().replace(/[^a-z]/g, '.');

        const student = await prisma.student.create({
          data: {
            instituteId: institute.id,
            name: studentName,
            phoneNo: studentPhone,
            parentPhone: parentPhone,
            email: `${emailSlug}@studentmail.com`,
            status: "ACTIVE",
            joinedAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000),
          }
        });

        // Enroll in 1 or 2 batches
        if (createdBatches.length > 0) {
          const batchToEnroll = createdBatches[s % createdBatches.length];
          await prisma.batchEnrollment.create({
            data: {
              studentId: student.id,
              batchId: batchToEnroll.id,
            }
          });
        }

        // Add 1 or 2 Fee installments
        const feeStatus = s % 4 === 0 ? "OVERDUE" : (s % 3 === 0 ? "PENDING" : "PAID");
        await prisma.fee.create({
          data: {
            studentId: student.id,
            amountTotal: 40000.0,
            amountPaid: feeStatus === "PAID" ? 40000.0 : (feeStatus === "PENDING" ? 20000.0 : 0.0),
            dueDate: new Date(Date.now() + 15 * 86400000),
            status: feeStatus,
            paidAt: feeStatus === "PAID" ? new Date() : null,
          }
        });
      }
    }
  }

  // 8. Also enrich the user's active institute (e.g. named "A" or user institute)
  const userInstitute = existingInstitutes.find(
    i => i.name === "A" || i.adminEmail.includes("throwaway24u") || i.adminEmail.includes("programcoder")
  );

  if (userInstitute) {
    console.log(`Enriching user's test institute: ${userInstitute.name} (${userInstitute.adminEmail})...`);
    // Ensure it has teachers
    const userTeachers = await prisma.teacher.findMany({ where: { instituteId: userInstitute.id } });
    if (userTeachers.length === 0) {
      await prisma.teacher.createMany({
        data: [
          {
            clerkUserId: `teacher_user_1_${Date.now()}`,
            instituteId: userInstitute.id,
            name: "Dr. Arvind Raman",
            subjects: "Physics",
            phoneNo: "+91 98102 45601",
            salary: 120000,
            status: "ACTIVE",
          },
          {
            clerkUserId: `teacher_user_2_${Date.now()}`,
            instituteId: userInstitute.id,
            name: "Prof. Rajesh Kumar",
            subjects: "Mathematics",
            phoneNo: "+91 98102 45602",
            salary: 110000,
            status: "ACTIVE",
          }
        ]
      });
    }

    // Ensure it has batches
    const userBatches = await prisma.batch.findMany({ where: { instituteId: userInstitute.id } });
    if (userBatches.length === 0) {
      const refreshedTeachers = await prisma.teacher.findMany({ where: { instituteId: userInstitute.id } });
      await prisma.batch.createMany({
        data: [
          {
            instituteId: userInstitute.id,
            batchName: "Class 12 - Target JEE 2026",
            className: "Class 12",
            subject: "Physics",
            timing: "Mon, Wed, Fri · 04:30 PM - 06:00 PM",
            teacherId: refreshedTeachers[0]?.id || null,
          },
          {
            instituteId: userInstitute.id,
            batchName: "Class 11 - NEET Elite",
            className: "Class 11",
            subject: "Mathematics",
            timing: "Tue, Thu, Sat · 06:15 PM - 07:45 PM",
            teacherId: refreshedTeachers[1]?.id || null,
          }
        ]
      });
    }
  }

  console.log("✅ Platform seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

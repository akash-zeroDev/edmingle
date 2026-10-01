"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { dispatchNotice } from "@/lib/notifications"

export async function enrollStudent(data: {
  name: string;
  phoneNo?: string;
  parentPhone?: string;
  email?: string;
  address?: string;
  batchId?: string;
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const adminEmail = user.emailAddresses[0]?.emailAddress;

    const institute = await prisma.institute.findFirst({
      where: { adminEmail }
    });

    if (!institute) throw new Error("Institute not found");

    // Create the student
    const student = await prisma.student.create({
      data: {
        name: data.name,
        phoneNo: data.phoneNo,
        parentPhone: data.parentPhone,
        email: data.email,
        address: data.address,
        status: "ACTIVE",
        instituteId: institute.id,
      }
    });

    // Enroll in batch if provided
    if (data.batchId) {
      await prisma.batchEnrollment.create({
        data: {
          studentId: student.id,
          batchId: data.batchId
        }
      });
    }

    // Automatically send Clerk invitation if email is present
    if (data.email && data.email.trim()) {
      try {
        const client = await clerkClient();
        await client.invitations.createInvitation({
          emailAddress: data.email.trim(),
          publicMetadata: {
            role: "student",
            studentId: student.id,
            instituteId: institute.id,
          },
          ignoreExisting: true,
        });
      } catch (inviteErr) {
        console.warn("Clerk invitation dispatch non-blocking warning:", inviteErr);
      }
    }

    revalidatePath('/institute/students');
    revalidatePath('/institute');
    return { success: true, studentId: student.id };
  } catch (error: any) {
    console.error("Failed to enroll student:", error);
    return { error: error.message || "Failed to enroll student" };
  }
}

export async function suspendStudent(studentId: string, reason?: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const adminEmail = user.emailAddresses[0]?.emailAddress;

    const institute = await prisma.institute.findFirst({
      where: { adminEmail },
    });
    if (!institute) throw new Error("Institute not found");

    const student = await prisma.student.findUnique({
      where: { id: studentId, instituteId: institute.id },
      include: {
        batches: {
          include: {
            batch: true,
          },
        },
      },
    });

    if (!student) throw new Error("Student not found");

    // Update status to SUSPENDED
    await prisma.student.update({
      where: { id: studentId },
      data: { status: "SUSPENDED" },
    });

    const batchNames = student.batches.map(
      (b) => `${b.batch.className} (${b.batch.subject})`
    );

    // Dispatch SMS and Email notifications to student and parent
    await dispatchNotice({
      recipientName: student.name,
      recipientEmail: student.email,
      recipientPhone: student.phoneNo,
      parentPhone: student.parentPhone,
      instituteName: institute.name,
      action: "SUSPENDED",
      targetType: "STUDENT",
      reason: reason || "Administrative suspension",
      batchNames,
    });

    revalidatePath("/institute/students");
    revalidatePath("/institute");

    return {
      success: true,
      message: `Student suspended. Notice sent via SMS & Email to student and parents.`,
    };
  } catch (error: any) {
    console.error("Failed to suspend student:", error);
    return { error: error.message || "Failed to suspend student" };
  }
}

export async function reactivateStudent(studentId: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const adminEmail = user.emailAddresses[0]?.emailAddress;

    const institute = await prisma.institute.findFirst({
      where: { adminEmail },
    });
    if (!institute) throw new Error("Institute not found");

    const student = await prisma.student.findUnique({
      where: { id: studentId, instituteId: institute.id },
      include: {
        batches: {
          include: {
            batch: true,
          },
        },
      },
    });

    if (!student) throw new Error("Student not found");

    await prisma.student.update({
      where: { id: studentId },
      data: { status: "ACTIVE" },
    });

    const batchNames = student.batches.map(
      (b) => `${b.batch.className} (${b.batch.subject})`
    );

    await dispatchNotice({
      recipientName: student.name,
      recipientEmail: student.email,
      recipientPhone: student.phoneNo,
      parentPhone: student.parentPhone,
      instituteName: institute.name,
      action: "REACTIVATED",
      targetType: "STUDENT",
      reason: "Status restored to active.",
      batchNames,
    });

    revalidatePath("/institute/students");
    revalidatePath("/institute");

    return { success: true, message: `Student status restored to active.` };
  } catch (error: any) {
    console.error("Failed to reactivate student:", error);
    return { error: error.message || "Failed to reactivate student" };
  }
}

export async function removeStudent(studentId: string, reason?: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const adminEmail = user.emailAddresses[0]?.emailAddress;

    const institute = await prisma.institute.findFirst({
      where: { adminEmail },
    });
    if (!institute) throw new Error("Institute not found");

    const student = await prisma.student.findUnique({
      where: { id: studentId, instituteId: institute.id },
      include: {
        batches: {
          include: {
            batch: true,
          },
        },
      },
    });

    if (!student) throw new Error("Student not found");

    const batchNames = student.batches.map(
      (b) => `${b.batch.className} (${b.batch.subject})`
    );

    // Dispatch SMS and Email termination notice prior to deletion
    await dispatchNotice({
      recipientName: student.name,
      recipientEmail: student.email,
      recipientPhone: student.phoneNo,
      parentPhone: student.parentPhone,
      instituteName: institute.name,
      action: "REMOVED",
      targetType: "STUDENT",
      reason: reason || "Enrollment terminated by institute administration",
      batchNames,
    });

    // Delete related records and student
    await prisma.batchEnrollment.deleteMany({ where: { studentId } });
    await prisma.fee.deleteMany({ where: { studentId } });
    await prisma.attendance.deleteMany({ where: { studentId } });
    await prisma.student.delete({ where: { id: studentId } });

    revalidatePath("/institute/students");
    revalidatePath("/institute");

    return {
      success: true,
      message: `Student permanently removed. Termination notice sent via SMS & Email.`,
    };
  } catch (error: any) {
    console.error("Failed to remove student:", error);
    return { error: error.message || "Failed to remove student" };
  }
}

export async function resendStudentInvitation(studentId: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const adminEmail = user.emailAddresses[0]?.emailAddress;

    const institute = await prisma.institute.findFirst({
      where: { adminEmail },
    });
    if (!institute) throw new Error("Institute not found");

    const student = await prisma.student.findUnique({
      where: { id: studentId, instituteId: institute.id },
    });

    if (!student) throw new Error("Student not found");
    if (!student.email || !student.email.trim()) {
      return { error: "This student does not have an email address registered." };
    }

    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: student.email.trim(),
      publicMetadata: {
        role: "student",
        studentId: student.id,
        instituteId: institute.id,
      },
      ignoreExisting: true,
    });

    return {
      success: true,
      message: `Invitation email sent to ${student.email}. The student can use the link to activate their portal access.`,
    };
  } catch (error: any) {
    console.error("Failed to resend invitation:", error);
    return { error: error.message || "Failed to send invitation." };
  }
}

export async function getStudentPortalData() {
  try {
    const user = await currentUser();
    if (!user) return { error: "UNAUTHENTICATED" };

    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();

    // 1. Try finding student by existing clerkUserId
    let student = await prisma.student.findFirst({
      where: { clerkUserId: user.id },
      include: {
        institute: true,
        batches: {
          include: {
            batch: {
              include: {
                teacher: true,
              },
            },
          },
        },
        fees: {
          orderBy: { dueDate: "asc" },
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    // 2. If not found by clerkUserId, look up by publicMetadata.studentId or verified userEmail
    if (!student) {
      const studentIdFromMeta = user.publicMetadata?.studentId as string | undefined;

      const fallbackQuery: any = [];
      if (studentIdFromMeta) {
        fallbackQuery.push({ id: studentIdFromMeta });
      }
      if (userEmail) {
        fallbackQuery.push({ email: userEmail });
      }

      if (fallbackQuery.length > 0) {
        const matched = await prisma.student.findFirst({
          where: { OR: fallbackQuery },
          include: {
            institute: true,
            batches: {
              include: {
                batch: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
            fees: {
              orderBy: { dueDate: "asc" },
            },
            attendance: {
              orderBy: { date: "desc" },
              take: 30,
            },
          },
        });

        if (matched) {
          // Link this Clerk user to the student record
          await prisma.student.update({
            where: { id: matched.id },
            data: { clerkUserId: user.id },
          });
          student = { ...matched, clerkUserId: user.id };
        }
      }
    }

    if (!student) {
      return { error: "STUDENT_NOT_FOUND", userEmail };
    }

    if (student.status === "SUSPENDED") {
      return {
        error: "STUDENT_SUSPENDED",
        studentName: student.name,
        instituteName: student.institute.name,
      };
    }

    return {
      success: true,
      student,
      institute: student.institute,
      batches: student.batches.map((b) => b.batch),
      fees: student.fees,
      attendance: student.attendance,
    };
  } catch (err: any) {
    console.error("Error fetching student portal data:", err);
    return { error: err.message || "Failed to load student data." };
  }
}

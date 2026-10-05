"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { dispatchNotice } from "@/lib/notifications"
import { getAnnouncementsForStudent } from "@/actions/announcement"

export async function enrollStudent(data: {
  name: string;
  phoneNo?: string;
  parentPhone?: string;
  email?: string;
  address?: string;
  batchId?: string;
}) {
  try {
    const authData = await getAuthenticatedInstitute();
    if (!authData?.institute) throw new Error("Institute not found or unauthorized");
    const { institute, user } = authData;

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
    const authData = await getAuthenticatedInstitute();
    if (!authData?.institute) throw new Error("Institute not found or unauthorized");
    const { institute, user } = authData;

    const student = await prisma.student.findFirst({
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
    const authData = await getAuthenticatedInstitute();
    if (!authData?.institute) throw new Error("Institute not found or unauthorized");
    const { institute, user } = authData;

    const student = await prisma.student.findFirst({
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
    const authData = await getAuthenticatedInstitute();
    if (!authData?.institute) throw new Error("Institute not found or unauthorized");
    const { institute, user } = authData;

    const student = await prisma.student.findFirst({
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
    const authData = await getAuthenticatedInstitute();
    if (!authData?.institute) throw new Error("Institute not found or unauthorized");
    const { institute, user } = authData;

    const student = await prisma.student.findFirst({
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

export async function updateStudent(data: {
  studentId: string;
  name: string;
  phoneNo?: string | null;
  parentPhone?: string | null;
  email?: string | null;
  address?: string | null;
}) {
  try {
    const authData = await getAuthenticatedInstitute();
    if (!authData?.institute) throw new Error("Institute not found or unauthorized");
    const { institute } = authData;

    if (!data.studentId) {
      return { error: "Student ID is required." };
    }

    const cleanName = data.name?.trim();
    if (!cleanName) {
      return { error: "Student name is required." };
    }

    // Verify student belongs to this institute
    const existing = await prisma.student.findFirst({
      where: { id: data.studentId, instituteId: institute.id },
    });

    if (!existing) {
      return { error: "Student not found in your institute." };
    }

    const cleanPhone = data.phoneNo?.trim() || null;
    const cleanParentPhone = data.parentPhone?.trim() || null;
    const cleanEmail = data.email?.trim()?.toLowerCase() || null;
    const cleanAddress = data.address?.trim() || null;

    // Validate phone number format if provided
    if (cleanPhone) {
      const digitsOnly = cleanPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return { error: "Student phone number must contain at least 10 digits." };
      }

      // Check uniqueness among active students in the institute
      const last10 = digitsOnly.slice(-10);
      const duplicate = await prisma.student.findFirst({
        where: {
          instituteId: institute.id,
          id: { not: data.studentId },
          status: "ACTIVE",
          phoneNo: { contains: last10 },
        },
      });

      if (duplicate) {
        return {
          error: `Phone number is already associated with student "${duplicate.name}" in this institute.`,
        };
      }
    }

    // Validate parent phone format if provided
    if (cleanParentPhone) {
      const parentDigits = cleanParentPhone.replace(/\D/g, "");
      if (parentDigits.length < 10) {
        return { error: "Parent phone number must contain at least 10 digits." };
      }
    }

    // Validate email format if provided
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return { error: "Please enter a valid email address." };
      }
    }

    // Check if login identifier changed while account was claimed in Clerk
    const phoneChanged = cleanPhone !== existing.phoneNo;
    const emailChanged = cleanEmail !== existing.email;
    const shouldUnlinkClerk = (phoneChanged || emailChanged) && Boolean(existing.clerkUserId);

    if (shouldUnlinkClerk) {
      console.info(
        `[updateStudent] Unlinking clerkUserId ${existing.clerkUserId} for student ${existing.id} due to identifier change (phone/email).`
      );
    }

    // Perform database update
    const updated = await prisma.student.update({
      where: { id: data.studentId },
      data: {
        name: cleanName,
        phoneNo: cleanPhone,
        parentPhone: cleanParentPhone,
        email: cleanEmail,
        address: cleanAddress,
        ...(shouldUnlinkClerk ? { clerkUserId: null } : {}),
      },
      include: {
        batches: {
          include: {
            batch: true,
          },
        },
      },
    });

    revalidatePath("/institute/students");
    revalidatePath("/institute");

    return {
      success: true,
      student: updated,
      unlinkedClerk: shouldUnlinkClerk,
      message: shouldUnlinkClerk
        ? "Student details updated. Student will need to sign in with their new phone number / credentials."
        : "Student profile updated successfully.",
    };
  } catch (error: any) {
    console.error("Failed to update student:", error);
    return { error: error.message || "Failed to update student." };
  }
}

export async function getStudentPortalData() {
  try {
    const user = await currentUser();
    if (!user) return { error: "UNAUTHENTICATED" };

    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    const phoneList = user.phoneNumbers?.map((p: any) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || [];

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

    // 2. If not found by clerkUserId, look up by publicMetadata.studentId, verified userEmail, or verified phone
    if (!student) {
      const studentIdFromMeta = user.publicMetadata?.studentId as string | undefined;

      const fallbackQuery: any = [];
      if (studentIdFromMeta) {
        fallbackQuery.push({ id: studentIdFromMeta });
      }
      if (userEmail) {
        fallbackQuery.push({ email: userEmail });
      }
      phoneList.forEach((phone: string) => {
        const last10 = phone.slice(-10);
        if (last10.length >= 10) {
          fallbackQuery.push({ phoneNo: { contains: last10 } });
        }
      });

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

    const batchIds = student.batches.map((b) => b.batchId);
    const announcements = await getAnnouncementsForStudent(student.instituteId, batchIds);

    return {
      success: true,
      student,
      institute: student.institute,
      batches: student.batches.map((b) => b.batch),
      fees: student.fees,
      attendance: student.attendance,
      announcements,
    };
  } catch (err: any) {
    console.error("Error fetching student portal data:", err);
    return { error: err.message || "Failed to load student data." };
  }
}

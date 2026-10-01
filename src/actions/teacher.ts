"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { z } from "zod"
import { dispatchNotice } from "@/lib/notifications"

const teacherSchema = z.object({
  name: z.string().min(2, "Teacher name must be at least 2 characters."),
  phoneNo: z.string().optional(),
  address: z.string().optional(),
  salary: z.coerce.number().min(0, "Salary must be a positive number.").optional(),
  subjects: z.string().optional(),
})

export async function createTeacher(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" };
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return { error: "User email not found" };
    }

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email }
    });

    if (!institute) {
      return { error: "Institute not found" };
    }

    const name = formData.get("name") as string;
    const phoneNo = (formData.get("phoneNo") as string) || undefined;
    const address = (formData.get("address") as string) || undefined;
    const salaryRaw = formData.get("salary") as string;
    const salary = salaryRaw ? parseFloat(salaryRaw) : undefined;
    const subjects = (formData.get("subjects") as string) || undefined;

    const parsed = teacherSchema.safeParse({ name, phoneNo, address, salary, subjects });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    // Generate unique temporary clerkUserId identifier
    const tempClerkId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await prisma.teacher.create({
      data: {
        clerkUserId: tempClerkId,
        name: parsed.data.name,
        phoneNo: parsed.data.phoneNo,
        address: parsed.data.address,
        salary: parsed.data.salary,
        subjects: parsed.data.subjects,
        status: "ACTIVE",
        instituteId: institute.id,
      },
    });

    revalidatePath("/institute/teachers");
    revalidatePath("/institute");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to create teacher:", error);
    return { error: error.message || "Failed to create teacher" };
  }
}

export async function suspendTeacher(teacherId: string, reason?: string) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" };
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("User email not found");

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    });
    if (!institute) throw new Error("Institute not found");

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId, instituteId: institute.id },
      include: { batchesTaught: true },
    });
    if (!teacher) throw new Error("Teacher not found");

    await prisma.teacher.update({
      where: { id: teacherId },
      data: { status: "SUSPENDED" },
    });

    const batchNames = teacher.batchesTaught.map((b) => `${b.className} (${b.subject})`);

    // Dispatch SMS and Email notice to teacher
    await dispatchNotice({
      recipientName: teacher.name,
      recipientPhone: teacher.phoneNo,
      instituteName: institute.name,
      action: "SUSPENDED",
      targetType: "TEACHER",
      reason: reason || "Administrative suspension",
      batchNames,
    });

    revalidatePath("/institute/teachers");
    revalidatePath("/institute");

    return {
      success: true,
      message: `Teacher suspended. Notification sent via SMS & Email.`,
    };
  } catch (error: any) {
    console.error("Failed to suspend teacher:", error);
    return { error: error.message || "Failed to suspend teacher" };
  }
}

export async function reactivateTeacher(teacherId: string) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" };
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("User email not found");

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    });
    if (!institute) throw new Error("Institute not found");

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId, instituteId: institute.id },
      include: { batchesTaught: true },
    });
    if (!teacher) throw new Error("Teacher not found");

    await prisma.teacher.update({
      where: { id: teacherId },
      data: { status: "ACTIVE" },
    });

    const batchNames = teacher.batchesTaught.map((b) => `${b.className} (${b.subject})`);

    await dispatchNotice({
      recipientName: teacher.name,
      recipientPhone: teacher.phoneNo,
      instituteName: institute.name,
      action: "REACTIVATED",
      targetType: "TEACHER",
      reason: "Faculty status restored to active.",
      batchNames,
    });

    revalidatePath("/institute/teachers");
    revalidatePath("/institute");

    return { success: true, message: `Teacher status restored to active.` };
  } catch (error: any) {
    console.error("Failed to reactivate teacher:", error);
    return { error: error.message || "Failed to reactivate teacher" };
  }
}

export async function removeTeacher(teacherId: string, reason?: string) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return { error: "Unauthorized" };
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("User email not found");

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    });
    if (!institute) throw new Error("Institute not found");

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId, instituteId: institute.id },
      include: { batchesTaught: true },
    });
    if (!teacher) throw new Error("Teacher not found");

    const batchNames = teacher.batchesTaught.map((b) => `${b.className} (${b.subject})`);

    // Dispatch SMS and Email notice prior to removal
    await dispatchNotice({
      recipientName: teacher.name,
      recipientPhone: teacher.phoneNo,
      instituteName: institute.name,
      action: "REMOVED",
      targetType: "TEACHER",
      reason: reason || "Faculty tenure terminated by institute administration",
      batchNames,
    });

    // Unassign all batches from this teacher
    await prisma.batch.updateMany({
      where: { teacherId },
      data: { teacherId: null },
    });

    // Delete teacher
    await prisma.teacher.delete({
      where: { id: teacherId },
    });

    revalidatePath("/institute/teachers");
    revalidatePath("/institute");

    return {
      success: true,
      message: `Teacher permanently removed. Termination notice sent via SMS & Email.`,
    };
  } catch (error: any) {
    console.error("Failed to remove teacher:", error);
    return { error: error.message || "Failed to remove teacher" };
  }
}

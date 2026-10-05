"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"

export async function toggleInstituteStatus(instituteId: string, isActive: boolean, reason?: string) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== "superadmin") {
      throw new Error("Unauthorized");
    }

    // Using raw SQL to bypass Prisma Client caching issues during dev mode
    await prisma.$executeRaw`UPDATE "Institute" SET "isActive" = ${isActive} WHERE id = ${instituteId}`;

    // Also update via Prisma Client
    try {
      await prisma.institute.update({
        where: { id: instituteId },
        data: { isActive },
      });
    } catch {
      // Continue even if Prisma cached schema differs
    }

    // Log to AuditLog
    const inst = await prisma.institute.findUnique({ where: { id: instituteId }, select: { name: true } });
    const reasonText = reason ? ` Reason: ${reason}` : "";
    await prisma.auditLog.create({
      data: {
        actor: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Super Admin",
        action: "INSTITUTE_STATUS_TOGGLED",
        details: `${inst?.name || "Institute"} access ${isActive ? "unblocked (ACTIVE)" : "blocked (SUSPENDED)"}.${reasonText}`,
        severity: isActive ? "INFO" : "WARNING",
        targetId: instituteId,
        targetType: "Institute",
      }
    });

    revalidatePath('/admin/institutes');
    revalidatePath('/admin/analytics');
    revalidatePath('/admin');
    revalidatePath('/institute', 'layout');
    revalidatePath('/teacher', 'layout');
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle institute status:", error);
    throw error;
  }
}

export async function impersonateInstitute(instituteId: string) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== "superadmin") {
      throw new Error("Unauthorized: Only Super Administrators can impersonate institutes.");
    }

    const inst = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: { id: true, name: true, adminEmail: true },
    });
    if (!inst) throw new Error("Institute not found");

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("impersonated_institute_id", instituteId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    await prisma.auditLog.create({
      data: {
        actor: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Super Admin",
        action: "ADMIN_IMPERSONATION_STARTED",
        details: `Super Admin started impersonation session for ${inst.name} (${inst.adminEmail}).`,
        severity: "WARNING",
        targetId: instituteId,
        targetType: "Institute",
      },
    });

    revalidatePath("/institute", "layout");
    return { success: true, instituteName: inst.name };
  } catch (error) {
    console.error("Failed to impersonate institute:", error);
    throw error;
  }
}

export async function stopImpersonating() {
  try {
    const user = await currentUser();
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const currentId = cookieStore.get("impersonated_institute_id")?.value;
    cookieStore.delete("impersonated_institute_id");

    if (currentId) {
      await prisma.auditLog.create({
        data: {
          actor: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Super Admin",
          action: "ADMIN_IMPERSONATION_ENDED",
          details: `Super Admin ended impersonation session (${currentId}).`,
          severity: "INFO",
          targetId: currentId,
          targetType: "Institute",
        },
      });
    }

    revalidatePath("/institute", "layout");
    revalidatePath("/admin/institutes");
    return { success: true };
  } catch (error) {
    console.error("Failed to stop impersonating:", error);
    throw error;
  }
}



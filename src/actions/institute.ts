"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"

export async function toggleInstituteStatus(instituteId: string, isActive: boolean) {
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== "superadmin") {
      throw new Error("Unauthorized");
    }

    // Using raw SQL to bypass Prisma Client caching issues during dev mode
    // (If the dev server hasn't been restarted, Prisma Client doesn't know about isActive)
    await prisma.$executeRaw`UPDATE "Institute" SET "isActive" = ${isActive} WHERE id = ${instituteId}`;

    revalidatePath('/admin/institutes');
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle institute status:", error);
    throw error;
  }
}

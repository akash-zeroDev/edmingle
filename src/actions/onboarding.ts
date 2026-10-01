"use server"

import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const onboardingSchema = z.object({
  name: z.string().min(2, "Institute name must be at least 2 characters."),
  phoneNo: z.string().min(10, "Please enter a valid phone number."),
  location: z.string().min(2, "Please enter a location."),
});

export async function completeOnboarding(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const phoneNo = formData.get("phoneNo") as string;
  const location = formData.get("location") as string;

  const parsed = onboardingSchema.safeParse({ name, phoneNo, location });
  
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress || "";

    // 1. Create Clerk Organization
    const organization = await client.organizations.createOrganization({
      name: parsed.data.name,
      createdBy: userId,
    });

    // 2. Update user's public metadata so we know they completed onboarding
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "institute_admin",
        onboarded: true,
      }
    });

    // 3. Create the Institute in Prisma
    await prisma.institute.create({
      data: {
        clerkOrgId: organization.id,
        name: parsed.data.name,
        phoneNo: parsed.data.phoneNo,
        location: parsed.data.location,
        adminEmail: email,
        subscriptionType: "FREE",
        paymentStatus: "PAID",
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return { error: err.message || "Something went wrong during onboarding." };
  }
}

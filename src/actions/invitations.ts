"use server"

import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function sendInstituteInvite(formData: FormData) {
  const email = formData.get("email");

  const parsed = inviteSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const client = await clerkClient();
    
    await client.invitations.createInvitation({
      emailAddress: parsed.data.email,
      publicMetadata: {
        role: "institute_admin",
      },
      ignoreExisting: true,
    });
    
    return { success: true };
  } catch (err: any) {
    console.error("Error sending invite:", err);
    return { error: err.message || "Failed to send invitation. Please try again." };
  }
}

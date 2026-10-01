import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "institute_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const institute = await prisma.institute.findFirst({
      where: { adminEmail: email },
    });

    if (!institute) {
      return NextResponse.json({ error: "Institute not found" }, { status: 404 });
    }

    const teachers = await prisma.teacher.findMany({
      where: { instituteId: institute.id },
      include: {
        batchesTaught: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

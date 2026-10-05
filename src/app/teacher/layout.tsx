import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { requireRoleAuth } from "@/lib/auth-guard"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforce Teacher access: Students redirect to /student, Institute Admins to /institute
  const { user } = await requireRoleAuth(["teacher", "superadmin"])

  const emailList = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
  const clerkUserId = user.id
  const phoneList = user.phoneNumbers?.map((p) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

  // Query real teacher or institute
  const teacher = await prisma.teacher.findFirst({
    where: {
      OR: [
        { clerkUserId },
        ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
        ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
      ],
    },
    include: {
      institute: true,
    },
  })

  let institute = teacher?.institute || null
  if (!institute && emailList.length > 0) {
    institute = await prisma.institute.findFirst({
      where: { adminEmail: { in: emailList } },
    })
  }

  let isActuallyActive = true
  if (institute) {
    const rawData: any[] = await prisma.$queryRaw`SELECT "isActive" FROM "Institute" WHERE id = ${institute.id}`
    isActuallyActive = rawData.length > 0 ? Boolean(rawData[0].isActive) : Boolean(institute.isActive)
  }

  const instituteName = institute?.name || "Coaching Academy"
  const clerkName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username
  const teacherName = teacher?.name || clerkName || (emailList[0] ? emailList[0].split("@")[0] : "Faculty Lead")

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Persistent Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block w-64">
        <AppSidebar
          mode="teacher"
          instituteName={instituteName}
          adminName={teacherName}
          isBlocked={!isActuallyActive}
        />
      </div>

      {/* Main Workspace Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        <TopBar
          title={isActuallyActive ? "Faculty Workspace" : "Access Suspended"}
          subtitle={isActuallyActive ? teacherName : "Organization Blocked"}
          instituteName={instituteName}
          mode="teacher"
        />

        <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto min-w-0 flex flex-col">
          {!isActuallyActive ? (
            <div className="flex-1 flex items-center justify-center p-8 min-h-[60vh]">
              <div className="max-w-md w-full bg-card rounded-2xl shadow-sm border border-red-200 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-red-600">⚠</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Organization Suspended</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Access for {instituteName} has been temporarily locked by the platform super administrator. Faculty operations and batch schedules are paused.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center justify-center h-10 px-6 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-medium text-sm transition-colors w-full cursor-pointer"
                >
                  Return to Home
                </a>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}


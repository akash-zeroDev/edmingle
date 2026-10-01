import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import prisma from "@/lib/prisma"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"

export default async function InstituteLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  
  if (!user || user.publicMetadata?.role !== "institute_admin") {
    redirect("/"); 
  }

  const email = user.emailAddresses[0]?.emailAddress;
  
  // Find their institute
  const institute = await prisma.institute.findFirst({
    where: { adminEmail: email }
  });

  if (!institute) {
    redirect("/onboarding");
  }

  // Fetch isActive status
  const rawData: any[] = await prisma.$queryRaw`SELECT "isActive" FROM "Institute" WHERE id = ${institute.id}`;
  const isActuallyActive = rawData.length > 0 ? rawData[0].isActive : true;

  const adminName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Administrator";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Persistent Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block w-64">
        <AppSidebar
          mode="institute"
          instituteName={institute.name}
          adminName={adminName}
          isBlocked={!isActuallyActive}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <TopBar
          title="Institute Dashboard"
          subtitle="Overview"
          instituteName={institute.name}
          mode="institute"
        />

        <main className="flex-1">
          {!isActuallyActive ? (
            <div className="flex-1 flex items-center justify-center p-8 min-h-[70vh]">
              <div className="max-w-md w-full bg-card rounded-2xl shadow-sm border border-red-200 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Account Suspended</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your access to Edmingle has been temporarily suspended due to pending platform fees. Please clear your dues to restore full access.
                </p>
                <a
                  href="/institute/settings"
                  className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors w-full"
                >
                  Go to Settings & Billing
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

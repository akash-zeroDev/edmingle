import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  
  if (user?.publicMetadata?.role !== "superadmin") {
    redirect("/"); 
  }

  const adminName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Master Admin";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Persistent Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block w-64">
        <AppSidebar
          mode="admin"
          adminName={adminName}
          instituteName="Edmingle Platform"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <TopBar
          title="Super Admin Portal"
          subtitle="Platform Overview"
          instituteName="Edmingle Platform"
          mode="admin"
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

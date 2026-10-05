import { requireRoleAuth } from "@/lib/auth-guard"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Enforce Superadmin-only access. Non-superadmin users are redirected to their own role dashboard.
  const { user } = await requireRoleAuth(["superadmin"])

  const adminName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Master Admin"

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Persistent Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block w-64">
        <AppSidebar
          mode="admin"
          adminName={adminName}
          instituteName="Classly Platform"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <TopBar
          title="Super Admin Portal"
          subtitle="Platform Overview"
          instituteName="Classly Platform"
          mode="admin"
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

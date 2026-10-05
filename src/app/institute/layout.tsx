import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ShieldAlert, Mail } from "lucide-react"
import prisma from "@/lib/prisma"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { requireRoleAuth } from "@/lib/auth-guard"
import { ImpersonationBanner } from "./components/impersonation-banner"

export default async function InstituteLayout({ children }: { children: React.ReactNode }) {
  // Enforce Institute Admin access. Teachers redirect to /teacher, Students to /student, Superadmin without impersonation to /admin.
  const { user, role } = await requireRoleAuth(["institute_admin"], { allowImpersonation: true });

  const authData = await getAuthenticatedInstitute();
  if (!authData?.institute) {
    if (role === "superadmin") {
      redirect("/admin/institutes");
    }
    redirect("/onboarding");
  }

  const { institute, isImpersonating } = authData;

  // Fetch isActive status directly from DB
  const rawData: any[] = await prisma.$queryRaw`SELECT "isActive" FROM "Institute" WHERE id = ${institute.id}`;
  const isActuallyActive = rawData.length > 0 ? Boolean(rawData[0].isActive) : Boolean(institute.isActive);

  const adminName = isImpersonating
    ? `${user.firstName || "Admin"} (Viewing ${institute.name})`
    : user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Administrator";

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
        {isImpersonating && (
          <ImpersonationBanner
            instituteName={institute.name}
            adminEmail={institute.adminEmail}
          />
        )}

        <TopBar
          title={isActuallyActive ? "Institute Dashboard" : "Account Suspended"}
          subtitle={isActuallyActive ? (isImpersonating ? "Super Admin Impersonation" : "Overview") : "Access Blocked"}
          instituteName={institute.name}
          mode="institute"
        />

        <main className="flex-1">
          {!isActuallyActive ? (
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 min-h-[75vh]">
              <div className="max-w-lg w-full bg-card rounded-2xl shadow-sm border border-border text-left overflow-hidden">
                {/* Subtle top indicator bar */}
                <div className="h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 w-full" />

                <div className="p-6 sm:p-7 space-y-5">
                  {/* Status Header */}
                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <ShieldAlert className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 mb-1.5">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        Account Suspended
                      </div>
                      <h2 className="text-lg font-bold text-foreground tracking-tight">
                        Institute Access Locked
                      </h2>
                    </div>
                  </div>

                  {/* Explanation Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Access for <strong className="text-foreground font-semibold">{institute.name}</strong> has been temporarily placed on administrative hold by the platform super administrator. All student enrollment, batch operations, fee collection, and faculty dashboards are currently locked for this organization.
                  </p>

                  {/* Metadata Specs Bar */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                        Organization
                      </span>
                      <span className="font-medium text-foreground truncate block mt-0.5">
                        {institute.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                        Status Code
                      </span>
                      <span className="font-mono text-[11px] text-rose-600 font-semibold block mt-0.5">
                        ADMIN_SUSPENDED
                      </span>
                    </div>
                  </div>

                  {/* Contact Support Team Panel (Replaces clumsy buttons) */}
                  <div className="pt-4 border-t border-border flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-foreground">Contact support</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        To reactivate your institute account, contact support:
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3">
                        <a
                          href={`mailto:support@classly.com?subject=Reactivation%20Request%20for%20${encodeURIComponent(institute.name)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline hover:text-primary-hover"
                        >
                          <Mail className="size-3.5" />
                          <span>support@classly.com</span>
                        </a>
                        <span className="text-[11px] text-muted-foreground">
                          ID: <code className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">{institute.id.slice(0, 10)}</code>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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

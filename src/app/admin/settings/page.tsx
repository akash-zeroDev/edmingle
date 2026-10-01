import { currentUser } from "@clerk/nextjs/server"
import { Settings, Shield, Bell, Key, Database } from "lucide-react"

export default async function AdminSettingsPage() {
  const user = await currentUser()
  const adminEmail = user?.emailAddresses[0]?.emailAddress || "master@edmingle.com"

  return (
    <div className="max-w-[1500px] w-full p-4 md:p-8 space-y-6">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Platform Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Global configuration for authentication, billing gateways, and platform security.
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Master Account Configuration */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Shield className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Super Admin Security & Access
              </h3>
              <p className="text-xs text-muted-foreground">
                Authenticated session for Master Admin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl border border-border bg-muted/20">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                Active Master Email
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {adminEmail}
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-muted/20">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                Access Level
              </span>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                Full Root Privileges (Superadmin)
              </p>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Database className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Database Cluster
              </h3>
              <p className="text-xs text-muted-foreground">
                Managed Neon PostgreSQL instance connection
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Neon Serverless Postgres (Prisma ORM)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Connected
            </span>
          </div>
        </div>

        {/* Communication & Broadcasts */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Bell className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Platform Notifications Dispatch
              </h3>
              <p className="text-xs text-muted-foreground">
                System broadcasts, automated suspension alerts, and SMS delivery
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Automated Suspension Notices & Invoices
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

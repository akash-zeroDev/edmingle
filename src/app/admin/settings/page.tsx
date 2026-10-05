import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSuperAdminSettings } from "@/actions/settings"
import { AdminSettingsView } from "./components/admin-settings-view"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminSettingsPage() {
  const user = await currentUser()
  if (!user || user?.publicMetadata?.role !== "superadmin") {
    redirect("/")
  }

  const adminEmail = user.emailAddresses[0]?.emailAddress || "master@classly.com"
  const settings = await getSuperAdminSettings()

  return <AdminSettingsView initialSettings={settings} adminEmail={adminEmail} />
}

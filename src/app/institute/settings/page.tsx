import { getInstituteSettings } from "@/actions/settings"
import { InstituteSettingsView } from "./components/institute-settings-view"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function InstituteSettingsPage() {
  try {
    const settings = await getInstituteSettings()
    return <InstituteSettingsView initialSettings={settings} />
  } catch (error) {
    redirect("/institute")
  }
}

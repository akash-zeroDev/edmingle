import { getTeacherPortalData } from "@/actions/teacher"
import { TeacherPortalWorkspace } from "./components/teacher-portal-workspace"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TeacherDashboardPage() {
  const portalData = await getTeacherPortalData()

  return <TeacherPortalWorkspace portalData={portalData} />
}

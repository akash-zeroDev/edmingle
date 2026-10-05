import { cookies } from "next/headers"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function getAuthenticatedInstitute() {
  const user = await currentUser()
  if (!user) return null

  // Check if superadmin is currently impersonating an institute
  if (user.publicMetadata?.role === "superadmin") {
    const cookieStore = await cookies()
    const impersonatedId = cookieStore.get("impersonated_institute_id")?.value
    if (impersonatedId) {
      const institute = await prisma.institute.findUnique({
        where: { id: impersonatedId },
      })
      if (institute) {
        return { institute, user, isImpersonating: true }
      }
    }
  }

  // Normal resolution via email matching
  const emailList = user.emailAddresses?.map((e) => e.emailAddress) || []
  const primaryEmail = user.emailAddresses[0]?.emailAddress

  const institute = await prisma.institute.findFirst({
    where: {
      OR: [
        ...(primaryEmail ? [{ adminEmail: primaryEmail }] : []),
        ...(emailList.length > 0 ? [{ adminEmail: { in: emailList } }] : []),
      ],
    },
  })

  if (!institute) return null

  return { institute, user, isImpersonating: false }
}

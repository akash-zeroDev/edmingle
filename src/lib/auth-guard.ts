import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export type UserRole = "superadmin" | "institute_admin" | "teacher" | "student"

/**
 * Normalizes any role string into a strict UserRole type
 */
export function normalizeRole(rawRole?: unknown): UserRole | null {
  if (typeof rawRole !== "string") return null
  const r = rawRole.trim().toLowerCase()
  if (r === "superadmin" || r === "super_admin") return "superadmin"
  if (r === "institute_admin" || r === "admin" || r === "instituteadmin") return "institute_admin"
  if (r === "teacher" || r === "faculty") return "teacher"
  if (r === "student") return "student"
  return null
}

/**
 * Returns the primary authorized route for a given user role
 */
export function getRoleHomeRoute(role: UserRole | null): string {
  switch (role) {
    case "superadmin":
      return "/admin"
    case "institute_admin":
      return "/institute"
    case "teacher":
      return "/teacher"
    case "student":
      return "/student"
    default:
      return "/"
  }
}

/**
 * Resolves the authenticated user's role from Clerk publicMetadata.
 * If missing from metadata, performs database auto-discovery and backfills Clerk metadata.
 */
export async function resolveUserRole(user: any): Promise<UserRole | null> {
  if (!user) return null

  // 1. Direct check in Clerk publicMetadata
  const metaRole = normalizeRole(user.publicMetadata?.role)
  if (metaRole) {
    return metaRole
  }

  // 2. Database Fallback Resolution (for legacy accounts or direct sign-ins)
  const emailList = user.emailAddresses?.map((e: any) => e.emailAddress.toLowerCase()) || []
  const primaryEmail = emailList[0] || ""
  const clerkUserId = user.id

  let resolvedRole: UserRole | null = null

  // Check Superadmin match
  if (
    primaryEmail === "master@edmingle.com" ||
    primaryEmail === "master@classly.com" ||
    primaryEmail === "programcoder.ak@gmail.com"
  ) {
    resolvedRole = "superadmin"
  }

  // Check Institute Admin match
  if (!resolvedRole && emailList.length > 0) {
    const inst = await prisma.institute.findFirst({
      where: { adminEmail: { in: emailList } },
      select: { id: true },
    })
    if (inst) {
      resolvedRole = "institute_admin"
    }
  }

  // Check Teacher match
  if (!resolvedRole) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { clerkUserId },
          ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
        ],
      },
      select: { id: true, instituteId: true },
    })
    if (teacher) {
      resolvedRole = "teacher"
    }
  }

  // Check Student match
  if (!resolvedRole) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { clerkUserId },
          ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
        ],
      },
      select: { id: true, instituteId: true },
    })
    if (student) {
      resolvedRole = "student"
    }
  }

  // 3. Backfill Clerk publicMetadata so subsequent checks are immediate
  if (resolvedRole) {
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          role: resolvedRole,
        },
      })
    } catch (err) {
      console.warn("Non-fatal: failed to backfill Clerk publicMetadata role:", err)
    }
  }

  return resolvedRole
}

/**
 * Enforces strict role-based access for App Router layouts and pages.
 * If user is not logged in -> redirects to "/"
 * If user has a different role -> redirects directly to their authorized home route!
 */
export async function requireRoleAuth(
  allowedRoles: UserRole[],
  options?: { allowImpersonation?: boolean }
) {
  const user = await currentUser()
  if (!user) {
    redirect("/")
  }

  const role = await resolveUserRole(user)

  // If user has no role, send to onboarding or root
  if (!role) {
    redirect("/onboarding")
  }

  // If role is authorized, grant access
  if (allowedRoles.includes(role)) {
    return { user, role }
  }

  // If superadmin is visiting institute layout with impersonation enabled
  if (role === "superadmin" && options?.allowImpersonation && allowedRoles.includes("institute_admin")) {
    return { user, role }
  }

  // CROSS-ROLE ACCESS DENIED: Redirect to user's own authorized dashboard
  const destination = getRoleHomeRoute(role)
  redirect(destination)
}

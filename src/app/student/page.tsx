import { getStudentPortalData } from "@/actions/student"
import { StudentPortalWorkspace } from "./components/student-portal-workspace"
import { ShieldAlert, UserX, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function StudentDashboard() {
  const result = await getStudentPortalData()

  // 1. Student Enrollment is Suspended
  if (result.error === "STUDENT_SUSPENDED") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-xs">
          <div className="size-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-[#15171b] mb-2">
            Account suspended
          </h2>
          <p className="text-xs text-[#5e6b63] leading-relaxed mb-6">
            Your access to <strong>{result.instituteName || "your institute"}</strong> has been suspended. Please contact your institute administrator.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="size-3.5 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  // 2. Student is Not Enrolled (e.g. Admin testing or unlinked user)
  if (result.error === "STUDENT_NOT_FOUND" || !result.student) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950">
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>Preview mode</span>
            </div>
            <p className="text-blue-900/80">
              Your account ({result.userEmail || "current user"}) is not linked to an enrolled student record. Showing preview mode.
            </p>
          </div>
          <Link
            href="/institute/students"
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors cursor-pointer text-xs"
          >
            Manage students
          </Link>
        </div>

        <StudentPortalWorkspace
          student={{
            name: "Aarav Sharma",
            phoneNo: "+91 98102 45631",
            email: result.userEmail || "student@example.com",
            id: "std_preview_2026",
          }}
          institute={{
            name: "Apex IIT-JEE & Medical Academy",
            location: "Connaught Place, New Delhi",
          }}
          batches={[]}
          fees={[]}
          attendance={[]}
          isPreview={true}
        />
      </div>
    )
  }

  // 3. Authenticated Active Student
  return (
    <StudentPortalWorkspace
      student={result.student}
      institute={result.institute}
      batches={result.batches || []}
      fees={result.fees || []}
      attendance={result.attendance || []}
      announcements={result.announcements || []}
      isPreview={false}
    />
  )
}

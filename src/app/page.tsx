import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const user = await currentUser();
    const role = user?.publicMetadata?.role;

    if (role === "student") {
      redirect("/student");
    } else if (role === "teacher") {
      redirect("/teacher");
    } else if (role === "institute_admin") {
      redirect("/institute");
    } else if (role === "superadmin") {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Classly</h1>
        <p className="text-gray-500">Coaching institute management</p>
        
        <div className="pt-4">
          {!userId ? (
            <div className="flex gap-4 justify-center">
              <SignInButton mode="modal">
                <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-white text-black border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <UserButton />
              </div>
              <p className="text-sm text-gray-600">Signed in</p>
              
              <div className="grid gap-2 text-left pt-4">
                <Link href="/admin" className="block p-3 rounded-lg border hover:bg-gray-50 transition">
                  <span className="font-semibold block">Platform Admin</span>
                  <span className="text-xs text-gray-500">Platform management</span>
                </Link>
                <Link href="/institute" className="block p-3 rounded-lg border hover:bg-gray-50 transition">
                  <span className="font-semibold block">Institute</span>
                  <span className="text-xs text-gray-500">Institute dashboard</span>
                </Link>
                <Link href="/teacher" className="block p-3 rounded-lg border hover:bg-gray-50 transition">
                  <span className="font-semibold block">Faculty Portal</span>
                  <span className="text-xs text-gray-500">Attendance, batches & payroll</span>
                </Link>
                <Link href="/student" className="block p-3 rounded-lg border hover:bg-gray-50 transition">
                  <span className="font-semibold block">Student</span>
                  <span className="text-xs text-gray-500">View schedules & fees</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

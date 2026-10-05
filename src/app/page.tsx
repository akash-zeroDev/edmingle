import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { resolveUserRole, getRoleHomeRoute } from "@/lib/auth-guard";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    const role = await resolveUserRole(user);
    if (role) {
      redirect(getRoleHomeRoute(role));
    } else {
      redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Classly</h1>
        <p className="text-gray-500">Coaching institute management</p>
        
        <div className="pt-4">
          <div className="flex gap-4 justify-center">
            <SignInButton mode="modal">
              <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-white text-black border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </div>
  );
}

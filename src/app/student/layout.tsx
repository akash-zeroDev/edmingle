import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { GraduationCap, ArrowLeft, BookOpen, Calendar, IndianRupee, Megaphone } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  const studentName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Student"

  const userEmail = user.emailAddresses[0]?.emailAddress || ""

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground flex flex-col">
      {/* Student Portal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#e7e9ed] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs group-hover:bg-primary-hover transition-colors">
                <GraduationCap className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground tracking-tight">
                  Edmingle
                </span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider -mt-0.5">
                  Student Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-900 font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{studentName}</span>
            </div>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9 rounded-xl ring-2 ring-primary/20",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e7e9ed] bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Edmingle. All student records securely encrypted.</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Powered by Classly Learning Engine</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

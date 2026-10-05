import Link from "next/link"
import { Compass, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#e7e9ed] shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-light text-primary mb-5">
          <Compass className="size-7" />
        </div>

        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 mb-3">
          404 · Page Not Found
        </span>

        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          We couldn't find that page
        </h1>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <Button asChild size="sm" className="h-9 px-4 text-xs bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xs">
            <Link href="/">
              <Home className="size-3.5 mr-1.5" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

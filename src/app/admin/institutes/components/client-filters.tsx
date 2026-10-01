"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect, useRef } from "react"
import { useDebounce } from "use-debounce"

export function ClientFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [debouncedQuery] = useDebounce(query, 300)
  
  // Keep track of initial mount to prevent fetching on first render if empty
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedQuery) {
      params.set("q", debouncedQuery)
    } else {
      params.delete("q")
    }

    // Only replace if the q param actually changed
    if (searchParams.get("q") !== (debouncedQuery || null)) {
      startTransition(() => {
        router.replace(`?${params.toString()}`)
      })
    }
  }, [debouncedQuery])

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#a0a4ac]">
          <Search className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search institutes by name or email..." 
          className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-[#e7e9ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        />
        {isPending && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <select 
          className="px-3 py-2 text-[13px] font-medium bg-white border border-[#e7e9ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-[#42454c] shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          value={searchParams.get("status") || "ALL"}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams.toString())
            if (e.target.value !== "ALL") {
              params.set("status", e.target.value)
            } else {
              params.delete("status")
            }
            startTransition(() => {
              router.replace(`?${params.toString()}`)
            })
          }}
        >
          <option value="ALL">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
    </div>
  )
}

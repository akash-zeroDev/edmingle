"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Layers3,
  BookOpen,
  Clock,
  UserSquare2,
  Users,
  Trash2,
  GraduationCap,
  Sparkles,
} from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTableCard } from "@/components/ui/data-table-card"
import { deleteBatch } from "@/actions/batch"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export interface BatchItem {
  id: string
  className: string
  batchName?: string | null
  subject: string
  timing: string | null
  teacherId: string | null
  teacher?: {
    id: string
    name: string
    phoneNo?: string | null
    subjects?: string | null
  } | null
  _count?: {
    students: number
  }
}

export function BatchesTable({ batches }: { batches: BatchItem[] }) {
  const router = useRouter()
  const [batchList, setBatchList] = useState<BatchItem[]>(batches)
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<BatchItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const filtered = batchList.filter((b) => {
    const q = search.toLowerCase()
    return (
      b.className.toLowerCase().includes(q) ||
      (b.batchName && b.batchName.toLowerCase().includes(q)) ||
      b.subject.toLowerCase().includes(q) ||
      (b.teacher?.name && b.teacher.name.toLowerCase().includes(q)) ||
      (b.timing && b.timing.toLowerCase().includes(q))
    )
  })

  const totalStudentsEnrolled = batchList.reduce(
    (acc, curr) => acc + (curr._count?.students || 0),
    0
  )
  const batchesWithFaculty = batchList.filter((b) => Boolean(b.teacherId)).length

  const handleDelete = async () => {
    if (!deleteDialog) return
    setIsDeleting(true)
    try {
      const res = await deleteBatch(deleteDialog.id)
      if (res?.error) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: res.error,
        })
      } else {
        toast({
          title: "Batch Deleted",
          description: res.message,
        })
        setBatchList((prev) => prev.filter((b) => b.id !== deleteDialog.id))
        setDeleteDialog(null)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Overview Strip using Common KpiCard Component */}
      <KpiGrid className="grid-cols-1 sm:grid-cols-3">
        <KpiCard
          title="Total Batches"
          value={batchList.length}
          subtitle="Active batches"
          icon={Layers3}
        />
        <KpiCard
          title="Assigned Teachers"
          value={batchesWithFaculty}
          subValue={`/ ${batchList.length}`}
          subtitle="Batches with a teacher"
          icon={UserSquare2}
        />
        <KpiCard
          title="Total Students"
          value={totalStudentsEnrolled}
          subtitle="Students across all batches"
          icon={Users}
        />
      </KpiGrid>

      {/* Filter Toolbar using Common SearchBar Component */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by batch, class, subject, or teacher..."
        totalCount={batchList.length}
        filteredCount={filtered.length}
        countLabel="batches"
      />

      {/* Batches Table using Common DataTableCard Component */}
      <DataTableCard
        title="All Batches"
      >
        <Table className="w-full table-fixed border-collapse">
          <TableHeader className="bg-[#fafafa]">
            <TableRow>
              <TableHead className="w-[22%] h-9 px-3 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Batch
              </TableHead>
              <TableHead className="w-[12%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Class
              </TableHead>
              <TableHead className="w-[14%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Subject
              </TableHead>
              <TableHead className="w-[15%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Timing
              </TableHead>
              <TableHead className="w-[16%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Teacher
              </TableHead>
              <TableHead className="w-[12%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Students
              </TableHead>
              <TableHead className="w-[9%] h-9 px-3 text-right text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center border-b border-[#f0f1f3]">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <Layers3 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#1a201c]">No batches found</div>
                  <div className="text-[12px] text-[#5e6b63] mt-1">
                    {search ? "No batches match your search." : "Add your first batch to get started."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((batch) => {
                const studentCount = batch._count?.students || 0
                const displayName = batch.batchName || batch.className

                return (
                  <TableRow
                    key={batch.id}
                    onClick={() => router.push(`/institute/batches/${batch.id}`)}
                    className="hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                  >
                    <TableCell className="px-3 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6.5 shrink-0 flex items-center justify-center rounded-lg text-[10px] font-bold bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Layers3 className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#24262c] group-hover:text-primary transition-colors truncate">
                            {displayName}
                          </div>
                          {batch.batchName && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {batch.className}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] border-b border-[#f0f1f3]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-semibold whitespace-nowrap">
                        <GraduationCap className="size-2.5 text-slate-500" />
                        {batch.className}
                      </span>
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] border-b border-[#f0f1f3]">
                      <span className="inline-block truncate max-w-full px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold" title={batch.subject}>
                        {batch.subject}
                      </span>
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {batch.timing ? (
                        <div className="flex items-center gap-1 text-foreground font-medium truncate">
                          <Clock className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{batch.timing}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic whitespace-nowrap">Flexible</span>
                      )}
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {batch.teacher ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="size-5 shrink-0 rounded-full bg-primary-light flex items-center justify-center text-[9px] font-bold text-primary">
                            {batch.teacher.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground truncate">{batch.teacher.name}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                          Unassigned
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <div className="flex items-center gap-1 text-foreground font-medium whitespace-nowrap">
                        <Users className="size-3 text-muted-foreground" />
                        <span>{studentCount}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-2.5 text-right border-b border-[#f0f1f3]">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteDialog(batch)
                          }}
                          className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg focus:outline-none focus-visible:outline-none cursor-pointer"
                          aria-label="Delete batch"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </DataTableCard>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl border border-border">
          <DialogHeader>
            <div className="size-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Delete Batch?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete <strong>{deleteDialog?.batchName ? `${deleteDialog.className} - ${deleteDialog.batchName}` : deleteDialog?.className}</strong> ({deleteDialog?.subject})? This will unenroll all students assigned to this batch.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteDialog(null)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDelete}
              className="text-xs h-9 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

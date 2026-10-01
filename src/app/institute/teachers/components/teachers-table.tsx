"use client"

import { useState, useEffect } from "react"
import {
  Search,
  UserSquare2,
  Phone,
  MapPin,
  BookOpen,
  IndianRupee,
  X,
  Calendar,
  Layers,
  AlertTriangle,
  UserX,
  CheckCircle2,
} from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"
import { suspendTeacher, reactivateTeacher, removeTeacher } from "@/actions/teacher"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTableCard } from "@/components/ui/data-table-card"

export interface TeacherWithBatches {
  id: string
  clerkUserId: string
  name: string
  address: string | null
  phoneNo: string | null
  salary: number | null
  subjects: string | null
  status?: string | null
  batchesTaught?: Array<{
    id: string
    className: string
    subject: string
    timing: string | null
  }>
}

export function TeachersTable({ teachers }: { teachers: TeacherWithBatches[] }) {
  const [teacherList, setTeacherList] = useState<TeacherWithBatches[]>(teachers)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithBatches | null>(null)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    actionType: "SUSPEND" | "REMOVE"
  }>({
    open: false,
    actionType: "SUSPEND",
  })

  useEffect(() => {
    setTeacherList(teachers)
  }, [teachers])

  const filteredTeachers = teacherList.filter((t) => {
    const query = search.toLowerCase()
    return (
      t.name.toLowerCase().includes(query) ||
      (t.phoneNo && t.phoneNo.toLowerCase().includes(query)) ||
      (t.subjects && t.subjects.toLowerCase().includes(query))
    )
  })

  const handleSuspend = async (reason: string) => {
    if (!selectedTeacher) return
    const res = await suspendTeacher(selectedTeacher.id, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Action failed", description: res.error })
    } else {
      toast({ title: "Teacher Suspended", description: res.message })
      setSelectedTeacher((prev) => (prev ? { ...prev, status: "SUSPENDED" } : null))
      setTeacherList((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? { ...t, status: "SUSPENDED" } : t))
      )
    }
  }

  const handleReactivate = async () => {
    if (!selectedTeacher) return
    const res = await reactivateTeacher(selectedTeacher.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Action failed", description: res.error })
    } else {
      toast({ title: "Teacher Reactivated", description: res.message })
      setSelectedTeacher((prev) => (prev ? { ...prev, status: "ACTIVE" } : null))
      setTeacherList((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? { ...t, status: "ACTIVE" } : t))
      )
    }
  }

  const handleRemove = async (reason: string) => {
    if (!selectedTeacher) return
    const targetId = selectedTeacher.id
    const res = await removeTeacher(targetId, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Action failed", description: res.error })
    } else {
      toast({ title: "Teacher Removed", description: res.message })
      setSelectedTeacher(null)
      setTeacherList((prev) => prev.filter((t) => t.id !== targetId))
    }
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search teachers by name, subject, or phone..."
          countLabel={`${filteredTeachers.length} of ${teacherList.length} teachers`}
        />
      </div>

      {/* Teachers Directory Card & Table */}
      <DataTableCard
        title="Faculty Directory"
        subtitle={`${filteredTeachers.length} ${filteredTeachers.length === 1 ? "teacher" : "teachers"} registered`}
      >
        <Table className="w-full border-collapse">
          <TableHeader className="bg-[#fafafa]">
            <TableRow>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Teacher Name
              </TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Status
              </TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Subjects Taught
              </TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Assigned Batches
              </TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Contact Number
              </TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Monthly Salary
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center border-b border-[#f0f1f3]">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <UserSquare2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#1a201c]">No teachers found</div>
                  <div className="text-[12px] text-[#5e6b63] mt-1">
                    {search ? "No faculty members match your search criteria." : "Start by adding your first teacher above."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map((teacher) => {
                const subjectList = teacher.subjects
                  ? teacher.subjects.split(",").map((s) => s.trim()).filter(Boolean)
                  : []

                const batchCount = teacher.batchesTaught?.length || 0
                const isSuspended = teacher.status === "SUSPENDED"

                return (
                  <TableRow
                    key={teacher.id}
                    onClick={() => setSelectedTeacher(teacher)}
                    className="hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                  >
                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-[32px] h-[32px] flex items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                            isSuspended
                              ? "bg-amber-100 text-amber-700"
                              : "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white"
                          }`}
                        >
                          {teacher.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#24262c] group-hover:text-primary transition-colors">
                            {teacher.name}
                          </div>
                          {teacher.address && (
                            <div className="text-[10px] text-[#8b9a90] truncate max-w-[160px]">
                              {teacher.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] border-b border-[#f0f1f3]">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isSuspended ? "Suspended" : "Active"}
                      </span>
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {subjectList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {subjectList.map((subject, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#a1b0a6]">—</span>
                      )}
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {batchCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#374151] text-[11px] font-semibold">
                          <Layers className="w-3 h-3 text-[#6b7280]" />
                          {batchCount} {batchCount === 1 ? "Batch" : "Batches"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8b9a90] italic">None assigned</span>
                      )}
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {teacher.phoneNo || <span className="text-[#a1b0a6]">N/A</span>}
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] text-[#1a201c] font-bold border-b border-[#f0f1f3]">
                      {teacher.salary ? `₹${teacher.salary.toLocaleString()}` : <span className="text-[#a1b0a6] font-normal">—</span>}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </DataTableCard>

      {/* Teacher Profile Sidecard */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent showCloseButton={false} className="sm:max-w-[480px] bg-white p-0 overflow-y-auto border-l border-[#e3e8e5]">
          {selectedTeacher && (
            <div className="flex flex-col min-h-full">
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white relative">
                <SheetClose render={<button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors outline-none focus:outline-none focus-visible:outline-none cursor-pointer"><X className="w-5 h-5" /></button>} />
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary text-white font-bold text-2xl mb-4 shadow-md">
                  {selectedTeacher.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{selectedTeacher.name}</h2>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedTeacher.status === "SUSPENDED"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {selectedTeacher.status === "SUSPENDED" ? "Suspended" : "Active"}
                  </span>
                </div>
                <div className="text-sm text-slate-300 flex items-center gap-2">
                  <UserSquare2 className="w-4 h-4 text-primary-light" />
                  Faculty Member
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-[#e3e8e5] bg-[#f8faf9]">
                    <div className="text-[10px] text-[#5e6b63] font-medium uppercase tracking-wider mb-1">Monthly Salary</div>
                    <div className="text-lg font-bold text-[#1a201c]">
                      {selectedTeacher.salary ? `₹${selectedTeacher.salary.toLocaleString()}` : "Not set"}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#e3e8e5] bg-[#f8faf9]">
                    <div className="text-[10px] text-[#5e6b63] font-medium uppercase tracking-wider mb-1">Classes Assigned</div>
                    <div className="text-lg font-bold text-primary">
                      {selectedTeacher.batchesTaught?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#1a201c] uppercase tracking-wider mb-3 border-b border-[#e3e8e5] pb-2">
                    Contact Details
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#e3e8e5] bg-white">
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#5e6b63] uppercase font-semibold">Phone</div>
                        <div className="text-[13px] font-medium text-[#1a201c]">{selectedTeacher.phoneNo || "Not provided"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#e3e8e5] bg-white">
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#5e6b63] uppercase font-semibold">Address</div>
                        <div className="text-[13px] font-medium text-[#1a201c]">{selectedTeacher.address || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#1a201c] uppercase tracking-wider mb-3 border-b border-[#e3e8e5] pb-2">
                    Specialized Subjects
                  </h3>
                  {selectedTeacher.subjects ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTeacher.subjects.split(",").map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8b9a90] italic">No subjects specified.</p>
                  )}
                </div>

                {/* Batches Taught */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#1a201c] uppercase tracking-wider mb-3 border-b border-[#e3e8e5] pb-2">
                    Assigned Batches
                  </h3>
                  {selectedTeacher.batchesTaught && selectedTeacher.batchesTaught.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTeacher.batchesTaught.map((batch) => (
                        <div key={batch.id} className="p-3 rounded-xl border border-[#e3e8e5] bg-white flex justify-between items-center">
                          <div>
                            <div className="text-xs font-bold text-[#1a201c]">{batch.className} - {batch.subject}</div>
                            {batch.timing && (
                              <div className="text-[11px] text-[#5e6b63] flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-[#8b9a90]" />
                                {batch.timing}
                              </div>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-[#e3e8e5] text-center text-xs text-[#8b9a90]">
                      No active batches currently assigned to this teacher.
                    </div>
                  )}
                </div>

                {/* Administrative Controls (Suspend / Remove) */}
                <div className="pt-4 border-t border-[#e3e8e5]">
                  <h3 className="text-[11px] font-bold text-[#1a201c] uppercase tracking-wider mb-3">
                    Administrative Controls
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {selectedTeacher.status === "SUSPENDED" ? (
                      <Button
                        type="button"
                        onClick={handleReactivate}
                        className="w-full h-10 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Reactivate Faculty Status
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setActionDialog({ open: true, actionType: "SUSPEND" })}
                        variant="outline"
                        className="w-full h-10 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-semibold"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
                        Suspend Faculty Member
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={() => setActionDialog({ open: true, actionType: "REMOVE" })}
                      variant="outline"
                      className="w-full h-10 border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold"
                    >
                      <UserX className="w-4 h-4 mr-2 text-red-600" />
                      Remove Faculty Member
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog with Reason for Suspend / Remove */}
      {selectedTeacher && (
        <ConfirmActionDialog
          open={actionDialog.open}
          onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
          actionType={actionDialog.actionType}
          title={
            actionDialog.actionType === "SUSPEND"
              ? `Suspend ${selectedTeacher.name}`
              : `Remove ${selectedTeacher.name}`
          }
          description={
            actionDialog.actionType === "SUSPEND"
              ? "Temporarily suspend this faculty member from teaching. You can enter an optional reason below."
              : "Permanently delete this faculty member from your institute records and unassign all their batches."
          }
          actionLabel={
            actionDialog.actionType === "SUSPEND" ? "Confirm Suspension" : "Permanently Remove"
          }
          targetName={selectedTeacher.name}
          targetRole="Faculty Member"
          onConfirm={actionDialog.actionType === "SUSPEND" ? handleSuspend : handleRemove}
        />
      )}
    </>
  )
}

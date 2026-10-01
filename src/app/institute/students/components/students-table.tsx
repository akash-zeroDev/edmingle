"use client"

import { useState, useEffect } from "react"
import { Users, X, Phone, Mail, GraduationCap, MapPin, Search, AlertTriangle, UserX, CheckCircle2, Send, KeyRound } from "lucide-react"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"
import { suspendStudent, reactivateStudent, removeStudent, resendStudentInvitation } from "@/actions/student"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTableCard } from "@/components/ui/data-table-card"

export function StudentsTable({ students }: { students: any[] }) {
  const [studentList, setStudentList] = useState(students)
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  // Dialog state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    actionType: "SUSPEND" | "REMOVE"
  }>({
    open: false,
    actionType: "SUSPEND",
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setStudentList(students)
  }, [students])

  const filteredStudents = studentList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phoneNo && s.phoneNo.includes(search))
  )

  const handleSuspend = async (reason: string) => {
    if (!selectedStudent) return
    const res = await suspendStudent(selectedStudent.id, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Action failed", description: res.error })
    } else {
      toast({ title: "Student Suspended", description: res.message })
      setSelectedStudent((prev: any) => (prev ? { ...prev, status: "SUSPENDED" } : null))
      setStudentList((prev: any[]) =>
        prev.map((s) => (s.id === selectedStudent.id ? { ...s, status: "SUSPENDED" } : s))
      )
    }
  }

  const handleReactivate = async () => {
    if (!selectedStudent) return
    const res = await reactivateStudent(selectedStudent.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Action failed", description: res.error })
    } else {
      toast({ title: "Student Reactivated", description: res.message })
      setSelectedStudent((prev: any) => (prev ? { ...prev, status: "ACTIVE" } : null))
      setStudentList((prev: any[]) =>
        prev.map((s) => (s.id === selectedStudent.id ? { ...s, status: "ACTIVE" } : s))
      )
    }
  }

  const handleRemove = async (reason: string) => {
    if (!selectedStudent) return
    const targetId = selectedStudent.id
    const res = await removeStudent(targetId, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Action failed", description: res.error })
    } else {
      toast({ title: "Student Removed", description: res.message })
      setSelectedStudent(null)
      setStudentList((prev: any[]) => prev.filter((s) => s.id !== targetId))
    }
  }

  const [isSendingInvite, setIsSendingInvite] = useState(false)

  const handleResendInvite = async () => {
    if (!selectedStudent) return
    setIsSendingInvite(true)
    const res = await resendStudentInvitation(selectedStudent.id)
    setIsSendingInvite(false)
    if (res.error) {
      toast({ variant: "destructive", title: "Invitation Failed", description: res.error })
    } else {
      toast({ title: "Invitation Sent", description: res.message })
    }
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search students by name or phone..."
          countLabel={`${filteredStudents.length} of ${studentList.length} students`}
        />
      </div>

      {/* Registered Students Card & Table */}
      <DataTableCard
        title="Registered Students"
        subtitle={`${filteredStudents.length} ${filteredStudents.length === 1 ? "student" : "students"} registered`}
      >
        <Table className="w-full border-collapse">
          <TableHeader className="bg-[#fafafa]">
            <TableRow>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Student</TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Status</TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Portal Access</TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Joined Date</TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Enrolled Batches</TableHead>
              <TableHead className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center border-b border-[#f0f1f3]">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#1a201c]">No students found</div>
                  <div className="text-[12px] text-[#5e6b63] mt-1">Start by enrolling a new student.</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const uniqueBatches = Array.from(
                  new Set(student.batches?.map((b: any) => b.batch?.className).filter(Boolean))
                )
                const isSuspended = student.status === "SUSPENDED"

                return (
                  <TableRow
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                  >
                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-[26px] h-[26px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? "bg-amber-100 text-amber-700"
                              : "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white"
                          } transition-colors`}
                        >
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#24262c] group-hover:text-primary transition-colors">
                          {student.name}
                        </span>
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

                    <TableCell className="h-[58px] px-5 text-[11px] border-b border-[#f0f1f3]">
                      {student.clerkUserId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Portal Active
                        </span>
                      ) : student.email ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-primary border border-blue-200">
                          <Mail className="size-3 text-primary" />
                          Invited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          No Email
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {isClient && student.joinedAt
                        ? new Date(student.joinedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {uniqueBatches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {uniqueBatches.map((b: any, i: number) => (
                            <span key={i} className="inline-flex px-2 py-0.5 rounded bg-[#f3f4f6] text-[#374151] text-[10px] font-medium">
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {student.phoneNo || "N/A"}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </DataTableCard>

      {/* Student Profile Sidecard */}
      <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <SheetContent showCloseButton={false} className="sm:max-w-[480px] bg-white p-0 overflow-y-auto border-l border-[#e3e8e5]">
          {selectedStudent && (
            <div className="flex flex-col min-h-full">
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white relative">
                <SheetClose render={<button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors outline-none focus:outline-none focus-visible:outline-none cursor-pointer"><X className="w-5 h-5" /></button>} />
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary text-white font-bold text-2xl mb-4 shadow-md">
                  {selectedStudent.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedStudent.status === "SUSPENDED"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {selectedStudent.status === "SUSPENDED" ? "Suspended" : "Active"}
                  </span>
                </div>
                <div className="text-sm text-slate-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary-light" />
                  Student Profile
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1">
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
                        <div className="text-[10px] text-[#5e6b63] uppercase font-semibold">Student Phone</div>
                        <div className="text-[13px] font-medium text-[#1a201c]">{selectedStudent.phoneNo || "Not provided"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#e3e8e5] bg-white">
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#5e6b63] uppercase font-semibold">Parent Phone</div>
                        <div className="text-[13px] font-medium text-[#1a201c]">{selectedStudent.parentPhone || "Not provided"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#e3e8e5] bg-white">
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#5e6b63] uppercase font-semibold">Email</div>
                        <div className="text-[13px] font-medium text-[#1a201c]">{selectedStudent.email || "Not provided"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#e3e8e5] bg-white">
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#5e6b63] uppercase font-semibold">Address</div>
                        <div className="text-[13px] font-medium text-[#1a201c]">{selectedStudent.address || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portal Access & Invitation Management */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#1a201c] uppercase tracking-wider mb-3 border-b border-[#e3e8e5] pb-2">
                    Student Portal Access
                  </h3>
                  <div className="p-3.5 rounded-xl border border-[#e3e8e5] bg-[#f8fafc] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1a201c]">
                        <KeyRound className="size-4 text-primary" />
                        <span>Account Status</span>
                      </div>
                      {selectedStudent.clerkUserId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="size-3" />
                          Portal Active
                        </span>
                      ) : selectedStudent.email ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <Mail className="size-3" />
                          Invite Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700">
                          Offline (No Email)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5e6b63]">
                      {selectedStudent.clerkUserId
                        ? "This student has activated their portal account and can view schedules, fees, and announcements."
                        : selectedStudent.email
                        ? `An invitation email was sent to ${selectedStudent.email}. They can activate their portal access via the link.`
                        : "No email address registered. Add an email to enable Student Portal access."}
                    </p>
                    {selectedStudent.email && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSendingInvite}
                        onClick={handleResendInvite}
                        className="w-full h-9 border-blue-200 text-primary bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-semibold cursor-pointer shadow-none"
                      >
                        <Send className="size-3.5 mr-1.5" />
                        {isSendingInvite ? "Sending..." : "Resend Activation Invitation"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Enrolled Batches */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#1a201c] uppercase tracking-wider mb-3 border-b border-[#e3e8e5] pb-2">
                    Enrolled Batches
                  </h3>
                  <div className="space-y-2">
                    {selectedStudent.batches && selectedStudent.batches.length > 0 ? (
                      selectedStudent.batches.map((b: any) => (
                        <div key={b.id} className="p-3 rounded-xl border border-[#e3e8e5] bg-white flex justify-between items-center">
                          <div>
                            <div className="text-xs font-bold text-[#1a201c]">{b.batch?.className}</div>
                            <div className="text-[11px] text-[#5e6b63]">{b.batch?.subject}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Enrolled
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#8b9a90] italic p-3 rounded-xl border border-dashed border-[#e3e8e5] bg-[#f8faf9]">
                        Not enrolled in any batches yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Administration Actions (Suspend / Remove) */}
                <div className="pt-4 border-t border-[#e3e8e5]">
                  <h3 className="text-[11px] font-bold text-[#1a201c] uppercase tracking-wider mb-3">
                    Administrative Controls
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {selectedStudent.status === "SUSPENDED" ? (
                      <Button
                        type="button"
                        onClick={handleReactivate}
                        className="w-full h-10 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Reactivate Student Enrollment
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setActionDialog({ open: true, actionType: "SUSPEND" })}
                        variant="outline"
                        className="w-full h-10 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-semibold"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
                        Suspend Student
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={() => setActionDialog({ open: true, actionType: "REMOVE" })}
                      variant="outline"
                      className="w-full h-10 border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold"
                    >
                      <UserX className="w-4 h-4 mr-2 text-red-600" />
                      Remove Student Permanently
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog with Reason for Suspend / Remove */}
      {selectedStudent && (
        <ConfirmActionDialog
          open={actionDialog.open}
          onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
          actionType={actionDialog.actionType}
          title={
            actionDialog.actionType === "SUSPEND"
              ? `Suspend ${selectedStudent.name}`
              : `Remove ${selectedStudent.name}`
          }
          description={
            actionDialog.actionType === "SUSPEND"
              ? "Temporarily suspend this student from all enrolled batches. You can enter an optional reason below."
              : "Permanently delete this student record and cancel all their batch enrollments and fee schedules."
          }
          actionLabel={
            actionDialog.actionType === "SUSPEND" ? "Confirm Suspension" : "Permanently Remove"
          }
          targetName={selectedStudent.name}
          targetRole="Student"
          onConfirm={actionDialog.actionType === "SUSPEND" ? handleSuspend : handleRemove}
        />
      )}
    </>
  )
}

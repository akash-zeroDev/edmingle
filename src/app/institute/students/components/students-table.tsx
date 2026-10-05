"use client"

import { useState, useEffect } from "react"
import { Users, Mail, CheckCircle2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTableCard } from "@/components/ui/data-table-card"
import { EntityProfileHost, useEntityProfile } from "@/components/entity-profile"
import { EditStudentDialog } from "@/components/entity-profile/edit-student-dialog"

export function StudentsTable({ students }: { students: any[] }) {
  const [studentList, setStudentList] = useState(students)
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [search, setSearch] = useState("")
  const { selected, expanded, openProfile, closeProfile, setExpanded } = useEntityProfile()

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
        title="All students"
      >
        <Table className="w-full table-fixed border-collapse">
          <TableHeader className="bg-[#fafafa]">
            <TableRow>
              <TableHead className="w-[22%] h-9 px-3 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Student</TableHead>
              <TableHead className="w-[11%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Status</TableHead>
              <TableHead className="w-[14%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Account</TableHead>
              <TableHead className="w-[13%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Joined Date</TableHead>
              <TableHead className="w-[18%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Enrolled Batches</TableHead>
              <TableHead className="w-[13%] h-9 px-3 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Phone</TableHead>
              <TableHead className="w-[9%] h-9 px-3 text-right text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center border-b border-[#f0f1f3]">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#1a201c]">No students found</div>
                  <div className="text-[12px] text-[#5e6b63] mt-1">Add a student to get started.</div>
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
                    onClick={() => openProfile("student", student.id)}
                    className="hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                  >
                    <TableCell className="px-3 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`size-6.5 shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? "bg-amber-100 text-amber-700"
                              : "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white"
                          } transition-colors`}
                        >
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#24262c] group-hover:text-primary transition-colors truncate">
                          {student.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] border-b border-[#f0f1f3]">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          isSuspended
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isSuspended ? "Suspended" : "Active"}
                      </span>
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] border-b border-[#f0f1f3]">
                      {student.clerkUserId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Active
                        </span>
                      ) : student.email ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-primary border border-blue-200 whitespace-nowrap">
                          <Mail className="size-3 text-primary" />
                          Invited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 whitespace-nowrap">
                          No email
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3] whitespace-nowrap">
                      {isClient && student.joinedAt
                        ? new Date(student.joinedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {uniqueBatches.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                          {uniqueBatches.map((b: any, i: number) => (
                            <span key={i} className="inline-block truncate max-w-full px-1.5 py-0.5 rounded bg-[#f3f4f6] text-[#374151] text-[10px] font-medium" title={b}>
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3] truncate">
                      {student.phoneNo || "N/A"}
                    </TableCell>

                    <TableCell className="px-3 py-2.5 text-right border-b border-[#f0f1f3]" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStudent(student)}
                        className="h-7 px-2 text-[11px] font-semibold text-slate-600 hover:text-primary hover:bg-primary-light/50 rounded-lg cursor-pointer inline-flex items-center gap-1"
                      >
                        <Pencil className="size-3" />
                        <span>Edit</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </DataTableCard>

      <EntityProfileHost
        selected={selected}
        expanded={expanded}
        onClose={closeProfile}
        onExpandedChange={setExpanded}
        students={studentList}
        onStudentUpdated={(updated) => {
          setStudentList((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
        }}
        onStudentRemoved={(id) => {
          setStudentList((prev) => prev.filter((s) => s.id !== id))
        }}
      />

      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          open={Boolean(editingStudent)}
          onOpenChange={(open) => !open && setEditingStudent(null)}
          onSaved={(updated) => {
            setStudentList((prev) =>
              prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
            )
          }}
        />
      )}
    </>
  )
}

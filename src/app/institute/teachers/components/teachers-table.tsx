"use client"

import { useState, useEffect } from "react"
import { UserSquare2, Layers } from "lucide-react"
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
import { EntityProfileHost, useEntityProfile, type TeacherProfileData } from "@/components/entity-profile"

export function TeachersTable({
  teachers,
  batches = [],
}: {
  teachers: any[]
  batches?: any[]
}) {
  const [teacherList, setTeacherList] = useState<any[]>(teachers)
  const [search, setSearch] = useState("")
  const { selected, expanded, openProfile, closeProfile, setExpanded } = useEntityProfile()

  useEffect(() => {
    setTeacherList(teachers)
  }, [teachers])

  const filteredTeachers = teacherList.filter((t) => {
    const query = search.toLowerCase()
    return (
      t.name.toLowerCase().includes(query) ||
      (t.email && t.email.toLowerCase().includes(query)) ||
      (t.phoneNo && t.phoneNo.toLowerCase().includes(query)) ||
      (t.subjects && t.subjects.toLowerCase().includes(query))
    )
  })

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
        title="All teachers"
      >
        <Table className="w-full table-fixed border-collapse">
          <TableHeader className="bg-[#fafafa]">
            <TableRow>
              <TableHead className="w-[24%] h-9 px-3 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Teacher
              </TableHead>
              <TableHead className="w-[12%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Status
              </TableHead>
              <TableHead className="w-[22%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Subjects
              </TableHead>
              <TableHead className="w-[15%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Batches
              </TableHead>
              <TableHead className="w-[14%] h-9 px-2.5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Phone
              </TableHead>
              <TableHead className="w-[13%] h-9 px-3 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">
                Salary
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
                    {search ? "No teachers match your search." : "Add a teacher to get started."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map((teacher) => {
                const subjectList = teacher.subjects
                  ? teacher.subjects.split(",").map((s: string) => s.trim()).filter(Boolean)
                  : []

                const batchCount = teacher.batchesTaught?.length || 0
                const isSuspended = teacher.status === "SUSPENDED"

                return (
                  <TableRow
                    key={teacher.id}
                    onClick={() => openProfile("teacher", teacher.id)}
                    className="hover:bg-[#fafbfc] transition-colors cursor-pointer group"
                  >
                    <TableCell className="px-3 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-6.5 shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            isSuspended
                              ? "bg-amber-100 text-amber-700"
                              : "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white"
                          }`}
                        >
                          {teacher.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#24262c] group-hover:text-primary transition-colors truncate">
                            {teacher.name}
                          </div>
                          <div className="text-[10px] text-[#8b9a90] truncate">
                            {teacher.email || teacher.address || "—"}
                          </div>
                        </div>
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

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {subjectList.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                          {subjectList.map((subject: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-block truncate max-w-full px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium"
                              title={subject}
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#a1b0a6]">—</span>
                      )}
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {batchCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#374151] text-[10px] font-semibold whitespace-nowrap">
                          <Layers className="size-2.5 text-[#6b7280]" />
                          {batchCount} {batchCount === 1 ? "batch" : "batches"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8b9a90] whitespace-nowrap">—</span>
                      )}
                    </TableCell>

                    <TableCell className="px-2.5 py-2.5 text-[11px] text-[#45484f] border-b border-[#f0f1f3] truncate">
                      {teacher.phoneNo || <span className="text-[#a1b0a6]">N/A</span>}
                    </TableCell>

                    <TableCell className="px-3 py-2.5 text-[11px] text-[#1a201c] font-bold border-b border-[#f0f1f3] whitespace-nowrap">
                      {teacher.salary ? `₹${teacher.salary.toLocaleString()}` : <span className="text-[#a1b0a6] font-normal">—</span>}
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
        teachers={teacherList}
        batches={batches}
        onTeacherUpdated={(updated) => {
          setTeacherList((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
        }}
        onTeacherRemoved={(id) => {
          setTeacherList((prev) => prev.filter((t) => t.id !== id))
        }}
      />
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Building2 } from "lucide-react"
import { EntityProfileHost, useEntityProfile } from "@/components/entity-profile"

export function InstitutesTable({ institutes }: { institutes: any[] }) {
  const [instituteList, setInstituteList] = useState<any[]>(institutes)
  const [isClient, setIsClient] = useState(false)
  const { selected, expanded, openProfile, closeProfile, setExpanded } = useEntityProfile()

  useEffect(() => {
    setIsClient(true)
    setInstituteList(institutes)
  }, [institutes])

  return (
    <>
      <div className="bg-white border border-[#e7e9ed] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden w-full">
        <div className="flex justify-between items-center px-5 min-h-[56px] border-b border-[#e7e9ed]">
          <div>
            <div className="text-[14px] font-bold text-[#202228]">Institutes</div>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead className="bg-[#fafafa]">
              <tr>
                <th className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Institute</th>
                <th className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Contact</th>
                <th className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Students</th>
                <th className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Plan</th>
                <th className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Status</th>
                <th className="h-10 px-5 text-left text-[10px] font-semibold text-[#8a8e96] uppercase tracking-[0.05em] border-b border-[#e7e9ed]">Created</th>
              </tr>
            </thead>
            <tbody>
              {instituteList.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="text-center py-[45px] px-5 text-[#8b9099] text-[11px]">
                      <div className="w-[42px] h-[42px] mx-auto mb-2.5 flex items-center justify-center rounded-[10px] bg-primary-light text-primary">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="text-[#34373e] font-semibold">No institutes found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                instituteList.map((inst) => (
                  <tr 
                    key={inst.id} 
                    className={`hover:bg-[#fafbfc] transition-colors cursor-pointer group ${!inst.isActive ? 'opacity-60' : ''}`}
                    onClick={() => openProfile("institute", inst.id)}
                  >
                    <td className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-[30px] h-[30px] flex items-center justify-center rounded-[7px] text-[10px] font-bold transition-colors ${inst.isActive ? 'bg-primary-light text-primary group-hover:bg-primary group-hover:text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {inst.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-semibold transition-colors ${inst.isActive ? 'text-[#24262c] group-hover:text-primary' : 'text-gray-500 line-through'}`}>{inst.name}</div>
                          <div className="text-[#8b9099] mt-[1px] text-[10px]">{inst.adminEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {inst.phoneNo || "N/A"}
                    </td>
                    <td className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <span className="font-medium text-[#24262c]">{inst._count?.students || 0}</span>
                    </td>
                    <td className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      <span className="font-semibold text-primary">{inst.subscriptionType}</span>
                    </td>
                    <td className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {inst.isActive ? (
                        <span className="inline-flex items-center gap-[5px] px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-[5px] h-[5px] rounded-full bg-emerald-600"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-[5px] px-2 py-1 rounded-full text-[10px] font-semibold bg-[#fff0f0] text-[#dc4b4b]">
                          <span className="w-[5px] h-[5px] rounded-full bg-[#dc4b4b]"></span>
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="h-[58px] px-5 text-[11px] text-[#45484f] border-b border-[#f0f1f3]">
                      {isClient ? new Date(inst.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Entity Profile Host (Sheet Drawer / Full Page) */}
      <EntityProfileHost
        selected={selected}
        expanded={expanded}
        onClose={closeProfile}
        onExpandedChange={setExpanded}
        institutes={instituteList}
        onInstituteUpdated={(updated) => {
          setInstituteList((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
        }}
      />
    </>
  )
}

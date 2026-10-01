"use client"

import { useState, useEffect, useTransition } from "react"
import { Building2, X, Download, FileText, Clock, ShieldAlert, ShieldCheck } from "lucide-react"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toggleInstituteStatus } from "@/actions/institute"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function InstitutesTable({ institutes }: { institutes: any[] }) {
  const [selectedInstitute, setSelectedInstitute] = useState<any | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggleStatus = (instituteId: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await toggleInstituteStatus(instituteId, !currentStatus);
        
        // Update local state so UI updates immediately
        setSelectedInstitute((prev: any) => prev ? { ...prev, isActive: !currentStatus } : null);
        
        toast({
          title: "Status Updated",
          description: `Institute has been ${!currentStatus ? 'unblocked' : 'blocked'} successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update institute status.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <div className="bg-white border border-[#e7e9ed] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden w-full">
        <div className="flex justify-between items-center px-5 min-h-[64px] border-b border-[#e7e9ed]">
          <div>
            <div className="text-[14px] font-bold text-[#202228]">Registered Institutes</div>
            <div className="text-[11px] text-[#8b9099] mt-0.5">{institutes.length} results found</div>
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
              {institutes.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="text-center py-[45px] px-5 text-[#8b9099] text-[11px]">
                      <div className="w-[42px] h-[42px] mx-auto mb-2.5 flex items-center justify-center rounded-[10px] bg-primary-light text-primary">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="text-[#34373e] font-semibold mb-[3px]">No institutes found</div>
                      <div>Try adjusting your filters or search query.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                institutes.map((inst) => (
                  <tr 
                    key={inst.id} 
                    className={`hover:bg-[#fafbfc] transition-colors cursor-pointer group ${!inst.isActive ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedInstitute(inst)}
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
                      <span className="font-medium text-[#24262c]">{inst._count.students}</span>
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

      <Sheet open={!!selectedInstitute} onOpenChange={(open) => !open && setSelectedInstitute(null)}>
        <SheetContent showCloseButton={false} className="sm:max-w-[480px] bg-white p-0 overflow-y-auto border-l border-[#e3e8e5]">
          {selectedInstitute && (
            <div className="flex flex-col min-h-full">
              {/* Header */}
              <div className={`p-6 text-white relative transition-colors duration-300 ${selectedInstitute.isActive ? 'bg-slate-900' : 'bg-[#4a1515]'}`}>
                <SheetClose render={<button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>} />
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-white font-bold text-lg mb-4 shadow-md">
                  {selectedInstitute.name.substring(0,2).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold mb-1">{selectedInstitute.name}</h2>
                <div className="text-sm text-white/70 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {selectedInstitute.adminEmail}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-8">
                
                {/* Status Toggle Box */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${selectedInstitute.isActive ? 'border-[#e3e8e5] bg-[#f8faf9]' : 'border-red-100 bg-red-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedInstitute.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {selectedInstitute.isActive ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#1a201c]">Institute Access</div>
                      <div className="text-[11px] text-[#5e6b63]">
                        {selectedInstitute.isActive ? "Institute admin can manage operations." : "Institute admin is completely locked out."}
                      </div>
                    </div>
                  </div>
                  <Switch 
                    checked={selectedInstitute.isActive} 
                    onCheckedChange={() => handleToggleStatus(selectedInstitute.id, selectedInstitute.isActive)}
                    disabled={isPending}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#e3e8e5] bg-[#f8faf9]">
                    <div className="text-[11px] font-semibold text-[#5e6b63] uppercase tracking-wider mb-1">Enrolled Students</div>
                    <div className="text-2xl font-bold text-[#1a201c]">{selectedInstitute._count.students}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-[#e3e8e5] bg-[#f8faf9]">
                    <div className="text-[11px] font-semibold text-[#5e6b63] uppercase tracking-wider mb-1">Current Plan</div>
                    <div className="text-xl font-bold text-primary">{selectedInstitute.subscriptionType}</div>
                  </div>
                </div>

                {/* Institute Details */}
                <div>
                  <h3 className="text-[13px] font-bold text-[#1a201c] uppercase tracking-wider mb-4 border-b border-[#e3e8e5] pb-2">Institute Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#5e6b63]">Phone Number</span>
                      <span className="font-medium text-[#1a201c]">{selectedInstitute.phoneNo || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#5e6b63]">Location</span>
                      <span className="font-medium text-[#1a201c]">{selectedInstitute.location || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#5e6b63]">Date Joined</span>
                      <span className="font-medium text-[#1a201c]">
                        {isClient ? new Date(selectedInstitute.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing Details */}
                <div>
                  <div className="flex justify-between items-center mb-4 border-b border-[#e3e8e5] pb-2">
                    <h3 className="text-[13px] font-bold text-[#1a201c] uppercase tracking-wider">Payment History</h3>
                    <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 px-2 border-[#e3e8e5] text-[#5e6b63] hover:text-[#1a201c]">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedInstitute.invoices && selectedInstitute.invoices.length > 0 ? (
                      selectedInstitute.invoices.map((invoice: any) => (
                        <div key={invoice.id} className="flex justify-between items-center p-3 rounded-lg border border-[#e3e8e5] hover:bg-[#f8faf9] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#fff0f0] text-[#dc4b4b]'}`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[#1a201c]">₹{invoice.amount.toLocaleString()}</div>
                              <div className="text-[11px] text-[#8b9a90]">Due {isClient ? new Date(invoice.dueDate).toLocaleDateString() : ""}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-[11px] font-bold ${invoice.status === 'PAID' ? 'text-emerald-700' : 'text-[#dc4b4b]'}`}>{invoice.status}</div>
                            {invoice.paidAt && <div className="text-[10px] text-[#8b9a90] mt-0.5">{isClient ? new Date(invoice.paidAt).toLocaleDateString() : ""}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 px-4 bg-[#f8faf9] rounded-xl border border-dashed border-[#e3e8e5]">
                        <Clock className="w-6 h-6 text-[#a1b0a6] mx-auto mb-2" />
                        <div className="text-[13px] font-medium text-[#5e6b63]">No payment history yet</div>
                        <div className="text-[11px] text-[#8b9a90] mt-1">Invoices will appear here when generated.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

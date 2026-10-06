"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomSelect } from "@/components/ui/custom-select"
import { cn } from "@/lib/utils"
import {
  Banknote,
  Building2,
  QrCode,
  CreditCard,
  FileCheck2,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  ChevronDown,
  Check,
} from "lucide-react"
import { disburseTeacherSalary } from "@/actions/payroll"
import { useToast } from "@/hooks/use-toast"

export interface TeacherPayrollItem {
  id: string
  name: string
  phoneNo?: string | null
  salary: number
  subjects?: string | null
  batchesCount: number
  batchNames: string[]
  payout?: {
    id: string
    voucherNo: string
    month: number
    year: number
    baseSalary: number
    bonus: number
    deductions: number
    netAmount: number
    status: string
    paymentMode: string
    transactionRef?: string | null
    paidAt: string
    notes?: string | null
  } | null
}

export interface DisburseSalaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher?: TeacherPayrollItem | null
  teachers?: TeacherPayrollItem[]
  month: number
  year: number
  instituteName?: string
  onDisbursementSuccess?: (payout: any) => void
}

function TeacherTypeAndSelectDropdown({
  teachers,
  selectedTeacherId,
  onSelect,
}: {
  teachers: TeacherPayrollItem[]
  selectedTeacherId: string
  onSelect: (teacherId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.id === selectedTeacherId),
    [teachers, selectedTeacherId]
  )

  // Sync displayed search term with selected teacher name
  useEffect(() => {
    if (selectedTeacher) {
      setSearchTerm(selectedTeacher.name)
    } else {
      setSearchTerm("")
    }
  }, [selectedTeacher])

  // Revert search term to valid selected teacher on blur / click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        if (selectedTeacher) {
          setSearchTerm(selectedTeacher.name)
        } else {
          setSearchTerm("")
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [selectedTeacher])

  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers
    const q = searchTerm.toLowerCase().trim()
    return teachers.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q)
      const matchSubject = t.subjects ? t.subjects.toLowerCase().includes(q) : false
      const matchBatch = t.batchNames ? t.batchNames.some((b) => b.toLowerCase().includes(q)) : false
      return matchName || matchSubject || matchBatch
    })
  }, [teachers, searchTerm])

  const handleSelectOption = (teacher: TeacherPayrollItem) => {
    onSelect(teacher.id)
    setSearchTerm(teacher.name)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      if (selectedTeacher) setSearchTerm(selectedTeacher.name)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredTeachers.length > 0) {
        handleSelectOption(filteredTeachers[0])
      }
    } else if (e.key === "ArrowDown" && !isOpen) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type to search and select faculty..."
          className="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev)
            inputRef.current?.focus()
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
          tabIndex={-1}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )}
          />
        </button>
      </div>

      {/* Single Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg max-h-60 overflow-y-auto custom-scrollbar-x p-1 space-y-0.5">
          {filteredTeachers.length === 0 ? (
            <div className="py-5 px-3 text-center text-xs text-muted-foreground">
              No matching faculty found.
            </div>
          ) : (
            filteredTeachers.map((t) => {
              const isSelected = t.id === selectedTeacherId
              const isPaid = Boolean(t.payout && t.payout.status === "PAID")
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectOption(t)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between gap-3 transition-colors",
                    isSelected
                      ? "bg-primary-light/60 text-primary font-semibold"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate flex items-center gap-2">
                      <span>{t.name}</span>
                      {isPaid && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      )}
                      {!isPaid && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {t.subjects || "Teacher"} · {t.batchesCount} {t.batchesCount === 1 ? "batch" : "batches"} · Base ₹{(t.salary || 0).toLocaleString("en-IN")}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export function DisburseSalaryModal({
  open,
  onOpenChange,
  teacher,
  teachers = [],
  month,
  year,
  instituteName = "Classly Coaching Institute",
  onDisbursementSuccess,
}: DisburseSalaryModalProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("")
  const [baseSalary, setBaseSalary] = useState<number>(0)
  const [bonus, setBonus] = useState<number>(0)
  const [deductions, setDeductions] = useState<number>(0)
  const [paymentMode, setPaymentMode] = useState<string>("NET_BANKING")
  const [transactionRef, setTransactionRef] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { toast } = useToast()

  // Find active teacher based on selected ID or fallback to initial teacher or first teacher
  const activeTeacher = React.useMemo(() => {
    if (selectedTeacherId) {
      const found = teachers.find((t) => t.id === selectedTeacherId)
      if (found) return found
    }
    return teacher || teachers.find((t) => !t.payout) || teachers[0] || null
  }, [selectedTeacherId, teachers, teacher])

  // Synchronize state when modal opens or initial teacher changes
  useEffect(() => {
    if (open) {
      const target = teacher || (selectedTeacherId ? teachers.find((t) => t.id === selectedTeacherId) : null) || teachers.find((t) => !t.payout) || teachers[0] || null
      if (target) {
        setSelectedTeacherId(target.id)
        setBaseSalary(target.salary || 45000)
        setBonus(0)
        setDeductions(0)
        setTransactionRef("")
        setNotes("")
        setPaymentMode("NET_BANKING")
      }
    }
  }, [open, teacher, teachers])

  const handleTeacherSelect = (newId: string) => {
    setSelectedTeacherId(newId)
    const target = teachers.find((t) => t.id === newId)
    if (target) {
      setBaseSalary(target.salary || 45000)
      setBonus(0)
      setDeductions(0)
      setTransactionRef("")
      setNotes("")
      setPaymentMode("NET_BANKING")
    }
  }

  if (!open) return null

  const netPayable = Math.max(0, baseSalary + (bonus || 0) - (deductions || 0))

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  const handleDisburse = async () => {
    if (!activeTeacher) {
      toast({
        variant: "destructive",
        title: "Faculty Required",
        description: "Please select a faculty member to disburse salary.",
      })
      return
    }

    if (netPayable <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Net salary payout must be greater than ₹0.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await disburseTeacherSalary({
        teacherId: activeTeacher.id,
        month,
        year,
        baseSalary,
        bonus,
        deductions,
        paymentMode,
        transactionRef,
        notes,
      })

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Disbursement Failed",
          description: res.error,
        })
      } else {
        toast({
          title: "Salary Disbursed",
          description: res.message,
        })
        onOpenChange(false)
        if (onDisbursementSuccess && res.payout) {
          onDisbursementSuccess(res.payout)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border border-border p-6 rounded-2xl shadow-xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="space-y-1 pb-1">
          <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-1">
            <Banknote className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Disburse salary
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {monthName}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-0.5">
          {/* Faculty Selector with Type-and-Select Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Teacher</span>
                <span className="text-rose-500">*</span>
              </Label>
              {activeTeacher?.payout && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="size-3" />
                  Paid ({activeTeacher.payout.voucherNo})
                </span>
              )}
            </div>

            <TeacherTypeAndSelectDropdown
              teachers={teachers}
              selectedTeacherId={selectedTeacherId}
              onSelect={handleTeacherSelect}
            />
          </div>

          {/* Teacher Profile Snapshot */}
          {activeTeacher ? (
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-primary/20">
                  {activeTeacher.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate flex items-center gap-2">
                    <span>{activeTeacher.name}</span>
                    {activeTeacher.phoneNo && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({activeTeacher.phoneNo})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {activeTeacher.subjects || "General Faculty"} · {activeTeacher.batchesCount} {activeTeacher.batchesCount === 1 ? "batch" : "batches"}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  Cycle
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {monthName}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
              Please select a faculty member from the dropdown above to disburse salary.
            </div>
          )}

          {/* Salary Breakdown & Adjustments */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-foreground">
              Salary Breakdown
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Base Retainer */}
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Base Retainer (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-semibold bg-card border-border"
                />
              </div>

              {/* Bonus / Incentive */}
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground flex items-center gap-1 text-emerald-700">
                  <Plus className="size-3" /> Bonus / Extra (₹)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={bonus || ""}
                  onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8 text-xs bg-card border-border"
                />
              </div>

              {/* Deductions / Advance */}
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground flex items-center gap-1 text-rose-600">
                  <Minus className="size-3" /> Deductions (₹)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={deductions || ""}
                  onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8 text-xs bg-card border-border"
                />
              </div>
            </div>

            {/* Net Amount Callout */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Net Salary Payable
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Base (₹{baseSalary.toLocaleString("en-IN")}) + Bonus (₹{bonus.toLocaleString("en-IN")}) - Deductions (₹{deductions.toLocaleString("en-IN")})
                </p>
              </div>
              <div className="text-lg font-bold text-foreground">
                ₹{netPayable.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Payment Method & Bank UTR */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold text-foreground">
              Disbursement Details
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Payment Method</Label>
                <CustomSelect
                  value={paymentMode}
                  onChange={(val) => {
                    setPaymentMode(val)
                    if (val === "RAZORPAY") {
                      const rzpRef = `pout_test_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`
                      setTransactionRef(rzpRef)
                      if (!notes) setNotes("Disbursed via Razorpay Online Payouts (Test Mode)")
                    }
                  }}
                  options={[
                    { value: "RAZORPAY", label: "Razorpay (Online Test Transfer)" },
                    { value: "NET_BANKING", label: "Bank Transfer (NEFT / IMPS)" },
                    { value: "UPI", label: "UPI Transfer" },
                    { value: "CHEQUE", label: "Bank Cheque" },
                    { value: "CASH", label: "Cash Voucher" },
                  ]}
                  size="sm"
                  placeholder="Select payment method"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    {paymentMode === "RAZORPAY"
                      ? "Razorpay Payout Reference"
                      : paymentMode === "CHEQUE"
                      ? "Cheque Number"
                      : paymentMode === "CASH"
                      ? "Cash Voucher Ref"
                      : "Bank UTR / Transaction Ref"}
                  </Label>
                  {paymentMode === "RAZORPAY" && (
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold border border-blue-200">
                      Test Mode
                    </span>
                  )}
                </div>
                <Input
                  placeholder={paymentMode === "RAZORPAY" ? "e.g. pout_test_987123" : paymentMode === "CHEQUE" ? "e.g. 004928" : "e.g. UTR-20261002-8924"}
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="h-8 text-xs bg-card border-border font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes / Remarks (Optional)</Label>
              <Input
                placeholder="e.g. Regular monthly stipend disbursed via HDFC current account."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-8 text-xs bg-card border-border"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t border-border mt-2 flex flex-row items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Disbursing <strong className="text-foreground text-sm">₹{netPayable.toLocaleString("en-IN")}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs rounded-lg border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || netPayable <= 0}
              onClick={handleDisburse}
              className="h-8 px-4 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 mr-1.5" />
                  Disburse salary
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

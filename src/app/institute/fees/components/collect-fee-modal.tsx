"use client"

import React, { useState, useEffect } from "react"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  Phone,
  Layers3,
  Percent,
  Loader2,
} from "lucide-react"
import { DynamicUpiQr } from "./dynamic-upi-qr"
import { CashChangeCalculator } from "./cash-change-calculator"
import { InstallmentPlanSelector } from "./installment-plan-selector"
import { CustomSelect } from "@/components/ui/custom-select"
import { recordFeePayment } from "@/actions/fee"
import { useToast } from "@/hooks/use-toast"

export interface StudentOption {
  id: string
  name: string
  phoneNo?: string | null
  parentPhone?: string | null
  email?: string | null
  batchName: string
  totalFee: number
  amountPaid: number
  status: string
  feeId?: string
}

interface CollectFeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: StudentOption[]
  initialStudentId?: string | null
  instituteName?: string
  onPaymentSuccess?: (receipt: any) => void
}

export function CollectFeeModal({
  open,
  onOpenChange,
  students,
  initialStudentId,
  instituteName = "Classly Coaching Institute",
  onPaymentSuccess,
}: CollectFeeModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || "")
  const [paymentMode, setPaymentMode] = useState<"UPI" | "CASH" | "CARD" | "CHEQUE">("UPI")
  const [paymentAmount, setPaymentAmount] = useState<number>(4000)
  const [planLabel, setPlanLabel] = useState<string>("Current Month")

  // Additional details
  const [transactionRef, setTransactionRef] = useState("")
  const [notes, setNotes] = useState("")
  const [hasDiscount, setHasDiscount] = useState(false)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [discountReason, setDiscountReason] = useState("Sibling Concession")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Reset or initialize when modal opens
  useEffect(() => {
    if (open) {
      if (initialStudentId) {
        setSelectedStudentId(initialStudentId)
      } else if (!selectedStudentId && students.length > 0) {
        setSelectedStudentId(students[0].id)
      }
    }
  }, [open, initialStudentId, students, selectedStudentId])

  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  // Update default payment amount whenever student changes
  useEffect(() => {
    if (selectedStudent) {
      const balance = Math.max(0, selectedStudent.totalFee - selectedStudent.amountPaid)
      const defaultAmt = Math.min(balance, Math.max(2500, Math.round(selectedStudent.totalFee / 10)))
      setPaymentAmount(defaultAmt > 0 ? defaultAmt : balance)
    }
  }, [selectedStudent])

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phoneNo && s.phoneNo.includes(searchQuery)) ||
      (s.parentPhone && s.parentPhone.includes(searchQuery)) ||
      s.batchName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleConfirmPayment = async () => {
    if (!selectedStudent) {
      toast({ variant: "destructive", title: "Select a student", description: "Please pick a student to record fee payment." })
      return
    }

    if (paymentAmount <= 0) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Payment amount must be greater than ₹0." })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await recordFeePayment({
        studentId: selectedStudent.id,
        feeId: selectedStudent.feeId,
        amount: paymentAmount,
        paymentMode,
        transactionRef,
        notes: notes || undefined,
        discountAmount: hasDiscount ? discountAmount : undefined,
        discountReason: hasDiscount ? discountReason : undefined,
      })

      if (res.error) {
        toast({ variant: "destructive", title: "Payment Failed", description: res.error })
      } else {
        toast({
          title: "Payment Recorded",
          description: `Receipt #${res.receiptNo} generated successfully.`,
        })

        onOpenChange(false)
        if (onPaymentSuccess) {
          onPaymentSuccess(res)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const outstandingBalance = selectedStudent
    ? Math.max(0, selectedStudent.totalFee - selectedStudent.amountPaid)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border border-border p-6 rounded-2xl shadow-xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <DialogHeader className="space-y-1 pb-1">
          <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-1">
            <CreditCard className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Collect Student Fee
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record tuition payment, select installment, and issue receipt.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-0.5">
          {/* STEP 1: Student Search / Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Select Student
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name, phone, or batch..."
                className="pl-9 h-9 text-xs rounded-lg border-border"
              />
            </div>

            {/* Quick Suggestions Dropdown if Searching */}
            {searchQuery && filteredStudents.length > 0 && (
              <div className="border border-border rounded-lg max-h-40 overflow-y-auto divide-y divide-border bg-popover shadow-md">
                {filteredStudents.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStudentId(s.id)
                      setSearchQuery("")
                    }}
                    className={`p-2.5 text-xs flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedStudentId === s.id ? "bg-primary-light/40" : ""
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-foreground">{s.name}</span>
                      <span className="text-[11px] text-muted-foreground ml-2">({s.batchName})</span>
                    </div>
                    <span className="text-xs font-semibold text-primary">
                      Due: ₹{(s.totalFee - s.amountPaid).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Selected Student Snapshot Card */}
          {selectedStudent && (
            <div className="p-3.5 rounded-lg bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedStudent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                    {selectedStudent.name}
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Layers3 className="size-3 text-muted-foreground" />
                      {selectedStudent.batchName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" />
                      Parent: {selectedStudent.parentPhone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right sm:border-l sm:border-border sm:pl-3">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  Outstanding Due
                </div>
                <div className="text-base font-bold text-rose-600">
                  ₹{outstandingBalance.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Total Fee: ₹{selectedStudent.totalFee.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Installment Selector */}
          {selectedStudent && (
            <InstallmentPlanSelector
              totalFee={selectedStudent.totalFee}
              alreadyPaid={selectedStudent.amountPaid}
              selectedAmount={paymentAmount}
              onSelectAmount={(amt, lbl) => {
                setPaymentAmount(amt)
                setPlanLabel(lbl)
              }}
            />
          )}

          {/* STEP 4: Optional Concession / Discount Toggle */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setHasDiscount(!hasDiscount)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
            >
              <Percent className="size-3.5 text-primary" />
              <span>{hasDiscount ? "Remove Concession / Discount" : "+ Apply Concession or Scholarship Discount"}</span>
            </button>

            {hasDiscount && (
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Discount Amount (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs bg-card border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Concession Reason</Label>
                    <CustomSelect
                      value={discountReason}
                      onChange={setDiscountReason}
                      options={[
                        { value: "Sibling Concession", label: "Sibling Concession (10%)" },
                        { value: "Merit Scholarship", label: "Merit Scholarship (15%)" },
                        { value: "Director Special Approval", label: "Director Special Approval" },
                        { value: "Early Bird Registration", label: "Early Bird Registration" },
                      ]}
                      size="sm"
                      placeholder="Select Concession Type"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 5: Payment Channels Tab (UPI, Cash, Card, Cheque) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Payment Method
            </Label>
            <Tabs
              value={paymentMode}
              onValueChange={(val) => setPaymentMode(val as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 h-9 p-0.5 bg-muted rounded-lg">
                <TabsTrigger value="UPI" className="text-xs font-medium rounded-md">
                  <QrCode className="size-3 mr-1" />
                  UPI QR
                </TabsTrigger>
                <TabsTrigger value="CASH" className="text-xs font-medium rounded-md">
                  <Banknote className="size-3 mr-1" />
                  Cash
                </TabsTrigger>
                <TabsTrigger value="CARD" className="text-xs font-medium rounded-md">
                  <CreditCard className="size-3 mr-1" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="CHEQUE" className="text-xs font-medium rounded-md">
                  <Building2 className="size-3 mr-1" />
                  Cheque
                </TabsTrigger>
              </TabsList>

              {/* UPI Tab: Live Dynamic QR */}
              <TabsContent value="UPI" className="pt-2">
                <DynamicUpiQr
                  amount={paymentAmount}
                  payeeName={instituteName}
                  transactionNote={`${selectedStudent?.name || "STUDENT"}-${planLabel}`}
                />
              </TabsContent>

              {/* Cash Tab: Tender & Change Calculator */}
              <TabsContent value="CASH" className="pt-2">
                <CashChangeCalculator payableAmount={paymentAmount} />
              </TabsContent>

              {/* Card / POS Tab */}
              <TabsContent value="CARD" className="pt-2 space-y-2 p-3 rounded-lg bg-muted/20 border border-border">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">POS Terminal / Transaction Ref</Label>
                  <Input
                    placeholder="e.g. TXN-894829 / Card Auth Code"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="h-8 text-xs bg-card border-border"
                  />
                </div>
              </TabsContent>

              {/* Cheque / DD Tab */}
              <TabsContent value="CHEQUE" className="pt-2 space-y-2 p-3 rounded-lg bg-muted/20 border border-border">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Cheque Number</Label>
                    <Input
                      placeholder="e.g. 004928"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="h-8 text-xs bg-card border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Bank & Branch</Label>
                    <Input
                      placeholder="e.g. HDFC Bank, Main Branch"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-8 text-xs bg-card border-border"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="pt-3 border-t border-border mt-2 flex flex-row items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Amount: <strong className="text-foreground text-sm">₹{paymentAmount.toLocaleString("en-IN")}</strong>
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
              disabled={isSubmitting || paymentAmount <= 0}
              onClick={handleConfirmPayment}
              className="h-8 px-4 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3 mr-1.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 mr-1.5" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

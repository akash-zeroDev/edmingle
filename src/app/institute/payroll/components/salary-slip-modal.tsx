"use client"

import React, { useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Printer,
  Share2,
  Receipt,
  CheckCircle2,
} from "lucide-react"
import { printOfficialSalaryVoucher } from "@/lib/print-document"

export interface SalarySlipData {
  voucherNo: string
  teacherName: string
  teacherPhone?: string | null
  month: number
  year: number
  baseSalary: number
  bonus: number
  deductions: number
  netAmount: number
  paymentMode: string
  transactionRef?: string | null
  paidAt?: string
  instituteName?: string
}

interface SalarySlipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slip: SalarySlipData | null
  instituteName?: string
}

export function SalarySlipModal({
  open,
  onOpenChange,
  slip,
  instituteName = "Classly Coaching Institute",
}: SalarySlipModalProps) {
  const slipRef = useRef<HTMLDivElement>(null)

  if (!slip) return null

  const monthName = new Date(slip.year, slip.month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  const formattedDateTime = slip.paidAt
    ? new Date(slip.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date(slip.paidAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

  const handlePrint = () => {
    printOfficialSalaryVoucher({
      voucherNo: slip.voucherNo,
      teacherName: slip.teacherName,
      teacherPhone: slip.teacherPhone,
      month: slip.month,
      year: slip.year,
      baseSalary: slip.baseSalary,
      bonus: slip.bonus,
      deductions: slip.deductions,
      netAmount: slip.netAmount,
      paymentMode: slip.paymentMode,
      transactionRef: slip.transactionRef,
      paidAt: slip.paidAt,
      instituteName: slip.instituteName || instituteName,
    })
  }

  const cleanPhone = (slip.teacherPhone || "").replace(/\D/g, "")
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Dear ${slip.teacherName}, your salary of ₹${slip.netAmount.toLocaleString(
          "en-IN"
        )} for ${monthName} has been processed under Voucher #${slip.voucherNo} (${
          slip.paymentMode
        }${slip.transactionRef ? ` - Ref: ${slip.transactionRef}` : ""}). - ${
          slip.instituteName || instituteName
        }`
      )}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border border-border p-6 rounded-2xl shadow-xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border pr-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="size-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Receipt className="size-4.5" />
              </div>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                DISBURSED
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Salary payslip
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Voucher #{slip.voucherNo} · {monthName}
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable Printable Slip Container */}
        <div className="py-4 overflow-y-auto flex-1 flex justify-center">
          <div
            ref={slipRef}
            className="bg-white border border-border shadow-xs print:shadow-none print:border-none w-full max-w-[480px] p-6 rounded-xl space-y-4"
          >
            {/* Institute Header */}
            <div className="border-b border-border pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {slip.instituteName || instituteName}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Salary payslip
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-foreground">
                  {slip.voucherNo}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Period: {monthName}
                </div>
              </div>
            </div>

            {/* Teacher Details Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border border-border">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  Teacher
                </span>
                <div className="font-semibold text-foreground">{slip.teacherName}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  Disbursed Date & Time
                </span>
                <div className="font-medium text-foreground">{formattedDateTime}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  Payment Mode
                </span>
                <div className="font-semibold text-primary">{slip.paymentMode}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  Bank Reference / UTR
                </span>
                <div className="font-mono text-foreground">{slip.transactionRef || "N/A"}</div>
              </div>
            </div>

            {/* Compensation Breakdown Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 text-[11px] font-semibold text-foreground flex justify-between border-b border-border">
                <span>Remuneration Component</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Base Retainer</span>
                  <span className="font-semibold text-foreground">
                    ₹{slip.baseSalary.toLocaleString("en-IN")}
                  </span>
                </div>
                {slip.bonus > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Performance Incentive / Extra Classes</span>
                    <span className="font-semibold">+₹{slip.bonus.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {slip.deductions > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Advance / Leave Deductions</span>
                    <span className="font-semibold">-₹{slip.deductions.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <div className="bg-muted/30 px-3 py-2.5 border-t border-border flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Net Disbursed Amount:</span>
                <span className="text-base font-bold text-emerald-700">
                  ₹{slip.netAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Signatory Acknowledgement */}
            <div className="pt-6 border-t border-dashed border-border flex justify-between items-end text-[11px] text-muted-foreground">
              <div>
                <div className="w-24 border-b border-foreground/40 mb-1" />
                <span>Authorized Signatory</span>
              </div>
              <div className="text-right">
                <div className="w-24 border-b border-foreground/40 mb-1 ml-auto" />
                <span>Faculty Signature</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <Share2 className="size-3.5 mr-1.5" />
                WhatsApp Slip
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs rounded-lg border-border"
            >
              <Printer className="size-3.5 mr-1.5 text-muted-foreground" />
              Print Voucher
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 px-4 text-xs font-semibold rounded-lg border-border"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

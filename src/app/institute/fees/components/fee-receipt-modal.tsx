"use client"

import React, { useState, useRef } from "react"
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
  CheckCircle2,
  Copy,
  Check,
  Receipt,
} from "lucide-react"
import { printOfficialFeeReceipt } from "@/lib/print-document"

export interface ReceiptData {
  receiptNo: string
  studentName: string
  batchName: string
  amount: number
  paymentMode: string
  remainingBalance: number
  paidAt?: string
  cashierName?: string
  instituteName?: string
  parentPhone?: string | null
  studentPhone?: string | null
  whatsappMessage?: string
}

interface FeeReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ReceiptData | null
  instituteName?: string
}

export function FeeReceiptModal({
  open,
  onOpenChange,
  receipt,
  instituteName = "Classly Coaching Institute",
}: FeeReceiptModalProps) {
  const [printFormat, setPrintFormat] = useState<"A4" | "THERMAL">("A4")
  const [copied, setCopied] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  if (!receipt) return null

  const formattedDateTime = receipt.paidAt
    ? new Date(receipt.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date(receipt.paidAt).toLocaleTimeString("en-IN", {
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
    printOfficialFeeReceipt({
      receiptNo: receipt.receiptNo,
      studentName: receipt.studentName,
      batchName: receipt.batchName,
      amount: receipt.amount,
      paymentMode: receipt.paymentMode,
      remainingBalance: receipt.remainingBalance,
      paidAt: receipt.paidAt,
      cashierName: receipt.cashierName,
      instituteName: receipt.instituteName || instituteName,
      parentPhone: receipt.parentPhone,
      studentPhone: receipt.studentPhone,
      transactionRef: (receipt as any).transactionRef || null,
    })
  }

  const handleCopyWhatsApp = () => {
    if (receipt.whatsappMessage) {
      navigator.clipboard.writeText(receipt.whatsappMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const cleanPhone = (receipt.parentPhone || receipt.studentPhone || "")
    .replace(/\D/g, "")
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        receipt.whatsappMessage || `Receipt #${receipt.receiptNo} of ₹${receipt.amount} generated.`
      )}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border border-border p-6 rounded-2xl shadow-xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border pr-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Receipt className="size-4.5" />
              </div>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PAID
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Tuition Fee Receipt
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Receipt #{receipt.receiptNo}
            </DialogDescription>
          </div>

          {/* Format Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg mr-2">
            <button
              type="button"
              onClick={() => setPrintFormat("A4")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                printFormat === "A4"
                  ? "bg-white text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard A4
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat("THERMAL")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                printFormat === "THERMAL"
                  ? "bg-white text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Thermal Slip
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="py-4 overflow-y-auto flex-1 flex justify-center">
          {/* Printable Container */}
          <div
            ref={receiptRef}
            className={`bg-white border border-border shadow-xs print:shadow-none print:border-none w-full transition-all ${
              printFormat === "A4"
                ? "max-w-[480px] p-6 rounded-xl"
                : "max-w-[320px] p-4 rounded-lg font-mono text-xs"
            }`}
          >
            {/* FORMAT: STANDARD A4 */}
            {printFormat === "A4" ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-border pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {receipt.instituteName || instituteName}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Authorized Tuition Acknowledgement
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PAID
                    </span>
                    <div className="text-xs font-mono font-bold text-foreground mt-1">
                      {receipt.receiptNo}
                    </div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border border-border">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      Student Name
                    </span>
                    <div className="font-semibold text-foreground">{receipt.studentName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      Enrolled Batch
                    </span>
                    <div className="font-semibold text-foreground">{receipt.batchName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      Payment Mode
                    </span>
                    <div className="font-semibold text-primary">{receipt.paymentMode}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      Payment Date & Time
                    </span>
                    <div className="font-medium text-foreground">{formattedDateTime}</div>
                  </div>
                </div>

                {/* Ledger Breakdown */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/40 px-3 py-2 text-[11px] font-semibold text-foreground flex justify-between border-b border-border">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-foreground">Tuition Fee Installment Payment</span>
                      <span className="font-semibold text-foreground">
                        ₹{receipt.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/30 px-3 py-2.5 border-t border-border flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Total Paid:</span>
                    <span className="text-base font-bold text-emerald-700">
                      ₹{receipt.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Balance & Notes */}
                <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-muted/20 border border-border">
                  <span className="text-muted-foreground">Remaining Balance Due:</span>
                  <span className="font-bold text-foreground">
                    ₹{receipt.remainingBalance.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Footnote */}
                <div className="text-[10px] text-muted-foreground text-center pt-1 border-t border-dashed border-border">
                  Computer-generated receipt · Valid without physical signature.
                </div>
              </div>
            ) : (
              /* FORMAT: THERMAL 3-INCH SLIP */
              <div className="space-y-3 text-center">
                <div className="border-b border-dashed border-border pb-2">
                  <div className="font-bold text-sm text-foreground">{receipt.instituteName || instituteName}</div>
                  <div className="text-[10px] text-muted-foreground">Reception Fee Voucher</div>
                  <div className="font-bold text-xs mt-1 text-foreground">{receipt.receiptNo}</div>
                </div>

                <div className="text-left space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-semibold text-foreground">{receipt.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch:</span>
                    <span className="text-foreground truncate max-w-[170px]">{receipt.batchName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode:</span>
                    <span className="font-semibold text-primary">{receipt.paymentMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="text-foreground">{formattedDateTime}</span>
                  </div>
                </div>

                <div className="border-y border-dashed border-border py-2 flex justify-between items-center text-xs font-bold">
                  <span>AMOUNT PAID:</span>
                  <span className="text-sm text-emerald-700">₹{receipt.amount.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Balance Due:</span>
                  <span className="font-semibold text-foreground">
                    ₹{receipt.remainingBalance.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="pt-2 text-[10px] text-muted-foreground border-t border-dashed border-border">
                  Thank you! Save this slip for your records.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer (Action Buttons) */}
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
                WhatsApp
              </a>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyWhatsApp}
              className="h-8 text-xs rounded-lg border-border"
            >
              {copied ? <Check className="size-3.5 mr-1 text-emerald-600" /> : <Copy className="size-3.5 mr-1 text-muted-foreground" />}
              {copied ? "Copied" : "Copy Message"}
            </Button>
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
              Print
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

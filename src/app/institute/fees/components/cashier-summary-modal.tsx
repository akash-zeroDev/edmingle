"use client"

import React from "react"
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
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CalendarDays,
  CheckCircle2,
  ReceiptText,
} from "lucide-react"

export interface CashierTransaction {
  id: string
  receiptNo: string
  studentName: string
  batchName: string
  amount: number
  paymentMode: string
  paidAt: string
  receivedBy?: string | null
}

interface CashierSummaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactions: CashierTransaction[]
  instituteName?: string
}

export function CashierSummaryModal({
  open,
  onOpenChange,
  transactions,
  instituteName = "Classly Coaching Institute",
}: CashierSummaryModalProps) {
  // Aggregate today's collections by payment mode
  const totalCollected = transactions.reduce((acc, t) => acc + t.amount, 0)
  const cashTotal = transactions
    .filter((t) => t.paymentMode === "CASH")
    .reduce((acc, t) => acc + t.amount, 0)
  const upiTotal = transactions
    .filter((t) => t.paymentMode === "UPI")
    .reduce((acc, t) => acc + t.amount, 0)
  const cardTotal = transactions
    .filter((t) => t.paymentMode === "CARD")
    .reduce((acc, t) => acc + t.amount, 0)
  const chequeTotal = transactions
    .filter((t) => t.paymentMode === "CHEQUE" || t.paymentMode === "NET_BANKING")
    .reduce((acc, t) => acc + t.amount, 0)

  const handlePrint = () => {
    window.print()
  }

  const currentDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card border border-border p-6 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header matching Classly standard dialogs */}
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-1">
            <ReceiptText className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Daily Counter Closing Summary
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Front-desk collections recorded for {currentDateStr}.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-0.5">
          {/* Summary Metric Card */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                Total Collections Recorded
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
                ₹{totalCollected.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {transactions.length} receipts issued at reception counter
              </p>
            </div>
            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="size-3.5" />
                Register Balanced
              </span>
              <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[160px]">
                {instituteName}
              </p>
            </div>
          </div>

          {/* Mode Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Banknote className="size-3.5 text-amber-600" />
                <span>Cash</span>
              </div>
              <div className="text-base font-bold text-foreground">
                ₹{cashTotal.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <QrCode className="size-3.5 text-primary" />
                <span>UPI</span>
              </div>
              <div className="text-base font-bold text-foreground">
                ₹{upiTotal.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CreditCard className="size-3.5 text-blue-600" />
                <span>Card</span>
              </div>
              <div className="text-base font-bold text-foreground">
                ₹{cardTotal.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3.5 text-slate-600" />
                <span>Bank / Cheque</span>
              </div>
              <div className="text-base font-bold text-foreground">
                ₹{chequeTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Recent Counter Ledger Table */}
          <div className="border border-border rounded-lg overflow-hidden bg-card shadow-xs">
            <div className="px-3.5 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Today&apos;s Receipts Ledger ({transactions.length})
              </span>
              <span className="text-[11px] text-muted-foreground">
                {currentDateStr}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-border">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No fee receipts recorded yet today. Click &quot;Collect Fee&quot; to accept counter payments.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-semibold text-foreground">{tx.studentName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {tx.receiptNo} · {tx.batchName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700">₹{tx.amount.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{tx.paymentMode}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t border-border mt-2 flex flex-row items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs rounded-lg border-border"
          >
            <Printer className="size-3.5 mr-1.5 text-muted-foreground" />
            Print Closing Sheet
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

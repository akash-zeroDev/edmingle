"use client"

import * as React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldCheck, IndianRupee, Smartphone, CreditCard, Loader2, Sparkles, CheckCircle } from "lucide-react"

interface RazorpayTestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    orderId: string
    amount: number // in paise
    currency?: string
    studentName?: string
    phone?: string
  } | null
  onSuccess: (paymentDetails: {
    razorpayOrderId: string
    razorpayPaymentId: string
    paymentMode: string
  }) => Promise<void>
}

export function RazorpayTestModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: RazorpayTestModalProps) {
  const [processingMode, setProcessingMode] = useState<string | null>(null)

  if (!order) return null

  const displayAmount = (order.amount / 100).toLocaleString("en-IN")

  const handlePay = async (mode: "UPI" | "CARD") => {
    try {
      setProcessingMode(mode)
      // Simulate network roundtrip (800ms)
      await new Promise((r) => setTimeout(r, 800))
      const simulatedPaymentId = `pay_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`

      await onSuccess({
        razorpayOrderId: order.orderId,
        razorpayPaymentId: simulatedPaymentId,
        paymentMode: mode,
      })
      onOpenChange(false)
    } finally {
      setProcessingMode(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-border shadow-2xl rounded-2xl">
        {/* Razorpay Branded Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <IndianRupee className="size-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-blue-300 font-semibold flex items-center gap-1.5">
                <span>Razorpay Gateway</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  TEST MODE
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Tuition Fee Checkout</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-blue-300">Amount to pay</div>
            <div className="text-xl font-bold text-white">₹{displayAmount}</div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-5 space-y-4 bg-background">
          {/* Order Details Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Order Reference:</span>
              <span className="font-mono text-foreground font-medium">{order.orderId}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Payer Name:</span>
              <span className="text-foreground font-medium">{order.studentName || "Enrolled Student"}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Contact:</span>
              <span className="text-foreground font-medium">{order.phone || "+91 98102 45631"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <span>Select Sandbox Payment Method:</span>
            </div>

            {/* Test UPI Button */}
            <button
              type="button"
              disabled={!!processingMode}
              onClick={() => handlePay("UPI")}
              className="w-full p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary-light/30 transition-all flex items-center justify-between text-left cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Smartphone className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Test UPI (Fast Verification)</div>
                  <div className="text-[11px] text-muted-foreground">Simulate instant approval with test VPA</div>
                </div>
              </div>
              {processingMode === "UPI" ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <div className="text-xs font-semibold text-primary">Pay ₹{displayAmount}</div>
              )}
            </button>

            {/* Test Card Button */}
            <button
              type="button"
              disabled={!!processingMode}
              onClick={() => handlePay("CARD")}
              className="w-full p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary-light/30 transition-all flex items-center justify-between text-left cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CreditCard className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Test Credit / Debit Card</div>
                  <div className="text-[11px] text-muted-foreground">Simulate 3D Secure OTP verification</div>
                </div>
              </div>
              {processingMode === "CARD" ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <div className="text-xs font-semibold text-primary">Pay ₹{displayAmount}</div>
              )}
            </button>
          </div>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Sandbox environment active. Transactions generate valid receipts and update the ledger.</span>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border bg-muted/30 sm:justify-between flex-row items-center">
          <span className="text-[11px] text-muted-foreground font-mono">256-bit SSL Simulated</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!!processingMode}
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

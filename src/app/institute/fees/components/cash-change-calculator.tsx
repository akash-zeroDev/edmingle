"use client"

import React, { useState, useEffect } from "react"
import { Banknote, CornerDownRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CashChangeCalculatorProps {
  payableAmount: number
  onTenderChange?: (tendered: number, changeToReturn: number) => void
}

export function CashChangeCalculator({
  payableAmount,
  onTenderChange,
}: CashChangeCalculatorProps) {
  const [tenderedInput, setTenderedInput] = useState<string>(payableAmount.toString())

  const tendered = parseFloat(tenderedInput) || 0
  const changeToReturn = Math.max(0, tendered - payableAmount)
  const shortage = Math.max(0, payableAmount - tendered)

  useEffect(() => {
    onTenderChange?.(tendered, changeToReturn)
  }, [tendered, changeToReturn, onTenderChange])

  // Suggested currency notes based on amount
  const roundToNext500 = Math.ceil(payableAmount / 500) * 500
  const roundToNext1000 = Math.ceil(payableAmount / 1000) * 1000
  const roundToNext2000 = Math.ceil(payableAmount / 2000) * 2000

  const quickAmounts = Array.from(
    new Set([payableAmount, roundToNext500, roundToNext1000, roundToNext2000])
  ).filter((amt) => amt >= payableAmount)

  return (
    <div className="p-3.5 rounded-lg bg-muted/20 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Banknote className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            Cash Tender & Change
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Due: <strong className="text-foreground">₹{payableAmount.toLocaleString("en-IN")}</strong>
        </span>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">
          Cash Tendered by Payer (₹)
        </Label>
        <Input
          type="number"
          min={0}
          value={tenderedInput}
          onChange={(e) => setTenderedInput(e.target.value)}
          placeholder="Enter cash received"
          className="h-8 text-sm font-semibold bg-card border-border"
        />
      </div>

      {/* Quick Currency Chip Suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[11px] text-muted-foreground">Quick:</span>
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setTenderedInput(amt.toString())}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              tendered === amt
                ? "bg-primary text-white border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            ₹{amt.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      {/* Change or Shortage Display */}
      {tendered >= payableAmount ? (
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <CornerDownRight className="size-3.5 text-emerald-700" />
            <span>Return Change:</span>
          </div>
          <span className="text-sm font-bold text-emerald-800">
            ₹{changeToReturn.toLocaleString("en-IN")}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span>Shortage (Underpaid):</span>
          </div>
          <span className="text-sm font-bold text-rose-800">
            -₹{shortage.toLocaleString("en-IN")}
          </span>
        </div>
      )}
    </div>
  )
}

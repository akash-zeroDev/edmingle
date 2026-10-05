"use client"

import React, { useState } from "react"
import { Calendar, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface InstallmentPlanSelectorProps {
  totalFee: number
  alreadyPaid: number
  selectedAmount: number
  onSelectAmount: (amount: number, planLabel: string) => void
}

export function InstallmentPlanSelector({
  totalFee,
  alreadyPaid,
  selectedAmount,
  onSelectAmount,
}: InstallmentPlanSelectorProps) {
  const balance = Math.max(0, totalFee - alreadyPaid)
  const monthlyAmount = Math.min(balance, Math.max(2500, Math.round(totalFee / 10)))
  const quarterlyAmount = Math.min(balance, Math.max(monthlyAmount * 3, Math.round(totalFee / 4)))

  const [isCustom, setIsCustom] = useState(false)
  const [customVal, setCustomVal] = useState(selectedAmount.toString())

  const plans = [
    {
      id: "month",
      label: "Current Month",
      sub: "1 Month Tuition",
      amount: monthlyAmount,
    },
    {
      id: "quarter",
      label: "Quarterly",
      sub: "Term Installment",
      amount: quarterlyAmount,
    },
    {
      id: "full",
      label: "Clear All Dues",
      sub: "Full Outstanding",
      amount: balance,
    },
  ]

  const handlePlanClick = (amount: number, label: string) => {
    setIsCustom(false)
    onSelectAmount(amount, label)
  }

  const handleCustomChange = (val: string) => {
    setCustomVal(val)
    const parsed = parseFloat(val) || 0
    onSelectAmount(parsed, "Custom Partial Payment")
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span>Payment Installment</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Outstanding: <strong className="text-foreground">₹{balance.toLocaleString("en-IN")}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {plans.map((p) => {
          const isSelected = !isCustom && selectedAmount === p.amount
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePlanClick(p.amount, p.label)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? "border-primary bg-primary-light/40 shadow-xs"
                  : "border-border bg-card hover:border-slate-300 hover:bg-muted/40"
              }`}
            >
              {isSelected && (
                <CheckCircle2 className="size-3.5 text-primary absolute top-2.5 right-2.5" />
              )}
              <div className="text-xs font-semibold text-foreground">{p.label}</div>
              <div className="text-sm font-bold text-foreground mt-0.5">
                ₹{p.amount.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-muted-foreground">{p.sub}</div>
            </button>
          )
        })}
      </div>

      {/* Custom Amount Toggle & Input */}
      <div>
        <button
          type="button"
          onClick={() => {
            setIsCustom(true)
            const parsed = parseFloat(customVal) || 0
            onSelectAmount(parsed, "Custom Partial Payment")
          }}
          className={`text-xs transition-colors cursor-pointer ${
            isCustom ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          + Custom amount
        </button>

        {isCustom && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                min={1}
                max={balance}
                value={customVal}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Enter custom amount"
                className="pl-7 h-8 text-xs font-semibold border-primary/40 focus-visible:ring-primary"
                autoFocus
              />
            </div>
            <span className="text-[11px] text-muted-foreground">Max: ₹{balance.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import React, { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomSelect } from "@/components/ui/custom-select"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export function Status({ value }: { value: string }) {
  const positive = ["Active", "PAID", "Paid", "Present", "Resolved", "ACTIVE"].includes(value)
  const warning = [
    "Invitation Sent",
    "PARTIAL",
    "PARTIALLY_PAID",
    "Partially Paid",
    "Late",
    "Open",
    "OPEN",
    "Past due",
    "OVERDUE",
    "Overdue",
    "PENDING",
    "Pending",
  ].includes(value)

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-[11px] font-semibold",
        positive && "bg-success-muted text-success border border-success/30",
        warning && "bg-warning-muted text-warning border border-warning/30",
        !positive && !warning && "bg-error-muted text-error border border-error/30"
      )}
    >
      {value}
    </span>
  )
}

export function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="border-b px-4 py-5 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-[13px] font-medium text-foreground">{value}</dd>
    </div>
  )
}

export function ActionButton({
  icon: Icon,
  children,
  onClick,
  destructive = false,
}: {
  icon: LucideIcon
  children: ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-9 justify-start shadow-none text-xs font-semibold cursor-pointer",
        destructive && "border-error/30 text-error hover:bg-error-muted hover:text-error"
      )}
    >
      <Icon className="size-3.5 mr-1.5" />
      {children}
    </Button>
  )
}

export function ActionDialog({
  action,
  name,
  open,
  onOpenChange,
  onConfirm,
}: {
  action: string
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (data: { amount?: number; method?: string; notes?: string }) => void
}) {
  const isPayment = action === "Record Payment"
  const [amount, setAmount] = React.useState("")
  const [method, setMethod] = React.useState("UPI")
  const [note, setNote] = React.useState("")

  const handleConfirm = () => {
    onConfirm?.({
      amount: parseFloat(amount) || 0,
      method,
      notes: note,
    })
    toast.success(`${action} processed for ${name}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
          <DialogDescription>
            Complete this action for <strong className="text-foreground">{name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2 py-2">
          {isPayment && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="payment-amount" className="text-xs">
                  Amount (₹)
                </Label>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="₹0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment-method" className="text-xs">
                  Payment Method
                </Label>
                <CustomSelect
                  id="payment-method"
                  value={method}
                  onChange={setMethod}
                  options={[
                    { value: "UPI", label: "UPI" },
                    { value: "CASH", label: "Cash" },
                    { value: "CARD", label: "Card" },
                    { value: "CHEQUE", label: "Bank Transfer / Cheque" },
                  ]}
                  placeholder="Select Method"
                  size="sm"
                />
              </div>
            </>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="action-note" className="text-xs">
              Notes
            </Label>
            <Input
              id="action-note"
              placeholder={`Add a note for ${action.toLowerCase()}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} className="h-9 text-xs bg-primary hover:bg-primary-hover text-white">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ConfirmDialog({
  action,
  name,
  destructive,
  open,
  onOpenChange,
  onConfirm,
}: {
  action: string
  name: string
  destructive?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (reason: string) => void
}) {
  const [reason, setReason] = React.useState("")

  const handleConfirm = () => {
    onConfirm?.(reason)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{action}?</DialogTitle>
          <DialogDescription>
            This will update status or access for <strong className="text-foreground">{name}</strong>. Add a clear reason before continuing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="governance-reason" className="text-xs">
            Reason / Audit Note
          </Label>
          <Input
            id="governance-reason"
            placeholder="Enter reason for this action"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            className="h-9 text-xs"
          >
            {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UsageBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
        <div className="h-full bg-primary rounded-sm transition-all" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  )
}

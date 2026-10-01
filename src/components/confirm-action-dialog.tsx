"use client"

import { useState } from "react"
import { AlertTriangle, UserX, Loader2, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actionLabel: string
  actionType: "SUSPEND" | "REMOVE"
  targetName: string
  targetRole: "Student" | "Faculty Member"
  onConfirm: (reason: string) => Promise<void>
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  actionType,
  targetName,
  targetRole,
  onConfirm,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRemove = actionType === "REMOVE"

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(reason)
      setReason("")
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6 bg-white rounded-2xl border border-[#e3e8e5]">
        <DialogHeader className="mb-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
              isRemove ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {isRemove ? <UserX className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <DialogTitle className="text-lg font-bold text-[#1a201c]">{title}</DialogTitle>
          <DialogDescription className="text-xs text-[#5e6b63]">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target Info Pill */}
          <div className="p-3 rounded-xl bg-[#f8faf9] border border-[#e3e8e5] text-xs flex justify-between items-center">
            <span className="text-[#5e6b63] font-medium">{targetRole}</span>
            <span className="font-bold text-[#1a201c]">{targetName}</span>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-[#1a201c] mb-1.5">
              Reason / Comment <span className="text-[#8b9a90] font-normal">(Optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Non-payment of platform fees, disciplinary action, completed curriculum..."
              rows={3}
              className="w-full p-3 text-xs bg-white border border-[#e3e8e5] rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/25 focus:border-primary transition-all resize-none text-[#1a201c] placeholder:text-[#a1b0a6]"
            />
          </div>

          {/* Notification notice */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
            <Send className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <span>
              An official <strong>SMS and Email notice</strong> with this reason will be dispatched immediately to all associated contact numbers and emails.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 text-xs font-medium border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`h-10 px-5 text-xs font-semibold text-white shadow-sm rounded-xl focus:outline-none focus-visible:outline-none ${
              isRemove
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              actionLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

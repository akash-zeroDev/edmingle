"use client"

import React, { useState, useEffect, useTransition } from "react"
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
import {
  Phone,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import {
  requestPhoneChangeOtp,
  verifyPhoneChangeOtp,
  getPhoneChangeQuota,
} from "@/actions/settings"
import { useToast } from "@/hooks/use-toast"

interface PhoneChangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPhone?: string
  role: "student" | "teacher"
  onSuccess?: (newPhone: string) => void
}

export function PhoneChangeModal({
  open,
  onOpenChange,
  currentPhone = "",
  role,
  onSuccess,
}: PhoneChangeModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<"INPUT" | "OTP">("INPUT")
  const [newPhone, setNewPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Quota & cooldown state
  const [quota, setQuota] = useState<{
    remainingQuota: number
    maxChanges: number
    canChange: boolean
    cooldownRemainingHours?: number
  }>({
    remainingQuota: 3,
    maxChanges: 3,
    canChange: true,
  })

  // 30s resend timer
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Fetch quota when modal opens
  useEffect(() => {
    if (open) {
      setStep("INPUT")
      setNewPhone("")
      setOtp("")
      setErrorMsg(null)
      setDevOtp(null)
      setCountdown(0)

      startTransition(async () => {
        const res = await getPhoneChangeQuota(role)
        if (res.success && res.remainingQuota !== undefined) {
          setQuota({
            remainingQuota: res.remainingQuota,
            maxChanges: res.maxChanges || 3,
            canChange: res.canChange ?? true,
            cooldownRemainingHours: res.cooldownRemainingHours,
          })
        }
      })
    }
  }, [open, role])

  const handleRequestOtp = () => {
    setErrorMsg(null)
    const cleanDigits = newPhone.replace(/\D/g, "").slice(-10)

    if (!cleanDigits || cleanDigits.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.")
      return
    }

    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      setErrorMsg("Indian mobile numbers must begin with 6, 7, 8, or 9.")
      return
    }

    startTransition(async () => {
      const res = await requestPhoneChangeOtp({
        newPhone: cleanDigits,
        role,
      })

      if (!res.success) {
        setErrorMsg(res.error || "Failed to send verification code.")
        toast({
          title: "Request failed",
          description: res.error || "Unable to send verification OTP.",
          variant: "destructive",
        })
      } else {
        setStep("OTP")
        setCountdown(30)
        if (res.devOtp) {
          setDevOtp(res.devOtp)
        }
        toast({
          title: "Verification code sent",
          description: `A 6-digit OTP has been dispatched to +91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}.`,
        })
      }
    })
  }

  const handleVerifyOtp = () => {
    setErrorMsg(null)
    const cleanOtp = otp.trim()

    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.")
      return
    }

    startTransition(async () => {
      const res = await verifyPhoneChangeOtp({
        newPhone: newPhone.replace(/\D/g, "").slice(-10),
        otp: cleanOtp,
        role,
      })

      if (!res.success) {
        setErrorMsg(res.error || "Verification failed.")
        toast({
          title: "Verification failed",
          description: res.error || "Invalid OTP code.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Mobile number updated",
          description: `Your phone number has been updated to ${res.updatedPhone}.`,
        })
        if (onSuccess && res.updatedPhone) {
          onSuccess(res.updatedPhone)
        }
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-2">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Phone className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {step === "INPUT" ? "Change registered mobile number" : "Enter verification code"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {step === "INPUT"
              ? "For student and faculty security, updating your contact number requires one-time password (OTP) verification."
              : `We sent a 6-digit security code to +91 ${newPhone.replace(/\D/g, "").slice(-10)}. Code expires in 5 minutes.`}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {step === "INPUT" ? (
          <div className="space-y-4 py-2">
            {/* Current Info & Quota Strip */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Currently registered:</span>
                <span className="font-semibold text-foreground font-mono">
                  {currentPhone || "None configured"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Annual update quota:</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary">
                  {quota.remainingQuota} of {quota.maxChanges} remaining
                </span>
              </div>
            </div>

            {quota.cooldownRemainingHours && quota.cooldownRemainingHours > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                <span>
                  Security cooldown active. You can change your number in{" "}
                  <strong>{quota.cooldownRemainingHours} hour(s)</strong>.
                </span>
              </div>
            ) : null}

            {/* Input field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                New 10-Digit Mobile Number
              </Label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground pointer-events-none border-r border-border pr-2.5">
                  <span>🇮🇳 +91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="98765 43210"
                  value={newPhone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^\d\s]/g, "")
                    setNewPhone(clean)
                    if (errorMsg) setErrorMsg(null)
                  }}
                  maxLength={12}
                  disabled={isPending || !quota.canChange}
                  className="pl-24 h-11 text-sm font-medium rounded-xl"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Indian numbers must start with 6, 7, 8, or 9. Maximum 3 updates per academic year.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Dev mode helper banner */}
            {devOtp && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 shrink-0 text-emerald-600" />
                  <span>
                    Test OTP: <strong className="font-mono text-sm tracking-wider">{devOtp}</strong>
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOtp(devOtp)}
                  className="h-7 text-[11px] px-2 text-emerald-700 hover:bg-emerald-100/50"
                >
                  Auto-fill
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  6-Digit OTP Code
                </Label>
                {countdown > 0 ? (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="size-3" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isPending}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="size-3" />
                    Resend OTP
                  </button>
                )}
              </div>

              <Input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "").slice(0, 6)
                  setOtp(clean)
                  if (errorMsg) setErrorMsg(null)
                }}
                maxLength={6}
                disabled={isPending}
                className="h-12 text-center text-lg tracking-[0.4em] font-mono font-bold rounded-xl"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground text-center">
                Maximum 3 verification attempts permitted before code invalidates.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
          {step === "OTP" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setStep("INPUT")
                setErrorMsg(null)
              }}
              disabled={isPending}
              className="rounded-xl h-10 text-xs font-semibold"
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              Change number
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl h-10 text-xs font-semibold"
            >
              Cancel
            </Button>
          )}

          {step === "INPUT" ? (
            <Button
              type="button"
              size="sm"
              onClick={handleRequestOtp}
              disabled={
                isPending ||
                !quota.canChange ||
                newPhone.replace(/\D/g, "").length !== 10
              }
              className="rounded-xl h-10 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs"
            >
              {isPending ? "Sending code..." : "Send verification code"}
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleVerifyOtp}
              disabled={isPending || otp.trim().length !== 6}
              className="rounded-xl h-10 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs"
            >
              {isPending ? "Verifying..." : "Verify & update"}
              <ShieldCheck className="size-3.5 ml-1.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

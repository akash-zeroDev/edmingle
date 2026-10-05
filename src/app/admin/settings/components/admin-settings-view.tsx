"use client"

import React, { useState, useTransition } from "react"
import {
  Landmark,
  CreditCard,
  Key,
  Shield,
  Database,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  RefreshCw,
  Sparkles,
  Lock,
  Building,
  Check,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  updateSuperAdminBankingSettings,
  updateRazorpaySettings,
  verifyRazorpayCredentials,
} from "@/actions/settings"
import type { PlatformSettingsData } from "@/lib/platform-settings"

interface AdminSettingsViewProps {
  initialSettings: PlatformSettingsData
  adminEmail: string
}

export function AdminSettingsView({
  initialSettings,
  adminEmail,
}: AdminSettingsViewProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("banking")

  // 1. Banking Details Form State
  const [accountHolderName, setAccountHolderName] = useState(
    initialSettings.banking.accountHolderName || ""
  )
  const [accountNumber, setAccountNumber] = useState(
    initialSettings.banking.accountNumber || ""
  )
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(
    initialSettings.banking.accountNumber || ""
  )
  const [ifscCode, setIfscCode] = useState(
    initialSettings.banking.ifscCode || ""
  )
  const [bankName, setBankName] = useState(
    initialSettings.banking.bankName || ""
  )
  const [branchName, setBranchName] = useState(
    initialSettings.banking.branchName || ""
  )
  const [accountType, setAccountType] = useState<"CURRENT" | "SAVINGS">(
    initialSettings.banking.accountType || "CURRENT"
  )
  const [upiVpa, setUpiVpa] = useState(initialSettings.banking.upiVpa || "")
  const [bankingErrors, setBankingErrors] = useState<Record<string, string>>({})
  const [isBankingPending, startBankingTransition] = useTransition()

  // 2. Razorpay Gateway Form State
  const [keyId, setKeyId] = useState(initialSettings.razorpay.keyId || "")
  const [keySecret, setKeySecret] = useState(
    initialSettings.razorpay.keySecret || ""
  )
  const [webhookSecret, setWebhookSecret] = useState(
    initialSettings.razorpay.webhookSecret || ""
  )
  const [environment, setEnvironment] = useState<"TEST" | "LIVE">(
    initialSettings.razorpay.environment || "TEST"
  )
  const [isActive, setIsActive] = useState<boolean>(
    initialSettings.razorpay.isActive ?? true
  )
  const [showSecret, setShowSecret] = useState(false)
  const [isRazorpayPending, startRazorpayTransition] = useTransition()

  // 3. Razorpay Probe State
  const [isProbing, startProbeTransition] = useTransition()
  const [probeResult, setProbeResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Real-time Banking Validation
  const validateBanking = () => {
    const errors: Record<string, string> = {}

    if (!accountHolderName.trim() || accountHolderName.trim().length < 3) {
      errors.accountHolderName = "Account holder name must be at least 3 characters."
    }

    if (!/^\d{9,18}$/.test(accountNumber)) {
      errors.accountNumber = "Account number must be between 9 and 18 numerical digits."
    }

    if (accountNumber !== confirmAccountNumber) {
      errors.confirmAccountNumber = "Account numbers do not match."
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
      errors.ifscCode = "Invalid IFSC format (e.g. HDFC0001234, SBIN0000456)."
    }

    if (!bankName.trim() || bankName.trim().length < 2) {
      errors.bankName = "Bank name is required."
    }

    if (!branchName.trim() || branchName.trim().length < 2) {
      errors.branchName = "Branch city/name is required."
    }

    if (upiVpa.trim() && !/^[\w.-]+@[\w.-]+$/.test(upiVpa.trim())) {
      errors.upiVpa = "Invalid UPI handle format (e.g. merchant@icici)."
    }

    setBankingErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveBanking = () => {
    if (!validateBanking()) {
      toast({
        title: "Validation error",
        description: "Please resolve the banking details errors highlighted below.",
        variant: "destructive",
      })
      return
    }

    startBankingTransition(async () => {
      const res = await updateSuperAdminBankingSettings({
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        confirmAccountNumber: confirmAccountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankName: bankName.trim(),
        branchName: branchName.trim(),
        accountType,
        upiVpa: upiVpa.trim(),
      })

      if (!res.success) {
        toast({
          title: "Update failed",
          description: res.error || "Failed to update merchant banking details.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Banking details saved",
          description: res.message || "Merchant account details saved securely.",
        })
      }
    })
  }

  const handleSaveRazorpay = () => {
    if (!keyId.trim()) {
      toast({
        title: "Validation error",
        description: "Razorpay Key ID is required.",
        variant: "destructive",
      })
      return
    }

    if (!keySecret.trim()) {
      toast({
        title: "Validation error",
        description: "Razorpay Key Secret is required.",
        variant: "destructive",
      })
      return
    }

    startRazorpayTransition(async () => {
      const res = await updateRazorpaySettings({
        keyId: keyId.trim(),
        keySecret: keySecret.trim(),
        webhookSecret: webhookSecret.trim(),
        environment,
        isActive,
      })

      if (!res.success) {
        toast({
          title: "Update failed",
          description: res.error || "Failed to configure Razorpay gateway.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Razorpay configured",
          description: res.message || "Gateway credentials saved successfully.",
        })
      }
    })
  }

  const handleProbeCredentials = () => {
    if (!keyId.trim() || !keySecret.trim()) {
      toast({
        title: "Missing credentials",
        description: "Please enter both Razorpay Key ID and Key Secret to probe.",
        variant: "destructive",
      })
      return
    }

    setProbeResult(null)
    startProbeTransition(async () => {
      const res = await verifyRazorpayCredentials(keyId.trim(), keySecret.trim())
      setProbeResult(res)
      if (res.success) {
        toast({
          title: "Credentials verified",
          description: res.message,
        })
      } else {
        toast({
          title: "Probe failed",
          description: res.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="max-w-[1400px] w-full p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Settings & Billing Gateway
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Superadmin
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Configure platform settlement bank details, Razorpay gateway integration, and SaaS subscription rules.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-border bg-card/50 rounded-2xl p-1.5 border">
          <TabsList className="h-11 gap-2 bg-transparent p-0 flex flex-wrap">
            <TabsTrigger
              value="banking"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Landmark className="size-4" />
              <span>Merchant Banking (Indian)</span>
            </TabsTrigger>
            <TabsTrigger
              value="razorpay"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <CreditCard className="size-4" />
              <span>Razorpay Integration</span>
            </TabsTrigger>
            <TabsTrigger
              value="infrastructure"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Database className="size-4" />
              <span>Database & Infrastructure</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: INDIAN MERCHANT BANKING DETAILS */}
        <TabsContent value="banking" className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Landmark className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Indian Merchant Settlement Account
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Used for receiving SaaS subscription fees from institutes and settlement transfers
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSaveBanking}
                disabled={isBankingPending}
                className="rounded-xl h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
              >
                {isBankingPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="size-3.5 mr-1.5" />
                    Save banking details
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Account Holder Name */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Legal Account Holder Name</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={accountHolderName}
                  onChange={(e) => {
                    setAccountHolderName(e.target.value)
                    if (bankingErrors.accountHolderName) {
                      setBankingErrors({ ...bankingErrors, accountHolderName: "" })
                    }
                  }}
                  placeholder="e.g. Classly Technologies Private Limited"
                  className="h-11 rounded-xl font-medium text-sm"
                />
                {bankingErrors.accountHolderName && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {bankingErrors.accountHolderName}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Must match the name registered on your corporate PAN / GSTIN certificate.
                </p>
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Bank Account Number</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="password"
                  value={accountNumber}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "")
                    setAccountNumber(clean)
                    if (bankingErrors.accountNumber) {
                      setBankingErrors({ ...bankingErrors, accountNumber: "" })
                    }
                  }}
                  placeholder="Enter 9–18 digit account number"
                  maxLength={18}
                  className="h-11 rounded-xl font-mono text-sm"
                />
                {bankingErrors.accountNumber && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {bankingErrors.accountNumber}
                  </p>
                )}
              </div>

              {/* Confirm Account Number */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Confirm Bank Account Number</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  value={confirmAccountNumber}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "")
                    setConfirmAccountNumber(clean)
                    if (bankingErrors.confirmAccountNumber) {
                      setBankingErrors({ ...bankingErrors, confirmAccountNumber: "" })
                    }
                  }}
                  placeholder="Re-enter account number"
                  maxLength={18}
                  className="h-11 rounded-xl font-mono text-sm"
                />
                {bankingErrors.confirmAccountNumber && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {bankingErrors.confirmAccountNumber}
                  </p>
                )}
                {confirmAccountNumber && accountNumber && accountNumber === confirmAccountNumber && (
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Account numbers match.
                  </p>
                )}
              </div>

              {/* IFSC Code */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Bank IFSC Code</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={ifscCode}
                  onChange={(e) => {
                    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                    setIfscCode(clean)
                    if (bankingErrors.ifscCode) {
                      setBankingErrors({ ...bankingErrors, ifscCode: "" })
                    }
                  }}
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  className="h-11 rounded-xl font-mono text-sm uppercase"
                />
                {bankingErrors.ifscCode && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {bankingErrors.ifscCode}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Format: 4 letters, '0', then 6 alphanumeric characters.
                </p>
              </div>

              {/* Bank Name */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Bank Name</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value)
                    if (bankingErrors.bankName) {
                      setBankingErrors({ ...bankingErrors, bankName: "" })
                    }
                  }}
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  className="h-11 rounded-xl text-xs"
                />
                {bankingErrors.bankName && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {bankingErrors.bankName}
                  </p>
                )}
              </div>

              {/* Branch City / Name */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Branch City / Name</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={branchName}
                  onChange={(e) => {
                    setBranchName(e.target.value)
                    if (bankingErrors.branchName) {
                      setBankingErrors({ ...bankingErrors, branchName: "" })
                    }
                  }}
                  placeholder="e.g. Connaught Place, New Delhi"
                  className="h-11 rounded-xl text-xs"
                />
                {bankingErrors.branchName && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {bankingErrors.branchName}
                  </p>
                )}
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Account Type
                </Label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setAccountType("CURRENT")}
                    className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      accountType === "CURRENT"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Building className="size-4" />
                    Current (Corporate)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("SAVINGS")}
                    className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      accountType === "SAVINGS"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Landmark className="size-4" />
                    Savings
                  </button>
                </div>
              </div>

              {/* Primary UPI VPA Handle */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Primary Merchant UPI VPA (Optional)
                </Label>
                <Input
                  value={upiVpa}
                  onChange={(e) => {
                    setUpiVpa(e.target.value)
                    if (bankingErrors.upiVpa) {
                      setBankingErrors({ ...bankingErrors, upiVpa: "" })
                    }
                  }}
                  placeholder="e.g. classly@okhdfcbank"
                  className="h-11 rounded-xl font-mono text-xs"
                />
                {bankingErrors.upiVpa && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {bankingErrors.upiVpa}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Optional UPI ID for direct corporate settlements.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: RAZORPAY GATEWAY INTEGRATION */}
        <TabsContent value="razorpay" className="space-y-6 max-w-4xl">
          {/* Status Banner */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950 flex items-start gap-3">
            <Zap className="size-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Automated SaaS Institute Subscriptions</span>
              <p className="text-indigo-900/80 leading-relaxed">
                Connect your Razorpay Merchant account to accept card, net banking, UPI, and recurring subscription payments from institutes. Supports automated webhooks for invoice settlements.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Razorpay Gateway API Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    API credentials from your Razorpay Dashboard (Settings &gt; API Keys)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleProbeCredentials}
                  disabled={isProbing || !keyId.trim() || !keySecret.trim()}
                  className="rounded-xl h-9 px-3.5 text-xs font-semibold border-border hover:bg-muted/40 cursor-pointer"
                >
                  {isProbing ? (
                    <>
                      <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                      Probing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5 mr-1.5 text-indigo-600" />
                      Test credentials probe
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSaveRazorpay}
                  disabled={isRazorpayPending}
                  className="rounded-xl h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
                >
                  {isRazorpayPending ? "Saving..." : "Save gateway config"}
                </Button>
              </div>
            </div>

            {/* Probe Feedback Banner */}
            {probeResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  probeResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                {probeResult.success ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                )}
                <div>
                  <span className="font-bold">
                    {probeResult.success ? "API Connection Verified" : "Verification Failed"}
                  </span>
                  <p className="mt-0.5 leading-snug">{probeResult.message}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Key ID */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Razorpay Key ID</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Key className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <Input
                    value={keyId}
                    onChange={(e) => setKeyId(e.target.value)}
                    placeholder="rzp_test_... or rzp_live_..."
                    className="pl-10 h-11 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Key Secret */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Razorpay Key Secret</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={keySecret}
                    onChange={(e) => setKeySecret(e.target.value)}
                    placeholder="Enter Key Secret"
                    className="pl-10 pr-10 h-11 rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Razorpay Webhook Secret (Optional)
                </Label>
                <Input
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="e.g. whsec_edmingle_platform_prod"
                  className="h-11 rounded-xl font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used to verify HMAC SHA-256 signatures for <code className="font-mono">payment.captured</code> and <code className="font-mono">order.paid</code> webhook events.
                </p>
              </div>

              {/* Environment Toggle */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Gateway Environment
                </Label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setEnvironment("TEST")}
                    className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      environment === "TEST"
                        ? "border-amber-400 bg-amber-50 text-amber-900"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className="size-2 rounded-full bg-amber-500" />
                    Sandbox / Test Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvironment("LIVE")}
                    className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      environment === "LIVE"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Production / Live Mode
                  </button>
                </div>
              </div>

              {/* Accept Payments Toggle */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Payment Processing
                </Label>
                <div className="p-3 rounded-xl border border-border bg-muted/10 flex items-center justify-between h-11">
                  <span className="text-xs font-medium text-foreground">
                    Accept Institute Payments
                  </span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: INFRASTRUCTURE & MASTER ACCOUNT */}
        <TabsContent value="infrastructure" className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account security */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Account security</h3>
                  <p className="text-xs text-muted-foreground">Clerk master authentication</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Admin Email
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-0.5">
                    {adminEmail}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Role Authority
                  </span>
                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                    Platform Superadmin
                  </p>
                </div>
              </div>
            </div>

            {/* Database & Infrastructure */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Database className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Database</h3>
                  <p className="text-xs text-muted-foreground">Serverless Neon PostgreSQL</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    PostgreSQL (Neon aws-us-east-2)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Connected
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Audit Log Retention
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                    365 Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

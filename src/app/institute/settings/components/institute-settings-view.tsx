"use client"

import React, { useState, useTransition } from "react"
import {
  Building2,
  Receipt,
  QrCode,
  Shield,
  Bell,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Landmark,
  CreditCard,
  FileText,
  BadgeCheck,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { updateInstituteSettings } from "@/actions/settings"

interface InstituteSettingsViewProps {
  initialSettings: {
    id: string
    name: string
    location: string
    phoneNo: string
    adminEmail: string
    subscriptionType: string
    joinedAt: Date
    tagline: string
    gstin: string
    upiVpa: string
    receiptPrefix: string
    receiptTerms: string
    bankName: string
    bankAccountNumber: string
    bankIfsc: string
    defaultBatchTimings: string
    attendanceGraceMinutes: number
    sendAbsenteeAlert: boolean
    sendFeeReminderAlert: boolean
  }
}

export function InstituteSettingsView({ initialSettings }: InstituteSettingsViewProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("branding")

  // Form states
  const [name, setName] = useState(initialSettings.name || "")
  const [tagline, setTagline] = useState(initialSettings.tagline || "")
  const [location, setLocation] = useState(initialSettings.location || "")
  const [phoneNo, setPhoneNo] = useState(initialSettings.phoneNo || "")
  const [gstin, setGstin] = useState(initialSettings.gstin || "")

  const [upiVpa, setUpiVpa] = useState(initialSettings.upiVpa || "")
  const [receiptPrefix, setReceiptPrefix] = useState(initialSettings.receiptPrefix || "REC")
  const [receiptTerms, setReceiptTerms] = useState(
    initialSettings.receiptTerms ||
      "Fees once paid are non-refundable. Please retain this receipt for official records."
  )
  const [bankName, setBankName] = useState(initialSettings.bankName || "")
  const [bankAccountNumber, setBankAccountNumber] = useState(initialSettings.bankAccountNumber || "")
  const [bankIfsc, setBankIfsc] = useState(initialSettings.bankIfsc || "")

  const [defaultBatchTimings, setDefaultBatchTimings] = useState(
    initialSettings.defaultBatchTimings || "04:00 PM - 07:00 PM"
  )
  const [attendanceGraceMinutes, setAttendanceGraceMinutes] = useState(
    initialSettings.attendanceGraceMinutes ?? 15
  )
  const [sendAbsenteeAlert, setSendAbsenteeAlert] = useState(
    initialSettings.sendAbsenteeAlert ?? true
  )
  const [sendFeeReminderAlert, setSendFeeReminderAlert] = useState(
    initialSettings.sendFeeReminderAlert ?? true
  )

  const handleSave = () => {
    if (!name.trim() || name.trim().length < 2) {
      toast({
        title: "Validation error",
        description: "Institute name must be at least 2 characters long.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const res = await updateInstituteSettings({
        name: name.trim(),
        location: location.trim(),
        phoneNo: phoneNo.trim(),
        tagline: tagline.trim(),
        gstin: gstin.trim(),
        upiVpa: upiVpa.trim(),
        receiptPrefix: receiptPrefix.trim(),
        receiptTerms: receiptTerms.trim(),
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankIfsc: bankIfsc.trim(),
        defaultBatchTimings: defaultBatchTimings.trim(),
        attendanceGraceMinutes,
        sendAbsenteeAlert,
        sendFeeReminderAlert,
      })

      if (!res.success) {
        toast({
          title: "Update failed",
          description: res.error || "Unable to save institute settings.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Settings saved",
          description: res.message || "Institute settings successfully synchronized live.",
        })
      }
    })
  }

  return (
    <div className="max-w-[1400px] w-full p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Institute Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {initialSettings.subscriptionType} Plan
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure center branding, dynamic billing defaults, receipt disclaimers, and automated parent alerts.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl h-10 px-5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
        >
          {isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save changes
            </>
          )}
        </Button>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-border bg-card/50 rounded-2xl p-1.5 border">
          <TabsList className="h-11 gap-2 bg-transparent p-0 flex flex-wrap">
            <TabsTrigger
              value="branding"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Building2 className="size-4" />
              <span>Center Identity & Name</span>
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Receipt className="size-4" />
              <span>Billing, UPI & Receipts</span>
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Clock className="size-4" />
              <span>Academic Defaults</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Bell className="size-4" />
              <span>Parent Alert Rules</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: CENTER IDENTITY & LIVE NAME REBRANDING */}
        <TabsContent value="branding" className="space-y-6 max-w-4xl">
          {/* Live Propagation Notice Banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950 flex items-start gap-3">
            <Sparkles className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Live Center Rebranding</span>
              <p className="text-blue-900/80 leading-relaxed">
                Changes to the institute name synchronize live across student fee receipts (<code className="font-mono font-bold">REC-...</code>), faculty salary vouchers (<code className="font-mono font-bold">VCH-...</code>), student dashboards, teacher workspace, and institute headers.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Institute Identity</h3>
                <p className="text-xs text-muted-foreground">Official registered name and campus address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Institute Name</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex IIT-JEE & Medical Academy"
                  className="h-11 rounded-xl font-medium text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  The primary institution name printed on all official receipts and digital portals.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Institute Tagline / Subtitle</Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Premier Coaching for Engineering & Medical"
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">GSTIN / Tax Identification</Label>
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  className="h-11 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground">Campus Location & Street Address</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 2nd Floor, Block B, Connaught Place, New Delhi - 110001"
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Official Helpdesk Phone</Label>
                <div className="relative">
                  <Phone className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <Input
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-10 h-11 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Administrator Email</Label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <Input
                    value={initialSettings.adminEmail}
                    disabled
                    className="pl-10 h-11 rounded-xl text-xs font-mono bg-muted/40 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Managed via Clerk Super Admin credentials.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: BILLING, UPI & RECEIPTS */}
        <TabsContent value="billing" className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <QrCode className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Institute UPI VPA & Fee Receipts</h3>
                <p className="text-xs text-muted-foreground">Powers dynamic QR payment collection and printed fee receipts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Institute UPI VPA Handle</span>
                  <span className="text-[11px] font-normal text-muted-foreground">(Powers live QR in fee modal)</span>
                </Label>
                <Input
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="e.g. apexacademy@okhdfcbank"
                  className="h-11 rounded-xl font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  When cashiers collect fees via UPI, students scan a dynamic QR code pre-filled with this VPA.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Receipt Prefix</Label>
                <Input
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
                  placeholder="REC"
                  maxLength={8}
                  className="h-11 rounded-xl font-mono text-xs uppercase"
                />
                <p className="text-[11px] text-muted-foreground">Receipt numbering will follow: {receiptPrefix}-2026-XXXX</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Bank Name for Wire Transfers</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. ICICI Bank"
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Institute Bank Account Number</Label>
                <Input
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 50100234567891"
                  className="h-11 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Bank IFSC Code</Label>
                <Input
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. ICIC0000102"
                  className="h-11 rounded-xl text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground">Printed Receipt Terms & Conditions</Label>
                <Textarea
                  value={receiptTerms}
                  onChange={(e) => setReceiptTerms(e.target.value)}
                  rows={3}
                  placeholder="Enter fee policy notes printed at the footer of parent receipts..."
                  className="rounded-xl text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: ACADEMIC DEFAULTS */}
        <TabsContent value="academic" className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Academic & Attendance Timings</h3>
                <p className="text-xs text-muted-foreground">Default batch shifts and student roll-call rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Standard Batch Timings</Label>
                <Input
                  value={defaultBatchTimings}
                  onChange={(e) => setDefaultBatchTimings(e.target.value)}
                  placeholder="04:00 PM - 07:00 PM"
                  className="h-11 rounded-xl text-xs"
                />
                <p className="text-[11px] text-muted-foreground">Default slot pre-filled when creating new batches.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Attendance Grace Period (Minutes)</Label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={attendanceGraceMinutes}
                  onChange={(e) => setAttendanceGraceMinutes(parseInt(e.target.value) || 0)}
                  className="h-11 rounded-xl text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">Students arriving within grace period are marked LATE instead of ABSENT.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: PARENT NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Parent Alerts & Notification Dispatch</h3>
                <p className="text-xs text-muted-foreground">Automated SMS & WhatsApp communication triggers</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl border border-border bg-muted/10 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">Daily Absentee SMS / WhatsApp to Parents</span>
                  <p className="text-[11px] text-muted-foreground">
                    Automatically sends instant alert to parent phone number whenever student is marked ABSENT during roll call.
                  </p>
                </div>
                <Switch
                  checked={sendAbsenteeAlert}
                  onCheckedChange={setSendAbsenteeAlert}
                />
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/10 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">Fee Installment Due Date Reminder</span>
                  <p className="text-[11px] text-muted-foreground">
                    Sends automated fee reminder notice to parent 3 days prior to due date.
                  </p>
                </div>
                <Switch
                  checked={sendFeeReminderAlert}
                  onCheckedChange={setSendFeeReminderAlert}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

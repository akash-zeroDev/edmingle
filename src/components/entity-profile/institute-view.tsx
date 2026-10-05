"use client"

import React, { useState, useEffect, useTransition } from "react"
import {
  Mail,
  Phone,
  MessageCircle,
  Download,
  Users,
  UserRound,
  BookOpen,
  Ban,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Status,
  Section,
  Detail,
  ActionButton,
  ActionDialog,
  ConfirmDialog,
  UsageBar,
} from "./profile-primitives"
import { toggleInstituteStatus, impersonateInstitute } from "@/actions/institute"
import { toast } from "@/hooks/use-toast"

export interface InstituteProfileData {
  id: string
  clerkOrgId: string
  name: string
  location?: string | null
  adminEmail: string
  phoneNo?: string | null
  joinedAt: Date | string
  subscriptionType: string
  subsInfo?: string | null
  paymentStatus: string
  isActive: boolean
  _count?: {
    students: number
    teachers: number
    batches: number
    supportTickets?: number
  }
  invoices?: Array<{
    id: string
    amount: number
    status: string
    dueDate: Date | string
    createdAt: Date | string
  }>
  batches?: Array<{
    id: string
    className: string
    batchName?: string | null
    subject: string
    teacher?: { name: string } | null
    _count?: { students: number }
  }>
  supportTickets?: Array<{
    id: string
    title: string
    status: string
    type: string
    updatedAt: Date | string
  }>
}

export function InstituteView({
  profile,
  onInstituteUpdated,
}: {
  profile: InstituteProfileData
  onInstituteUpdated?: (updated: InstituteProfileData) => void
}) {
  const [isActive, setIsActive] = useState(profile.isActive)
  const [dialog, setDialog] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isImpersonating, setIsImpersonating] = useState(false)

  const handleImpersonate = async () => {
    setIsImpersonating(true)
    try {
      const res = await impersonateInstitute(profile.id)
      if (res.success) {
        toast.success(`Access granted. Switching context to ${res.instituteName}...`)
        window.location.href = "/institute"
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Impersonation Failed",
        description: err?.message || "Failed to switch to institute context.",
      })
      setIsImpersonating(false)
    }
  }

  const cleanPhone = (profile.phoneNo || "").replace(/\D/g, "")

  const handleEmailAdmin = () => {
    window.open(`mailto:${profile.adminEmail}?subject=${encodeURIComponent(`Classly Platform Notice: ${profile.name}`)}`)
  }

  const handleCall = () => {
    if (profile.phoneNo) window.open(`tel:${profile.phoneNo}`)
    else toast({ variant: "destructive", title: "No Phone", description: "Institute contact phone not on file." })
  }

  const handleWhatsApp = () => {
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${profile.name} Administration, contacting from Classly Platform.`)}`)
    } else {
      toast({ variant: "destructive", title: "No WhatsApp", description: "Institute phone number not provided." })
    }
  }

  useEffect(() => {
    setIsActive(profile.isActive)
  }, [profile.isActive])

  const handleToggleBlock = (reason?: string) => {
    const nextActive = !isActive
    startTransition(async () => {
      try {
        await toggleInstituteStatus(profile.id, nextActive, reason)
        setIsActive(nextActive)
        toast.success(nextActive ? `${profile.name} unblocked` : `${profile.name} blocked and locked out`)
        onInstituteUpdated?.({ ...profile, isActive: nextActive })
      } catch (err: any) {
        toast({ variant: "destructive", title: "Action Failed", description: err.message || "Failed to update status." })
      }
    })
  }

  const footprint = [
    { icon: Users, label: "Students", value: profile._count?.students || 0 },
    { icon: UserRound, label: "Teachers", value: profile._count?.teachers || 0 },
    { icon: BookOpen, label: "Batches", value: profile._count?.batches || 0 },
  ] satisfies Array<{ icon: LucideIcon; label: string; value: number }>

  const invoices = profile.invoices && profile.invoices.length > 0
    ? profile.invoices
    : [
        {
          id: `INV-2026-${profile.id.substring(0, 4)}`,
          amount: 8000,
          status: profile.paymentStatus || "PAID",
          dueDate: new Date(),
          createdAt: new Date(),
        },
      ]

  return (
    <>
      {/* Contact & Communications */}
      <Section title="Contact & communications">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Admin email" value={profile.adminEmail} />
          <Detail label="Phone" value={profile.phoneNo || "Not provided"} />
          <Detail label="Location" value={profile.location || "Not specified"} />
          <Detail
            label="Date Joined"
            value={new Date(profile.joinedAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton icon={Mail} onClick={handleEmailAdmin}>
            Email Admin
          </ActionButton>
          <ActionButton icon={Phone} onClick={handleCall}>
            Call
          </ActionButton>
          <ActionButton icon={MessageCircle} onClick={handleWhatsApp}>
            WhatsApp
          </ActionButton>
        </div>
      </Section>

      {/* Subscription & Billing */}
      <Section title="Subscription & billing" action={<Status value={profile.paymentStatus || "Paid"} />}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Detail label="Current plan" value={<span className="font-bold text-primary">{profile.subscriptionType}</span>} />
          <Detail label="Billing Cycle" value={profile.subsInfo || "Annual Term License"} />
          <Detail label="Payment method" value="Bank Transfer / UPI" />
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="data-table min-w-[480px]">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs">{inv.id}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="font-bold text-slate-900">₹{inv.amount.toLocaleString("en-IN")}</td>
                  <td>
                    <Status value={inv.status} />
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Download receipt ${inv.id}`}
                      onClick={() => toast.success(`Receipt ${inv.id} downloaded`)}
                      className="size-8"
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Platform Footprint & Usage Bars */}
      <Section title="Platform footprint">
        <div className="grid grid-cols-3 gap-3">
          {footprint.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
              <Icon className="size-4 text-primary" />
              <p className="mt-2 text-2xl font-bold text-slate-900">{value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Active {label.toLowerCase()}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3.5">
          <UsageBar label="Database & Storage Space" value={42} />
          <UsageBar label="SMS Broadcast Credits" value={78} />
          <UsageBar label="Monthly Email Quota" value={28} />
        </div>
      </Section>

      {/* Academic & System Policy */}
      <Section title="Academic & system policy">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Attendance policy" value="75% Minimum Mandatory" />
          <Detail label="Timezone" value="India Standard Time (IST - UTC+05:30)" />
          <Detail label="Current session" value="Academic Session 2025–2026" />
          <Detail label="Organization Clerk ID" value={<span className="font-mono text-xs text-slate-600">{profile.clerkOrgId}</span>} />
        </dl>
      </Section>

      {/* Active Batches */}
      <Section title="Active batches">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="data-table min-w-[500px]">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Faculty</th>
                <th>Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {profile.batches && profile.batches.length > 0 ? (
                profile.batches.map((batch) => (
                  <tr key={batch.id}>
                    <td className="font-semibold text-slate-900">{batch.batchName || batch.className}</td>
                    <td className="text-slate-600">{batch.teacher?.name || "Assigned Faculty"}</td>
                    <td className="font-medium">{batch._count?.students || 0}</td>
                    <td>
                      <Status value="Active" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                    No active batches registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Support Tickets Summary */}
      {profile.supportTickets && profile.supportTickets.length > 0 && (
        <Section title="Support summary">
          <div className="divide-y rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
            {profile.supportTickets.map((ticket) => (
              <div key={ticket.id} className="grid grid-cols-[80px_1fr_auto] items-center gap-2 p-3">
                <span className="font-mono text-muted-foreground">{ticket.id.substring(0, 8)}</span>
                <div>
                  <p className="font-medium text-slate-900">{ticket.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Updated {new Date(ticket.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <Status value={ticket.status} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Governance & Access Killswitch */}
      <Section title="Governance">
        <div className="space-y-3 rounded-xl border border-error/25 bg-error-muted/30 p-4">
          <div>
            <p className="text-[13px] font-semibold text-slate-900">Platform access control</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Immediately controls access for every administrator, teacher, and student in this organization.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              disabled={isPending}
              onClick={() => setDialog(isActive ? "Block Institute" : "Unblock Institute")}
              className="h-9 text-xs font-semibold cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : isActive ? (
                <Ban className="size-3.5 mr-1.5" />
              ) : (
                <ShieldCheck className="size-3.5 mr-1.5" />
              )}
              {isActive ? "Block Institute" : "Unblock Institute"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isImpersonating || isPending}
              onClick={handleImpersonate}
              className="h-9 text-xs border-slate-200 cursor-pointer"
            >
              {isImpersonating ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin text-amber-600" />
              ) : (
                <ExternalLink className="size-3.5 mr-1.5" />
              )}
              {isImpersonating ? "Switching..." : "Impersonate Admin"}
            </Button>
          </div>
        </div>
      </Section>

      {/* Confirm Block / Unblock Dialog */}
      <ConfirmDialog
        action={dialog ?? "Block Institute"}
        name={profile.name}
        destructive={dialog === "Block Institute"}
        open={Boolean(dialog && ["Block Institute", "Unblock Institute"].includes(dialog))}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={(reason) => handleToggleBlock(reason)}
      />
    </>
  )
}

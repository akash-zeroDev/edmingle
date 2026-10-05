"use client"

import React, { useState } from "react"
import {
  Phone,
  MessageCircle,
  ShieldAlert,
  IndianRupee,
  ReceiptText,
  Send,
  Plus,
  Ban,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Pencil,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditStudentDialog } from "./edit-student-dialog"
import {
  Status,
  Section,
  Detail,
  ActionButton,
  ActionDialog,
  ConfirmDialog,
} from "./profile-primitives"
import {
  suspendStudent,
  reactivateStudent,
  removeStudent,
  resendStudentInvitation,
} from "@/actions/student"
import { removeStudentFromBatch } from "@/actions/batch"
import { recordFeePayment, sendFeeReminder } from "@/actions/fee"
import { toast } from "@/hooks/use-toast"

export interface StudentProfileData {
  id: string
  name: string
  status: string
  phoneNo?: string | null
  parentPhone?: string | null
  email?: string | null
  address?: string | null
  joinedAt: Date | string
  clerkUserId?: string | null
  batches?: Array<{
    id: string
    batchId: string
    batch: {
      id: string
      className: string
      batchName?: string | null
      subject: string
      timing?: string | null
      teacher?: { name: string } | null
    }
  }>
  fees?: Array<{
    id: string
    amountTotal: number
    amountPaid: number
    dueDate: Date | string
    status: string
    payments?: Array<{
      id: string
      receiptNo: string
      amount: number
      paidAt: Date | string
      paymentMode: string
    }>
  }>
  attendance?: Array<{
    id: string
    date: Date | string
    status: string
  }>
}

export function StudentView({
  profile,
  onStudentUpdated,
  onStudentRemoved,
}: {
  profile: StudentProfileData
  onStudentUpdated?: (updated: StudentProfileData) => void
  onStudentRemoved?: (id: string) => void
}) {
  const [status, setStatus] = useState(profile.status === "SUSPENDED" ? "Suspended" : "Active")
  const [dialog, setDialog] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [unenrollTargetBatchId, setUnenrollTargetBatchId] = useState<string | null>(null)

  const fee = profile.fees?.[0]
  const courseFeeVal = fee ? fee.amountTotal : 40000
  const collectedVal = fee ? fee.amountPaid : 0
  const outstandingVal = Math.max(0, courseFeeVal - collectedVal)
  const feeStatusStr = fee
    ? fee.amountPaid >= fee.amountTotal
      ? "Paid"
      : new Date(fee.dueDate) < new Date()
      ? "Past due"
      : "Partially Paid"
    : "Pending"

  const nextDueStr = fee
    ? new Date(fee.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "N/A"

  const portalStatus = profile.clerkUserId
    ? "Active"
    : profile.email
    ? "Invitation Sent"
    : "Offline"

  const attendanceTotal = profile.attendance?.length || 12
  const attendedCount = profile.attendance
    ? profile.attendance.filter((a) => a.status === "PRESENT" || a.status === "Present").length
    : 11
  const missedCount = attendanceTotal - attendedCount
  const overallAttPercent = `${Math.round((attendedCount / (attendanceTotal || 1)) * 100)}%`

  // Quick Action Buttons
  const handleCall = () => {
    const phone = profile.phoneNo || profile.parentPhone
    if (phone) window.open(`tel:${phone}`)
    else toast({ variant: "destructive", title: "No Phone", description: "No contact phone on file." })
  }

  const handleWhatsApp = () => {
    const phone = (profile.parentPhone || profile.phoneNo || "").replace(/\D/g, "")
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Hello, contacting regarding ${profile.name}'s classes at Classly.`)}`)
    } else {
      toast({ variant: "destructive", title: "No WhatsApp", description: "No parent phone number registered." })
    }
  }

  const handleAlertParent = () => {
    const phone = (profile.parentPhone || "").replace(/\D/g, "")
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Important notice regarding ${profile.name}: Please contact institute administration.`)}`)
    } else {
      toast({ variant: "destructive", title: "No Parent Phone", description: "Parent phone number not provided." })
    }
  }

  const handleResendPortalLink = async () => {
    const res = await resendStudentInvitation(profile.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Invite Failed", description: res.error })
    } else {
      toast.success("Portal activation invite resent to " + (profile.email || "student email"))
    }
  }

  const handleWhatsAppReminder = async () => {
    const res = await sendFeeReminder(profile.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Reminder Failed", description: res.error })
    } else {
      toast.success("WhatsApp fee reminder sent to parent", { description: profile.name })
    }
  }

  const handleRecordPayment = async (data: { amount?: number; method?: string; notes?: string }) => {
    if (!data.amount || data.amount <= 0) return
    const res = await recordFeePayment({
      studentId: profile.id,
      amount: data.amount,
      paymentMode: (data.method as any) || "UPI",
      notes: data.notes,
    })
    if (res.error) {
      toast({ variant: "destructive", title: "Payment Failed", description: res.error })
    } else {
      toast.success(`Recorded ₹${data.amount.toLocaleString("en-IN")}. Receipt #${res.receiptNo} issued!`)
      if (onStudentUpdated && fee) {
        onStudentUpdated({
          ...profile,
          fees: [
            {
              ...fee,
              amountPaid: fee.amountPaid + data.amount,
              status: fee.amountPaid + data.amount >= fee.amountTotal ? "PAID" : "PARTIAL",
            },
          ],
        })
      }
    }
  }

  const handleSuspend = async (reason: string) => {
    const res = await suspendStudent(profile.id, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Suspend Failed", description: res.error })
    } else {
      setStatus("Suspended")
      toast.success(`${profile.name} suspended`)
      onStudentUpdated?.({ ...profile, status: "SUSPENDED" })
    }
  }

  const handleReactivate = async () => {
    const res = await reactivateStudent(profile.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Reactivation Failed", description: res.error })
    } else {
      setStatus("Active")
      toast.success(`${profile.name} reactivated`)
      onStudentUpdated?.({ ...profile, status: "ACTIVE" })
    }
  }

  const handleRemove = async (reason: string) => {
    const res = await removeStudent(profile.id, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Remove Failed", description: res.error })
    } else {
      toast.success(`${profile.name} removed`)
      onStudentRemoved?.(profile.id)
    }
  }

  const handleUnenroll = async (reason: string) => {
    if (!unenrollTargetBatchId) return
    const res = await removeStudentFromBatch(unenrollTargetBatchId, profile.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Unenroll Failed", description: res.error })
    } else {
      toast.success(`${profile.name} unenrolled from batch`)
      if (onStudentUpdated && profile.batches) {
        onStudentUpdated({
          ...profile,
          batches: profile.batches.filter((b) => b.batchId !== unenrollTargetBatchId),
        })
      }
    }
  }

  return (
    <>
      {/* Quick Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 border-b px-4 py-3 sm:grid-cols-5 sm:px-6 bg-slate-50/50">
        <ActionButton icon={Pencil} onClick={() => setEditOpen(true)}>
          Edit Details
        </ActionButton>
        <ActionButton icon={Phone} onClick={handleCall}>
          Call
        </ActionButton>
        <ActionButton icon={MessageCircle} onClick={handleWhatsApp}>
          WhatsApp
        </ActionButton>
        <ActionButton icon={ShieldAlert} onClick={handleAlertParent}>
          Alert Parent
        </ActionButton>
        <ActionButton icon={IndianRupee} onClick={() => setDialog("Record Payment")}>
          Record Payment
        </ActionButton>
      </div>

      <Tabs defaultValue="overview">
        <div className="overflow-x-auto border-b bg-white">
          <TabsList className="h-11 min-w-max justify-start rounded-none bg-transparent p-0 px-3">
            <TabsTrigger
              value="overview"
              className="h-11 rounded-none border-b-2 border-transparent text-xs shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              Overview & Fees
            </TabsTrigger>
            <TabsTrigger
              value="batches"
              className="h-11 rounded-none border-b-2 border-transparent text-xs shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              Batches & Attendance
            </TabsTrigger>
            <TabsTrigger
              value="governance"
              className="h-11 rounded-none border-b-2 border-transparent text-xs shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              Activity & Governance
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW & FEES */}
        <TabsContent value="overview" className="mt-0 space-y-0">
          <Section title="Fee ledger overview" action={<Status value={feeStatusStr} />}>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Detail label="Course fee" value={`₹${courseFeeVal.toLocaleString("en-IN")}`} />
              <Detail label="Collected" value={`₹${collectedVal.toLocaleString("en-IN")}`} />
              <Detail
                label="Outstanding"
                value={
                  <span className={outstandingVal > 0 ? "text-error font-bold" : "text-success font-bold"}>
                    ₹{outstandingVal.toLocaleString("en-IN")}
                  </span>
                }
              />
              <Detail label="Next due date" value={nextDueStr} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleWhatsAppReminder} className="h-8 text-xs bg-primary hover:bg-primary-hover text-white">
                <MessageCircle className="size-3.5 mr-1.5" />
                Send WhatsApp Reminder
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDialog("Record Payment")} className="h-8 text-xs border-slate-200">
                <ReceiptText className="size-3.5 mr-1.5" />
                Record Payment
              </Button>
            </div>
          </Section>

          <Section
            title="Guardian & contact"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="h-7 px-2.5 text-xs border-slate-200 hover:text-primary hover:border-primary/40 cursor-pointer"
              >
                <Pencil className="size-3 mr-1 text-primary" />
                Edit
              </Button>
            }
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Student phone" value={profile.phoneNo || "Not provided"} />
              <Detail label="Parent / guardian" value={profile.parentPhone || "Not provided"} />
              <Detail label="Student email" value={profile.email || "Not provided"} />
              <Detail label="Address" value={profile.address || "Not provided"} />
            </dl>
          </Section>

          <Section title="Student portal access" action={<Status value={portalStatus} />}>
            <p className="text-[13px] text-muted-foreground">
              Portal access controls assignments, attendance history, notices, and fee receipts.
            </p>
            {profile.email ? (
              <Button variant="outline" size="sm" className="mt-3 h-8 text-xs border-slate-200" onClick={handleResendPortalLink}>
                <Send className="size-3.5 mr-1.5" />
                Resend Portal Activation Link
              </Button>
            ) : (
              <p className="mt-2 text-xs text-amber-700 italic">No email address registered. Add an email to enable Student Portal access.</p>
            )}
          </Section>
        </TabsContent>

        {/* TAB 2: BATCHES & ATTENDANCE */}
        <TabsContent value="batches" className="mt-0 space-y-0">
          <Section title="Enrolled batches">
            {profile.batches && profile.batches.length > 0 ? (
              <div className="divide-y rounded-xl border border-slate-200 bg-white overflow-hidden">
                {profile.batches.map((b) => (
                  <div key={b.id} className="p-3.5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">
                        {b.batch.batchName || b.batch.className}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {b.batch.subject} · {b.batch.teacher?.name || "Faculty Member"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {b.batch.timing || "Regular Timing"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:bg-error-muted hover:text-error h-8 text-xs font-semibold"
                      onClick={() => {
                        setUnenrollTargetBatchId(b.batchId)
                        setDialog("Unenroll")
                      }}
                    >
                      Unenroll
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic p-3 border border-dashed rounded-xl">
                Not enrolled in any batches.
              </p>
            )}
          </Section>

          <Section title="Attendance summary">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-2xl font-bold text-primary">{overallAttPercent}</p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-2xl font-bold text-emerald-700">{attendedCount}</p>
                <p className="text-xs text-muted-foreground">Attended</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-2xl font-bold text-rose-600">{missedCount}</p>
                <p className="text-xs text-muted-foreground">Missed</p>
              </div>
            </div>

            {profile.attendance && profile.attendance.length > 0 && (
              <div className="mt-4 divide-y rounded-xl border border-slate-200 bg-white overflow-hidden">
                {profile.attendance.map((item, idx) => (
                  <div key={item.id || idx} className="grid grid-cols-[80px_1fr_auto] items-center gap-2 px-3.5 py-2.5 text-xs">
                    <span className="text-muted-foreground font-mono">
                      {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                    <span className="font-medium text-slate-800">
                      {profile.batches?.[0]?.batch?.className || "Class Lecture"}
                    </span>
                    <Status value={item.status} />
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabsContent>

        {/* TAB 3: ACTIVITY & GOVERNANCE */}
        <TabsContent value="governance" className="mt-0 space-y-0">
          <Section title="Activity history">
            <div className="divide-y rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
              <div className="px-3.5 py-2.5">
                <p className="font-semibold text-slate-900">Student enrollment registered</p>
                <p className="mt-0.5 text-muted-foreground">
                  {new Date(profile.joinedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} · System
                </p>
              </div>
              {fee?.payments?.map((pmt) => (
                <div key={pmt.id} className="px-3.5 py-2.5">
                  <p className="font-semibold text-emerald-700">Fee payment of ₹{pmt.amount.toLocaleString("en-IN")} received</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {new Date(pmt.paidAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · Mode: {pmt.paymentMode} ({pmt.receiptNo})
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Governance">
            <div className="space-y-2 rounded-xl border border-error/25 bg-error-muted/30 p-4">
              <p className="text-[13px] font-semibold text-slate-900">Danger zone</p>
              <p className="text-xs text-muted-foreground">
                Access restrictions are recorded in the institute audit history.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {status === "Active" ? (
                  <ActionButton icon={Ban} destructive onClick={() => setDialog("Suspend Student")}>
                    Suspend Student
                  </ActionButton>
                ) : (
                  <ActionButton icon={RotateCcw} onClick={() => setDialog("Reactivate Student")}>
                    Reactivate Student
                  </ActionButton>
                )}
                <ActionButton icon={Trash2} destructive onClick={() => setDialog("Permanently Delete Record")}>
                  Permanently Delete Record
                </ActionButton>
              </div>
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      {/* Action Dialog (Record Payment) */}
      <ActionDialog
        action={dialog ?? "Record Payment"}
        name={profile.name}
        open={Boolean(dialog === "Record Payment")}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={handleRecordPayment}
      />

      {/* Confirmation Dialogs (Suspend, Reactivate, Delete, Unenroll) */}
      <ConfirmDialog
        action={dialog ?? "Suspend Student"}
        name={profile.name}
        destructive={dialog !== "Reactivate Student"}
        open={Boolean(dialog && ["Suspend Student", "Reactivate Student", "Permanently Delete Record", "Unenroll"].includes(dialog))}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={(reason) => {
          if (dialog === "Suspend Student") handleSuspend(reason)
          else if (dialog === "Reactivate Student") handleReactivate()
          else if (dialog === "Permanently Delete Record") handleRemove(reason)
          else if (dialog === "Unenroll") handleUnenroll(reason)
        }}
      />

      {/* Edit Student Details Dialog */}
      <EditStudentDialog
        student={profile}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated) => {
          onStudentUpdated?.({
            ...profile,
            name: updated.name,
            phoneNo: updated.phoneNo,
            parentPhone: updated.parentPhone,
            email: updated.email,
            address: updated.address,
            clerkUserId: updated.clerkUserId,
          })
        }}
      />
    </>
  )
}

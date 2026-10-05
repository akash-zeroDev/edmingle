"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Phone,
  MessageCircle,
  IndianRupee,
  UserRound,
  Ban,
  RotateCcw,
  Trash2,
  Plus,
  Send,
  Layers,
  Link2,
} from "lucide-react"
import {
  Section,
  Detail,
  ActionButton,
  ActionDialog,
  ConfirmDialog,
} from "./profile-primitives"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CustomSelect } from "@/components/ui/custom-select"
import { suspendTeacher, reactivateTeacher, removeTeacher, resendTeacherInvitation } from "@/actions/teacher"
import { enrollTeacherInBatch, getInstituteBatches } from "@/actions/batch"
import { toast } from "@/hooks/use-toast"

export interface BatchItem {
  id: string
  className: string
  batchName?: string | null
  subject: string
  timing?: string | null
  teacherId?: string | null
  teacher?: { id: string; name: string } | null
  _count?: { students: number }
}

export interface TeacherProfileData {
  id: string
  name: string
  status: string
  email?: string | null
  phoneNo?: string | null
  address?: string | null
  salary?: number | null
  subjects?: string | null
  batchesTaught?: Array<{
    id: string
    className: string
    batchName?: string | null
    subject: string
    timing?: string | null
    _count?: { students: number }
  }>
}

export function TeacherView({
  profile,
  availableBatches = [],
  onTeacherUpdated,
  onTeacherRemoved,
}: {
  profile: TeacherProfileData
  availableBatches?: BatchItem[]
  onTeacherUpdated?: (updated: TeacherProfileData) => void
  onTeacherRemoved?: (id: string) => void
}) {
  const router = useRouter()
  const [status, setStatus] = useState(profile.status === "SUSPENDED" ? "Suspended" : "Active")
  const [dialog, setDialog] = useState<string | null>(null)

  // Batch Linking States
  const [batchesList, setBatchesList] = useState<BatchItem[]>(availableBatches)
  const [linkBatchOpen, setLinkBatchOpen] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [unlinkingBatchId, setUnlinkingBatchId] = useState<string | null>(null)

  useEffect(() => {
    if (availableBatches && availableBatches.length > 0) {
      setBatchesList(availableBatches)
    }
  }, [availableBatches])

  const handleOpenLinkBatch = async () => {
    setLinkBatchOpen(true)
    if (batchesList.length === 0) {
      const res = await getInstituteBatches()
      if (res.batches) {
        setBatchesList(res.batches)
      }
    }
  }

  const handleLinkBatchSubmit = async () => {
    if (!selectedBatchId) {
      toast({
        variant: "destructive",
        title: "Select a Batch",
        description: "Please choose a batch to link with this faculty member.",
      })
      return
    }

    setIsLinking(true)
    const res = await enrollTeacherInBatch(selectedBatchId, profile.id)
    setIsLinking(false)

    if (res.error) {
      toast({ variant: "destructive", title: "Linking Failed", description: res.error })
    } else {
      toast({ title: "Batch Linked", description: `${profile.name} linked to batch successfully.` })
      const target = batchesList.find((b) => b.id === selectedBatchId)
      const newBatchEntry = target
        ? {
            id: target.id,
            className: target.className,
            batchName: target.batchName,
            subject: target.subject,
            timing: target.timing,
            _count: target._count,
          }
        : null

      if (newBatchEntry) {
        const updatedBatches = [
          ...(profile.batchesTaught || []).filter((b) => b.id !== selectedBatchId),
          newBatchEntry,
        ]
        onTeacherUpdated?.({ ...profile, batchesTaught: updatedBatches })
      }

      setSelectedBatchId("")
      setLinkBatchOpen(false)
      router.refresh()
    }
  }

  const handleUnlinkBatch = async (batchId: string, batchTitle: string) => {
    setUnlinkingBatchId(batchId)
    const res = await enrollTeacherInBatch(batchId, null)
    setUnlinkingBatchId(null)

    if (res.error) {
      toast({ variant: "destructive", title: "Unlink Failed", description: res.error })
    } else {
      toast({ title: "Batch Unlinked", description: `Faculty unassigned from ${batchTitle}.` })
      const updatedBatches = (profile.batchesTaught || []).filter((b) => b.id !== batchId)
      onTeacherUpdated?.({ ...profile, batchesTaught: updatedBatches })
      router.refresh()
    }
  }

  const subjectList = profile.subjects
    ? profile.subjects.split(",").map((s) => s.trim()).filter(Boolean)
    : ["General Faculty"]

  const cleanPhone = (profile.phoneNo || "").replace(/\D/g, "")

  const handleCall = () => {
    if (profile.phoneNo) window.open(`tel:${profile.phoneNo}`)
    else toast({ variant: "destructive", title: "No Phone", description: "Teacher phone not provided." })
  }

  const handleWhatsApp = () => {
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${profile.name}, contacting regarding your classes at Classly.`)}`)
    } else {
      toast({ variant: "destructive", title: "No WhatsApp", description: "Teacher phone not provided." })
    }
  }

  const handleSuspend = async (reason: string) => {
    const res = await suspendTeacher(profile.id, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Action Failed", description: res.error })
    } else {
      setStatus("Suspended")
      toast.success(`${profile.name} suspended`)
      onTeacherUpdated?.({ ...profile, status: "SUSPENDED" })
    }
  }

  const handleReactivate = async () => {
    const res = await reactivateTeacher(profile.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Action Failed", description: res.error })
    } else {
      setStatus("Active")
      toast.success(`${profile.name} reactivated`)
      onTeacherUpdated?.({ ...profile, status: "ACTIVE" })
    }
  }

  const handleRemove = async (reason: string) => {
    const res = await removeTeacher(profile.id, reason)
    if (res.error) {
      toast({ variant: "destructive", title: "Action Failed", description: res.error })
    } else {
      toast.success(`${profile.name} removed`)
      onTeacherRemoved?.(profile.id)
    }
  }

  const handleResendInvite = async () => {
    const res = await resendTeacherInvitation(profile.id)
    if (res.error) {
      toast({ variant: "destructive", title: "Invitation Failed", description: res.error })
    } else {
      toast.success(res.message || "Invitation link dispatched to teacher email.")
    }
  }

  return (
    <>
      <Section title="Contact">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Email" value={profile.email || "Not provided"} />
          <Detail label="Phone" value={profile.phoneNo || "Not provided"} />
          <Detail label="Residential address" value={profile.address || "Not provided"} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton icon={Phone} onClick={handleCall}>
            Call
          </ActionButton>
          <ActionButton icon={MessageCircle} onClick={handleWhatsApp}>
            WhatsApp
          </ActionButton>
          {profile.email && (
            <ActionButton icon={Send} onClick={handleResendInvite}>
              Resend Invite
            </ActionButton>
          )}
        </div>
      </Section>

      <Section title="Subject expertise">
        <div className="flex flex-wrap gap-2">
          {subjectList.map((subject) => (
            <span
              key={subject}
              className="rounded-lg bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary"
            >
              {subject}
            </span>
          ))}
        </div>
      </Section>

      <Section
        title="Assigned batches"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenLinkBatch}
            className="h-7 px-2.5 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-lg focus:outline-none focus-visible:outline-none"
          >
            <Plus className="size-3 mr-1" />
            Link Batch
          </Button>
        }
      >
        {profile.batchesTaught && profile.batchesTaught.length > 0 ? (
          <div className="divide-y rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {profile.batchesTaught.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between gap-3 p-3.5 text-xs hover:bg-slate-50/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {batch.batchName ? `${batch.className} - ${batch.batchName}` : batch.className}
                  </p>
                  <p className="mt-0.5 text-muted-foreground truncate">
                    {batch.subject} · {batch.timing || "Schedule not set"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                    {batch._count?.students || 0} students
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlinkBatch(batch.id, batch.batchName || batch.className)}
                    disabled={unlinkingBatchId === batch.id}
                    className="h-7 px-2 text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    title="Unassign faculty from this batch"
                  >
                    {unlinkingBatchId === batch.id ? "Unlinking..." : "Unlink"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2">
            <Layers className="size-6 mx-auto text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground">No batches currently assigned.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenLinkBatch}
              className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/50 rounded-lg shadow-xs"
            >
              <Plus className="size-3.5 mr-1.5" />
              Enroll in Batch
            </Button>
          </div>
        )}
      </Section>

      <Section title="Compensation & payroll">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Monthly retainer
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {profile.salary ? `₹${profile.salary.toLocaleString("en-IN")}` : "₹45,000"}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ month</span>
            </p>
          </div>
          <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            <IndianRupee className="size-5" />
          </div>
        </div>
      </Section>

      <Section title="Faculty actions">
        <div className="flex flex-wrap gap-2">
          {profile.email && (
            <ActionButton icon={Send} onClick={handleResendInvite}>
              Resend Portal Invitation
            </ActionButton>
          )}
          {status === "Active" ? (
            <ActionButton icon={Ban} destructive onClick={() => setDialog("Suspend Teacher")}>
              Suspend Teacher
            </ActionButton>
          ) : (
            <ActionButton icon={RotateCcw} onClick={() => setDialog("Reactivate Teacher")}>
              Reactivate Teacher
            </ActionButton>
          )}
          <ActionButton icon={Trash2} destructive onClick={() => setDialog("Remove Teacher")}>
            Remove Teacher
          </ActionButton>
        </div>
      </Section>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        action={dialog ?? "Suspend Teacher"}
        name={profile.name}
        destructive={dialog !== "Reactivate Teacher"}
        open={Boolean(dialog && ["Suspend Teacher", "Reactivate Teacher", "Remove Teacher"].includes(dialog))}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={(reason) => {
          if (dialog === "Suspend Teacher") handleSuspend(reason)
          else if (dialog === "Reactivate Teacher") handleReactivate()
          else if (dialog === "Remove Teacher") handleRemove(reason)
        }}
      />

      {/* Dialog: Link Batch to Faculty */}
      <Dialog open={linkBatchOpen} onOpenChange={setLinkBatchOpen}>
        <DialogContent className="sm:max-w-[460px] p-6 bg-white rounded-2xl border border-[#e7e9ed] shadow-lg">
          <DialogHeader>
            <div className="size-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-2">
              <Link2 className="size-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#15171b]">
              Enroll {profile.name} in a Batch
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5e6b63]">
              Assign this faculty instructor to lead a batch. Once linked, the batch and its student roster will sync directly into their Teacher Portal.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {batchesList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#e3e8e5] bg-[#f8faf9] text-center space-y-2">
                <p className="text-xs text-[#5e6b63]">
                  No batches created in your institute yet.
                </p>
                <a
                  href="/institute/batches"
                  className="inline-flex text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  + Create New Batch
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1a201c]">
                  Select Batch to Assign *
                </label>
                <CustomSelect
                  value={selectedBatchId}
                  onChange={setSelectedBatchId}
                  options={batchesList.map((b) => {
                    const isCurrentTeacher = b.teacherId === profile.id
                    const otherTeacher = b.teacher && !isCurrentTeacher ? b.teacher.name : null
                    const name = b.batchName ? `${b.className} - ${b.batchName}` : b.className
                    const statusText = isCurrentTeacher
                      ? " (Already enrolled)"
                      : otherTeacher
                      ? ` (Currently: ${otherTeacher})`
                      : " (Unassigned)"
                    return {
                      value: b.id,
                      label: `${name} — ${b.subject}`,
                      description: `${b.timing || "No schedule set"}${statusText}`,
                      disabled: isCurrentTeacher,
                    }
                  })}
                  placeholder="-- Choose a batch --"
                  searchPlaceholder="Search by class, batch name, or subject..."
                  searchable={true}
                  className="w-full"
                />
                <p className="text-[11px] text-[#8b9a90]">
                  {batchesList.length} total batches available in your institute.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLinkBatchOpen(false)}
              className="text-xs h-9 border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isLinking || !selectedBatchId || batchesList.length === 0}
              onClick={handleLinkBatchSubmit}
              className="text-xs h-9 bg-primary hover:bg-primary-hover text-white rounded-xl focus:outline-none focus-visible:outline-none"
            >
              {isLinking ? "Linking..." : "Confirm & Link Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

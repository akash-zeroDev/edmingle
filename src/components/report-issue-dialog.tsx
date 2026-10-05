"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { useUser } from "@clerk/nextjs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { submitSupportTicket } from "@/actions/support"
import { CustomSelect } from "@/components/ui/custom-select"
import { Bug, Sparkles, Send, HelpCircle, CircleHelp } from "lucide-react"

export function ReportIssueDialog({
  trigger,
  instituteId,
}: {
  trigger?: React.ReactNode
  instituteId?: string
}) {
  const { user } = useUser()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"BUG" | "FEEDBACK" | "FEATURE_REQUEST" | "SUPPORT">("BUG")
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM")
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter a subject and description.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        const reporterName = user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "Institute User"
        const reporterEmail = user?.primaryEmailAddress?.emailAddress || "user@platform.local"
        const role = (user?.publicMetadata?.role as any) || "INSTITUTE_ADMIN"
        const reporterRole =
          role === "student"
            ? "STUDENT"
            : role === "teacher"
            ? "TEACHER"
            : "INSTITUTE_ADMIN"

        await submitSupportTicket({
          title,
          description,
          type,
          severity,
          reporterName,
          reporterEmail,
          reporterPhone: phone || undefined,
          reporterRole,
          instituteId,
        })

        toast({
          title: "Report submitted",
          description: "Thank you for your feedback.",
        })
        setTitle("")
        setDescription("")
        setPhone("")
        setOpen(false)
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not submit report. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label="Report an issue or give feedback"
          >
            <CircleHelp className="size-4 text-muted-foreground" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card border border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-primary-light text-primary">
              <Bug className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Report an issue
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Share bugs, suggestions, or questions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Category</label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(val as any)}
                options={[
                  { value: "BUG", label: "Bug" },
                  { value: "FEEDBACK", label: "Feedback" },
                  { value: "FEATURE_REQUEST", label: "Feature request" },
                  { value: "SUPPORT", label: "Account help" },
                ]}
                placeholder="Select category"
                size="sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Priority</label>
              <CustomSelect
                value={severity}
                onChange={(val) => setSeverity(val as any)}
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "CRITICAL", label: "Critical" },
                ]}
                placeholder="Select priority"
                size="sm"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-foreground mb-1 block">Subject</label>
            <Input
              placeholder="e.g. Attendance checkbox lags on mobile"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-foreground mb-1 block">Description</label>
            <Textarea
              placeholder="Describe the issue or suggestion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-[11px] font-semibold text-foreground mb-1 block">
              Phone <span className="font-normal text-muted-foreground">(Optional)</span>
            </label>
            <Input
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs cursor-pointer gap-1.5 bg-primary text-white hover:bg-primary/90"
            >
              <Send className="size-3" />
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

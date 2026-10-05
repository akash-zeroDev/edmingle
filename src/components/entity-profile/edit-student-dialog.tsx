"use client"

import { useState, useEffect, useTransition } from "react"
import { User, Phone, Mail, MapPin, AlertTriangle, Loader2, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { updateStudent } from "@/actions/student"

export interface EditStudentDialogProps {
  student: {
    id: string
    name: string
    phoneNo?: string | null
    parentPhone?: string | null
    email?: string | null
    address?: string | null
    clerkUserId?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (updated: any) => void
}

export function EditStudentDialog({
  student,
  open,
  onOpenChange,
  onSaved,
}: EditStudentDialogProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: student.name || "",
    phoneNo: student.phoneNo || "",
    parentPhone: student.parentPhone || "",
    email: student.email || "",
    address: student.address || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when student or open changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: student.name || "",
        phoneNo: student.phoneNo || "",
        parentPhone: student.parentPhone || "",
        email: student.email || "",
        address: student.address || "",
      })
      setErrors({})
    }
  }, [student, open])

  // Check if phone or email is modified compared to original
  const isPhoneChanged = (formData.phoneNo?.trim() || "") !== (student.phoneNo?.trim() || "")
  const isEmailChanged = (formData.email?.trim().toLowerCase() || "") !== (student.email?.trim().toLowerCase() || "")
  const isLoginIdentifierChanged = isPhoneChanged || isEmailChanged
  const hasActiveClerk = Boolean(student.clerkUserId)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Student full name is required."
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters."
    }

    if (formData.phoneNo.trim()) {
      const digits = formData.phoneNo.replace(/\D/g, "")
      if (digits.length < 10) {
        newErrors.phoneNo = "Phone number must contain at least 10 digits."
      }
    }

    if (formData.parentPhone.trim()) {
      const parentDigits = formData.parentPhone.replace(/\D/g, "")
      if (parentDigits.length < 10) {
        newErrors.parentPhone = "Parent phone number must contain at least 10 digits."
      }
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    startTransition(async () => {
      try {
        const res = await updateStudent({
          studentId: student.id,
          name: formData.name,
          phoneNo: formData.phoneNo || null,
          parentPhone: formData.parentPhone || null,
          email: formData.email || null,
          address: formData.address || null,
        })

        if (res.error) {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: res.error,
          })
        } else {
          toast({
            title: "Student Updated",
            description: res.message || "Student details saved successfully.",
          })
          onSaved?.(res.student)
          onOpenChange(false)
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to update student profile.",
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl bg-white border border-[#e7e9ed] shadow-lg">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#e7e9ed] bg-[#fafbfc]">
          <DialogTitle className="text-base font-bold text-[#15171b] flex items-center gap-2">
            <User className="size-4 text-primary" />
            <span>Edit Student Profile</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5e6b63] mt-1">
            Update personal info, contact numbers, or correct registration typos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Active Account Alert */}
          {hasActiveClerk && isLoginIdentifierChanged ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Active Portal Account Notice</span>
                <p className="mt-0.5 text-amber-700 leading-relaxed text-[11px]">
                  This student has claimed their portal account. Changing their phone number or email will require them to sign in again with the new credentials via OTP.
                </p>
              </div>
            </div>
          ) : !hasActiveClerk ? (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
              <span className="size-2 rounded-full bg-slate-400" />
              <span className="text-[11px]">Unclaimed Account · Changes to phone or email will update the login identifier immediately.</span>
            </div>
          ) : null}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#15171b] mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b9a90]" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="pl-9 h-10 text-xs border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Phone Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Student Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#15171b] mb-1.5">
                Student Phone (Login)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b9a90]" />
                <Input
                  type="tel"
                  value={formData.phoneNo}
                  onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="pl-9 h-10 text-xs border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
                />
              </div>
              {errors.phoneNo && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.phoneNo}</p>
              )}
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#15171b] mb-1.5">
                Parent / Guardian Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b9a90]" />
                <Input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="pl-9 h-10 text-xs border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
                />
              </div>
              {errors.parentPhone && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.parentPhone}</p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#15171b]">
                Email Address
              </label>
              <span className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                Optional
              </span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b9a90]" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                className="pl-9 h-10 text-xs border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#15171b]">
                Residential Address
              </label>
              <span className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                Optional
              </span>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b9a90]" />
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Sector 14, Gurgaon, Haryana"
                className="pl-9 h-10 text-xs border-[#e3e8e5] rounded-xl focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/25"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-[#e7e9ed] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs border-[#e3e8e5] rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-9 px-4 text-xs bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

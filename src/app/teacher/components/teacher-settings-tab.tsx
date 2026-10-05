"use client"

import React, { useState, useTransition } from "react"
import {
  GraduationCap,
  BookOpen,
  Layers3,
  Phone,
  ShieldCheck,
  Save,
  Plus,
  X,
  IndianRupee,
  Landmark,
  Building2,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PhoneChangeModal } from "@/components/settings/phone-change-modal"
import { updateTeacherAcademicProfile } from "@/actions/settings"

interface TeacherSettingsTabProps {
  teacher: {
    id: string
    name: string
    email?: string | null
    phoneNo?: string | null
    subjects?: string | null
    salary?: number | null
    instituteName?: string
    instituteId?: string
  }
}

export function TeacherSettingsTab({ teacher }: TeacherSettingsTabProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Parse initial subjects, classes, and bio
  let initialSubjects: string[] = ["Physics", "Mechanics"]
  let initialClasses: string[] = ["Class 11", "Class 12", "Dropper JEE"]
  let initialBio = "Senior Faculty with 8+ years experience coaching students for competitive examinations."

  try {
    if (teacher.subjects) {
      if (teacher.subjects.startsWith("{")) {
        const parsed = JSON.parse(teacher.subjects)
        if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
          initialSubjects = parsed.subjects
        }
        if (Array.isArray(parsed.classes) && parsed.classes.length > 0) {
          initialClasses = parsed.classes
        }
        if (parsed.bio) {
          initialBio = parsed.bio
        }
      } else {
        initialSubjects = teacher.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }
    }
  } catch {
    // Keep fallback defaults
  }

  const [subjects, setSubjects] = useState<string[]>(initialSubjects)
  const [classes, setClasses] = useState<string[]>(initialClasses)
  const [bio, setBio] = useState<string>(initialBio)

  // Input states for adding new tags
  const [newSubjectInput, setNewSubjectInput] = useState("")
  const [newClassInput, setNewClassInput] = useState("")

  // Phone state & OTP modal
  const [currentPhone, setCurrentPhone] = useState(teacher.phoneNo || "+91 98123 45678")
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)

  // Handlers for Subject tags
  const handleAddSubject = () => {
    const trimmed = newSubjectInput.trim()
    if (!trimmed) return
    if (subjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast({
        title: "Subject already added",
        description: `"${trimmed}" is already in your subjects list.`,
        variant: "destructive",
      })
      return
    }
    setSubjects([...subjects, trimmed])
    setNewSubjectInput("")
  }

  const handleRemoveSubject = (subjectToRemove: string) => {
    if (subjects.length <= 1) {
      toast({
        title: "Cannot remove all",
        description: "You must maintain at least one subject taught.",
        variant: "destructive",
      })
      return
    }
    setSubjects(subjects.filter((s) => s !== subjectToRemove))
  }

  // Handlers for Class tags
  const handleAddClass = () => {
    const trimmed = newClassInput.trim()
    if (!trimmed) return
    if (classes.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast({
        title: "Class already added",
        description: `"${trimmed}" is already in your classes list.`,
        variant: "destructive",
      })
      return
    }
    setClasses([...classes, trimmed])
    setNewClassInput("")
  }

  const handleRemoveClass = (classToRemove: string) => {
    if (classes.length <= 1) {
      toast({
        title: "Cannot remove all",
        description: "You must maintain at least one class/grade taught.",
        variant: "destructive",
      })
      return
    }
    setClasses(classes.filter((c) => c !== classToRemove))
  }

  // Save Academic Profile
  const handleSaveProfile = () => {
    if (subjects.length === 0) {
      toast({
        title: "Missing subjects",
        description: "Please specify at least one subject taught.",
        variant: "destructive",
      })
      return
    }

    if (classes.length === 0) {
      toast({
        title: "Missing classes",
        description: "Please specify at least one class or batch level taught.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const res = await updateTeacherAcademicProfile({
        subjects,
        classes,
        bio: bio.trim(),
      })

      if (!res.success) {
        toast({
          title: "Save failed",
          description: res.error || "Unable to update academic profile.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profile updated",
          description: res.message || "Academic subjects and classes updated successfully.",
        })
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Faculty Profile & Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your academic specializations, classes taught, and verified mobile contact.
          </p>
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={isPending}
          className="rounded-xl h-10 px-5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
        >
          {isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save academic profile
            </>
          )}
        </Button>
      </div>

      {/* SECTION 1: REGISTERED MOBILE NUMBER & OTP VERIFICATION */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Phone className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Registered Mobile Number
            </h3>
            <p className="text-xs text-muted-foreground">
              Used for 2-factor security alerts, salary slip SMS notifications, and institute communications
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground font-mono">
                {currentPhone}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                Verified
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Maximum 3 phone updates permitted per academic year with OTP verification.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPhoneModalOpen(true)}
            className="rounded-xl h-9 text-xs font-semibold border-border hover:bg-muted/40 cursor-pointer shrink-0"
          >
            <ShieldCheck className="size-3.5 mr-1.5 text-primary" />
            Change mobile number
          </Button>
        </div>
      </div>

      {/* SECTION 2: ACADEMIC SPECIALIZATION & TAGS */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Subjects Taught
            </h3>
            <p className="text-xs text-muted-foreground">
              Add or remove subjects and topics you instruct across institute batches
            </p>
          </div>
        </div>

        {/* Subjects Tag Manager */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl border border-border bg-muted/10">
            {subjects.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary text-white shadow-2xs group"
              >
                <span>{sub}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(sub)}
                  className="rounded hover:bg-white/20 p-0.5 transition-colors cursor-pointer"
                  title={`Remove ${sub}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Subject Input */}
          <div className="flex gap-2">
            <Input
              value={newSubjectInput}
              onChange={(e) => setNewSubjectInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSubject()
                }
              }}
              placeholder="e.g. Thermodynamics, Optics, Organic Chemistry, Mechanics..."
              className="h-10 rounded-xl text-xs"
            />
            <Button
              type="button"
              onClick={handleAddSubject}
              disabled={!newSubjectInput.trim()}
              className="rounded-xl h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shrink-0 cursor-pointer"
            >
              <Plus className="size-3.5 mr-1" />
              Add subject
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Layers3 className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Classes & Batches Taught
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure grade levels and target competitive examination batches
              </p>
            </div>
          </div>

          {/* Classes Tag Manager */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl border border-border bg-muted/10">
              {classes.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-2xs group"
                >
                  <span>{cls}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClass(cls)}
                    className="rounded hover:bg-white/20 p-0.5 transition-colors cursor-pointer"
                    title={`Remove ${cls}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Class Input */}
            <div className="flex gap-2">
              <Input
                value={newClassInput}
                onChange={(e) => setNewClassInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddClass()
                  }
                }}
                placeholder="e.g. Class 11, Class 12, Repeater NEET, Foundation Batch..."
                className="h-10 rounded-xl text-xs"
              />
              <Button
                type="button"
                onClick={handleAddClass}
                disabled={!newClassInput.trim()}
                className="rounded-xl h-10 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" />
                Add class
              </Button>
            </div>
          </div>
        </div>

        {/* Faculty Bio / Specialization */}
        <div className="pt-4 border-t border-border space-y-2">
          <Label className="text-xs font-semibold text-foreground">
            Academic Bio & Specialization
          </Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Describe your teaching pedagogy, exam achievements, and specializations..."
            className="rounded-xl text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* SECTION 3: SALARY & PAYOUT DETAILS (CONFIDENTIAL) */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Landmark className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Salary & Wire Settlement Details
            </h3>
            <p className="text-xs text-muted-foreground">
              Confidential payroll profile configured with your affiliated institute
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl border border-border bg-muted/20">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              Affiliated Institute
            </span>
            <p className="text-xs font-bold text-foreground mt-0.5">
              {teacher.instituteName || "Classly Coaching Institute"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/20">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              Base Monthly Remuneration
            </span>
            <p className="text-xs font-bold text-emerald-600 mt-0.5">
              ₹{(teacher.salary || 65000).toLocaleString("en-IN")} / month
            </p>
          </div>
        </div>
      </div>

      {/* Phone Change Modal */}
      <PhoneChangeModal
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
        currentPhone={currentPhone}
        role="teacher"
        onSuccess={(newNumber) => {
          setCurrentPhone(newNumber)
        }}
      />
    </div>
  )
}

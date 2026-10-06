"use client"

import React, { useState, useTransition } from "react"
import {
  ShieldCheck,
  Save,
  Plus,
  X,
  CheckCircle2,
  Lock,
  Loader2,
  RotateCcw,
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
  let parsedSubjects: string[] = ["Physics", "Mechanics"]
  let parsedClasses: string[] = ["Class 11", "Class 12", "Dropper JEE"]
  let parsedBio = "Senior Faculty with 8+ years experience coaching students for competitive examinations."

  try {
    if (teacher.subjects) {
      if (teacher.subjects.startsWith("{")) {
        const parsed = JSON.parse(teacher.subjects)
        if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
          parsedSubjects = parsed.subjects
        }
        if (Array.isArray(parsed.classes) && parsed.classes.length > 0) {
          parsedClasses = parsed.classes
        }
        if (parsed.bio) {
          parsedBio = parsed.bio
        }
      } else {
        parsedSubjects = teacher.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }
    }
  } catch {
    // Keep fallback defaults
  }

  // Saved snapshot for dirty checking
  const [savedSnapshot, setSavedSnapshot] = useState({
    subjects: parsedSubjects,
    classes: parsedClasses,
    bio: parsedBio,
  })

  // Editable form state
  const [subjects, setSubjects] = useState<string[]>(parsedSubjects)
  const [classes, setClasses] = useState<string[]>(parsedClasses)
  const [bio, setBio] = useState<string>(parsedBio)

  // Input states for adding new tags
  const [newSubjectInput, setNewSubjectInput] = useState("")
  const [newClassInput, setNewClassInput] = useState("")

  // Phone state & OTP modal
  const [currentPhone, setCurrentPhone] = useState(teacher.phoneNo || "+91 98123 45678")
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)

  // Dirty state detection
  const isDirty =
    JSON.stringify(subjects) !== JSON.stringify(savedSnapshot.subjects) ||
    JSON.stringify(classes) !== JSON.stringify(savedSnapshot.classes) ||
    bio.trim() !== savedSnapshot.bio.trim()

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

  // Reset unsaved changes
  const handleDiscardChanges = () => {
    setSubjects(savedSnapshot.subjects)
    setClasses(savedSnapshot.classes)
    setBio(savedSnapshot.bio)
    setNewSubjectInput("")
    setNewClassInput("")
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
        setSavedSnapshot({
          subjects: [...subjects],
          classes: [...classes],
          bio: bio.trim(),
        })
        toast({
          title: "Profile updated",
          description: res.message || "Academic subjects and classes updated successfully.",
        })
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Faculty Profile & Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your academic specializations, teaching cohorts, verified mobile contact, and institute credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
              disabled={isPending}
              className="h-9 px-3 text-xs rounded-lg cursor-pointer"
            >
              <RotateCcw className="size-3 mr-1.5 text-muted-foreground" />
              Discard
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={isPending}
            className="rounded-lg h-9 px-4 text-xs font-medium bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 mr-2 animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save className="size-3.5 mr-2" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Unified Professional Settings Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden divide-y divide-border/60">
        {/* SECTION 1: FACULTY IDENTITY */}
        <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="md:w-1/3 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Faculty Profile
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your registered credentials and official designation in the academy directory.
            </p>
          </div>

          <div className="md:w-2/3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  {teacher.name}
                </h4>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/70">
                  Senior Faculty
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {teacher.email || "No email registered"}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT & SECURITY */}
        <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="md:w-1/3 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Mobile Contact & 2FA
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Primary contact used for multi-factor security alerts, salary slip SMS, and urgent notices.
            </p>
          </div>

          <div className="md:w-2/3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/80 bg-muted/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-foreground font-mono">
                    {currentPhone}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Protected by 6-digit OTP verification. Maximum 3 updates permitted per academic year.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPhoneModalOpen(true)}
                className="h-8 rounded-lg text-xs font-medium border-border hover:bg-muted/60 shrink-0 cursor-pointer"
              >
                <ShieldCheck className="size-3.5 mr-1.5 text-muted-foreground" />
                Change number
              </Button>
            </div>
          </div>
        </div>

        {/* SECTION 3: SUBJECTS TAUGHT */}
        <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="md:w-1/3 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Subjects & Disciplines
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Academic curriculum subjects you are accredited to instruct across student cohorts.
            </p>
          </div>

          <div className="md:w-2/3 space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-lg border border-border/80 bg-muted/20">
              {subjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background text-foreground border border-border/90 shadow-2xs group"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title={`Remove ${sub}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSubject()
                    }
                  }}
                  placeholder="e.g. Physics, Mechanics, Physical Chemistry..."
                  className="h-9 rounded-lg text-xs pl-3 pr-16 bg-background"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono pointer-events-none hidden sm:inline">
                  ↵ Enter
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubject}
                disabled={!newSubjectInput.trim()}
                className="h-9 rounded-lg text-xs font-medium px-3 shrink-0 cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Add subjects using the input field above. Press Enter or click Add to attach.
            </p>
          </div>
        </div>

        {/* SECTION 4: CLASSES & BATCHES TAUGHT */}
        <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="md:w-1/3 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Grade Levels & Batches
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Target academic tiers and competitive examination batches assigned to your schedule.
            </p>
          </div>

          <div className="md:w-2/3 space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-lg border border-border/80 bg-muted/20">
              {classes.map((cls) => (
                <span
                  key={cls}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background text-foreground border border-border/90 shadow-2xs group"
                >
                  <span>{cls}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClass(cls)}
                    className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title={`Remove ${cls}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={newClassInput}
                  onChange={(e) => setNewClassInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddClass()
                    }
                  }}
                  placeholder="e.g. Class 11, Class 12, Repeater NEET, Foundation..."
                  className="h-9 rounded-lg text-xs pl-3 pr-16 bg-background"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono pointer-events-none hidden sm:inline">
                  ↵ Enter
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddClass}
                disabled={!newClassInput.trim()}
                className="h-9 rounded-lg text-xs font-medium px-3 shrink-0 cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Define the academic grades or target entrance exam batches you instruct.
            </p>
          </div>
        </div>

        {/* SECTION 5: ACADEMIC BIO & CREDENTIALS */}
        <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="md:w-1/3 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Professional Summary
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Brief summary of pedagogical experience, university degrees, and competitive exam results.
            </p>
          </div>

          <div className="md:w-2/3 space-y-2">
            <Label className="text-xs font-medium text-foreground sr-only">
              Academic Bio
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Detail your teaching experience, specialized pedagogy, and student mentorship achievements..."
              className="rounded-lg text-xs leading-relaxed bg-background"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>Visible across faculty directory outlines and syllabus documents.</span>
              <span className="font-mono text-[10px]">{bio.length}/600</span>
            </div>
          </div>
        </div>

        {/* SECTION 6: INSTITUTIONAL COMPENSATION & PAYROLL */}
        <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="md:w-1/3 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Payroll & Affiliation
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Employment affiliation and compensation parameters configured by the institute administration.
            </p>
          </div>

          <div className="md:w-2/3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Affiliated Institute
                </span>
                <p className="text-xs font-semibold text-foreground mt-1">
                  {teacher.instituteName || "Coaching Academy"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Base Monthly Remuneration
                </span>
                <p className="text-xs font-semibold text-foreground font-mono mt-1">
                  ₹{(teacher.salary || 65000).toLocaleString("en-IN")} / month
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-0.5">
              <Lock className="size-3 text-muted-foreground shrink-0" />
              <span>Contractual terms are managed by institute administration. For salary revisions, consult the institute admin.</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-6 py-4 sm:px-7 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Academic profile updates synchronize immediately across institute dashboards and syllabus cards.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                disabled={isPending}
                className="h-8 px-3 text-xs rounded-lg cursor-pointer"
              >
                Discard
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSaveProfile}
              disabled={isPending}
              className="rounded-lg h-8 px-4 text-xs font-medium bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5 mr-2" />
                  Save changes
                </>
              )}
            </Button>
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

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Expand, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Status } from "./profile-primitives"
import { StudentView, type StudentProfileData } from "./student-view"
import { TeacherView, type TeacherProfileData } from "./teacher-view"
import { InstituteView, type InstituteProfileData } from "./institute-view"
import { cn } from "@/lib/utils"

export type EntityKind = "student" | "teacher" | "institute"
export type SelectedEntity = { kind: EntityKind; id: string } | null

export function readProfileQuery(): { selected: SelectedEntity; expanded: boolean } {
  if (typeof window === "undefined") return { selected: null, expanded: false }
  const params = new URLSearchParams(window.location.search)
  for (const kind of ["student", "teacher", "institute"] as const) {
    const id = params.get(kind)
    if (id) return { selected: { kind, id }, expanded: params.get("profileView") === "full" }
  }
  return { selected: null, expanded: false }
}

export function writeProfileQuery(selected: SelectedEntity, expanded = false, replace = false) {
  const url = new URL(window.location.href)
  ;["student", "teacher", "institute", "profileView"].forEach((key) => url.searchParams.delete(key))
  if (selected) {
    url.searchParams.set(selected.kind, selected.id)
    if (expanded) url.searchParams.set("profileView", "full")
  }
  window.history[replace ? "replaceState" : "pushState"]({}, "", `${url.pathname}${url.search}${url.hash}`)
  window.dispatchEvent(new Event("classly-profile-change"))
}

export function useEntityProfile() {
  const [state, setState] = useState<{ selected: SelectedEntity; expanded: boolean }>({
    selected: null,
    expanded: false,
  })

  useEffect(() => {
    const sync = () => setState(readProfileQuery())
    window.addEventListener("popstate", sync)
    window.addEventListener("classly-profile-change", sync)
    sync()
    return () => {
      window.removeEventListener("popstate", sync)
      window.removeEventListener("classly-profile-change", sync)
    }
  }, [])

  return {
    ...state,
    openProfile: (kind: EntityKind, id: string) => writeProfileQuery({ kind, id }),
    closeProfile: () => writeProfileQuery(null),
    setExpanded: (expanded: boolean) => state.selected && writeProfileQuery(state.selected, expanded),
  }
}

interface EntityProfileHostProps {
  selected: SelectedEntity
  expanded: boolean
  onClose: () => void
  onExpandedChange: (expanded: boolean) => void
  students?: StudentProfileData[]
  teachers?: TeacherProfileData[]
  institutes?: InstituteProfileData[]
  batches?: any[]
  onStudentUpdated?: (updated: StudentProfileData) => void
  onTeacherUpdated?: (updated: TeacherProfileData) => void
  onInstituteUpdated?: (updated: InstituteProfileData) => void
  onStudentRemoved?: (id: string) => void
  onTeacherRemoved?: (id: string) => void
}

export function EntityProfileHost({
  selected,
  expanded,
  onClose,
  onExpandedChange,
  students = [],
  teachers = [],
  institutes = [],
  batches = [],
  onStudentUpdated,
  onTeacherUpdated,
  onInstituteUpdated,
  onStudentRemoved,
  onTeacherRemoved,
}: EntityProfileHostProps) {
  const record = useMemo(() => {
    if (!selected) return null
    if (selected.kind === "student") {
      return students.find((s) => s.id === selected.id) || null
    }
    if (selected.kind === "teacher") {
      return teachers.find((t) => t.id === selected.id) || null
    }
    if (selected.kind === "institute") {
      return institutes.find((i) => i.id === selected.id) || null
    }
    return null
  }, [selected, students, teachers, institutes])

  if (!selected || !record) return null

  const initials = record.name ? record.name.substring(0, 2).toUpperCase() : "??"

  const meta =
    selected.kind === "student"
      ? {
          label: "Student profile",
          idLabel: "Student ID",
          joined: `Enrolled ${new Date((record as any).joinedAt).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })}`,
          status: (record as any).status === "SUSPENDED" ? "Suspended" : "Active",
        }
      : selected.kind === "teacher"
      ? {
          label: "Faculty profile",
          idLabel: "Faculty ID",
          joined: "Faculty member",
          status: (record as any).status === "SUSPENDED" ? "Suspended" : "Active",
        }
      : {
          label: "Institute profile",
          idLabel: "Org ID",
          joined: `Joined ${new Date((record as any).joinedAt).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })}`,
          status: (record as any).isActive ? "Active" : "Blocked",
        }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 data-[state=closed]:duration-200 data-[state=open]:duration-200 bg-background",
          expanded
            ? "fixed inset-0 z-50 h-screen w-screen max-w-none sm:max-w-none border-0"
            : "w-full sm:w-[40vw] sm:max-w-[40vw] border-l border-border"
        )}
      >
        <SheetTitle className="sr-only">{record.name}</SheetTitle>
        <SheetDescription className="sr-only">
          {meta.label} for {record.name}
        </SheetDescription>

        {expanded ? (
          /* ========================================================
             FULL-PAGE EXPANDED VIEW HEADER
             ======================================================== */
          <div className="shrink-0 bg-card border-b border-border shadow-2xs">
            {/* Top Navigation Bar */}
            <div className="h-14 px-4 sm:px-8 border-b border-border/70 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExpandedChange(false)}
                  className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-muted cursor-pointer shrink-0"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Return to Drawer</span>
                </Button>
                <div className="h-4 w-px bg-border hidden sm:block shrink-0" />
                <div className="hidden sm:flex items-center gap-2 text-xs truncate">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px] shrink-0">
                    {meta.label}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-bold text-foreground truncate">{record.name}</span>
                  <Status value={meta.status} />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  title="Close Profile (Esc)"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Entity Hero Info Banner (Centered with max-w-5xl) */}
            <div className="mx-auto max-w-5xl px-4 sm:px-8 py-4 sm:py-5">
              <div className="flex items-start gap-3.5 sm:gap-4">
                <span className="grid size-12 sm:size-14 shrink-0 place-items-center rounded-2xl bg-primary-light text-base sm:text-lg font-bold text-primary shadow-xs">
                  {initials}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-lg sm:text-xl font-bold text-foreground truncate tracking-tight">
                      {record.name}
                    </h1>
                    <Status value={meta.status} />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {meta.idLabel}: {record.id} · {meta.joined}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             DRAWER SIDE-CARD VIEW HEADER
             ======================================================== */
          <header className="border-b border-border px-4 pb-4 pt-4 sm:px-6 bg-card shrink-0 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {meta.label}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExpandedChange(true)}
                  className="h-7 text-xs font-semibold border-border cursor-pointer px-2.5"
                  title="Expand to Full Page"
                >
                  <Expand className="size-3 mr-1" />
                  <span>Expand</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="size-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  title="Close drawer"
                  aria-label="Close"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-light text-base font-bold text-primary shadow-xs">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-bold text-foreground">{record.name}</h2>
                  <Status value={meta.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                  {meta.idLabel}: {record.id.substring(0, 10)}... · {meta.joined}
                </p>
              </div>
            </div>
          </header>
        )}

        {/* Scrollable Entity Body (Sheet Drawer or Full Page) */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            expanded ? "bg-muted/30" : "bg-card"
          )}
        >
          <div
            className={cn(
              "w-full",
              expanded && "mx-auto max-w-5xl bg-card border-x border-border shadow-xs min-h-full"
            )}
          >
            {selected.kind === "student" && (
              <StudentView
                profile={record as StudentProfileData}
                onStudentUpdated={onStudentUpdated}
                onStudentRemoved={(id) => {
                  onStudentRemoved?.(id)
                  onClose()
                }}
              />
            )}
            {selected.kind === "teacher" && (
              <TeacherView
                profile={record as TeacherProfileData}
                availableBatches={batches}
                onTeacherUpdated={onTeacherUpdated}
                onTeacherRemoved={(id) => {
                  onTeacherRemoved?.(id)
                  onClose()
                }}
              />
            )}
            {selected.kind === "institute" && (
              <InstituteView
                profile={record as InstituteProfileData}
                onInstituteUpdated={onInstituteUpdated}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

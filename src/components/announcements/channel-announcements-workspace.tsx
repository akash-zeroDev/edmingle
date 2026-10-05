"use client"

import * as React from "react"
import { useState, useMemo, useRef, useEffect } from "react"
import {
  Megaphone,
  Globe,
  BookOpen,
  Users,
  Search,
  Trash2,
  Send,
  SendHorizontal,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  X,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export interface AnnouncementChannel {
  id: string | null // null means "All Batches"
  name: string
  subtitle?: string
  studentCount?: number
  isGlobal?: boolean
}

export interface AnnouncementMessage {
  id: string
  content: string
  priority: "NORMAL" | "HIGH" | "URGENT"
  batchId: string | null
  batchName?: string | null
  authorRole: "ADMIN" | "FACULTY"
  authorName: string
  createdAt: string
}

interface ChannelAnnouncementsWorkspaceProps {
  userRole: "ADMIN" | "FACULTY"
  currentUserName: string
  channels: AnnouncementChannel[]
  initialAnnouncements: AnnouncementMessage[]
  className?: string
  onPublish: (data: {
    batchId: string | null
    content: string
    priority: "NORMAL" | "HIGH" | "URGENT"
  }) => Promise<{ success?: boolean; announcement?: any; error?: string }>
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>
}

function formatDateSeparator(dateString: string): string {
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return "Recent"
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export function ChannelAnnouncementsWorkspace({
  userRole,
  currentUserName,
  channels,
  initialAnnouncements,
  className,
  onPublish,
  onDelete,
}: ChannelAnnouncementsWorkspaceProps) {
  const { toast } = useToast()

  // Active channel selection (defaults to first channel, typically "All Batches")
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    channels[0]?.id ?? null
  )

  // Channel search query in left rail
  const [channelSearch, setChannelSearch] = useState("")

  // Search query within the active channel stream
  const [streamSearch, setStreamSearch] = useState("")

  // Priority filter for the stream
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "NORMAL" | "HIGH" | "URGENT">("ALL")

  // Feed items
  const [announcements, setAnnouncements] = useState<AnnouncementMessage[]>(initialAnnouncements)

  useEffect(() => {
    setAnnouncements(initialAnnouncements)
  }, [initialAnnouncements])

  // Composer state
  const [messageText, setMessageText] = useState("")
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL")
  const [isSending, setIsSending] = useState(false)

  // Textarea ref & chat scroll container ref
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const streamContainerRef = useRef<HTMLDivElement>(null)

  // Filter channels based on search
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return channels
    const q = channelSearch.toLowerCase()
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q))
    )
  }, [channels, channelSearch])

  // Active channel object
  const activeChannel = useMemo(() => {
    return (
      channels.find((c) => c.id === selectedChannelId) ||
      channels[0] || {
        id: null,
        name: "All batches",
        subtitle: "All students",
        isGlobal: true,
      }
    )
  }, [channels, selectedChannelId])

  // Count messages per channel
  const messageCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 }
    announcements.forEach((a) => {
      counts.ALL = (counts.ALL || 0) + 1
      if (a.batchId) {
        counts[a.batchId] = (counts[a.batchId] || 0) + 1
      }
    })
    return counts
  }, [announcements])

  // Filter announcements for the active channel
  const activeChannelAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      // If "All Batches" channel selected: show global notices (batchId === null) OR all notices
      if (selectedChannelId === null || selectedChannelId === "ALL") {
        return true
      }
      // For a specific batch: show notices explicitly for this batch or global institute notices
      return a.batchId === selectedChannelId || a.batchId === null || a.batchId === "ALL"
    })
  }, [announcements, selectedChannelId])

  // Further filtered by stream search and priority
  const displayAnnouncements = useMemo(() => {
    return activeChannelAnnouncements.filter((a) => {
      if (priorityFilter !== "ALL" && a.priority !== priorityFilter) {
        return false
      }
      if (streamSearch.trim()) {
        const q = streamSearch.toLowerCase()
        const matchesContent = a.content.toLowerCase().includes(q)
        const matchesAuthor = a.authorName.toLowerCase().includes(q)
        if (!matchesContent && !matchesAuthor) return false
      }
      return true
    })
  }, [activeChannelAnnouncements, priorityFilter, streamSearch])

  // Scroll stream container to top when new messages arrive or channel switches
  useEffect(() => {
    streamContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [selectedChannelId])

  // Handle send message
  async function handleSend() {
    const text = messageText.trim()
    if (!text || isSending) return

    setIsSending(true)

    // Optimistic message
    const tempId = `temp_${Date.now()}`
    const optimisticItem: AnnouncementMessage = {
      id: tempId,
      content: text,
      priority,
      batchId: selectedChannelId,
      batchName: activeChannel.name,
      authorRole: userRole,
      authorName: currentUserName,
      createdAt: new Date().toISOString(),
    }

    setAnnouncements((prev) => [optimisticItem, ...prev])
    setMessageText("")

    try {
      const res = await onPublish({
        batchId: selectedChannelId,
        content: text,
        priority,
      })

      if (res.error) {
        toast({
          title: "Failed to post announcement",
          description: res.error,
          variant: "destructive",
        })
        // Rollback
        setAnnouncements((prev) => prev.filter((a) => a.id !== tempId))
      } else if (res.announcement) {
        // Replace temp with real
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === tempId ? (res.announcement as AnnouncementMessage) : a))
        )
        toast({
          title: "Announcement posted",
        })
        // Ensure scroll to top
        streamContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      })
      setAnnouncements((prev) => prev.filter((a) => a.id !== tempId))
    } finally {
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  // Handle Enter key for fast sending
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle delete notice
  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return

    const previous = announcements
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))

    try {
      const res = await onDelete(id)
      if (res.error) {
        toast({
          title: "Failed to delete",
          description: res.error,
          variant: "destructive",
        })
        setAnnouncements(previous)
      } else {
        toast({
          title: "Announcement deleted",
        })
      }
    } catch {
      toast({
        title: "Failed to delete",
        description: "Something went wrong.",
        variant: "destructive",
      })
      setAnnouncements(previous)
    }
  }

  let previousDateGroup = ""

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col md:flex-row min-w-0 w-full",
        className || "h-[calc(100dvh-11.5rem)] min-h-[480px]"
      )}
    >
      {/* =====================================================================
          LEFT RAIL: CHANNEL & BATCH SELECTOR (Compact Discord/Slack style)
         ===================================================================== */}
      <aside className="w-full md:w-60 lg:w-68 border-r border-border flex flex-col bg-muted/20 shrink-0 min-w-0">
        {/* Rail Header */}
        <div className="p-3 sm:p-3.5 border-b border-border/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Megaphone className="size-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-foreground uppercase tracking-wider truncate">
                  Channels
                </h3>
                <p className="text-[10px] text-muted-foreground truncate">
                  Select audience
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-foreground shrink-0">
              {channels.length}
            </span>
          </div>

          {/* Channel Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              placeholder="Search batches..."
              className="h-8 pl-8 pr-7 text-xs rounded-lg border-border/80 bg-background"
            />
            {channelSearch && (
              <button
                type="button"
                onClick={() => setChannelSearch("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChannels.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No matching channels found.
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isSelected = selectedChannelId === channel.id
              const count = channel.id === null ? messageCounts.ALL : (messageCounts[channel.id] || 0)

              return (
                <button
                  key={channel.id ?? "all"}
                  type="button"
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer group border min-w-0",
                    isSelected
                      ? "bg-card border-primary/30 text-foreground shadow-2xs ring-1 ring-primary/20"
                      : "border-transparent text-muted-foreground hover:bg-card/70 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-primary-light group-hover:text-primary"
                    )}
                  >
                    {channel.isGlobal || channel.id === null ? (
                      <Globe className="size-3.5" />
                    ) : (
                      <BookOpen className="size-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={cn(
                          "text-xs font-semibold truncate",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {channel.name}
                      </p>
                      {count > 0 && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0",
                            isSelected
                              ? "bg-primary-light text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {channel.subtitle || (channel.studentCount ? `${channel.studentCount} students` : "All students")}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* =====================================================================
          RIGHT AREA: ACTIVE CHANNEL STREAM & SLEEK CHAT COMPOSER
         ===================================================================== */}
      <main className="flex-1 flex flex-col h-full bg-card min-w-0">
        {/* Stream Top Header Bar */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-border/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 bg-card shrink-0 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
            <div className="size-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
              {activeChannel.isGlobal || activeChannel.id === null ? (
                <Globe className="size-4" />
              ) : (
                <BookOpen className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {activeChannel.name}
                </h2>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                  Active
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                {activeChannel.subtitle ||
                  (activeChannel.studentCount
                    ? `${activeChannel.studentCount} students`
                    : "All students")}
              </p>
            </div>
          </div>

          {/* Search & Priority Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-28 sm:w-36 md:w-44">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={streamSearch}
                onChange={(e) => setStreamSearch(e.target.value)}
                placeholder="Search..."
                className="h-7.5 pl-8 pr-6 text-xs rounded-lg border-border"
              />
              {streamSearch && (
                <button
                  type="button"
                  onClick={() => setStreamSearch("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border">
              {(["ALL", "NORMAL", "HIGH", "URGENT"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={cn(
                    "px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                    priorityFilter === p
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === "ALL" ? "All" : p === "HIGH" ? "Important" : p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stream Message Area (Scrollable Feed) */}
        <div
          ref={streamContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-3 sm:p-4 space-y-3 bg-muted/10"
        >
          {displayAnnouncements.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <div className="size-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-2.5 text-muted-foreground/60">
                <MessageSquare className="size-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                No announcements yet
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                {streamSearch
                  ? "No announcements match your search query."
                  : `Write an announcement below to post to ${activeChannel.name}.`}
              </p>
            </div>
          ) : (
            displayAnnouncements.map((item) => {
              const isMe =
                (item.authorRole === userRole &&
                  (item.authorName.toLowerCase() === currentUserName.toLowerCase() ||
                    item.authorName.toLowerCase().includes(currentUserName.toLowerCase()) ||
                    currentUserName.toLowerCase().includes(item.authorName.toLowerCase()))) ||
                item.authorName.toLowerCase() === "you"
              const isUrgent = item.priority === "URGENT"
              const isHigh = item.priority === "HIGH"
              const dateGroup = formatDateSeparator(item.createdAt)
              const showDateDivider = dateGroup !== previousDateGroup
              previousDateGroup = dateGroup

              return (
                <React.Fragment key={item.id}>
                  {/* Date Separator Divider */}
                  {showDateDivider && (
                    <div className="flex items-center gap-3 my-2.5">
                      <div className="h-px bg-border/60 flex-1" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-0.5 rounded-full bg-background border border-border/70 shadow-2xs">
                        {dateGroup}
                      </span>
                      <div className="h-px bg-border/60 flex-1" />
                    </div>
                  )}

                  {/* Refined Message Card with distinct border & visual accent */}
                  <div
                    className={cn(
                      "group relative rounded-xl border bg-card p-3 sm:p-3.5 transition-all shadow-2xs hover:shadow-xs",
                      isUrgent
                        ? "border-l-4 border-l-rose-500 border-border bg-rose-50/15 dark:bg-rose-950/10"
                        : isHigh
                        ? "border-l-4 border-l-amber-500 border-border bg-amber-50/15 dark:bg-amber-950/10"
                        : "border-l-4 border-l-primary/40 border-border bg-card"
                    )}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        {/* Author Avatar Initial */}
                        <div
                          className={cn(
                            "size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                            item.authorRole === "ADMIN"
                              ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-800"
                              : "bg-primary/10 text-primary ring-1 ring-primary/30"
                          )}
                        >
                          {item.authorRole === "ADMIN" ? (
                            <ShieldCheck className="size-3.5" />
                          ) : isMe ? (
                            "Y"
                          ) : (
                            item.authorName?.charAt(0).toUpperCase() || "T"
                          )}
                        </div>

                        {/* Author Name */}
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.authorRole === "ADMIN" ? (
                            <span>Admin ({item.authorName})</span>
                          ) : isMe ? (
                            <span>You</span>
                          ) : (
                            item.authorName
                          )}
                        </span>

                        {/* Target batch pill */}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border/80 shrink-0">
                          {item.batchName || "All batches"}
                        </span>

                        {/* Priority pill */}
                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100/90 text-rose-700 border border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 uppercase tracking-wide shrink-0">
                            <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
                            Urgent
                          </span>
                        ) : isHigh ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100/90 text-amber-700 border border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 uppercase tracking-wide shrink-0">
                            <span className="size-1.5 rounded-full bg-amber-600" />
                            Important
                          </span>
                        ) : null}
                      </div>

                      {/* Right Meta: Timestamp & Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <time className="text-[11px] text-muted-foreground font-medium">
                          {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 size-6 rounded-md text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer"
                          title="Delete announcement"
                          aria-label="Delete announcement"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Message Body with clean alignment under avatar */}
                    <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words pl-8">
                      {item.content}
                    </div>
                  </div>
                </React.Fragment>
              )
            })
          )}
        </div>

        {/* =====================================================================
            BOTTOM DOCKED SLEEK & MINIMAL CHAT COMPOSER
           ===================================================================== */}
        <div className="p-2.5 sm:p-3 border-t border-border bg-card shrink-0">
          <div className="rounded-xl border border-border bg-background shadow-2xs focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all p-1.5 sm:p-2 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Write an announcement for ${activeChannel.name}...`}
              className="flex-1 bg-transparent px-1.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed min-h-[36px] max-h-[96px]"
            />

            <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
              {/* Priority Selector Dropdown Pill */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "h-7 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors border shrink-0 cursor-pointer",
                      priority === "URGENT"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : priority === "HIGH"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                    )}
                    title="Set announcement priority"
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        priority === "URGENT"
                          ? "bg-rose-500"
                          : priority === "HIGH"
                          ? "bg-amber-500"
                          : "bg-muted-foreground/60"
                      )}
                    />
                    <span className="hidden sm:inline">
                      {priority === "URGENT" ? "Urgent" : priority === "HIGH" ? "Important" : "Normal"}
                    </span>
                    <ChevronDown className="size-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-36 p-1">
                  <DropdownMenuItem
                    onClick={() => setPriority("NORMAL")}
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span className="size-2 rounded-full bg-slate-400" />
                    <span>Normal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPriority("HIGH")}
                    className="text-xs flex items-center gap-2 text-amber-700 cursor-pointer"
                  >
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span>Important</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPriority("URGENT")}
                    className="text-xs flex items-center gap-2 text-rose-700 cursor-pointer"
                  >
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span>Urgent</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Send Button */}
              <Button
                type="button"
                size="sm"
                disabled={!messageText.trim() || isSending}
                onClick={handleSend}
                className="h-8 px-3 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0"
                title="Send announcement"
                aria-label="Send announcement"
              >
                {isSending ? (
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <SendHorizontal className="size-4 shrink-0" />
                    <span>Send</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Minimal shortcut & target indicator */}
          <div className="flex items-center justify-between px-1 pt-1 text-[10px] text-muted-foreground/70">
            <span className="truncate">
              Target: <strong className="font-medium text-foreground/80">{activeChannel.name}</strong>
            </span>
            <span className="hidden sm:inline shrink-0">
              Press <kbd className="px-1 py-0.2 rounded border border-border bg-muted/60 text-[9px] font-mono">Enter ↵</kbd> to send
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import * as React from "react"
import { useState } from "react"
import {
  ChannelAnnouncementsWorkspace,
  type AnnouncementChannel,
  type AnnouncementMessage,
} from "@/components/announcements/channel-announcements-workspace"
import { createBatchAnnouncement, deleteAnnouncement } from "@/actions/announcement"

interface InstituteAnnouncementsViewProps {
  instituteName: string
  channels: AnnouncementChannel[]
  initialAnnouncements: AnnouncementMessage[]
}

export function InstituteAnnouncementsView({
  instituteName,
  channels,
  initialAnnouncements,
}: InstituteAnnouncementsViewProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Announcements
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Broadcast updates to all batches or target a specific class
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 min-w-0">
        <ChannelAnnouncementsWorkspace
        userRole="ADMIN"
        currentUserName={`${instituteName} Administration`}
        channels={channels}
        initialAnnouncements={initialAnnouncements}
        onPublish={async (data) => {
          return await createBatchAnnouncement({
            batchId: data.batchId,
            content: data.content,
            priority: data.priority,
          })
        }}
        onDelete={async (id) => {
          return await deleteAnnouncement(id)
        }}
      />
      </div>
    </div>
  )
}

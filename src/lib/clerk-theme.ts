export const clerkAppearance = {
  variables: {
    colorPrimary: "#1d4ed8",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), sans-serif",
  },
  elements: {
    userButtonAvatarBox: "size-8 rounded-full ring-2 ring-primary/20",
    userButtonPopoverFooter: "!hidden",
    footer: "!hidden",
    footerAction: "!hidden",
    footerPages: "!hidden",
    userButtonPopoverCard:
      "rounded-2xl border border-border bg-card shadow-2xl p-1.5 transition-all duration-200 ease-out origin-top-right",
    userButtonPopoverMain: "p-2",
    userButtonPopoverActions: "gap-1 py-1",
    userButtonPopoverActionButton:
      "rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
    userButtonPopoverActionButtonIconBox: "size-4 text-muted-foreground",
    userButtonPopoverActionButtonText: "text-xs font-medium",
    userPreview: "p-2",
    userPreviewMainIdentifier: "text-xs font-semibold text-foreground",
    userPreviewSecondaryIdentifier: "text-[11px] text-muted-foreground",
  },
}

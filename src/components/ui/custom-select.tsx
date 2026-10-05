"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

/* ==========================================================================
   DIRECT / HIGHER-LEVEL API: <CustomSelect />
   Ideal for standard selects, long searchable lists, and mobile responsiveness
   ========================================================================== */

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  description?: string
  badge?: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface CustomSelectProps<T extends string = string> {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  size?: "sm" | "default" | "lg"
  name?: string
  id?: string
  icon?: React.ComponentType<{ className?: string }>
  align?: "start" | "center" | "end"
}

export function CustomSelect<T extends string = string>({
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  placeholder = "Select an option...",
  searchable,
  searchPlaceholder = "Search options...",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  size = "default",
  name,
  id,
  icon: TriggerIcon,
  align = "start",
}: CustomSelectProps<T>) {
  const [internalValue, setInternalValue] = React.useState<T | undefined>(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === currentValue)
  }, [options, currentValue])

  // Automatically enable search if options list has more than 6 items, unless explicitly turned off
  const isSearchable = searchable !== undefined ? searchable : options.length > 6

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase().trim()
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(query)
      const matchDesc = opt.description ? opt.description.toLowerCase().includes(query) : false
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(query) : false
      return matchLabel || matchDesc || matchBadge
    })
  }, [options, searchQuery])

  const handleSelect = React.useCallback(
    (val: T) => {
      if (!isControlled) {
        setInternalValue(val)
      }
      onChange?.(val)
      setOpen(false)
      setSearchQuery("")
    },
    [isControlled, onChange]
  )

  // Focus search input when popover opens
  React.useEffect(() => {
    if (open && isSearchable) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else if (!open) {
      setSearchQuery("")
    }
  }, [open, isSearchable])

  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs rounded-lg",
    default: "h-9 px-3 text-xs sm:text-[13px] rounded-xl",
    lg: "h-11 px-3.5 text-sm rounded-xl",
  }[size]

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        asChild
        disabled={disabled}
      >
        <button
          type="button"
          id={id}
          name={name}
          aria-expanded={open}
          className={cn(
            "group flex w-full items-center justify-between border border-[#e2e8f0] bg-white text-left font-medium text-slate-800 transition-all",
            "hover:border-slate-300 hover:bg-[#fafafa]",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
            "cursor-pointer shadow-xs",
            sizeClasses,
            triggerClassName,
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {TriggerIcon && (
              <TriggerIcon className="size-3.5 shrink-0 text-slate-400 group-hover:text-slate-600" />
            )}
            {selectedOption?.icon && (
              <selectedOption.icon className="size-3.5 shrink-0 text-primary" />
            )}
            <span className={cn("truncate", !selectedOption && "text-slate-400 font-normal")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            className={cn(
              "ml-2 size-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-slate-600",
              open && "rotate-180 text-primary"
            )}
          />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={5}
          avoidCollisions={true}
          className={cn(
            "z-[60] w-[var(--radix-popover-trigger-width)] min-w-[200px] max-w-[calc(100vw-24px)] rounded-xl border border-[#e2e8f0] bg-white p-1 text-slate-900 shadow-xl outline-none transition-all duration-200 ease-out",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:duration-150 data-[state=closed]:ease-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:data-[state=closed]:slide-out-to-top-1 data-[side=top]:data-[state=closed]:slide-out-to-bottom-1",
            contentClassName
          )}
        >
          {/* Optional Search Input Header */}
          {isSearchable && (
            <div className="relative border-b border-slate-100 p-1.5 pb-2">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 size-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 border border-transparent focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Scrollable List */}
          <div className="max-h-60 overflow-y-auto overscroll-contain py-1 px-0.5 space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === currentValue
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer select-none",
                      isSelected
                        ? "bg-primary-light text-primary font-semibold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                      opt.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {opt.icon && (
                        <opt.icon
                          className={cn(
                            "size-3.5 shrink-0",
                            isSelected ? "text-primary" : "text-slate-400"
                          )}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="truncate text-[10px] text-slate-400 font-normal">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="inline-flex rounded px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="size-3.5 text-primary stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/* ==========================================================================
   COMPOSABLE / SHADCN-STYLE API:
   <Select>
     <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
     <SelectContent>
       <SelectItem value="1">Option 1</SelectItem>
     </SelectContent>
   </Select>
   ========================================================================== */

interface SelectContextValue {
  value?: string
  onValueChange?: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  selectedLabel: string
  setSelectedLabel: (label: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const handleValueChange = React.useCallback(
    (newVal: string) => {
      if (!isControlled) {
        setInternalValue(newVal)
      }
      onValueChange?.(newVal)
      setOpen(false)
    },
    [isControlled, onValueChange]
  )

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel,
      }}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)

  return (
    <PopoverPrimitive.Trigger asChild>
      <button
        ref={ref}
        type="button"
        className={cn(
          "group flex h-9 w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs sm:text-[13px] text-slate-800 transition-all cursor-pointer shadow-xs",
          "hover:border-slate-300 hover:bg-[#fafafa]",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 truncate">{children}</div>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-slate-600",
            ctx?.open && "rotate-180 text-primary"
          )}
        />
      </button>
    </PopoverPrimitive.Trigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

export function SelectValue({
  placeholder = "Select...",
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const ctx = React.useContext(SelectContext)
  return (
    <span className={cn("truncate", !ctx?.value && "text-slate-400 font-normal", className)}>
      {ctx?.selectedLabel || ctx?.value || placeholder}
    </span>
  )
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end"
    sideOffset?: number
    className?: string
  }
>(({ className, children, align = "start", sideOffset = 5, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        avoidCollisions={true}
        className={cn(
          "z-[60] w-[var(--radix-popover-trigger-width)] min-w-[180px] max-w-[calc(100vw-24px)] rounded-xl border border-[#e2e8f0] bg-white p-1 text-slate-900 shadow-xl outline-none transition-all duration-200 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:duration-150 data-[state=closed]:ease-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:data-[state=closed]:slide-out-to-top-1 data-[side=top]:data-[state=closed]:slide-out-to-bottom-1",
          className
        )}
        {...props}
      >
        <div className="max-h-60 overflow-y-auto overscroll-contain py-1 px-0.5 space-y-0.5 scrollbar-thin">
          {children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})
SelectContent.displayName = "SelectContent"

export function SelectItem({
  value,
  children,
  className,
  disabled = false,
}: {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx?.value === value

  React.useEffect(() => {
    if (isSelected && typeof children === "string") {
      ctx.setSelectedLabel(children)
    }
  }, [isSelected, children, ctx])

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => ctx?.onValueChange?.(value)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer select-none",
        isSelected
          ? "bg-primary-light text-primary font-semibold"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
        className
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check className="size-3.5 text-primary stroke-[2.5]" />}
    </button>
  )
}

export function SelectGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("p-1", className)}>{children}</div>
}

export function SelectLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SelectSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-slate-100", className)} />
}

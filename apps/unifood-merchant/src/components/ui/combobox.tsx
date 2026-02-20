"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

// --- Context ---

interface ComboboxContextValue {
  value: string[]
  onValueChange: (value: string[]) => void
  open: boolean
  setOpen: (open: boolean) => void
  searchValue: string
  setSearchValue: (value: string) => void
  multiple?: boolean
  items?: any[]
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

export function useCombobox() {
  const context = React.useContext(ComboboxContext)
  if (!context) throw new Error("useCombobox must be used within a Combobox")
  return context
}

// --- Components ---

export interface ComboboxProps {
  children: React.ReactNode
  items?: any[]
  defaultValue?: string[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  multiple?: boolean
  autoHighlight?: boolean
}

export function Combobox({
  children,
  defaultValue = [],
  value: propValue,
  onValueChange: propOnValueChange,
  multiple = false,
  items,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue)
  const [searchValue, setSearchValue] = React.useState("")

  const value = propValue !== undefined ? propValue : internalValue
  
  const onValueChange = React.useCallback((newValue: string[]) => {
    if (propValue === undefined) setInternalValue(newValue)
    propOnValueChange?.(newValue)
  }, [propValue, propOnValueChange])

  const contextValue = React.useMemo(() => ({ 
    value, 
    onValueChange, 
    open, 
    setOpen, 
    searchValue, 
    setSearchValue,
    multiple,
    items
  }), [value, onValueChange, open, multiple, items, searchValue])

  return (
    <ComboboxContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full">
            {children}
          </div>
        </PopoverAnchor>
      </Popover>
    </ComboboxContext.Provider>
  )
}

export function useComboboxAnchor() {
  return React.useRef<HTMLDivElement>(null)
}

export const ComboboxChips = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="combobox"
      className={cn(
        "group flex min-h-9 w-full flex-wrap items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs transition-[color,box-shadow]",
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const input = e.currentTarget.querySelector('input');
          input?.focus();
        }
      }}
      {...props}
    >
      {children}
      <PopoverTrigger asChild>
        <button 
          type="button" 
          className="ml-auto opacity-50 hover:opacity-100 outline-none focus:opacity-100"
          aria-label="Open selection"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
    </div>
  )
})
ComboboxChips.displayName = "ComboboxChips"

export function ComboboxValue({ 
  children 
}: { 
  children: (values: string[]) => React.ReactNode 
}) {
  const { value } = useCombobox()
  return (
    <React.Fragment>
      {children(value)}
    </React.Fragment>
  )
}

export function ComboboxChip({ 
  value: chipValue,
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value, onValueChange } = useCombobox()
  
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onValueChange(value.filter(v => v !== chipValue))
  }

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 pr-1 font-normal", className)}
      {...props}
    >
      {children}
      <button
        type="button"
        onClick={handleRemove}
        className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-muted"
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
      </button>
    </Badge>
  )
}

export function ComboboxChipsInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const { searchValue, setSearchValue, setOpen, value, onValueChange } = useCombobox()
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && searchValue === "" && value.length > 0) {
      onValueChange(value.slice(0, -1))
    }
  }

  return (
    <input
      value={searchValue}
      onFocus={() => setOpen(true)}
      onChange={(e) => {
        setSearchValue(e.target.value)
        setOpen(true)
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[50px] py-1",
        className
      )}
      {...props}
    />
  )
}

export function ComboboxContent({ 
  children,
  anchor 
}: { 
  children: React.ReactNode
  anchor?: React.RefObject<HTMLDivElement | null> 
}) {
  const { searchValue } = useCombobox()
  
  return (
    <PopoverContent 
      className="p-0 overflow-hidden" 
      style={{ width: anchor?.current?.offsetWidth }}
      align="start"
    >
      <Command className="w-full" shouldFilter={false}>
        {children}
      </Command>
    </PopoverContent>
  )
}

export function ComboboxEmpty({ children }: { children: React.ReactNode }) {
  return <CommandEmpty>{children}</CommandEmpty>
}

export function ComboboxList({ 
  children,
  items: propItems 
}: { 
  children: (item: any) => React.ReactNode
  items?: any[]
}) {
  const { items: contextItems, searchValue } = useCombobox()
  const items = propItems || contextItems

  const filteredItems = React.useMemo(() => {
    if (!searchValue) return items
    const search = searchValue.toLowerCase()
    return items?.filter(item => 
      item.name?.toLowerCase().includes(search)
    )
  }, [items, searchValue])

  return (
    <CommandList>
      {filteredItems && filteredItems.length > 0 ? (
        <CommandGroup>
          {filteredItems.map((item) => children(item))}
        </CommandGroup>
      ) : searchValue ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No matches found.
        </div>
      ) : null}
    </CommandList>
  )
}

export function ComboboxItem({ 
  value: itemValue,
  children,
  className 
}: { 
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value, onValueChange, multiple, setSearchValue } = useCombobox()
  const isSelected = value.includes(itemValue)

  return (
    <CommandItem
      value={itemValue}
      onSelect={() => {
        if (multiple) {
          const newValue = isSelected
            ? value.filter((v) => v !== itemValue)
            : [...value, itemValue]
          onValueChange(newValue)
        } else {
          onValueChange([itemValue])
        }
        setSearchValue("")
      }}
      className={cn("flex items-center justify-between", className)}
    >
      {children}
      {isSelected && <Check className="h-4 w-4" />}
    </CommandItem>
  )
}
export function ComboboxCreate({
  onSelect,
  children,
}: {
  onSelect: (value: string) => void
  children?: (searchValue: string) => React.ReactNode
}) {
  const { searchValue, items = [] } = useCombobox()

  if (!searchValue) return null

  const hasExactMatch = items.some(
    (item) => item.name?.toLowerCase() === searchValue.toLowerCase()
  )

  if (hasExactMatch) return null

  return (
    <CommandGroup className="border-t mt-1">
      <CommandItem
        value={searchValue}
        onSelect={() => onSelect(searchValue)}
        className="flex items-center gap-2"
      >
        <span className="text-muted-foreground italic">
          {children ? children(searchValue) : `Create "${searchValue}"`}
        </span>
      </CommandItem>
    </CommandGroup>
  )
}

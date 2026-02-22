"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, FilterX, Pencil, Trash2, MoreVertical } from "lucide-react"
import { EditMenuItemDialog, DeleteMenuItemDialog } from "./menu-item-dialogs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export interface MenuItem {
  id: string
  name: string
  description: string | null
  photo?: string | null
  isActive: boolean
  isVeg: boolean
  isSpicy: boolean
  preparationTime?: number | null
  categories: {
    id: string
    name: string
  }[]
  variants: {
    id: string
    name: string
    price: number
    isAvailable: boolean
    unitType?: string
    unitValue?: number
    unitLabel?: string
  }[]
  branchItems?: {
    branchId: string
    isAvailable: boolean
  }[]
}

interface MenuItemsTableProps {
  items: MenuItem[]
  categories: { id: string; name: string }[]
  branches: { id: string; name: string }[]
  role: "OWNER" | "STAFF"
  currentBranchId: string
  onBranchChange: (id: string) => void
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void
  onUpdateItem: (itemId: string, data: any) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
}

export function MenuItemsTable({
  items,
  categories,
  branches,
  role,
  currentBranchId,
  onBranchChange,
  onToggleAvailability,
  onUpdateItem,
  onDeleteItem,
}: MenuItemsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedAvailability, setSelectedAvailability] = React.useState<string>("all")
  const [selectedPricing, setSelectedPricing] = React.useState<string>("all")

  // For Edit/Delete
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null)
  const [deletingItem, setDeletingItem] = React.useState<MenuItem | null>(null)

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      const matchesCategory = selectedCategory === "all" || 
        item.categories.some(cat => cat.id === selectedCategory)
      
      const branchItem = currentBranchId 
        ? item.branchItems?.find(bi => bi.branchId === currentBranchId)
        : null

      const isAvailable = branchItem ? branchItem.isAvailable : true

      const matchesAvailability = selectedAvailability === "all" ||
        (selectedAvailability === "available" ? isAvailable : !isAvailable)

      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [items, searchQuery, selectedCategory, selectedAvailability, currentBranchId])

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-2 overflow-x-auto overflow-y-visible pb-2 scrollbar-none">
        {/* Filters on the left */}
        <div className="flex flex-row items-center gap-2 shrink-0 flex-wrap">
          {role === "OWNER" && (
            <Select value={currentBranchId} onValueChange={onBranchChange}>
              <SelectTrigger className="w-[180px] h-9 shrink-0">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px] h-9 shrink-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger className="w-[130px] h-9 shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>


          {(searchQuery !== "" || selectedCategory !== "all" || selectedAvailability !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedAvailability("all")
              }}
              className="flex items-center h-9 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors shrink-0"
            >
              <FilterX className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Search on the right */}
        <div className="relative min-w-[220px] max-w-[320px] w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search items..."
            className="pl-8 h-9"
            style={{ isolation: "auto" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Availability</TableHead>
              {role === "OWNER" && <TableHead className="w-[70px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={role === "OWNER" ? 7 : 6} className="h-24 text-center">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const branchItem = currentBranchId 
                  ? item.branchItems?.find(bi => bi.branchId === currentBranchId)
                  : null
                const isAvailable = branchItem ? branchItem.isAvailable : true

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md border bg-muted overflow-hidden">
                        {item.photo ? (
                          <img 
                            src={item.photo} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground uppercase font-bold">
                            {item.name.substring(0, 2)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {!item.isActive && (
                            <Badge variant="outline" className="text-[10px] h-4 py-0 text-muted-foreground">Inactive</Badge>
                          )}
                          {item.isVeg && (
                            <div className="flex h-3 w-3 items-center justify-center border border-green-600 rounded-[2px] p-[1px]">
                              <div className="h-full w-full rounded-full bg-green-600" />
                            </div>
                          )}
                          {item.isSpicy && (
                            <span title="Spicy">🌶️</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </span>
                          )}
                          {item.preparationTime && (
                            <span className="text-[10px] text-muted-foreground shrink-0 border-l pl-2">
                              {item.preparationTime} min wait
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map(cat => (
                          <Badge key={cat.id} variant="secondary" className="font-normal">{cat.name}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.variants.length > 1 ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            MYR {Math.min(...item.variants.map(v => v.price))} - MYR {Math.max(...item.variants.map(v => v.price))}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.variants.length} Variants
                          </span>
                        </div>
                      ) : item.variants[0] ? (
                        <span className="text-sm font-medium">MYR {item.variants[0].price}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No price</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={isAvailable ? "text-success text-xs" : "text-muted-foreground text-xs"}>
                          {isAvailable ? "Available" : "Hidden"}
                        </span>
                        <Switch
                          checked={isAvailable}
                          onCheckedChange={(checked) => onToggleAvailability(item.id, checked)}
                          disabled={!currentBranchId}
                        />
                      </div>
                    </TableCell>
                    {role === "OWNER" && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => setEditingItem(item)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => setDeletingItem(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editingItem && (
        <EditMenuItemDialog
          item={editingItem}
          categories={categories}
          branches={branches}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSubmit={(data) => onUpdateItem(editingItem.id, data)}
        />
      )}

      {deletingItem && (
        <DeleteMenuItemDialog
          item={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onConfirm={() => onDeleteItem(deletingItem.id)}
        />
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MenuForm, MenuFormValues } from "./menu-form"
import { AlertTriangle } from "lucide-react"

interface EditMenuItemDialogProps {
  item: any
  categories: { id: string; name: string }[]
  branches: { id: string; name: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
}

export function EditMenuItemDialog({
  item,
  categories,
  branches,
  open,
  onOpenChange,
  onSubmit,
}: EditMenuItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const initialValues: Partial<MenuFormValues> = {
    name: item.name,
    description: item.description || "",
    categoryIds: item.categories.map((c: any) => c.id),
    pricingModel: item.pricingModel,
    price: item.price?.toString() || "",
    unitPrice: item.unitPrice?.toString() || "",
    unitType: item.unitType || "portion",
    unitSize: item.unitSize?.toString() || "1",
    imageUrl: item.imageUrl || "",
    // Determine branch availability
    availableInAllBranches: item.branchItems?.length === branches.length,
    branchIds: item.branchItems?.map((bi: any) => bi.branchId) || [],
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>
            Update the details for "{item.name}".
          </DialogDescription>
        </DialogHeader>
        <MenuForm
          initialValues={initialValues}
          categories={categories}
          branches={branches}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

interface DeleteMenuItemDialogProps {
  item: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function DeleteMenuItemDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
}: DeleteMenuItemDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Menu Item</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MenuForm } from "./menu-form"

interface AddMenuItemModalProps {
  categories: { id: string; name: string }[]
  branches: { id: string; name: string }[]
  onSubmit: (data: any) => Promise<void>
}

export function AddMenuItemModal({ categories, branches, onSubmit }: AddMenuItemModalProps) {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
          <DialogDescription>
            Create a new item for your restaurant menu.
          </DialogDescription>
        </DialogHeader>
        <MenuForm
          categories={categories}
          branches={branches}
          onSubmit={handleFormSubmit}
          submitLabel="Create Item"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

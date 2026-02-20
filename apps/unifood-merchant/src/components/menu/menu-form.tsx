"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { ImageUpload } from "@/components/ui/image-upload"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, "Please select at least one category"),
  availableInAllBranches: z.boolean(),
  branchIds: z.array(z.string()).optional(),
  pricingModel: z.enum(["FIXED", "MEASURED"]),
  price: z.string().optional(),
  unitPrice: z.string().optional(),
  unitType: z.string().optional(),
  unitSize: z.string().optional(),
  imageUrl: z.string().optional(),
})

export type MenuFormValues = z.infer<typeof formSchema>

interface MenuFormProps {
  initialValues?: Partial<MenuFormValues>
  categories: { id: string; name: string }[]
  branches: { id: string; name: string }[]
  onSubmit: (data: any) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
}

export function MenuForm({
  initialValues,
  categories,
  branches,
  onSubmit,
  submitLabel = "Submit",
  isSubmitting = false,
}: MenuFormProps) {
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      categoryIds: initialValues?.categoryIds || [],
      availableInAllBranches: initialValues?.availableInAllBranches ?? true,
      branchIds: initialValues?.branchIds || [],
      pricingModel: initialValues?.pricingModel || "FIXED",
      price: initialValues?.price?.toString() || "",
      unitPrice: initialValues?.unitPrice?.toString() || "",
      unitType: initialValues?.unitType || "portion",
      unitSize: initialValues?.unitSize?.toString() || "1",
      imageUrl: initialValues?.imageUrl || "",
    },
  })

  const pricingModel = form.watch("pricingModel")
  const availableInAllBranches = form.watch("availableInAllBranches")
  const selectedCategoryIds = form.watch("categoryIds") || []
  const selectedBranchIds = form.watch("branchIds") || []

  const categoryAnchor = useComboboxAnchor()
  const branchAnchor = useComboboxAnchor()

  const handleFormSubmit = async (values: MenuFormValues) => {
    // Clean up numbers
    const formattedData = {
      ...values,
      price: values.price ? parseFloat(values.price) : undefined,
      unitPrice: values.unitPrice ? parseFloat(values.unitPrice) : undefined,
      unitSize: values.unitSize ? parseFloat(values.unitSize) : undefined,
      // If all branches, send all IDs
      branchIds: values.availableInAllBranches ? branches.map(b => b.id) : values.branchIds
    }
    await onSubmit(formattedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  disabled={isSubmitting}
                  onChange={field.onChange}
                  onRemove={() => field.onChange("")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chicken Khichuri" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormLabel>Categories</FormLabel>
          <Combobox
            multiple
            items={categories}
            value={selectedCategoryIds}
            onValueChange={(vals) => form.setValue("categoryIds", vals)}
          >
            <ComboboxChips ref={categoryAnchor} className="w-full">
              <ComboboxValue>
                {(values) => (
                  values.map((id) => (
                    <ComboboxChip key={id} value={id}>
                      {categories.find(c => c.id === id)?.name}
                    </ComboboxChip>
                  ))
                )}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Select categories..." />
            </ComboboxChips>
            <ComboboxContent anchor={categoryAnchor}>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.id} value={item.id}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {form.formState.errors.categoryIds && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.categoryIds.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Branch Availability</FormLabel>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="all-branches"
                checked={availableInAllBranches}
                onCheckedChange={(checked) => form.setValue("availableInAllBranches", !!checked)}
              />
              <label htmlFor="all-branches" className="text-sm font-medium leading-none cursor-pointer">
                Available in All Branches
              </label>
            </div>
          </div>

          {!availableInAllBranches && (
            <Combobox
              multiple
              items={branches}
              value={selectedBranchIds}
              onValueChange={(vals) => form.setValue("branchIds", vals)}
            >
              <ComboboxChips ref={branchAnchor} className="w-full">
                <ComboboxValue>
                  {(values) => (
                    values.map((id) => (
                      <ComboboxChip key={id} value={id}>
                        {branches.find(b => b.id === id)?.name}
                      </ComboboxChip>
                    ))
                  )}
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Select branches..." />
              </ComboboxChips>
              <ComboboxContent anchor={branchAnchor}>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.id} value={item.id}>
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pricingModel"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Pricing Model</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed Price</SelectItem>
                    <SelectItem value="MEASURED">Measured (by weight/qty)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {pricingModel === "FIXED" ? (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (৳)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price (৳)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit (e.g. g, portion)</FormLabel>
                  <FormControl>
                    <Input placeholder="portion" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : submitLabel}
        </Button>
      </form>
    </Form>
  )
}

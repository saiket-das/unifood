"use client"

import * as React from "react"
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { ImageUpload } from "@/components/ui/image-upload"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Leaf, Flame, Power, ChevronRight, X, Coins, Package } from "lucide-react"
import { cn } from "@/lib/utils"

import { menuItemSchema, type MenuItemValues } from "@/schemas/food"

export type MenuFormValues = MenuItemValues

interface MenuFormProps {
  initialValues?: Partial<MenuFormValues>
  categories: { id: string; name: string }[]
  branches: { id: string; name: string }[]
  onSubmit: (data: any) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
  showFooter?: boolean
}

function ToggleCard({ 
  icon: Icon, 
  title, 
  description, 
  value, 
  onChange, 
  variant = "default" 
}: { 
  icon: any, 
  title: string, 
  description?: string, 
  value: boolean, 
  onChange: (val: boolean) => void,
  variant?: "default" | "destructive" | "success"
}) {
  const bgColor = variant === "destructive" ? "bg-red-50" : variant === "success" ? "bg-green-50" : "bg-blue-50"
  const iconColor = variant === "destructive" ? "text-red-500" : variant === "success" ? "text-green-500" : "text-blue-500"
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm transition-all hover:border-primary/50">
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-lg", bgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}

export function MenuForm({
  initialValues,
  categories,
  branches,
  onSubmit,
  submitLabel = "Submit",
  isSubmitting = false,
  showFooter = true,
}: MenuFormProps) {
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      categoryIds: initialValues?.categoryIds || [],
      availableInAllBranches: initialValues?.availableInAllBranches ?? true,
      branchIds: initialValues?.branchIds || [],
      photo: initialValues?.photo || "",
      isActive: initialValues?.isActive ?? true,
      isVeg: initialValues?.isVeg ?? false,
      isSpicy: initialValues?.isSpicy ?? false,
      pricingType: (initialValues?.variants && initialValues.variants.length > 1) ? "variants" : "fixed",
      fixedPrice: initialValues?.variants?.[0]?.price?.toString() || "",
      fixedUnitType: (initialValues?.variants?.[0]?.unitType as any) || "portion",
      fixedUnitValue: initialValues?.variants?.[0]?.unitValue?.toString() || "1",
      fixedUnitLabel: initialValues?.variants?.[0]?.unitLabel || "",
      preparationTime: initialValues?.preparationTime?.toString() || "",
      variants: initialValues?.variants?.map(v => ({
        name: v.name || "",
        unitType: (v.unitType as any) || "portion",
        unitValue: v.unitValue?.toString() || "",
        unitLabel: v.unitLabel || "",
        price: v.price?.toString() || "",
        isAvailable: v.isAvailable ?? true,
      })) || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control as any,
    name: "variants",
  })

  const availableInAllBranches = form.watch("availableInAllBranches")
  const selectedCategoryIds = form.watch("categoryIds") || []
  const selectedBranchIds = form.watch("branchIds") || []

  const categoryAnchor = useComboboxAnchor()
  const branchAnchor = useComboboxAnchor()

  const handleFormSubmit: SubmitHandler<MenuFormValues> = async (values) => {
    try {
      let finalVariants: any[] = []

      if (values.pricingType === "fixed") {
        finalVariants = [{
          name: "Regular",
          unitType: values.fixedUnitType || "portion",
          unitValue: values.fixedUnitValue ? parseFloat(values.fixedUnitValue) : 1,
          unitLabel: values.fixedUnitLabel || "",
          price: parseFloat(values.fixedPrice || "0"),
          isAvailable: true
        }]
      } else {
        finalVariants = (values.variants || []).map(v => ({
          ...v,
          unitValue: v.unitValue ? parseFloat(v.unitValue) : undefined,
          price: parseFloat(v.price)
        }))
      }

      const formattedValues = {
        ...values,
        preparationTime: values.preparationTime ? parseInt(values.preparationTime) : undefined,
        variants: finalVariants
      }
      // Assuming 'mutation' is available in the scope, e.g., from useMutation hook
      // For this example, we'll call the passed onSubmit prop
      await onSubmit(formattedValues)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details Card */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/5">
                <h3 className="font-semibold text-lg">Product Details</h3>
                <p className="text-sm text-muted-foreground">General information about the menu item</p>
              </div>
              <div className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Nasi Goreng Ayam" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your delicious food..." 
                          className="min-h-[100px] resize-none" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

          {/* Branch Availability Card */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Branch Availability</h3>
                <p className="text-xs text-muted-foreground">Control which branches serve this item</p>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border">
                <span className="text-[10px] font-semibold">All Branches</span>
                <Switch 
                  checked={availableInAllBranches}
                  onCheckedChange={(checked) => form.setValue("availableInAllBranches", checked)}
                  size="sm"
                />
              </div>
            </div>
            <div className="p-6">
              {!availableInAllBranches ? (
                <div className="space-y-2">
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
                      <ComboboxEmpty>
                        {branches.length === 0 ? "No branches available.\nPlease add a branch first." : "No branches found."}
                      </ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item.id} value={item.id}>
                            {item.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <p className="text-[10px] text-muted-foreground">This item will only be visible in selected branches.</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Item is available across all branches.</span>
                </div>
              )}
            </div>
          </div>

            {/* Pricing Strategy Card */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/5">
                <h3 className="font-semibold text-lg">Pricing & Variants</h3>
                <p className="text-sm text-muted-foreground">Select how you want to price this item</p>
              </div>
              <div className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="pricingType"
                  render={({ field }) => (
                    <div className="flex p-1 bg-muted rounded-lg w-fit">
                      <button
                        type="button"
                        onClick={() => field.onChange("fixed")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                          field.value === "fixed" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Coins className="h-4 w-4" /> Fixed Price
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("variants")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                          field.value === "variants" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Package className="h-4 w-4" /> Multiple Variants
                      </button>
                    </div>
                  )}
                />

                {form.watch("pricingType") === "fixed" ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-xl bg-muted/30">
                    <FormField
                      control={form.control}
                      name="fixedPrice"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Price (MYR)</FormLabel>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">MYR</span>
                            <FormControl>
                              <Input type="number" placeholder="0.00" className="pl-12" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fixedUnitType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Unit Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="portion">Portion</SelectItem>
                              <SelectItem value="size">Size</SelectItem>
                              <SelectItem value="weight">Weight</SelectItem>
                              <SelectItem value="volume">Volume</SelectItem>
                              <SelectItem value="unit">Unit</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fixedUnitLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Unit Label</FormLabel>
                          <FormControl>
                            <Input placeholder="plate, bowl" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">Define your item variations</h4>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => append({ 
                          name: "", 
                          unitType: "portion", 
                          unitValue: "1", 
                          unitLabel: "",
                          price: "", 
                          isAvailable: true 
                        })}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Variant
                      </Button>
                    </div>
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-xl bg-muted/30 space-y-4 relative group">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Variant (e.g. Small)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Small / Large" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.unitType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="portion">Portion</SelectItem>
                                    <SelectItem value="size">Size</SelectItem>
                                    <SelectItem value="weight">Weight</SelectItem>
                                    <SelectItem value="volume">Volume</SelectItem>
                                    <SelectItem value="unit">Unit</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.unitValue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Val</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.unitLabel`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Unit</FormLabel>
                                <FormControl>
                                  <Input placeholder="g, plate" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Price (MYR)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-background border text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Categorization Card */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/5">
                <h3 className="font-semibold text-lg">Categorization</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <FormLabel>Categories</FormLabel>
                    <Combobox
                      multiple
                      items={categories}
                      value={selectedCategoryIds}
                      onValueChange={(vals) => form.setValue("categoryIds", vals)}
                    >
                      <ComboboxChips ref={categoryAnchor} className="w-full h-10 min-h-[40px]">
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
                        <ComboboxEmpty>
                          {categories.length === 0 ? "No categories available.\nPlease create one first." : "No categories found."}
                        </ComboboxEmpty>
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

                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Preparation Time (min)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 15" {...field} value={field.value || ""} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Product Image Card */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/5">
                <h3 className="font-semibold text-lg">Product Image</h3>
                <p className="text-xs text-muted-foreground">Standard 16:9 ratio</p>
              </div>
              <div className="p-6">
                <FormField
                  control={form.control}
                  name="photo"
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
              </div>
            </div>

            {/* Product Status Card */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/5">
                <h3 className="font-semibold text-lg">Product Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ToggleCard
                          icon={Power}
                          title="Active"
                          description="Visible in menu"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isVeg"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ToggleCard
                          icon={Leaf}
                          title="Vegetarian"
                          description="Egg & Meat free"
                          value={field.value}
                          onChange={field.onChange}
                          variant="success"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isSpicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ToggleCard
                          icon={Flame}
                          title="Spicy"
                          description="High heat level"
                          value={field.value}
                          onChange={field.onChange}
                          variant="destructive"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>


          </div>
        </div>

        {showFooter && (
          <div className="flex gap-4 pt-6 border-t font-semibold">
            <Button type="submit" className="flex-1 h-12 text-base" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : submitLabel}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

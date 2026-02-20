"use client"

import * as React from "react"
import { MenuItemsTable } from "@/components/menu/menu-items-table"
import { AddMenuItemModal } from "@/components/menu/add-menu-item-modal"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { LayoutDashboard } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUserContext } from "@/hooks/use-user-context"

import { MenuSkeleton } from "@/components/menu/menu-skeleton"

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  unitPrice: number | null
  unitType: string | null
  unitSize: number | null
  pricingModel: "FIXED" | "MEASURED"
  categories: { id: string; name: string }[]
  branchItems?: { branchId: string; isAvailable: boolean }[]
}

interface Category {
  id: string
  name: string
}

// Extended user shape returned from /users/profile (has extra fields beyond SidebarUser)
interface FullUser {
  id: string
  name: string
  email: string
  role: "OWNER" | "STAFF"
  avatar: string
  restaurant?: { id: string }
  staffBranch?: { branchId: string; branch?: { id: string; name: string; address: string } }
}

export function MenuClient() {
  const queryClient = useQueryClient()
  const { data: userContext, isLoading: isLoadingContext } = useUserContext()

  const user = userContext?.user as FullUser | undefined
  const branches = userContext?.branches || []

  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("")

  React.useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      const defaultId =
        user?.role === "STAFF"
          ? user?.staffBranch?.branchId || branches[0]?.id || ""
          : branches[0]?.id || ""
      setSelectedBranchId(defaultId)
    }
  }, [branches, user, selectedBranchId])

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get<Category[]>("/menu/categories")
      return res.data || []
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  })

  const menuQueryKey =
    user?.role === "OWNER" ? user?.restaurant?.id : user?.staffBranch?.branchId

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["menu-items", menuQueryKey],
    queryFn: async () => {
      const endpoint =
        user?.role === "OWNER"
          ? `/menu/restaurant/${user?.restaurant?.id}`
          : `/menu/branch/${user?.staffBranch?.branchId}`
      const res = await apiClient.get<MenuItem[]>(endpoint)
      return res.data || []
    },
    enabled: !!(user?.restaurant?.id || user?.staffBranch?.branchId),
    staleTime: 5 * 60 * 1000,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/menu/${user?.restaurant?.id}`, data),
    onSuccess: (res) => {
      if (res.error) toast.error(res.error)
      else {
        toast.success("Menu item created")
        queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: any }) =>
      apiClient.patch(`/menu/${itemId}`, data),
    onSuccess: (res) => {
      if (res.error) toast.error(res.error)
      else {
        toast.success("Menu item updated")
        queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => apiClient.delete(`/menu/${itemId}`),
    onSuccess: (res) => {
      if (res.error) toast.error(res.error)
      else {
        toast.success("Menu item deleted")
        queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      }
    },
  })

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      apiClient.patch(`/menu/${selectedBranchId}/${itemId}/availability`, { isAvailable }),
    onSuccess: (res, { isAvailable }) => {
      if (res.error) toast.error(res.error)
      else {
        toast.success(`Item marked as ${isAvailable ? "available" : "hidden"}`)
        queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      }
    },
  })

  const handleCreateMenuItem = async (data: any): Promise<void> => { await createMutation.mutateAsync(data) }
  const handleUpdateMenuItem = async (itemId: string, data: any): Promise<void> => { await updateMutation.mutateAsync({ itemId, data }) }
  const handleDeleteMenuItem = async (itemId: string): Promise<void> => { deleteMutation.mutate(itemId) }
  const handleToggleAvailability = (itemId: string, isAvailable: boolean) => {
    if (!selectedBranchId) return
    toggleAvailabilityMutation.mutate({ itemId, isAvailable })
  }

  if (isLoadingContext || (isLoadingItems && items.length === 0)) {
    return <MenuSkeleton />
  }

  const role = (user?.role ?? "STAFF") as "OWNER" | "STAFF"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-sm text-muted-foreground">
            {role === "OWNER"
              ? "Manage your entire restaurant menu."
              : "Manage item availability for your branch."}
          </p>
        </div>

        {role === "OWNER" && (
          <div className="flex items-center gap-2">
            <AddMenuItemModal
              categories={categories}
              branches={branches}
              onSubmit={handleCreateMenuItem}
            />
          </div>
        )}
      </div>

      <MenuItemsTable
        items={items}
        categories={categories}
        branches={branches}
        role={role}
        currentBranchId={selectedBranchId}
        onBranchChange={setSelectedBranchId}
        onToggleAvailability={handleToggleAvailability}
        onUpdateItem={handleUpdateMenuItem}
        onDeleteItem={handleDeleteMenuItem}
      />

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
          <LayoutDashboard className="h-4 w-4" />
          Quick Tip
        </h4>
        <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
          {role === "OWNER"
            ? "Changes made to menu items reflect across all branches. Availability can be managed per branch."
            : "Toggling an item off will hide it from the customer app immediately for this branch."}
        </p>
      </div>
    </div>
  )
}

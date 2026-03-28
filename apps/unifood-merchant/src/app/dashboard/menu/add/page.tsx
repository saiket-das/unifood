"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { MenuForm } from "@/components/menu/menu-form"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/lib/routes"
import { useUserContext } from "@/hooks/use-user-context"
import { MenuSkeleton } from "@/components/menu/menu-skeleton"

export default function AddMenuItemPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // We need categories and branches for the form
  // These are probably available from global state or we can fetch them
  // Assuming they are available via queries
  
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<{ id: string; name: string }[]>("/menu/categories"),
  })

  const { data: userContext, isLoading: isLoadingUser } = useUserContext()

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/menu/${userContext?.user?.restaurant?.id}`, data),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Menu item created successfully")
        queryClient.invalidateQueries({ queryKey: ["menu-items"] })
        router.push(APP_ROUTES.MENU)
      }
    },
  })

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  if (isLoadingUser || !userContext) {
    return <MenuSkeleton />
  }

  const categories = categoriesRes?.data || []
  const branches = userContext.branches || []
  const restaurantId = userContext.user?.restaurant?.id

  return (
    <div className="space-y-6 py-0 px-2">
      {/* Sticky Header with Actions */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-6 px-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(APP_ROUTES.MENU)} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Item</h1>
            <p className="text-sm text-muted-foreground">Fill in the details to create a new menu product</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push(APP_ROUTES.MENU)} disabled={createMutation.isPending}>
            Discard
          </Button>
          <Button 
            onClick={() => {
              // Trigger form submit via document id for simplicity or using a ref if needed
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }} 
            disabled={createMutation.isPending}
            className="bg-primary hover:bg-primary/90 px-6 font-semibold"
          >
            {createMutation.isPending ? "Sharing..." : "Save Product"}
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        <MenuForm
          categories={categories}
          branches={branches}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          submitLabel="Save Product"
          showFooter={false} // We handle buttons in the header
        />
      </div>
    </div>
  )
}

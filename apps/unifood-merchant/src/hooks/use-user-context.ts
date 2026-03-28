"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { SidebarBranch } from "@/components/sidebar/app-sidebar"

// Full profile shape including STAFF and OWNER-specific fields
export interface UserProfile {
  id: string
  name: string
  email: string
  role: "OWNER" | "STAFF" | "STUDENT"
  avatar: string
  isActive: boolean
  needsPasswordChange: boolean
  // OWNER fields
  restaurant?: { id: string; name: string }
  // STAFF fields
  staffBranch?: {
    branchId: string
    branch: {
      id: string
      name: string
      address: string
    }
  }
}

interface UserContext {
  user: UserProfile
  branches: SidebarBranch[]
}

async function fetchUserContext(): Promise<UserContext> {
  const profileRes = await apiClient.get<UserProfile>("/users/profile")
  if (profileRes.error || !profileRes.data) {
    throw new Error(profileRes.error || "Failed to fetch profile")
  }

  const user = profileRes.data
  let branches: SidebarBranch[] = []

  if (user.role === "OWNER") {
    const restaurantRes = await apiClient.get<{ branches: SidebarBranch[] }>("/restaurants/my")
    if (!restaurantRes.error && restaurantRes.data) {
      branches = restaurantRes.data.branches
    }
  } else if (user.role === "STAFF") {
    // staffBranch.branch is included by the backend (staffBranch: { include: { branch: true } })
    if (user.staffBranch?.branch) {
      const { id, name, address } = user.staffBranch.branch
      branches = [{ id, name, address }]
    }
  }

  return { user, branches }
}

export function useUserContext() {
  return useQuery<UserContext>({
    // Scoped to "user-context" — cleared on logout via queryClient.clear()
    queryKey: ["user-context"],
    queryFn: fetchUserContext,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

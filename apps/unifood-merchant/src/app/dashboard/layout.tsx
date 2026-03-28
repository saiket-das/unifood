import { SiteHeader } from "@/components/sidebar/site-header"
import { AppSidebar, SidebarUser, SidebarBranch } from "@/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { APP_ROUTES } from "@/lib/routes"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch User Profile
  const profileRes = await apiClient.get<SidebarUser>("/users/profile")
  
  if (profileRes.error || !profileRes.data) {
    // Handle error - could redirect to login or show error
    console.error("Failed to fetch profile:", profileRes.error)
    return <div>Failed to load dashboard. Please try logging in again.</div>
  }

  const user = profileRes.data

  if (user.role === "STUDENT") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-muted-foreground">This account does not have merchant access.</p>
        <Link href={APP_ROUTES.LOGIN} className="mt-4 text-primary hover:underline">Back to Login</Link>
      </div>
    )
  }

  let branches: SidebarBranch[] = []

  // If owner, fetch restaurant/branches
  if (user.role === "OWNER") {
    const restaurantRes = await apiClient.get<{ branches: SidebarBranch[] }>("/restaurants/my")
    if (!restaurantRes.error && restaurantRes.data) {
      branches = restaurantRes.data.branches
    }
  } else if (user.role === "STAFF" && user.staffBranch?.branch) {
    branches = [user.staffBranch.branch]
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} branches={branches} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

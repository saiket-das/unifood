"use client"

import * as React from "react"
import {
  Settings,
  HelpCircle,
  Search,
  Bell,
  Command,
} from "lucide-react"

import Image from "next/image"
import { OWNER_ROUTES, STAFF_ROUTES, SECONDARY_ROUTES } from "@/lib/routes"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { BranchSwitcher } from "./branch-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// This would typically come from an auth hook/context
const sampleData = {
  user: {
    name: "John Owner",
    email: "owner@unifood.com",
    avatar: "/avatars/john.jpg",
    role: "owner" as "owner" | "staff",
  },
  branches: [
    {
      name: "Unifood Main",
      // logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Unifood North",
      // logo: Command,
      plan: "Startup",
    },
    {
      name: "Unifood South",
      // logo: Command,
      plan: "Free",
    },
  ],
  navSecondary: [
    {
      title: "Notifications",
      url: SECONDARY_ROUTES.NOTIFICATIONS,
      icon: Bell,
    },
    {
      title: "Settings",
      url: SECONDARY_ROUTES.SETTINGS,
      icon: Settings,
    },
    {
      title: "Get Help",
      url: SECONDARY_ROUTES.HELP,
      icon: HelpCircle,
    },
    {
      title: "Search",
      url: SECONDARY_ROUTES.SEARCH,
      icon: Search,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Mock role-based logic. In a real app, this would be reactive.
  const user = sampleData.user
  
  const navMainItems = React.useMemo(() => {
    return user.role === "owner" ? OWNER_ROUTES : STAFF_ROUTES
  }, [user.role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {user.role === "owner" ? (
          <BranchSwitcher branches={sampleData.branches} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Image src="/icon.svg" alt="Unifood" width={32} height={32} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Unifood</span>
                    <span className="truncate text-xs">Merchant</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={sampleData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

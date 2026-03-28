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
import Link from "next/link"
import { OWNER_ROUTES, STAFF_ROUTES, SECONDARY_ROUTES, APP_ROUTES } from "@/lib/routes"
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

export interface SidebarBranch {
  id: string;
  name: string;
  address: string;
}

export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
  role: "OWNER" | "STAFF" | "STUDENT";
  staffBranch?: {
    branch: SidebarBranch;
  };
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SidebarUser;
  branches?: SidebarBranch[];
}

const secondaryRoutes = [
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
];

export function AppSidebar({ user, branches = [], ...props }: AppSidebarProps) {
  const navMainItems = React.useMemo(() => {
    return user.role === "OWNER" ? OWNER_ROUTES : STAFF_ROUTES
  }, [user.role])

  const formattedBranches = React.useMemo(() => {
    return branches.map(b => ({
      name: b.name,
      plan: b.address
    }))
  }, [branches])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {formattedBranches.length > 0 ? (
          <BranchSwitcher branches={formattedBranches} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link href={APP_ROUTES.DASHBOARD}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Image src="/icon.svg" alt="Unifood" width={32} height={32} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Unifood</span>
                    <span className="truncate text-xs">Merchant</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={secondaryRoutes} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

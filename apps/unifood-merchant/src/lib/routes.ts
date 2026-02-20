import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingBag, 
  UtensilsCrossed, 
  Users 
} from "lucide-react"

export type RouteItem = {
  title: string
  url: string
  icon: any
  isActive?: boolean
}

export const OWNER_ROUTES: RouteItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Menu",
    url: "/dashboard/menu",
    icon: Utensils,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Manual Orders",
    url: "/dashboard/manual-orders",
    icon: UtensilsCrossed,
  },
  {
    title: "Staff",
    url: "/dashboard/staff",
    icon: Users,
  },
]

export const STAFF_ROUTES: RouteItem[] = [
  {
    title: "Menu",
    url: "/dashboard/menu",
    icon: Utensils,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Manual Orders",
    url: "/dashboard/manual-orders",
    icon: UtensilsCrossed,
  },
]

export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  SIGNUP: "/signup",
  SETUP_PASSWORD: "/login/setup-password",
}

export const SECONDARY_ROUTES = {
  NOTIFICATIONS: "/dashboard/notifications",
  SETTINGS: "/dashboard/settings",
  HELP: "/dashboard/help",
  SEARCH: "/dashboard/search",
}

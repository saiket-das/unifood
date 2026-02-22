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

export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  SIGNUP: "/signup",
  SETUP_PASSWORD: "/login/setup-password",
  MENU: "/dashboard/menu",
  MENU_ADD: "/dashboard/menu/add",
  ORDERS: "/dashboard/orders",
  MANUAL_ORDERS: "/dashboard/manual-orders",
  STAFF: "/dashboard/staff",
}

export const OWNER_ROUTES: RouteItem[] = [
  {
    title: "Dashboard",
    url: APP_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Menu",
    url: APP_ROUTES.MENU,
    icon: Utensils,
  },
  {
    title: "Orders",
    url: APP_ROUTES.ORDERS,
    icon: ShoppingBag,
  },
  {
    title: "Manual Orders",
    url: APP_ROUTES.MANUAL_ORDERS,
    icon: UtensilsCrossed,
  },
  {
    title: "Staff",
    url: APP_ROUTES.STAFF,
    icon: Users,
  },
]

export const STAFF_ROUTES: RouteItem[] = [
  {
    title: "Menu",
    url: APP_ROUTES.MENU,
    icon: Utensils,
  },
  {
    title: "Orders",
    url: APP_ROUTES.ORDERS,
    icon: ShoppingBag,
  },
  {
    title: "Manual Orders",
    url: APP_ROUTES.MANUAL_ORDERS,
    icon: UtensilsCrossed,
  },
]

export const SECONDARY_ROUTES = {
  NOTIFICATIONS: "/dashboard/notifications",
  SETTINGS: "/dashboard/settings",
  HELP: "/dashboard/help",
  SEARCH: "/dashboard/search",
}

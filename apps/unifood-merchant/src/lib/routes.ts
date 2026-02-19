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
  items?: { title: string; url: string }[]
}

export const OWNER_ROUTES: RouteItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Menu",
    url: "/menu",
    icon: Utensils,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Manual Orders",
    url: "/manual-orders",
    icon: UtensilsCrossed,
  },
  {
    title: "Staff",
    url: "/staff",
    icon: Users,
  },
]

export const STAFF_ROUTES: RouteItem[] = [
  {
    title: "Menu",
    url: "/menu",
    icon: Utensils,
    items: [
      { title: "Availability", url: "/menu/availability" }
    ]
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Manual Orders",
    url: "/manual-orders",
    icon: UtensilsCrossed,
  },
]

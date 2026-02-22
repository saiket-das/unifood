import { redirect } from "next/navigation"
import { APP_ROUTES } from "@/lib/routes"

export default function AvailabilityPage() {
  redirect(APP_ROUTES.MENU)
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck } from "lucide-react"

interface StaffStatsProps {
  totalStaff: number
  activeStaff: number
}

export function StaffStats({ totalStaff, activeStaff }: StaffStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStaff}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total registered staff members
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{activeStaff}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently active and able to log in
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

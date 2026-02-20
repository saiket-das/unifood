import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Power, PowerOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface StaffMember {
  id: string
  name: string
  email: string
  isActive: boolean
  needsPasswordChange: boolean
}

interface StaffTableProps {
  staff: StaffMember[]
  onToggleStatus: (staffId: string) => void
  onDeleteStaff: (staffId: string) => void
  isPending: boolean
}

export function StaffTable({ staff, onToggleStatus, onDeleteStaff, isPending }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
        <p>No staff members found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                {member.isActive ? (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                    Inactive
                  </Badge>
                )}
                {member.needsPasswordChange && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                    Pending Setup
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onToggleStatus(member.id)}
                      className="cursor-pointer"
                    >
                      {member.isActive ? (
                        <>
                          <PowerOff className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteStaff(member.id)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove from Branch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

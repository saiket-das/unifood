"use client"

import * as React from "react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { StaffStats } from "@/components/staff/staff-stats"
import { StaffTable, StaffMember } from "@/components/staff/staff-table"
import { InviteStaffModal } from "@/components/staff/invite-staff-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUserContext } from "@/hooks/use-user-context"
import { StaffSkeleton } from "@/components/staff/staff-skeleton"

export function StaffClient() {
  const queryClient = useQueryClient()
  const { data: userContext, isLoading: isLoadingContext } = useUserContext()

  const branches = userContext?.branches || []

  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("")

  React.useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0]?.id || "")
    }
  }, [branches, selectedBranchId])

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff", selectedBranchId],
    queryFn: async () => {
      const res = await apiClient.get<any[]>(`/branches/${selectedBranchId}/staff`)
      if (res.error) throw new Error(res.error)
      return res.data?.map(item => ({
        id: item.staff.id,
        name: item.staff.name,
        email: item.staff.email,
        isActive: item.staff.isActive,
        needsPasswordChange: item.staff.needsPasswordChange,
      })) as StaffMember[] || []
    },
    enabled: !!selectedBranchId,
    staleTime: 5 * 60 * 1000,
  })

  const inviteMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.post(`/branches/${selectedBranchId}/staff/invite`, { ...data, role: "STAFF" }),
    onSuccess: (res) => {
      if (res.error) {
        toast.error("Failed to invite staff", { description: res.error })
        throw new Error(res.error)
      }
      toast.success("Staff invited successfully")
      queryClient.invalidateQueries({ queryKey: ["staff", selectedBranchId] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (staffId: string) =>
      apiClient.patch(`/branches/${selectedBranchId}/staff/${staffId}/status`, {}),
    onSuccess: (res) => {
      if (res.error) {
        toast.error("Failed to update status", { description: res.error })
      } else {
        toast.success("Staff status updated")
        queryClient.invalidateQueries({ queryKey: ["staff", selectedBranchId] })
      }
    },
  })

  const removeMutation = useMutation({
    mutationFn: (staffId: string) =>
      apiClient.post(`/branches/${selectedBranchId}/staff/${staffId}/remove`, {}),
    onSuccess: (res) => {
      if (res.error) {
        toast.error("Failed to remove staff", { description: res.error })
      } else {
        toast.success("Staff removed from branch")
        queryClient.invalidateQueries({ queryKey: ["staff", selectedBranchId] })
      }
    },
  })

  const handleInvite = async (data: any) => {
    await inviteMutation.mutateAsync(data)
  }

  const handleToggleStatus = (staffId: string) => {
    toggleMutation.mutate(staffId)
  }

  const handleDeleteStaff = (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff member from the branch?")) return
    removeMutation.mutate(staffId)
  }

  if (isLoadingContext || (isLoading && staff.length === 0)) {
    return <StaffSkeleton />
  }

  const isActionPending = inviteMutation.isPending || toggleMutation.isPending || removeMutation.isPending
  const activeStaffCount = staff.filter((s: StaffMember) => s.isActive).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Invite, manage, and assign roles to your restaurant staff.</p>
        </div>
        <div className="flex items-center gap-2">
          {branches.length > 1 && (
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <InviteStaffModal onInvite={handleInvite} isPending={isActionPending} />
        </div>
      </div>

      <StaffStats totalStaff={staff.length} activeStaff={activeStaffCount} />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Staff Directory</h2>
        <StaffTable
          staff={staff}
          onToggleStatus={handleToggleStatus}
          onDeleteStaff={handleDeleteStaff}
          isPending={isActionPending || isLoading}
        />
      </div>
    </div>
  )
}

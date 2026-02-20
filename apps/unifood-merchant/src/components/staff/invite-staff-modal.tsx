import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  temporaryPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type InviteFormValues = z.infer<typeof inviteSchema>

interface InviteStaffModalProps {
  onInvite: (data: InviteFormValues) => Promise<void>
  isPending: boolean
}

export function InviteStaffModal({ onInvite, isPending }: InviteStaffModalProps) {
  const [open, setOpen] = React.useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      name: "",
      temporaryPassword: "",
    },
  })

  const onSubmit = async (data: InviteFormValues) => {
    try {
      await onInvite(data)
      setOpen(false)
      reset()
    } catch (error) {
      // Error handled by parent
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#006292] hover:bg-[#004e75] text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Invite New Staff</DialogTitle>
            <DialogDescription>
              Invite a new staff member to this branch. They will receive an email with their temporary password.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="temporaryPassword">Temporary Password</FieldLabel>
              <Input
                id="temporaryPassword"
                type="password"
                placeholder="••••••••"
                {...register("temporaryPassword")}
                aria-invalid={!!errors.temporaryPassword}
              />
              {errors.temporaryPassword && (
                <p className="text-xs font-medium text-destructive mt-1">
                  {errors.temporaryPassword.message}
                </p>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#006292] hover:bg-[#004e75] text-white" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inviting...
                </>
              ) : (
                "Invite Staff"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

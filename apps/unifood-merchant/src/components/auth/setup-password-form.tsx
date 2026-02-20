"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePassword } from "@/app/actions/auth"
import { APP_ROUTES } from "@/lib/routes"

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SetupPasswordValues = z.infer<typeof passwordSchema>

export function SetupPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupPasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (data: SetupPasswordValues) => {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("password", data.password)

      const result = await changePassword(null, formData)

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.success) {
        // Password changed successfully, rediect to dashboard
        router.push(APP_ROUTES.DASHBOARD)
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-2xl border-white/10 pt-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#006292] to-transparent opacity-50" />
        <CardHeader className="text-center flex flex-col items-center gap-4 pb-2">
          <div className="bg-white p-3 rounded-lg shadow-lg border border-blue-50 relative group">
            <div className="absolute inset-0 bg-blue-50/50 rounded-lg scale-0 group-hover:scale-110 transition-transform duration-500 -z-10" />
            <Image
              src="/logo-navy.svg"
              alt="Unifood Logo"
              width={40}
              height={40}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#001b29] font-heading">
            Setup Password
          </CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500 max-w-xs text-center">
            You are using a temporary password. Please set a new password to continue to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-3">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              
              <Field className="gap-1.5">
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </Field>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <Field className="gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#006292] hover:bg-[#004e75] text-white transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Continue to Dashboard"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

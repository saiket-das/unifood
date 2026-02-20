"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
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
import { loginUser } from "@/app/actions/auth"
import { APP_ROUTES } from "@/lib/routes"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [authError, setAuthError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    setAuthError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      const result = await loginUser(null, formData)

      console.log(result);
      if (result.error) {
        setAuthError(result.error)
        return
      }

      if (result.needsPasswordChange) {
        router.push(`${APP_ROUTES.SETUP_PASSWORD}?email=${encodeURIComponent(data.email)}`)
      } else if (result.success) {
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
          <CardTitle className="text-3xl font-bold tracking-tight text-[#001b29] font-heading">
            unifood
          </CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500">
            Welcome back! Please login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-3">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field className="gap-1.5">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm font-medium text-[#006292] hover:underline underline-offset-4"
                  >
                    Forgot your password?
                  </a>
                </div>
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

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-medium">
                  {authError}
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
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <div className="text-center text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link href={APP_ROUTES.SIGNUP} className="font-semibold text-[#006292] hover:underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      const result = await loginUser(null, formData)

      if (result.error) {
        toast.error("Authentication failed", {
          description: result.error,
        })
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
      <Card className="overflow-hidden p-0 border-white/10 shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-[#006292] relative hidden md:flex items-center justify-center p-12">
            <div className="relative z-10">
              <Image
                src="/icon.svg"
                alt="Unifood Logo"
                width={120}
                height={120}
                className="drop-shadow-sm"
              />
            </div>
          </div>

          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[#001b29]">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-balance text-sm font-medium">
                  Login to your Unifood account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="#"
                    className="ml-auto text-sm font-medium text-[#006292] hover:underline underline-offset-4"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>


              <Field className="pt-2">
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
              </Field>
              
              <div className="text-center text-sm text-slate-500 mt-4">
                Don&apos;t have an account?{" "}
                <Link href={APP_ROUTES.SIGNUP} className="font-semibold text-[#006292] hover:underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="px-6 text-center text-xs text-slate-500">
        By clicking login, you agree to our{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-[#006292]">Terms of Service</Link>{" "}
        and{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-[#006292]">Privacy Policy</Link>.
      </div>
    </div>
  )
}

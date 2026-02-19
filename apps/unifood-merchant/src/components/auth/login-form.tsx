import Image from "next/image"
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
          <form>
            <FieldGroup className="gap-3">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
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
                <Input id="password" type="password" required />
              </Field>
              <Field className="gap-2 pt-2">
                <Button type="submit" className="w-full bg-[#006292] hover:bg-[#004e75] text-white transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]">
                  Login
                </Button>
                <div className="text-center text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="font-semibold text-[#006292] hover:underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

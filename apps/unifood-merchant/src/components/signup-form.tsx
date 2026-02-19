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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-heading">Create an account</CardTitle>
          <CardDescription>
            Get started with your merchant account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup className="gap-3">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </Field>
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" required />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input id="confirm-password" type="password" required />
              </Field>
              <Field className="gap-2">
                <Button type="submit" className="w-full">Sign Up</Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a href="/login" className="underline underline-offset-4">
                    Login
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

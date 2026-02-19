import { SignupForm } from "@/components/auth/signup-form";
import { AuthWrapper } from "@/components/auth/auth-wrapper";

export default function SignupPage() {
  return (
    <AuthWrapper>
      <SignupForm />
    </AuthWrapper>
  );
}

import { LoginForm } from "@/components/auth/login-form";
import { AuthWrapper } from "@/components/auth/auth-wrapper";

export default function LoginPage() {
  return (
    <AuthWrapper>
      <LoginForm />
    </AuthWrapper>
  );
}

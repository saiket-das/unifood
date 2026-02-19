import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden" style={{ backgroundColor: 'oklch(0.88 0.025 240)' }}>
      {/* Blurry logo background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/logo.svg"
          alt=""
          width={700}
          height={560}
          className="scale-150"
          aria-hidden="true"
          style={{ filter: 'brightness(0) invert(0.3) sepia(1) saturate(4) hue-rotate(175deg) blur(10px) opacity(0.35)' }}
        />
      </div>

      <div className="relative flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <Image
            src="/favicon.svg"
            alt="Unifood Logo"
            width={40}
            height={40}
          />
          Unifood Merchant
        </a>
        <LoginForm />
      </div>
    </div>
  );
}

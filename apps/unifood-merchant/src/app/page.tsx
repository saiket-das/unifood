import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { APP_ROUTES } from "@/lib/routes"
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#001b29] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Premium CSS Silk Background Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(circle at 10% 10%, rgba(0, 98, 146, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(0, 127, 177, 0.1) 0%, transparent 40%),
              linear-gradient(135deg, #003551 0%, #001b29 100%)
            `
          }}
        />
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-soft-light" />
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%]" />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center gap-8 max-w-2xl px-6">
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-blue-50/20 mb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Image
            src="/logo-navy.svg"
            alt="Unifood Logo"
            width={60}
            height={60}
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2 font-heading animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          unifood
        </h1>
        
        <p className="text-xl md:text-2xl text-blue-100/80 mb-8 max-w-lg font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          The ultimate platform for managing your restaurant staff, orders, and operations.
        </p>

        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href={APP_ROUTES.LOGIN}>Login</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-lg backdrop-blur-sm transition-all duration-300 bg-transparent">
            <Link href={APP_ROUTES.DASHBOARD}>Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

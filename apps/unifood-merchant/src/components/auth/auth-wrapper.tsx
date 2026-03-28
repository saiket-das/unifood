"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="relative min-h-svh w-full overflow-hidden flex items-center justify-center p-6 md:p-10 bg-[#001b29]">
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
        {/* Animated Silk-like Waves (Subtle) */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-soft-light" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%]" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ x: 20, opacity: 0, filter: "blur(10px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: -20, opacity: 0, filter: "blur(10px)" }}
            transition={{ 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

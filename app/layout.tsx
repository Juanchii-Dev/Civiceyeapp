import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { GamificationProvider } from "@/contexts/GamificationContext"
import { AnalyticsProvider } from "@/contexts/AnalyticsContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { GeolocationProvider } from "@/contexts/GeolocationContext"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <AuthProvider>
            <GamificationProvider>
              <AnalyticsProvider>
                <NotificationProvider>
                  <GeolocationProvider>
                    {children}
                    <Toaster />
                  </GeolocationProvider>
                </NotificationProvider>
              </AnalyticsProvider>
            </GamificationProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };

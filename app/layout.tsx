import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { env } from "@/lib/utils/env";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: env.appName,
    template: `%s · ${env.appName}`,
  },
  description: `${env.appName} — real estate operations platform for ${env.companyName}.`,
  applicationName: env.appName,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#17874c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

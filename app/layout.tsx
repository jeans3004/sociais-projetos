import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export const metadata: Metadata = {
  title: {
    default: "Sistema de Doações - Christ Master",
    template: "%s | Doações CM"
  },
  description: "Sistema para gerenciamento e contabilização de doações escolares do Centro de Educação Integral Christ Master",
  keywords: ["doações", "escola", "christ master", "gestão escolar", "sistema"],
  authors: [{ name: "Christ Master" }],
  creator: "Christ Master",
  publisher: "Christ Master",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Doações CM',
  },
  applicationName: 'Sistema de Doações CM',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

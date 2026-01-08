import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/shell"; // <--- Import the new shell
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PI Ocean - Buying House ERP",
  description: "Managed by PI Ocean Tex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader 
            color="#2563eb"
            showSpinner={false} 
            height={3}
        />
        {/* The Shell handles showing/hiding the sidebar based on the URL */}
        <Shell>
            {children}
        </Shell>
        <Toaster />
      </body>
    </html>
  );
}
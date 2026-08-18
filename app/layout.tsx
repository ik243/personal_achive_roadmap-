import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppDataProvider } from "@/providers/app-data-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roadmap — Personal Learning Progress",
  description: "Personal interactive roadmap and progress tracking for learning goals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AppDataProvider>
              <TooltipProvider>
                {children}
                <Toaster closeButton position="bottom-right" />
              </TooltipProvider>
            </AppDataProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

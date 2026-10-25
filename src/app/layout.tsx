import type { Metadata } from "next";
import { JetBrains_Mono, Rubik } from "next/font/google";
import { Suspense } from "react";
import { InteractionSounds } from "~/components/ui/interaction-sounds";
import { themeInitScript } from "~/lib/theme";
import { PageTransitionProvider } from "~/providers/page-transition-provider";
import { ThemeProvider } from "~/providers/theme-provider";
import { ToastProvider } from "~/providers/toast-provider";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevSpace",
  description: "Find your direction. Build real capability.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink dark:bg-night dark:text-night-ink">
        <InteractionSounds />
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={children}>
              <PageTransitionProvider>{children}</PageTransitionProvider>
            </Suspense>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Nav } from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AppSpecificProviders } from "./AppSpecificProviders";
import { geistSans, optima } from "@/components/fonts/fonts";
import { twMerge } from "tailwind-merge";
import "./globals.css";

export const revalidate = 300;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Sitemap required, manifest added automatically, robots.txt assumed */}
        <link rel="alternate" type="application/xml" href="/sitemap.xml" />
        {/* Light theme favicon */}
        <link
          rel="icon"
          href="https://cdn.inevitable.science/static/img/branding/favicon-light.ico"
          media="(prefers-color-scheme: light)"
        />
        {/* Dark theme favicon */}
        <link
          rel="icon"
          href="https://cdn.inevitable.science/static/img/branding/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body
        className={twMerge(
          geistSans.variable,
          optima.variable,
          "min-h-screen font-sans tracking-[0.015em]"
        )}
      >
        <AppSpecificProviders>
          <Nav />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AppSpecificProviders>

        <Toaster />
      </body>
    </html>
  );
}

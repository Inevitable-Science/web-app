import { Nav } from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { geistSans, optima } from "@/components/fonts/fonts";
import { twMerge } from "tailwind-merge";
import "./globals.css";

/*import { headers } from "next/headers";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  return {
    title: "Inevitable Protocol | Home",
    description: "Begin your journey. Build the future of life—together.",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Inevitable Protocol | Home",
      description: "Begin your journey. Build the future of life—together.",
      siteName: "Inevitable Protocol",
      images: [
        {
          url: imgUrl,
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url: url,
      type: "website",
    },
    twitter: {
      title: "Inevitable Protocol | Home",
      description: "Begin your journey. Build the future of life—together.",
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: "/manifest/manifest.json",
  };
}*/

export const revalidate = 300;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*<link rel="apple-touch-icon" href="/assets/img/small-bw.svg" />*/}
        {/* Light theme favicon */}
        <link
          rel="icon"
          href="/assets/img/branding/favicon-light.ico"
          media="(prefers-color-scheme: light)"
        />
        {/* Dark theme favicon */}
        <link
          rel="icon"
          href="/assets/img/branding/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body
        className={twMerge(
          geistSans.variable,
          optima.variable,
          "font-sans min-h-screen tracking-[0.015em]"
        )}
      >
          <Providers>
            <Nav />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </Providers>

        <Toaster />
      </body>
    </html>
  );
}
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { twMerge } from "tailwind-merge";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { geistSans, optima } from "@/components/fonts/fonts";


/*import localFont from "next/font/local";

const simplonNorm = localFont({
  src: [
    { path: "../../public/fonts/SimplonNorm-Light.otf", weight: "400" },
    { path: "../../public/fonts/SimplonNorm-Regular.otf", weight: "500" },
    { path: "../../public/fonts/SimplonNorm-Bold.otf", weight: "700" },
  ],
  variable: "--font-simplon-norm",
});
const simplonMono = localFont({
  src: [
    { path: "../../public/fonts/SimplonMono-Light.otf", weight: "400" },
    { path: "../../public/fonts/SimplonMono-Regular.otf", weight: "500" },
    { path: "../../public/fonts/SimplonMono-Bold.otf", weight: "700" },
  ],
  variable: "--font-simplon-mono",
});*/

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
    keywords: "Inevitable, Inevitable Protocol", 
  };
}

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
          //simplonNorm.variable,
          //simplonMono.variable,
          geistSans.variable,
          optima.variable,
          "font-sans min-h-screen tracking-[0.015em]"
        )}
      >
          <Providers>
          <main className="min-h-screen">{children}</main>
          <Footer />
          </Providers>

        <Toaster />
      </body>
    </html>
  );
}
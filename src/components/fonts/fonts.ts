import localFont from "next/font/local";

export const geistSans = localFont({
  src: [
    {
      path: "./static/Geist-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./static/Geist-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./static/Geist-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./static/Geist-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./static/Geist-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./static/Geist-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./static/Geist-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./static/Geist-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./static/Geist-Thin.ttf",
      weight: "100",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans", // Matches Tailwind config
  display: "swap",
});


export const optima = localFont({
  src: [
    {
      path: "./optima/optima.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./optima/optima_medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./optima/optima_b.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./optima/optima_italic.woff",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-optima",
  display: "swap",
});
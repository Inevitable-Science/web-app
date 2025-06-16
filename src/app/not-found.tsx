import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Page Not Found | Inevitable Protocol",
});

export default function NotFound() {
  return (
    <div className="text-white text-center h-screen flex items-center justify-center flex-col">
      <div className="flex gap-2 items-center">
        <h1 className="text-5xl font-semibold">404</h1>
        <div className="border-l border-color h-16 w-1" />
        <p>Page Not Found</p>
      </div>

      <style>{`
      footer{
        display: none !important;
      }
      `}</style>
    </div>
  );
}

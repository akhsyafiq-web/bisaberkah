import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

/* next/font/local handles preloading + FOUT prevention. */
/* The CSS @font-face in globals.css ensures the font loads as a fallback. */
const plusJakarta = localFont({
  src: [
    {
      path: "../fonts/PlusJakartaSans-VariableFont_wght.ttf",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "../fonts/PlusJakartaSans-Italic-VariableFont_wght.ttf",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
  fallback: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  title: "BisaBerkah — Catat, Rencanakan, Berkah",
  description: "Aplikasi pencatatan keuangan keluarga yang berkah",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BisaBerkah",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07835A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

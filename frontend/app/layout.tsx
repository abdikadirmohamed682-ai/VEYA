import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VEYA | Create Your Store & Sell Online",
  description:
    "VEYA is a modern marketplace where you can create your own digital or physical store, showcase your products, and sell online with ease.",
  keywords: [
    "VEYA",
    "online marketplace",
    "online store",
    "digital products",
    "physical products",
    "digital store",
    "physical store",
    "sell online",
    "create online store",
  ],
  openGraph: {
    title: "VEYA | Create Your Store & Sell Online",
    description:
      "Create your own digital or physical store with VEYA, showcase your products, and sell online with ease.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Tinos, Geist_Mono } from "next/font/google";
import "./globals.css";

const tinos = Tinos({
  variable: "--font-tinos",
  weight: ["400", "700"],
  subsets: ["vietnamese", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CVGen - AI-Powered CV Generator",
  description: "Tạo CV và Cover Letter tự động bằng Trí tuệ nhân tạo (Gemini AI).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${tinos.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

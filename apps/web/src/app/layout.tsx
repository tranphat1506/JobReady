import type { Metadata } from "next";
import { Lora, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@flaticon/flaticon-uicons/css/all/all.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["vietnamese", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerGo - AI-Powered CV & Cover Letter Generator",
  description: "Tạo CV và Cover Letter chuyên nghiệp bằng AI. Tối ưu cho ATS, phù hợp với từng Job Description.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${lora.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

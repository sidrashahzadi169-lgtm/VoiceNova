import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceNova - AI Voice Studio Platform",
  description: "AI-powered voice synthesis & script studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

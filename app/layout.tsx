import type { Metadata } from "next";

import { AppProviders } from "@/components/chat/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic Multimodal Assistant",
  description: "Multimodal agent with Groq control plane and Gemini reasoning plane",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-dvh overflow-hidden flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slide — Instagram Automation",
  description:
    "Automate your Instagram DMs and comments with AI-powered responses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="noise">{children}</body>
      </html>
    </ClerkProvider>
  );
}

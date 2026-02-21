import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Roundtable",
  description: "Multi-LLM deliberation platform — connect multiple AI models for consensus-driven answers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

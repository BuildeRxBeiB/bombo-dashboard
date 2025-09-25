import type { Metadata } from "next";
import "./globals.css";
import "./responsive-fix.css";
import "../styles/chart-overrides.css";
import "../styles/theme-consistency.css";

export const metadata: Metadata = {
  title: "BOMBO - Key Metrics Dashboard",
  description: "NFT Ticketing Platform Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
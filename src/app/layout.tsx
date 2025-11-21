import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "UI/UX Testing Tool",
  description: "Web-based UI/UX testing tool with admin panel verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative z-0 overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Providers>
          <Navbar />
          <main className="min-h-screen relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}


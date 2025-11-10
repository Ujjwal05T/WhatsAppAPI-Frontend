import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// NOTE: Removed use of `next/font/google` (Geist) because Turbopack
// during build resolves an internal module that isn't available in
// some environments: '@vercel/turbopack-next/internal/font/google/font'.
// Using a regular <link> to load a web font avoids the turbopack-internal
// import and fixes the build error. If you prefer to self-host or
// re-enable next/font later, revert this change.

export const metadata: Metadata = {
  title: "WhatsApp API Dashboard",
  description: "Manage your WhatsApp accounts and send messages programmatically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load Inter from Google Fonts as a safe external stylesheet. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        />
      </head>
      <body
        className={`antialiased`}
        style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

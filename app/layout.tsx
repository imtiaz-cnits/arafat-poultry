import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arafat Poultry & Fisheries | Quality Products. Trusted Service.",
  description: "Arafat Poultry & Fisheries Management System & POS, Powered by CodeNext IT",
  icons: {
    icon: [
      { url: "/fav-icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/fav-icon.png", type: "image/png" },
    ],
    shortcut: ["/fav-icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/fav-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/fav-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&family=Valley+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('theme');
                if (stored === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('light-mode', 'dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.removeAttribute('light-mode');
                  document.documentElement.removeAttribute('data-theme');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <Providers>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
      </body>

    </html>
  );
}

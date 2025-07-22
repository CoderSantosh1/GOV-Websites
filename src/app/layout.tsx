import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

const inter = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarkariresultsnow.com",
  description: "SarkariResultsNow provides all Sarkari Result, Admit Card, Government Jobs, Free Test Series Also Available",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="KpO7IT-JrAfXS5vKDai0XcwaVUS-JzRDwsl1kBtfoyI" />
        <meta name="google-adsense-account" content="ca-pub-7649078598124252" />
        <link rel="icon" type="image/png" href="/logo-color-new.jpg" />
        <meta property="og:title" content="Sarkariresultsnow - Latest Govt Job Results, Admit Cards & News" />
        <meta property="og:description" content="Get the latest updates on government job results, admit cards, sarkari news, and more. Stay informed with Sarkariresultsnow for all your govt job needs." />
        <meta property="og:image" content="https://www.sarkariresultsnow.com/og-image.png" />
        <meta property="og:url" content="https://www.sarkariresultsnow.com/" />
        <meta name="description" content="SarkariResultsNow provides all Sarkari Result, Admit Card, Government Jobs and Free Test Series , Latest Notifications." />
       
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
        
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
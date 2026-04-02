import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Writebolt Blog",
  description:
    "Production-ready, SEO-optimized blog template powered by Supabase and Next.js",
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CREAO Marketplace — Full pages, not just components",
  description:
    "Browse, preview, and copy production-ready landing pages and components — every listing ships with the exact AI prompt that built it.",
};

const themeInitScript = `
(function(){
  try{
    var saved=localStorage.getItem('creao-theme');
    var theme=saved||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
    document.documentElement.setAttribute('data-theme',theme);
  }catch(e){}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-10 text-center text-sm text-muted">
          <p>
            Built with{" "}
            <a href="https://agent.creao.ai/@Sonofpeace" className="text-accent hover:underline" target="_blank" rel="noopener">
              CREAO
            </a>
            . <Link href="/showcase" className="hover:underline">The original 100-page pack</Link> is free to browse.
          </p>
        </footer>
      </body>
    </html>
  );
}

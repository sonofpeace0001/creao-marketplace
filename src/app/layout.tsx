import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { SITE_NAME, SITE_URL } from "@/lib/site";

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

const DESCRIPTION =
  "Browse, preview, and copy production-ready landing pages and components — every listing ships with the exact AI prompt that built it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CREAO Marketplace — Full pages, not just components",
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "CREAO Marketplace — Full pages, not just components",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "CREAO Marketplace — Full pages, not just components",
    description: DESCRIPTION,
  },
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
            . <Link href="/showcase" className="hover:underline">The 100-page pack</Link>: 10 pages free, the rest with{" "}
            <Link href="/premium" className="hover:underline">Premium</Link>.
          </p>
        </footer>
      </body>
    </html>
  );
}

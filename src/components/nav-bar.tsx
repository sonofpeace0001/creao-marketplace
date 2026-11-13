import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";

export async function NavBar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-toolbar-bg backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="CREAO">
          <Image src="/logo-white.png" alt="CREAO" width={91} height={33} className="theme-logo-dark h-6 w-auto" priority />
          <Image src="/logo-black.png" alt="CREAO" width={91} height={33} className="theme-logo-light h-6 w-auto" priority />
        </Link>
        <nav className="order-last flex w-full items-center gap-5 overflow-x-auto whitespace-nowrap text-sm text-muted [scrollbar-width:none] [&>a]:-my-1 [&>a]:py-2.5 sm:[&>a]:my-0 sm:[&>a]:py-0 sm:order-none sm:w-auto sm:flex-1 sm:gap-6 sm:overflow-visible">
          <Link href="/browse" className="hover:text-fg">Browse</Link>
          <Link href="/components" className="hover:text-fg">Components</Link>
          <Link href="/showcase" className="hover:text-fg">Showcase</Link>
          <Link href="/premium" className="text-accent hover:underline">★ Premium</Link>
          {user && <Link href="/dashboard" className="hover:text-fg">Dashboard</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
          {user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm text-fg transition-colors hover:border-hairline sm:px-4">
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="rounded-lg border border-border px-3 py-2 text-sm text-fg transition-colors hover:border-hairline sm:px-4">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:px-4"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

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
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="CREAO">
          <Image src="/logo-white.png" alt="CREAO" width={91} height={33} className="theme-logo-dark h-6 w-auto" priority />
          <Image src="/logo-black.png" alt="CREAO" width={91} height={33} className="theme-logo-light h-6 w-auto" priority />
        </Link>
        <nav className="flex flex-1 items-center gap-6 text-sm text-muted">
          <Link href="/browse" className="hover:text-fg">Browse</Link>
          <Link href="/showcase" className="hover:text-fg">Showcase</Link>
          {user && <Link href="/dashboard" className="hover:text-fg">Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-hairline">
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-hairline">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
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

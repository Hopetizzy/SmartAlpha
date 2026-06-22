import Link from "next/link";
import Image from "next/image";

import { getCurrentViewer } from "@/lib/auth-state";
import { NavbarLinks } from "@/components/layout/NavbarLinks";

export async function Navbar() {
  const viewer = await getCurrentViewer();

  return (
    <header className="w-full h-16 bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Smart Alpha Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-semibold text-text-primary text-base tracking-tight">
              Smart Alpha
            </span>
          </Link>
          
          {/* Main Navigation Links */}
          <NavbarLinks />
        </div>

        {/* Right: Auth / Action items */}
        <div className="flex items-center gap-4">
          {viewer.isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-secondary font-medium hidden sm:inline">
                Logged in as <strong className="text-text-primary">{viewer.name || viewer.email}</strong>
              </span>
              
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="bg-surface border border-border text-text-primary hover:bg-surface-secondary transition-colors font-medium rounded-md px-3 py-1.5 text-xs"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/sign-in"
                className="bg-surface border border-border text-text-primary hover:bg-surface-secondary transition-colors font-medium rounded-md px-3.5 py-2 text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="bg-primary text-primary-foreground hover:bg-opacity-90 transition-opacity font-medium rounded-md px-3.5 py-2 text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

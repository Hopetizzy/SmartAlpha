"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarLinksProps {
  isLanding?: boolean;
}

export function NavbarLinks({ isLanding = false }: NavbarLinksProps) {
  const pathname = usePathname();

  const landingLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
  ];

  const dashboardLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
  ];

  const links = isLanding ? landingLinks : dashboardLinks;

  return (
    <nav className="flex items-center gap-8">
      {links.map((link) => {
        // Only mark active if exact match or subpath
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors duration-200 ${
              isActive
                ? "text-text-primary font-semibold"
                : "text-text-secondary font-medium hover:text-text-primary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

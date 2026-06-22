"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="flex items-center gap-8">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
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

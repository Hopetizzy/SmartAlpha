import Link from "next/link";
import Image from "next/image";

export function AuthShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background Glows (Green & Blue theme) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(97,168,255,0.06),_transparent_30%)]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo Badge */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary shadow-sm hover:bg-surface-secondary transition-all"
          >
            <Image
              src="/logo.png"
              alt="Smart Alpha Logo"
              width={16}
              height={16}
              className="object-contain"
            />
            <span>Smart Alpha</span>
          </Link>
        </div>

        {/* Card Content Container */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-[0_8px_30px_rgba(16,24,40,0.03)] backdrop-blur-sm">
          {children}
          {footer ? <div className="mt-6 border-t border-border pt-6">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

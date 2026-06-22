import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface py-8 text-center text-xs text-text-secondary mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>
          &copy; {new Date().getFullYear()} Smart Alpha. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <p>
            Powered by{" "}
            <a
              href="https://insforge.dev"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-text-primary hover:underline"
            >
              InsForge
            </a>
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}

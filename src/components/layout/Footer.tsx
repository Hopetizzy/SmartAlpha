import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface/50 backdrop-blur-sm py-6 text-xs text-text-secondary mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} SmartAlpha. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-text-muted font-medium">
            <span className="hover:text-text-primary cursor-pointer transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-text-primary cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}

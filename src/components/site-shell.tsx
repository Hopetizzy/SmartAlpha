import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header Navbar */}
      <Navbar />

      {/* Main Content Area: 1440px max width, centered, 32px (p-8) padding */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-8 flex flex-col gap-6">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

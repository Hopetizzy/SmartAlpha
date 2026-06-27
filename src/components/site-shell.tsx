import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebarNav } from "@/components/layout/DashboardSidebarNav";
import { getCurrentViewer, syncUserPremiumStatus } from "@/lib/auth-state";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface SiteShellProps {
  children: React.ReactNode;
  isLanding?: boolean;
}

export async function SiteShell({ children, isLanding = false }: SiteShellProps) {
  const viewer = await getCurrentViewer();

  // If landing page, render top navbar + children + footer
  if (isLanding) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Top Header Navbar */}
        <Navbar isLanding={isLanding} />

        {/* Main Content Area: 1440px max width, centered, 32px (p-8) padding */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-8 flex flex-col gap-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  // Dashboard / settings pages layouts (Vertical sidebar layout)
  const userId = viewer.id || "";
  
  // Sync user premium status from Stripe tables
  await syncUserPremiumStatus(userId);

  const accessToken = await getAccessToken();
  const insforge = createInsforgeServerClient({ accessToken: accessToken ?? undefined });

  // Fetch database user record
  const { data: dbUser } = await insforge.database
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const isPremium = dbUser?.is_premium ?? false;
  const userDisplayName = viewer.name || viewer.email?.split("@")[0] || "Trader";

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background w-full">
      {/* Left Vertical Side Navigation */}
      <DashboardSidebarNav isPremium={isPremium} userDisplayName={userDisplayName} />

      {/* Right Content Panel */}
      <div className="flex-grow flex flex-col h-[calc(100vh-4rem)] lg:h-screen overflow-hidden">
        {/* Top Header Panel (desktop only) */}
        <header className="hidden lg:flex w-full h-16 border-b border-border bg-surface/50 backdrop-blur-md shrink-0 px-8 items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
              {formattedDate}
            </span>
            <h2 className="text-sm font-extrabold text-text-primary leading-tight">
              Hello, <span className="text-primary font-extrabold">{userDisplayName}</span>!
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <ThemeSwitcher />
            
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors font-semibold rounded-md px-3 py-1.5 text-xs shadow-sm"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Scrollable Children Body */}
        <main className="flex-grow overflow-y-auto p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

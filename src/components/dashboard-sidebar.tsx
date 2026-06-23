"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  Settings, 
  Trophy, 
  Bot, 
  Sparkles, 
  Moon, 
  Sun, 
  X 
} from "lucide-react";
import { WalletLeaderboard } from "@/components/wallet-leaderboard";

interface DashboardSidebarProps {
  userDisplayName: string;
  isPremium: boolean;
  hasTelegram: boolean;
  telegramChatId: string;
  formattedDate: string;
}

export function DashboardSidebar({
  userDisplayName,
  isPremium,
  hasTelegram,
  telegramChatId,
  formattedDate,
}: DashboardSidebarProps) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 1. User Profile Greeting Card */}
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm relative overflow-hidden flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted tracking-wider">
              {formattedDate}
            </span>
            <h3 className="text-lg font-bold text-text-primary mt-1 leading-snug">
              Welcome back,<br />
              <span className="text-primary font-extrabold">{userDisplayName}!</span>
            </h3>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-tertiary border border-border flex items-center justify-center text-text-primary text-sm font-extrabold shadow-sm shrink-0">
              {userDisplayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-surface-secondary border border-border rounded-full text-text-muted">
              <Moon className="w-3.5 h-3.5" />
              <Sun className="w-3.5 h-3.5 text-text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Navigation Card */}
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col gap-2">
        <div className="text-[10px] font-bold text-text-muted tracking-wider uppercase px-2 mb-2">
          Navigation
        </div>
        <div className="flex flex-col gap-1">
          {/* Active Dashboard Link */}
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold bg-surface border border-border text-text-primary shadow-sm"
          >
            <span className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-text-primary" />
              Dashboard
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
          </Link>
          
          {/* Interactive Leaderboard Modal Trigger */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors text-left w-full"
          >
            <Trophy className="w-4 h-4 text-text-secondary" />
            Leaderboard
          </button>

          {/* Settings Link */}
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <Settings className="w-4 h-4 text-text-secondary" />
            Settings
          </Link>
        </div>
      </div>

      {/* 3. Colourful Premium Telegram Banner */}
      {hasTelegram ? (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-lg p-6 shadow-md relative overflow-hidden flex flex-col gap-4">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-teal-100">
              Bot Linked Successfully
            </span>
          </div>

          <div className="flex flex-col">
            <h4 className="text-base font-bold leading-tight">Telegram Alerts Active</h4>
            <p className="text-xs text-teal-100 mt-1 leading-relaxed">
              Signals are dispatched to your DM (Chat ID: <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[10px]">{telegramChatId}</code>) in less than 100ms.
            </p>
          </div>

          <Link
            href="/settings"
            className="w-full text-center bg-white text-teal-900 font-bold text-xs py-2 rounded-md shadow hover:bg-teal-50 transition-colors mt-2"
          >
            Configure Filters
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-lg p-6 shadow-md relative overflow-hidden flex flex-col gap-4">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 fill-current text-violet-200" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-200">
              Connection Required
            </span>
          </div>

          <div className="flex flex-col">
            <h4 className="text-base font-bold leading-tight">Link Telegram Bot</h4>
            <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
              Get real-time push alerts with risk scores and direct exchange links pushed straight to your DMs.
            </p>
          </div>

          <Link
            href="/settings"
            className="w-full text-center bg-white text-indigo-900 font-bold text-xs py-2 rounded-md shadow hover:bg-indigo-50 transition-colors mt-2"
          >
            Connect Bot Now
          </Link>
        </div>
      )}

      {/* 4. WALLET LEADERBOARD POPUP MODAL */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                  SMART MONEY TRACKING
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-1">
                  Wallet Performance Leaderboard
                </h3>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Renders Wallet Leaderboard component */}
            <div className="p-6">
              <WalletLeaderboard isModal={true} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

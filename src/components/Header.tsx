import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Bell, Plus, Volume2 } from 'lucide-react';
import { PaymentSettings } from '../types';

interface HeaderProps {
  onOpenWallet: () => void;
  onOpenAddMoney: () => void;
  onOpenNotifications?: () => void;
  publicSettings?: Omit<PaymentSettings, 'adminSecretPin'> | null;
  onTriggerAdminPrompt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWallet,
  onOpenAddMoney,
  onOpenNotifications,
  publicSettings,
  onTriggerAdminPrompt,
}) => {
  const { user, openAuthModal } = useAuth();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Secret admin unlock gesture: 3 rapid clicks within 1.2 seconds
  const handleSecretLogoClick = () => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    const nextCount = logoClickCount + 1;
    if (nextCount >= 3) {
      setLogoClickCount(0);
      onTriggerAdminPrompt();
    } else {
      setLogoClickCount(nextCount);
      clickTimerRef.current = setTimeout(() => {
        setLogoClickCount(0);
      }, 1200);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      {/* Top Banner Announcement if active */}
      {publicSettings?.announcementActive && publicSettings.announcementText && (
        <div className="bg-indigo-600 text-white py-1 px-3.5 text-xs font-bold flex items-center gap-2 overflow-hidden shadow-inner">
          <Volume2 className="w-3.5 h-3.5 shrink-0 text-amber-300 animate-pulse" />
          <div className="whitespace-nowrap overflow-hidden text-ellipsis flex-1 tracking-wide text-[11px]">
            {publicSettings.announcementText}
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* RUG ESPORTS Brand Logo (Freely displayed image, Secret Admin Trigger on 3 taps) */}
        <div 
          id="brand-logo-trigger"
          onClick={handleSecretLogoClick}
          className="flex items-center cursor-pointer select-none group active:scale-95 transition"
          title="RUG ESPORTS (Admin: 3 taps)"
        >
          <img 
            src="https://krorent.in/wp-content/uploads/2026/08/RUGESPORTS.jpeg" 
            alt="RUG ESPORTS" 
            className="h-10 sm:h-11 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right side: Wallet + Notifications */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Wallet Pill Button */}
              <div
                id="header-wallet-pill-btn"
                onClick={onOpenWallet}
                className="flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg py-1 pl-2.5 pr-1 transition cursor-pointer shadow-xs active:scale-95 gap-2"
              >
                <div className="flex items-center gap-1 text-indigo-600">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="text-xs font-black text-slate-900 font-['Rajdhani']">
                    ₹{user.walletBalance.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddMoney();
                  }}
                  className="w-5 h-5 rounded-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition shadow-xs"
                  title="Add Money"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                id="header-notification-btn"
                onClick={() => onOpenNotifications && onOpenNotifications()}
                className="relative w-8 h-8 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center transition border border-slate-200"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="header-login-btn"
                onClick={() => openAuthModal('login')}
                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg transition shadow-md active:scale-95 uppercase tracking-wider"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

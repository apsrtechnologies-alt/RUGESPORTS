import React from 'react';
import { Home, Trophy, Wallet, User } from 'lucide-react';

export type NavTab = 'tournaments' | 'my_matches' | 'wallet' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onChangeTab?: (tab: NavTab) => void;
  joinedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onChangeTab,
  joinedCount = 0,
}) => {
  const handleTabClick = (tab: NavTab) => {
    if (onTabChange) onTabChange(tab);
    if (onChangeTab) onChangeTab(tab);
  };

  const tabs = [
    {
      id: 'tournaments' as NavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'my_matches' as NavTab,
      label: 'My Tournaments',
      icon: Trophy,
      badge: joinedCount > 0 ? joinedCount : undefined,
    },
    {
      id: 'wallet' as NavTab,
      label: 'Wallet',
      icon: Wallet,
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/80 shadow-2xl max-w-md mx-auto pb-safe">
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              type="button"
              className={`flex flex-col items-center justify-center relative py-1 transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight truncate ${
                  isActive ? 'font-bold text-indigo-600' : 'font-medium text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

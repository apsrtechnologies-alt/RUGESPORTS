import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Tournament, PaymentSettings, GameMode, BannerSlide } from './types';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { TournamentCard } from './components/TournamentCard';
import { TournamentDetailModal } from './components/TournamentDetailModal';
import { BannerSlider } from './components/BannerSlider';
import { WalletView } from './components/WalletView';
import { JoinedMatchesView } from './components/JoinedMatchesView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { LandingHomeView } from './components/LandingHomeView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminUnlockModal } from './components/admin/AdminUnlockModal';
import { 
  Flame, Trophy, RefreshCw, Zap, Sparkles, Swords, Globe, LayoutGrid
} from 'lucide-react';

function MainAppContent() {
  const { user } = useAuth();
  
  // Navigation & State
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('tournaments');
  const [walletInitialTab, setWalletInitialTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  
  // Admin State (Completely hidden from ordinary UI, unlocked via secret PIN)
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);

  // Tournament Data & Filters
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<string[]>([]);
  const [publicSettings, setPublicSettings] = useState<Omit<PaymentSettings, 'adminSecretPin'> | null>(null);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('All');

  // Load public tournament & arena data
  const loadPublicData = async () => {
    setLoadingTournaments(true);
    try {
      const [tours, settings, bannerList] = await Promise.all([
        api.getTournaments(),
        api.getPublicSettings(),
        api.getBanners().catch(() => []),
      ]);
      setTournaments(tours);
      setPublicSettings(settings);
      setBanners(bannerList || []);

      if (user) {
        try {
          const myMatches = await api.getJoinedTournaments(user.id);
          setJoinedTournamentIds(myMatches.map(m => m.tournament?.id || m.id));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoadingTournaments(false);
    }
  };

  useEffect(() => {
    loadPublicData();

    // Check if admin is in URL pathname (/admin) or query (?admin, ?admin=portal, ?admin=true)
    const pathname = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    if (
      pathname === '/admin' || 
      pathname.startsWith('/admin/') || 
      urlParams.get('admin') === 'portal' || 
      urlParams.get('admin') === 'true' ||
      urlParams.has('admin')
    ) {
      setShowAdminUnlockModal(true);
    }
  }, [user]);

  // Handle Join Match / Open Detail
  const handleSelectTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const handleWalletOpen = (tab: 'balance' | 'deposit' | 'withdraw' = 'balance') => {
    setWalletInitialTab(tab);
    setActiveNavTab('wallet');
  };

  const handleBannerClick = (banner: BannerSlide) => {
    if (banner.tournamentId) {
      const found = tournaments.find(t => t.id === banner.tournamentId);
      if (found) {
        setSelectedTournament(found);
        return;
      }
    }
    if (banner.linkTab) {
      setActiveNavTab(banner.linkTab as NavTab);
    }
  };

  // If Admin Mode is active, render the comprehensive desktop-optimized AdminPortal
  if (isAdminMode && adminPin) {
    return (
      <AdminPortal
        adminPin={adminPin}
        onExitAdmin={() => {
          setIsAdminMode(false);
          setAdminPin(null);
          loadPublicData();
        }}
      />
    );
  }

  // Filtered Tournaments list by GameMode
  const filteredTournaments = tournaments.filter((t) => {
    if (selectedModeFilter !== 'All' && t.gameMode !== selectedModeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-['Inter',sans-serif]">
      {/* Top Header */}
      <Header
        publicSettings={publicSettings}
        onOpenWallet={() => handleWalletOpen('balance')}
        onOpenAddMoney={() => handleWalletOpen('deposit')}
        onTriggerAdminPrompt={() => setShowAdminUnlockModal(true)}
      />

      {/* Main Content Area Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 pt-3 pb-24">
        
        {/* ======================================================== */}
        {/* VIEW 1: TOURNAMENTS EXPLORER / OFFICIAL HOMEPAGE */}
        {/* ======================================================== */}
        {activeNavTab === 'tournaments' && (
          <div className="space-y-3.5 animate-fadeIn">
            {!user ? (
              <LandingHomeView
                tournaments={tournaments}
                publicSettings={publicSettings}
                onExploreMatches={() => setSelectedModeFilter('All')}
                onSelectTournament={handleSelectTournament}
              />
            ) : (
              <>
                {/* Visual Banner Carousel */}
                <BannerSlider banners={banners} onBannerClick={handleBannerClick} />

                {/* Filter Pills */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 no-scrollbar">
                  {['All', 'Squad', 'Clash Squad (4v4)', 'Solo', 'Duo'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedModeFilter(mode)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-xs ${
                        selectedModeFilter === mode
                          ? 'bg-orange-500 text-white shadow-orange-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Tournament List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <h2 className="font-bold text-sm text-slate-900 font-['Rajdhani'] uppercase tracking-wider">
                        Available Tournaments ({filteredTournaments.length})
                      </h2>
                    </div>
                    <button
                      onClick={loadPublicData}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingTournaments ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {loadingTournaments ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                      <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-600">Loading Active Tournaments...</p>
                    </div>
                  ) : filteredTournaments.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                      <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                      <h3 className="font-bold text-sm text-slate-800">No Matches Found</h3>
                      <p className="text-xs text-slate-500">Check back soon for new tournaments!</p>
                    </div>
                  ) : (
                    filteredTournaments.map((tournament) => (
                      <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        isJoined={joinedTournamentIds.includes(tournament.id)}
                        onSelect={() => handleSelectTournament(tournament)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: JOINED MATCHES & ROOM CREDENTIALS */}
        {/* ======================================================== */}
        {activeNavTab === 'joined' && (
          <JoinedMatchesView
            onSelectTournament={handleSelectTournament}
            onExploreMatches={() => setActiveNavTab('tournaments')}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 3: WALLET & INSTANT UPI TRANSACTIONS */}
        {/* ======================================================== */}
        {activeNavTab === 'wallet' && (
          <WalletView
            publicSettings={publicSettings}
            initialTab={walletInitialTab}
            onRefreshData={loadPublicData}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 4: PLAYER PROFILE */}
        {/* ======================================================== */}
        {activeNavTab === 'profile' && (
          <ProfileView
            onOpenWallet={() => handleWalletOpen('balance')}
            onOpenAdmin={() => setShowAdminUnlockModal(true)}
          />
        )}
      </main>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <BottomNav
        activeTab={activeNavTab}
        onChangeTab={(tab) => setActiveNavTab(tab)}
      />

      {/* Tournament Detail & Room Credential Modal */}
      <TournamentDetailModal
        tournament={selectedTournament}
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        onJoinedSuccess={() => {
          loadPublicData();
        }}
        onOpenDeposit={() => {
          setSelectedTournament(null);
          handleWalletOpen('deposit');
        }}
      />

      {/* Player Authentication Modal */}
      <AuthModal />

      {/* Admin Secret PIN Verification Modal */}
      <AdminUnlockModal
        isOpen={showAdminUnlockModal}
        onClose={() => setShowAdminUnlockModal(false)}
        onSuccess={(pin) => {
          setAdminPin(pin);
          setIsAdminMode(true);
          setShowAdminUnlockModal(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

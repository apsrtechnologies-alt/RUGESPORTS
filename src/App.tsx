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
  const [unregisteredView, setUnregisteredView] = useState<'home' | 'matches'>('home');
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

    // Check if admin param is in URL query (?admin=portal or ?admin=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'portal' || urlParams.get('admin') === 'true') {
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
      {/* Top Header with secret admin logo trigger */}
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
            {/* If user is unregistered, provide a slick toggle between Official Site Home and Match List */}
            {!user && (
              <div className="flex items-center justify-between p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <button
                  id="tab-unregistered-home"
                  onClick={() => setUnregisteredView('home')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    unregisteredView === 'home'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>About rugesports.in</span>
                </button>
                <button
                  id="tab-unregistered-matches"
                  onClick={() => setUnregisteredView('matches')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    unregisteredView === 'matches'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Live Matches ({tournaments.length})</span>
                </button>
              </div>
            )}

            {!user && unregisteredView === 'home' ? (
              <LandingHomeView
                tournaments={tournaments}
                publicSettings={publicSettings}
                onExploreMatches={() => setUnregisteredView('matches')}
                onSelectTournament={handleSelectTournament}
              />
            ) : (
              <>
                {/* Top Carousel Banner Slider (Admin Managed Multi-image carousel) */}
                {banners.length > 0 ? (
                  <BannerSlider banners={banners} onBannerClick={handleBannerClick} />
                ) : (
                  /* Fallback Esports Hero Promotion Banner if no custom banners are set */
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-4 text-white shadow-md shadow-orange-500/15">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-white/20 backdrop-blur-xs text-white font-extrabold text-[9px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                          FREE FIRE ARENA
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-100 bg-black/20 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3 fill-amber-300 text-amber-300" /> Instant Wallet Payouts
                        </span>
                      </div>
                      <h2 className="text-xl font-black font-['Rajdhani'] leading-tight text-white tracking-wide">
                        WIN REAL CASH ON EVERY BOOYAH & KILL!
                      </h2>
                      <p className="text-xs font-medium text-white/90 leading-snug">
                        Join Free Fire custom matches, play fair, and withdraw instant winnings via UPI & Bank.
                      </p>
                    </div>
                  </div>
                )}

                {/* Mode Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['All', 'Solo', 'Duo', 'Squad', '1v1 Custom', '2v2 Custom', 'Clash Squad (4v4)'].map((mode) => (
                    <button
                      key={mode}
                      id={`filter-mode-${mode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      onClick={() => setSelectedModeFilter(mode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                        selectedModeFilter === mode
                          ? 'bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-600/30'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {mode === 'All' ? 'All Matches' : mode}
                    </button>
                  ))}
                </div>

                {/* Matches Header & Counter */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Available Matches ({filteredTournaments.length})
                    </h3>
                  </div>
                  <button
                    onClick={loadPublicData}
                    className="p-1.5 text-slate-500 hover:text-orange-600 bg-white border border-slate-200 rounded-xl transition shadow-2xs"
                    title="Refresh Tournaments"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingTournaments ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Tournament List */}
                {loadingTournaments ? (
                  <div className="space-y-3 py-12 text-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Loading Free Fire matches...</p>
                  </div>
                ) : filteredTournaments.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-800">No matches found</p>
                    <p className="text-xs text-slate-500">
                      Matches will be created by the admin shortly. Check back in a few minutes!
                    </p>
                    {selectedModeFilter !== 'All' && (
                      <button
                        onClick={() => setSelectedModeFilter('All')}
                        className="py-1.5 px-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold"
                      >
                        Show All Matches
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTournaments.map((tournament) => (
                      <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        isJoined={joinedTournamentIds.includes(tournament.id)}
                        onJoinClick={handleSelectTournament}
                        onViewDetails={handleSelectTournament}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: MY MATCHES & ROOM CREDENTIALS */}
        {/* ======================================================== */}
        {activeNavTab === 'my_matches' && (
          <JoinedMatchesView
            onBrowseMatches={() => setActiveNavTab('tournaments')}
            onViewTournamentDetails={handleSelectTournament}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 3: WALLET, DEPOSIT (MANUAL QR) & WITHDRAWAL */}
        {/* ======================================================== */}
        {activeNavTab === 'wallet' && (
          <WalletView
            publicSettings={publicSettings}
            initialTab={walletInitialTab}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 4: PLAYER PROFILE & STATS */}
        {/* ======================================================== */}
        {activeNavTab === 'profile' && (
          <ProfileView
            publicSettings={publicSettings}
            onOpenWallet={() => handleWalletOpen('balance')}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNav
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        joinedCount={joinedTournamentIds.length}
      />

      {/* Global Auth Modal (Login / Register) */}
      <AuthModal />

      {/* Tournament Details / Join Custom Room Modal */}
      {selectedTournament && (
        <TournamentDetailModal
          tournament={selectedTournament}
          isOpen={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
          onJoinedSuccess={() => {
            loadPublicData();
            setActiveNavTab('my_matches');
          }}
          onOpenDeposit={() => {
            setSelectedTournament(null);
            handleWalletOpen('deposit');
          }}
        />
      )}

      {/* Secret Admin PIN Prompt Modal */}
      <AdminUnlockModal
        isOpen={showAdminUnlockModal}
        onClose={() => setShowAdminUnlockModal(false)}
        onSuccess={(pin) => {
          setAdminPin(pin);
          setIsAdminMode(true);
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

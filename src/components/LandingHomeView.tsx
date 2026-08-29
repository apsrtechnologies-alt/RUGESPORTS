import React, { useState, useEffect } from 'react';
import { Tournament, PaymentSettings, BannerSlide, BrowseGameItem, PastTournamentItem, FeaturedLargePrizeItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerGoogleOAuthPopup } from '../services/googleAuth';
import { 
  Trophy, Flame, ShieldCheck, Zap, Gamepad2, Users, 
  ArrowRight, CheckCircle2, Award, Sparkles, Smartphone, 
  Clock, DollarSign, MessageCircle, Send, Globe, ChevronRight,
  ChevronDown, HelpCircle, Shield, Target, Crosshair, Star, Check
} from 'lucide-react';

interface LandingHomeViewProps {
  tournaments: Tournament[];
  publicSettings: Omit<PaymentSettings, 'adminSecretPin'> | null;
  onExploreMatches: () => void;
  onSelectTournament: (tournament: Tournament) => void;
}

export const LandingHomeView: React.FC<LandingHomeViewProps> = ({
  tournaments,
  publicSettings,
  onExploreMatches,
  onSelectTournament,
}) => {
  const { openAuthModal, loginWithGoogle } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Dynamic Homepage Content fetched from Admin settings
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [browseGames, setBrowseGames] = useState<BrowseGameItem[]>([]);
  const [pastTournaments, setPastTournaments] = useState<PastTournamentItem[]>([]);
  const [featuredLargePrizes, setFeaturedLargePrizes] = useState<FeaturedLargePrizeItem[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [bannerList, gameList, pastList, prizeList] = await Promise.all([
          api.getBanners().catch(() => []),
          api.getBrowseGames().catch(() => []),
          api.getPastTournaments().catch(() => []),
          api.getFeaturedLargePrizes().catch(() => []),
        ]);
        if (bannerList && bannerList.length > 0) setBanners(bannerList);
        if (gameList && gameList.length > 0) setBrowseGames(gameList);
        if (pastList && pastList.length > 0) setPastTournaments(pastList);
        if (prizeList && prizeList.length > 0) setFeaturedLargePrizes(prizeList);
      } catch (err) {
        console.error('Failed to load homepage elements:', err);
      }
    };
    loadContent();
  }, []);

  // Auto-cycle banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const filteredMatches = selectedCategory === 'All'
    ? upcomingTournaments
    : upcomingTournaments.filter(t => t.gameMode.toLowerCase().includes(selectedCategory.toLowerCase()) || t.matchType.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleHeroGoogleClick = () => {
    setIsGoogleSigningIn(true);
    triggerGoogleOAuthPopup(
      async (userInfo) => {
        try {
          await loginWithGoogle({
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
            googleId: userInfo.sub,
          });
        } catch (err) {
          console.error(err);
          openAuthModal('login');
        } finally {
          setIsGoogleSigningIn(false);
        }
      },
      (err) => {
        setIsGoogleSigningIn(false);
        openAuthModal('login');
      }
    );
  };

  const faqs = [
    {
      q: 'How and when do I receive the Free Fire Room ID & Password?',
      a: 'Once you join a tournament slot, the Room ID and Password are automatically published in your "Joined Matches" tab exactly 15 minutes before match start.',
    },
    {
      q: 'How quickly are tournament winnings sent to my UPI / Bank?',
      a: 'Match results are declared immediately after the room finishes. Your prize money is instantly credited to your in-app wallet and can be withdrawn directly to Google Pay, PhonePe, Paytm, or BHIM UPI within 5 minutes.',
    },
    {
      q: 'Are PC / Emulator players allowed in custom rooms?',
      a: 'No. RUG ESPORTS strictly enforces 100% Mobile Phone gameplay. Any player detected using emulators or third-party hacks is immediately disqualified.',
    },
    {
      q: 'What if I score kills but do not get the #1 Booyah?',
      a: 'You still win! Every tournament features dedicated "Per Kill" bounties. For example, if a match pays ₹15 per kill and you eliminate 6 opponents, you earn ₹90 regardless of your final rank.',
    },
  ];

  const currentBanner = banners.length > 0 ? banners[activeBannerIndex] : null;

  return (
    <div className="space-y-6 animate-fadeIn pb-14 text-white bg-slate-950 -mx-3.5 -mt-3 px-3.5 pt-3">
      
      {/* ========================================================================= */}
      {/* 1. TOP BRAND HEADER - EXACT MATCH TO REFERENCE */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black font-['Rajdhani'] text-slate-950 text-base shadow-md shadow-orange-500/20">
            R
          </div>
          <div>
            <div className="font-black text-sm tracking-wider text-white font-['Rajdhani'] leading-none">
              RUG <span className="text-amber-400">INDIA</span> ESPORTS
            </div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">
              Official Competitive Arena
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHeroGoogleClick}
            disabled={isGoogleSigningIn}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isGoogleSigningIn ? 'Connecting...' : 'Sign In'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO BANNER CAROUSEL (IMAGE ONLY • BOTTOM INFO • GOLD HEADLINE) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
          {/* Main Pure Image Banner Display */}
          <div className="relative aspect-16/10 sm:aspect-16/9 bg-slate-950 overflow-hidden">
            <img
              src={currentBanner ? currentBanner.imageUrl : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'}
              alt="Tournament Hero"
              className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Bottom Banner Content Frame (Gold Rajdhani title, description, button) */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800/80 space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black font-['Rajdhani'] text-amber-400 tracking-wide uppercase">
                {currentBanner?.headlineText || currentBanner?.title || 'NAYE KHILADI'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {currentBanner?.descriptionText || currentBanner?.subtitle || 'Free Fire & BGMI: NAYE KHILADI 2026 crowned its first champions as teams turned #AbTeriBari into their moment of glory.'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={onExploreMatches}
                className="py-2.5 px-5 bg-transparent hover:bg-white/10 text-white font-bold rounded-2xl text-xs border border-white/30 hover:border-white/60 transition flex items-center gap-2 active:scale-95"
              >
                <span>{currentBanner?.buttonText || 'Tournament details'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              {/* Decorative Esports Crest on bottom right */}
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Trophy className="w-5 h-5 fill-amber-400/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBannerIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeBannerIndex === idx
                    ? 'w-6 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. PAST TOURNAMENTS SECTION - EXACT MATCH TO REFERENCE IMAGE 2 */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black font-['Rajdhani'] text-amber-400 tracking-wider uppercase">
            PAST TOURNAMENTS
          </h2>
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Championships
          </span>
        </div>

        {/* Horizontal scroll of past tournament posters */}
        <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 no-scrollbar snap-x">
          {pastTournaments.map((past) => (
            <div
              key={past.id}
              className="w-52 shrink-0 bg-slate-900/90 rounded-2xl border border-slate-800/90 p-3 space-y-2.5 shadow-md snap-start hover:border-slate-700 transition"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950">
                <img
                  src={past.imageUrl}
                  alt={past.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/80 text-emerald-400 border border-emerald-400/40 backdrop-blur-xs">
                  {past.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm font-['Rajdhani'] tracking-wide">
                  {past.title}
                </h3>
                <div className="text-[10px] text-slate-400 leading-snug">
                  <span className="text-slate-500">Dates: </span>
                  <span>{past.dates}</span>
                </div>
                {past.winnerTeam && (
                  <div className="text-[10px] text-amber-400 font-semibold truncate">
                    🏆 {past.winnerTeam}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BROWSE GAMES SECTION - EXACT MATCH TO REFERENCE IMAGE 3 */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-['Rajdhani'] text-white tracking-wide">
            Browse games
          </h2>
          <button
            onClick={onExploreMatches}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal scroll of games cards */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
          {browseGames.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                if (game.status === 'LIVE') {
                  onExploreMatches();
                }
              }}
              className={`w-36 shrink-0 bg-slate-900 rounded-2xl border overflow-hidden p-2 space-y-2 shadow-md snap-start transition ${
                game.status === 'LIVE'
                  ? 'border-emerald-500/50 hover:border-emerald-400 cursor-pointer'
                  : 'border-slate-800 opacity-80 cursor-default'
              }`}
            >
              <div className="relative aspect-4/5 rounded-xl overflow-hidden bg-slate-950">
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Status Badge Overlay */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                    game.status === 'LIVE'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/50'
                      : 'bg-slate-900/90 text-amber-400 border border-amber-400/30'
                  }`}>
                    {game.badge || (game.status === 'LIVE' ? 'LIVE NOW' : 'COMING SOON')}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 text-center">
                <h4 className="font-black text-white text-xs truncate" title={game.title}>
                  {game.title}
                </h4>
                <span className={`text-[9px] font-bold block ${
                  game.status === 'LIVE' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {game.status === 'LIVE' ? 'Join Custom Rooms' : 'Coming Soon'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TOURNAMENTS WITH LARGE PRIZES - EXACT MATCH TO REFERENCE IMAGE 4 */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-['Rajdhani'] text-white tracking-wide">
            Tournaments with large prizes
          </h2>
          <span className="text-[11px] text-amber-400 font-bold">
            High Stakes
          </span>
        </div>

        {/* Horizontal scroll of large prize cards */}
        <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 no-scrollbar snap-x">
          {featuredLargePrizes.map((item) => (
            <div
              key={item.id}
              onClick={onExploreMatches}
              className="w-72 shrink-0 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg snap-start hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
            >
              {/* Wide Banner Image */}
              <div className="relative aspect-16/9 bg-slate-950 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Time Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  {item.iconUrl && (
                    <img
                      src={item.iconUrl}
                      alt="icon"
                      className="w-6 h-6 rounded-full border border-white/40 object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-black/80 text-cyan-300 border border-cyan-400/30 backdrop-blur-xs">
                    {item.timeTag}
                  </span>
                </div>
              </div>

              {/* Tournament Title & Prize Row */}
              <div className="p-3.5 space-y-1.5 bg-slate-900/90">
                <h4 className="font-black text-white text-sm font-['Rajdhani'] tracking-wide truncate">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{item.subtitle}</span>
                  <strong className="text-amber-400 font-black font-['Rajdhani'] text-sm">
                    {item.prizePool}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INSTANT GOOGLE AUTH & PLAYER ACTION CARD */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl border border-amber-500/20 p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">
            START COMPETING IN 30 SECONDS
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black font-['Rajdhani'] text-white">
            READY TO CLAIM YOUR FIRST CASH BOOYAH?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Link your Google account or phone number to unlock custom rooms, join match slots, and withdraw instant UPI winnings.
          </p>
        </div>

        <div className="pt-1 space-y-2">
          <button
            onClick={handleHeroGoogleClick}
            disabled={isGoogleSigningIn}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2.5 shadow-md active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isGoogleSigningIn ? 'Connecting Google Account...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs transition border border-slate-700"
          >
            Register with Phone / Username
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. LIVE TOURNAMENTS PREVIEW */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h2 className="text-xl font-black font-['Rajdhani'] text-white tracking-wide">
              LIVE & UPCOMING MATCHES
            </h2>
          </div>
          <button
            onClick={onExploreMatches}
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            View All ({upcomingTournaments.length})
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Solo', 'Duo', 'Squad', '1v1', 'Clash Squad'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Matches List */}
        <div className="space-y-2.5">
          {filteredMatches.slice(0, 4).map((tournament) => {
            const fillPercent = Math.min(100, Math.round((tournament.joinedCount / tournament.totalSlots) * 100));
            return (
              <div
                key={tournament.id}
                onClick={() => onSelectTournament(tournament)}
                className="p-3.5 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800/90 shadow-sm transition cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-orange-950/80 text-orange-400 border border-orange-500/30 uppercase">
                        {tournament.gameMode}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-800 text-slate-300 border border-slate-700">
                        {tournament.map}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm font-['Rajdhani'] tracking-wide">
                      {tournament.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{new Date(tournament.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-amber-400 font-['Rajdhani'] block">
                      Prize: ₹{tournament.prizePool}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Entry: {tournament.entryFee > 0 ? `₹${tournament.entryFee}` : 'FREE'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Slots Filled</span>
                    <strong className="text-white">{tournament.joinedCount} / {tournament.totalSlots}</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. INSTANT UPI WITHDRAWALS SUPPORT */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-sm space-y-2 text-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
          INSTANT WITHDRAWALS SUPPORTED VIA
        </span>
        <div className="flex items-center justify-center gap-3 flex-wrap text-xs font-bold text-slate-300">
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1">
            <span className="text-blue-400">G</span>Pay
          </span>
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1">
            <span className="text-purple-400">Phone</span>Pe
          </span>
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1">
            <span className="text-sky-400">Pay</span>tm
          </span>
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1">
            <span className="text-orange-400">BHIM</span> UPI
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. INTERACTIVE FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <HelpCircle className="w-4 h-4" />
          <h3 className="font-black text-base text-white font-['Rajdhani']">
            FREQUENTLY ASKED QUESTIONS
          </h3>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3 text-left font-bold text-xs text-slate-200 flex items-center justify-between gap-2 hover:bg-slate-800/40 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-3 text-xs text-slate-400 bg-slate-900/80 border-t border-slate-800 leading-relaxed animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. BOTTOM COMMUNITY & SUPPORT FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm text-center space-y-3">
        <div className="space-y-1">
          <div className="font-extrabold text-sm text-white font-['Rajdhani'] tracking-wide">
            RUG <span className="text-amber-400">|</span> INDIA ESPORTS
          </div>
          <p className="text-xs text-slate-400">
            India's Premier Free Fire Competitive Esports Arena
          </p>
          <div className="text-[11px] font-bold text-amber-400">
            rugesports.in
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
          {publicSettings?.whatsappContact && (
            <a
              href={`https://wa.me/${publicSettings.whatsappContact.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-900/80 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>
          )}
          {publicSettings?.telegramChannel && (
            <a
              href={publicSettings.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/80 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold hover:bg-sky-900/80 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Room Alerts</span>
            </a>
          )}
        </div>

        <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
          Free Fire is a registered trademark of Garena International. RUG ESPORTS is an independent tournament platform.
        </p>
      </footer>

    </div>
  );
};

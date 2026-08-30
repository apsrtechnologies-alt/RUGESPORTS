import React, { useState, useEffect } from 'react';
import { Tournament, PaymentSettings, BannerSlide, BrowseGameItem, PastTournamentItem, FeaturedLargePrizeItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerGoogleOAuthPopup } from '../services/googleAuth';
import { 
  Trophy, Flame, ShieldCheck, Zap, Gamepad2, Users, 
  ArrowRight, CheckCircle2, Award, Sparkles, Smartphone, 
  Clock, DollarSign, MessageCircle, Send, Globe, ChevronRight,
  ChevronLeft, ChevronDown, HelpCircle, Shield, Target, Crosshair, Star, Check,
  Coins, Headphones, ExternalLink
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
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

  // Default banners if none configured in admin
  const defaultHeroSlides = [
    {
      id: 'slide-1',
      title: 'Free Fire Grand Championship',
      headlineText: 'FREE FIRE GRAND CHAMPIONSHIP',
      subtitle: 'Daily Cash Tournaments • Instant UPI Payouts',
      descriptionText: 'Daily custom room tournaments with verified players, high kill bounties, and direct UPI withdrawals.',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      badge: '🔥 MEGA PRIZE POOL',
      active: true,
      order: 1
    },
    {
      id: 'slide-2',
      title: 'Clash Squad 4v4 Faceoff',
      headlineText: 'CLASH SQUAD 4v4 ARENA',
      subtitle: 'Top Squads Battle for Cash Prizes',
      descriptionText: 'Intense 4v4 custom clashes with gun property OFF and fair referee spectating.',
      imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
      badge: '⚡ 4v4 SQUAD ARENA',
      active: true,
      order: 2
    },
    {
      id: 'slide-3',
      title: 'Solo Headshot Championship',
      headlineText: 'SOLO WARZONE BOUNTY',
      subtitle: 'Show Your Solo Dominance • High Kill Rewards',
      descriptionText: 'Earn per elimination bounty straight to your wallet. Every kill pays cash!',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      badge: '🎯 SOLO WARZONE',
      active: true,
      order: 3
    }
  ];

  const activeBanners = banners.length > 0 ? banners : defaultHeroSlides;

  // Auto-cycle banners every 5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

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
      q: 'How do I participate in a Free Fire tournament on RUG Esports?',
      a: 'Sign in with your Google account, browse the tournament list, top up your entry fee with UPI if required, and click "Join Now". Provide your in-game Free Fire UID and IGN. The Room ID and password will be displayed 15 minutes before match start.'
    },
    {
      q: 'How and when are winnings credited?',
      a: 'Winnings are calculated according to the match rules (per kill + placement points) and credited directly to your RUG Esports wallet within 15–30 minutes of match completion after admin verification. You can instantly withdraw funds via UPI.'
    },
    {
      q: 'Are room credentials sent via SMS or displayed in the app?',
      a: 'Room credentials (Custom Room ID and Password) appear directly on your tournament card and under "Joined Matches" 15 minutes before the scheduled match time.'
    },
    {
      q: 'What anti-cheat and fair play policies are enforced?',
      a: 'We strictly prohibit emulators (unless explicitly stated in match details), mods, hacks, and teaming. Every match is spectated by official referees, and winners must upload a final scoreboard screenshot.'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-14 text-white bg-slate-950 -mx-3.5 -mt-3 px-3.5 pt-3">
      
      {/* ========================================================================= */}
      {/* 1. TOP BRAND BANNER (RUG INDIA ESPORTS • OFFICIAL COMPETITIVE ARENA) */}
      {/* ========================================================================= */}
      <div className="flex items-center py-2 px-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-sm">
            <img 
              src="https://krorent.in/wp-content/uploads/2026/08/RUGESPORTS.jpeg" 
              alt="RUG ESPORTS" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="font-black text-sm tracking-wider text-white font-['Rajdhani'] leading-none">
              RUG <span className="text-amber-400">INDIA</span> ESPORTS
            </div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">
              Official Competitive Arena
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO BANNER CAROUSEL (IMAGE ONLY • BOTTOM INFO • GOLD HEADLINE) */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
          {/* Slides Container */}
          <div className="relative h-56 sm:h-64 w-full overflow-hidden">
            {activeBanners.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title || 'Tournament'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Ambient Deep Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                    {slide.badge || '🔥 MEGA PRIZE POOL'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-['Rajdhani'] tracking-wide leading-tight drop-shadow-md">
                    {slide.headlineText || slide.title}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium drop-shadow-sm line-clamp-2">
                    {slide.descriptionText || slide.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          {activeBanners.length > 1 && (
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2 py-1 rounded-full border border-slate-800">
              <button
                onClick={() => setActiveBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="text-slate-400 hover:text-white transition p-0.5"
                title="Previous Slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex gap-1 px-1">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeBannerIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length)}
                className="text-slate-400 hover:text-white transition p-0.5"
                title="Next Slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action button beneath banner */}
        <button
          onClick={onExploreMatches}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.99] transition"
        >
          <Flame className="w-4 h-4 fill-slate-950" />
          <span>View Live Tournaments ({tournaments.length})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK STATS BAR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-center">
        <div>
          <div className="text-base font-black text-amber-400 font-['Rajdhani'] leading-none">
            ₹5,00,000+
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
            Prizes Won
          </span>
        </div>
        <div className="border-x border-slate-800">
          <div className="text-base font-black text-emerald-400 font-['Rajdhani'] leading-none">
            Instant
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
            UPI Payouts
          </span>
        </div>
        <div>
          <div className="text-base font-black text-orange-400 font-['Rajdhani'] leading-none">
            100% Fair
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
            Anti-Cheat
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BROWSE GAMES SECTION (LIVE NOW & COMING SOON) */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-1">
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
                  : 'border-slate-800 opacity-85 cursor-default'
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
      {/* 5. PAST TOURNAMENTS SECTION */}
      {/* ========================================================================= */}
      {pastTournaments.length > 0 && (
        <section className="space-y-3 pt-1">
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
      )}

      {/* ========================================================================= */}
      {/* 6. TOURNAMENTS WITH LARGE PRIZES */}
      {/* ========================================================================= */}
      {featuredLargePrizes.length > 0 && (
        <section className="space-y-3 pt-1">
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
      )}

      {/* ========================================================================= */}
      {/* 7. LIVE & UPCOMING FEATURED TOURNAMENTS */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-base text-white font-['Rajdhani'] tracking-wide">
              FEATURED TOURNAMENTS
            </h3>
          </div>
          <button
            onClick={onExploreMatches}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingTournaments.length > 0 ? (
          <div className="space-y-3">
            {upcomingTournaments.slice(0, 3).map((t) => {
              const joinedCount = t.joinedCount || 0;
              const isFull = joinedCount >= t.totalSlots;

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTournament(t)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition cursor-pointer space-y-3 shadow-md group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-black uppercase tracking-wider">
                          {t.gameMode} • {t.map}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(t.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white font-['Rajdhani'] tracking-wide group-hover:text-amber-400 transition mt-1">
                        {t.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Prize Pool
                      </span>
                      <span className="text-base font-black text-amber-400 font-['Rajdhani'] leading-none">
                        ₹{t.prizePool}
                      </span>
                    </div>
                  </div>

                  {/* Info badges */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Entry</span>
                      <span className="font-bold text-white">
                        {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}
                      </span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Per Kill</span>
                      <span className="font-bold text-amber-400">
                        {t.perKill > 0 ? `₹${t.perKill}` : 'Rank Only'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Slots</span>
                      <span className={`font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                        {joinedCount}/{t.totalSlots}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
            No live tournaments scheduled right now. Check back soon!
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 8. INSTANT GOOGLE AUTH & 1-TAP ACTION CARD */}
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
      {/* 9. HOW TO PLAY & WIN (3 SIMPLE STEPS) */}
      {/* ========================================================================= */}
      <section className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="font-black text-base text-white font-['Rajdhani'] tracking-wide">
            HOW TO PLAY & WIN
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="w-7 h-7 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-black flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-white text-sm">Sign In & Select Match</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Sign in with Google, pick your favorite match mode (Solo, Duo, Squad, Clash Squad), and register with your Free Fire IGN.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="w-7 h-7 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-black flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-white text-sm">Join Custom Room</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Get Room ID and Password 15 mins before match starts. Enter room inside Free Fire and show your skills.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-white text-sm">Instant UPI Payouts</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Winnings are credited to your wallet instantly after match ends. Withdraw directly to any UPI ID (PhonePe, GPay, Paytm).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. TRUST & FAIR PLAY BADGES */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-xs text-white">100% Anti-Cheat</h4>
          <p className="text-[10px] text-slate-400 leading-snug">
            Strict emulator & hack detection. Every match is spectated by official referees.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <Coins className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-xs text-white">Instant UPI Cashout</h4>
          <p className="text-[10px] text-slate-400 leading-snug">
            Direct withdrawals to your GPay, PhonePe, or Paytm UPI ID within minutes.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <h3 className="font-black text-base text-white font-['Rajdhani'] tracking-wide">
            FREQUENTLY ASKED QUESTIONS
          </h3>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-3.5 text-left font-bold text-xs text-white flex items-center justify-between gap-3 hover:text-amber-400 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-90 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. OFFICIAL CONTACT & SUPPORT FOOTER */}
      {/* ========================================================================= */}
      <footer className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Headphones className="w-4 h-4 text-amber-400" />
          <span className="font-black text-sm text-white font-['Rajdhani'] tracking-wider">
            24/7 PLAYER SUPPORT & COMMUNITY
          </span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Need help with match registrations, room credentials, or UPI withdrawals? Join our official community.
        </p>

        <div className="flex items-center justify-center gap-3 pt-1">
          {publicSettings?.supportWhatsapp && (
            <a
              href={`https://wa.me/${publicSettings.supportWhatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          {publicSettings?.supportTelegram && (
            <a
              href={publicSettings.supportTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
          © {new Date().getFullYear()} RUG Esports (rugesports.in). All rights reserved.
        </div>
      </footer>

    </div>
  );
};

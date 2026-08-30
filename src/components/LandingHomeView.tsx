import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  Smartphone, 
  ChevronRight, 
  CheckCircle2, 
  Gift, 
  ChevronLeft, 
  Headphones, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';
import { Tournament, PublicSettings } from '../types';

interface LandingHomeViewProps {
  tournaments: Tournament[];
  publicSettings?: PublicSettings | null;
  onExploreMatches: () => void;
  onSelectTournament: (t: Tournament) => void;
}

export const LandingHomeView: React.FC<LandingHomeViewProps> = ({
  tournaments,
  publicSettings,
  onExploreMatches,
  onSelectTournament
}) => {
  // 1. Dynamic Hero Slides
  const defaultHeroSlides = [
    {
      id: 'slide-1',
      title: 'Free Fire Grand Championship',
      subtitle: 'Daily Cash Tournaments • Instant UPI Payouts',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      tag: '🔥 MEGA PRIZE POOL',
      gradient: 'from-amber-500/90 via-orange-600/80 to-slate-950'
    },
    {
      id: 'slide-2',
      title: 'Clash Squad 4v4 Faceoff',
      subtitle: 'Top Squads Battle for ₹10,000 Cash Pool',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
      tag: '⚡ 4v4 SQUAD ARENA',
      gradient: 'from-orange-600/90 via-red-600/80 to-slate-950'
    },
    {
      id: 'slide-3',
      title: 'Solo Headshot Championship',
      subtitle: 'Show Your Solo Dominance • High Kill Rewards',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      tag: '🎯 SOLO WARZONE',
      gradient: 'from-amber-600/90 via-yellow-600/80 to-slate-950'
    }
  ];

  const heroSlides = publicSettings?.banners && publicSettings.banners.length > 0
    ? publicSettings.banners.map((b, i) => ({
        id: b.id || `banner-${i}`,
        title: b.title || 'Official RUG Esports Tournament',
        subtitle: b.subtitle || 'Competitive Esports Arena',
        image: b.imageUrl,
        tag: '🔥 OFFICIAL MATCH',
        gradient: 'from-amber-500/90 via-orange-600/80 to-slate-950'
      }))
    : defaultHeroSlides;

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Featured Tournaments (Up to 3 upcoming or ongoing)
  const featuredMatches = tournaments.slice(0, 3);

  // Active FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Ambient Deep Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                    {slide.tag}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-['Rajdhani'] tracking-wide leading-tight drop-shadow-md">
                    {slide.title}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators & Controls */}
          {heroSlides.length > 1 && (
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2 py-1 rounded-full border border-slate-800">
              <button
                onClick={() => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="text-slate-400 hover:text-white transition p-0.5"
                title="Previous Slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex gap-1 px-1">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeSlide ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
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
      {/* 4. FEATURED / UPCOMING MATCHES */}
      {/* ========================================================================= */}
      <section className="space-y-3">
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

        {featuredMatches.length > 0 ? (
          <div className="space-y-3">
            {featuredMatches.map((t) => {
              const joinedCount = t.participants ? t.participants.length : 0;
              const isFull = joinedCount >= t.maxSlots;

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
                          {t.mode} • {t.map}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {t.scheduleTime || 'Today'}
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
                        {t.perKillReward ? `₹${t.perKillReward}` : 'Rules'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Slots</span>
                      <span className={`font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                        {joinedCount}/{t.maxSlots}
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
      {/* 5. HOW IT WORKS (3 SIMPLE STEPS) */}
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
      {/* 6. TRUST & FAIR PLAY BADGES */}
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
      {/* 7. FREQUENTLY ASKED QUESTIONS */}
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
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
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
      {/* 8. OFFICIAL CONTACT & SUPPORT FOOTER */}
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
          {publicSettings?.whatsappSupportNumber && (
            <a
              href={`https://wa.me/${publicSettings.whatsappSupportNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          {publicSettings?.telegramChannelUrl && (
            <a
              href={publicSettings.telegramChannelUrl}
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

import React, { useState, useEffect } from 'react';
import { BannerSlide, BrowseGameItem, PastTournamentItem, FeaturedLargePrizeItem, Tournament } from '../../types';
import { api } from '../../services/api';
import { 
  Plus, Edit2, Trash2, Image as ImageIcon, Eye, RefreshCw, 
  Check, X, Sparkles, MoveUp, MoveDown, Layers, Gamepad2, 
  Trophy, Flame, CheckCircle2, Clock, DollarSign, Upload, Link2
} from 'lucide-react';

interface HomepageControlTabProps {
  adminPin: string;
  tournaments: Tournament[];
  onDataChanged: () => void;
}

export const HomepageControlTab: React.FC<HomepageControlTabProps> = ({
  adminPin,
  tournaments,
  onDataChanged,
}) => {
  const [subSection, setSubSection] = useState<'banners' | 'browseGames' | 'pastTournaments' | 'featuredLargePrizes'>('banners');
  
  // Data states
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [browseGames, setBrowseGames] = useState<BrowseGameItem[]>([]);
  const [pastTournaments, setPastTournaments] = useState<PastTournamentItem[]>([]);
  const [featuredLargePrizes, setFeaturedLargePrizes] = useState<FeaturedLargePrizeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal States
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: '',
    imageUrl: '',
    linkTab: 'tournaments',
    tournamentId: '',
    active: true,
    order: 1,
    headlineText: 'NAYE KHILADI',
    descriptionText: 'Free Fire & BGMI: NAYE KHILADI 2026 champions battle for real cash glory.',
    buttonText: 'Tournament details',
  });

  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<BrowseGameItem | null>(null);
  const [gameForm, setGameForm] = useState({
    title: 'Free Fire MAX',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    status: 'LIVE' as 'LIVE' | 'COMING_SOON',
    badge: 'LIVE NOW',
    active: true,
    order: 1,
    linkTab: 'tournaments',
  });

  const [showPastModal, setShowPastModal] = useState(false);
  const [editingPast, setEditingPast] = useState<PastTournamentItem | null>(null);
  const [pastForm, setPastForm] = useState({
    title: 'BMSD 2025',
    tag: 'Invite',
    dates: '18th Sep 2025 to 12th Oct 2025',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    winnerTeam: 'Team Soul Esports',
    prizePool: '₹2,50,000',
    active: true,
    order: 1,
  });

  const [showLargePrizeModal, setShowLargePrizeModal] = useState(false);
  const [editingLargePrize, setEditingLargePrize] = useState<FeaturedLargePrizeItem | null>(null);
  const [largePrizeForm, setLargePrizeForm] = useState({
    title: '( G.C.L ) GLOBAL CHAMPIONS LEAGUE',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    timeTag: 'IN 7 MINUTES, 11:30',
    subtitle: '1v1 • 8 slots',
    prizePool: '₹10,000',
    tournamentId: '',
    active: true,
    order: 1,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadHomepageData = async () => {
    setLoading(true);
    try {
      const [bannerList, gameList, pastList, prizeList] = await Promise.all([
        api.admin.getBanners(adminPin).catch(() => []),
        api.admin.getBrowseGames(adminPin).catch(() => []),
        api.admin.getPastTournaments(adminPin).catch(() => []),
        api.admin.getFeaturedLargePrizes(adminPin).catch(() => []),
      ]);
      setBanners(bannerList || []);
      setBrowseGames(gameList || []);
      setPastTournaments(pastList || []);
      setFeaturedLargePrizes(prizeList || []);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load homepage elements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomepageData();
  }, [adminPin]);

  // Image Upload helper for any form
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('error', 'Image file is too large (max 4MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // BANNER ACTIONS
  // ==========================================
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.imageUrl.trim()) {
      showToast('error', 'Banner image URL or file is required');
      return;
    }
    try {
      if (editingBanner) {
        await api.admin.updateBanner(adminPin, editingBanner.id, bannerForm);
        showToast('success', 'Banner updated successfully!');
      } else {
        await api.admin.createBanner(adminPin, bannerForm);
        showToast('success', 'New banner slide added!');
      }
      setShowBannerModal(false);
      setEditingBanner(null);
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Delete this banner from homepage?')) return;
    try {
      await api.admin.deleteBanner(adminPin, id);
      showToast('success', 'Banner deleted');
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleToggleBanner = async (banner: BannerSlide) => {
    try {
      await api.admin.updateBanner(adminPin, banner.id, { active: !banner.active });
      showToast('success', banner.active ? 'Banner paused' : 'Banner activated');
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // ==========================================
  // BROWSE GAMES ACTIONS
  // ==========================================
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameForm.title.trim() || !gameForm.imageUrl.trim()) {
      showToast('error', 'Game title and image URL are required');
      return;
    }
    try {
      if (editingGame) {
        await api.admin.updateBrowseGame(adminPin, editingGame.id, gameForm);
        showToast('success', 'Game updated successfully!');
      } else {
        await api.admin.createBrowseGame(adminPin, gameForm);
        showToast('success', 'New game added to Browse Games section!');
      }
      setShowGameModal(false);
      setEditingGame(null);
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save game');
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!window.confirm('Delete this game from Browse Games?')) return;
    try {
      await api.admin.deleteBrowseGame(adminPin, id);
      showToast('success', 'Game removed');
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleToggleGameStatus = async (game: BrowseGameItem) => {
    const nextStatus = game.status === 'LIVE' ? 'COMING_SOON' : 'LIVE';
    const nextBadge = nextStatus === 'LIVE' ? 'LIVE NOW' : 'COMING SOON';
    try {
      await api.admin.updateBrowseGame(adminPin, game.id, { status: nextStatus, badge: nextBadge });
      showToast('success', `Status updated to ${nextStatus}`);
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // ==========================================
  // PAST TOURNAMENTS ACTIONS
  // ==========================================
  const handleSavePast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastForm.title.trim() || !pastForm.imageUrl.trim()) {
      showToast('error', 'Title and poster image URL are required');
      return;
    }
    try {
      if (editingPast) {
        await api.admin.updatePastTournament(adminPin, editingPast.id, pastForm);
        showToast('success', 'Past tournament updated!');
      } else {
        await api.admin.createPastTournament(adminPin, pastForm);
        showToast('success', 'Past tournament added!');
      }
      setShowPastModal(false);
      setEditingPast(null);
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save past tournament');
    }
  };

  const handleDeletePast = async (id: string) => {
    if (!window.confirm('Delete this past tournament showcase?')) return;
    try {
      await api.admin.deletePastTournament(adminPin, id);
      showToast('success', 'Past tournament deleted');
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // ==========================================
  // FEATURED LARGE PRIZES ACTIONS
  // ==========================================
  const handleSaveLargePrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!largePrizeForm.title.trim() || !largePrizeForm.imageUrl.trim()) {
      showToast('error', 'Title and image URL are required');
      return;
    }
    try {
      if (editingLargePrize) {
        await api.admin.updateFeaturedLargePrize(adminPin, editingLargePrize.id, largePrizeForm);
        showToast('success', 'Large prize tournament updated!');
      } else {
        await api.admin.createFeaturedLargePrize(adminPin, largePrizeForm);
        showToast('success', 'Large prize tournament showcase created!');
      }
      setShowLargePrizeModal(false);
      setEditingLargePrize(null);
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save item');
    }
  };

  const handleDeleteLargePrize = async (id: string) => {
    if (!window.confirm('Delete this featured large prize item?')) return;
    try {
      await api.admin.deleteFeaturedLargePrize(adminPin, id);
      showToast('success', 'Item deleted');
      loadHomepageData();
      onDataChanged();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TOAST FEEDBACK */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn ${
          feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER BANNER & SUB-SECTION SELECTOR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 uppercase tracking-wide">
                Homepage Visual Management
              </span>
              <span className="text-xs text-slate-400 font-medium">All Sections Managed by Admin</span>
            </div>
            <h3 className="text-xl font-black font-['Rajdhani'] text-slate-900 mt-1">
              Homepage Control Center
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Add, edit, reorder, and delete Banners, Browse Games, Past Tournaments, and Large Prize Showcases seen by players on the homepage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadHomepageData}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition"
              title="Refresh All Homepage Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 SUBSECTION TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSubSection('banners')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center ${
              subSection === 'banners'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>1. Hero Banners ({banners.length})</span>
          </button>

          <button
            onClick={() => setSubSection('browseGames')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center ${
              subSection === 'browseGames'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>2. Browse Games ({browseGames.length})</span>
          </button>

          <button
            onClick={() => setSubSection('pastTournaments')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center ${
              subSection === 'pastTournaments'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>3. Past Tournaments ({pastTournaments.length})</span>
          </button>

          <button
            onClick={() => setSubSection('featuredLargePrizes')}
            className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center ${
              subSection === 'featuredLargePrizes'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-red-400" />
            <span>4. Large Prizes ({featuredLargePrizes.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO BANNERS CAROUSEL */}
      {/* ========================================================================= */}
      {subSection === 'banners' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-['Rajdhani']">
                Hero Banner Sliders (Image Only • Bottom Details)
              </h4>
              <p className="text-xs text-slate-500">
                All banner images are clean artworks without text inside. Headlines and details appear below the image.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBannerForm({
                  title: '',
                  subtitle: '',
                  badge: '',
                  imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
                  linkTab: 'tournaments',
                  tournamentId: '',
                  active: true,
                  order: banners.length + 1,
                  headlineText: 'NAYE KHILADI',
                  descriptionText: 'Free Fire & BGMI: NAYE KHILADI 2026 champions crowned as teams battle for cash prizes.',
                  buttonText: 'Tournament details',
                });
                setShowBannerModal(true);
              }}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Hero Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                {/* Banner Image Preview */}
                <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/70 text-white backdrop-blur-xs">
                      #{banner.order}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-xs ${
                      banner.active ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>
                      {banner.active ? 'LIVE / ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                </div>

                {/* Banner Bottom Information */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between bg-slate-900 text-white">
                  <div className="space-y-1">
                    <h5 className="font-black text-amber-400 font-['Rajdhani'] text-base tracking-wide uppercase">
                      {banner.headlineText || banner.title || 'BANNER HEADLINE'}
                    </h5>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {banner.descriptionText || banner.subtitle || 'No description added'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 border border-white/20 px-2 py-0.5 rounded-full">
                      Btn: {banner.buttonText || 'Tournament details'}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleBanner(banner)}
                        className={`p-1.5 rounded-lg text-xs font-bold ${
                          banner.active ? 'text-amber-400 hover:bg-white/10' : 'text-emerald-400 hover:bg-white/10'
                        }`}
                        title={banner.active ? 'Pause' : 'Activate'}
                      >
                        {banner.active ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBanner(banner);
                          setBannerForm({
                            title: banner.title || '',
                            subtitle: banner.subtitle || '',
                            badge: banner.badge || '',
                            imageUrl: banner.imageUrl || '',
                            linkTab: banner.linkTab || 'tournaments',
                            tournamentId: banner.tournamentId || '',
                            active: banner.active !== false,
                            order: banner.order || 1,
                            headlineText: banner.headlineText || 'NAYE KHILADI',
                            descriptionText: banner.descriptionText || '',
                            buttonText: banner.buttonText || 'Tournament details',
                          });
                          setShowBannerModal(true);
                        }}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: BROWSE GAMES */}
      {/* ========================================================================= */}
      {subSection === 'browseGames' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-['Rajdhani']">
                Browse Games Showcase (Free Fire LIVE, Others COMING SOON)
              </h4>
              <p className="text-xs text-slate-500">
                Control which games are displayed, their status tags (LIVE / COMING SOON), and game posters.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingGame(null);
                setGameForm({
                  title: 'Free Fire MAX',
                  imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
                  status: 'LIVE',
                  badge: 'LIVE NOW',
                  active: true,
                  order: browseGames.length + 1,
                  linkTab: 'tournaments',
                });
                setShowGameModal(true);
              }}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Game
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {browseGames.map((game) => (
              <div
                key={game.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-slate-950">
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      game.status === 'LIVE' 
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/50' 
                        : 'bg-slate-800/90 text-amber-400 border border-amber-400/30'
                    }`}>
                      {game.status === 'LIVE' ? 'LIVE' : 'COMING SOON'}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <h5 className="font-black text-white text-xs truncate" title={game.title}>
                    {game.title}
                  </h5>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <button
                      onClick={() => handleToggleGameStatus(game)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        game.status === 'LIVE' ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10'
                      }`}
                    >
                      Toggle: {game.status === 'LIVE' ? 'Make Soon' : 'Make Live'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGame(game);
                          setGameForm({
                            title: game.title,
                            imageUrl: game.imageUrl,
                            status: game.status,
                            badge: game.badge || (game.status === 'LIVE' ? 'LIVE NOW' : 'COMING SOON'),
                            active: game.active !== false,
                            order: game.order || 1,
                            linkTab: game.linkTab || 'tournaments',
                          });
                          setShowGameModal(true);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PAST TOURNAMENTS */}
      {/* ========================================================================= */}
      {subSection === 'pastTournaments' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-['Rajdhani']">
                Past Tournaments Showcase (BMSD 2025, BMPS, BGIS, etc.)
              </h4>
              <p className="text-xs text-slate-500">
                Display historic championship posters, dates, tags (Invite/Completed), and winner statistics.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPast(null);
                setPastForm({
                  title: 'BMSD 2025',
                  tag: 'Invite',
                  dates: '18th Sep 2025 to 12th Oct 2025',
                  imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
                  winnerTeam: 'Team Soul Esports',
                  prizePool: '₹2,50,000',
                  active: true,
                  order: pastTournaments.length + 1,
                });
                setShowPastModal(true);
              }}
              className="py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Past Tournament
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastTournaments.map((past) => (
              <div
                key={past.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-3 shadow-xs text-white"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950">
                  <img
                    src={past.imageUrl}
                    alt={past.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-emerald-400 border border-emerald-400/40 backdrop-blur-xs">
                    {past.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h5 className="font-black text-white text-base font-['Rajdhani'] tracking-wide">
                    {past.title}
                  </h5>
                  <p className="text-xs text-slate-400">
                    <strong>Dates:</strong> {past.dates}
                  </p>
                  {past.winnerTeam && (
                    <p className="text-xs text-amber-400 font-semibold">
                      🏆 Champions: {past.winnerTeam} ({past.prizePool || '₹2,00,000'})
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingPast(past);
                      setPastForm({
                        title: past.title,
                        tag: past.tag || 'Invite',
                        dates: past.dates || '',
                        imageUrl: past.imageUrl,
                        winnerTeam: past.winnerTeam || '',
                        prizePool: past.prizePool || '',
                        active: past.active !== false,
                        order: past.order || 1,
                      });
                      setShowPastModal(true);
                    }}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeletePast(past.id)}
                    className="py-1.5 px-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: FEATURED LARGE PRIZE TOURNAMENTS */}
      {/* ========================================================================= */}
      {subSection === 'featuredLargePrizes' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-['Rajdhani']">
                Featured Large Prize Tournaments Showcase
              </h4>
              <p className="text-xs text-slate-500">
                Display high-stakes championship cards with start time badges, format details, and prize pools.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingLargePrize(null);
                setLargePrizeForm({
                  title: '( G.C.L ) GLOBAL CRICKET LEAGUE',
                  imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
                  iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
                  timeTag: 'IN 7 MINUTES, 11:30',
                  subtitle: '1v1 • 8 slots',
                  prizePool: '₹10,000',
                  tournamentId: '',
                  active: true,
                  order: featuredLargePrizes.length + 1,
                });
                setShowLargePrizeModal(true);
              }}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Large Prize Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredLargePrizes.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs text-white flex flex-col justify-between"
              >
                <div className="relative aspect-16/9 bg-slate-950 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                    {item.iconUrl && (
                      <img
                        src={item.iconUrl}
                        alt="icon"
                        className="w-7 h-7 rounded-full border border-white/30 object-cover shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/80 text-cyan-300 border border-cyan-400/30 backdrop-blur-xs">
                      {item.timeTag}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div>
                    <h5 className="font-black text-white text-base font-['Rajdhani'] tracking-wide">
                      {item.title}
                    </h5>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                      <span>{item.subtitle}</span>
                      <strong className="text-amber-400 font-extrabold">{item.prizePool}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEditingLargePrize(item);
                        setLargePrizeForm({
                          title: item.title,
                          imageUrl: item.imageUrl,
                          iconUrl: item.iconUrl || '',
                          timeTag: item.timeTag || 'IN 7 MINUTES, 11:30',
                          subtitle: item.subtitle || '1v1 • 8 slots',
                          prizePool: item.prizePool || '₹10,000',
                          tournamentId: item.tournamentId || '',
                          active: item.active !== false,
                          order: item.order || 1,
                        });
                        setShowLargePrizeModal(true);
                      }}
                      className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLargePrize(item.id)}
                      className="py-1 px-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BANNER CREATE / EDIT */}
      {/* ========================================================================= */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Rajdhani']">
                {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
              </h3>
              <button onClick={() => setShowBannerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Banner Image URL or Upload *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                  <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, (url) => setBannerForm({ ...bannerForm, imageUrl: url }))}
                    />
                  </label>
                </div>
                {bannerForm.imageUrl && (
                  <div className="mt-2 aspect-16/9 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img src={bannerForm.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline Text (Under Banner)</label>
                  <input
                    type="text"
                    value={bannerForm.headlineText}
                    onChange={(e) => setBannerForm({ ...bannerForm, headlineText: e.target.value })}
                    placeholder="e.g. NAYE KHILADI"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    placeholder="Tournament details"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description Paragraph (Under Banner)</label>
                <textarea
                  rows={2}
                  value={bannerForm.descriptionText}
                  onChange={(e) => setBannerForm({ ...bannerForm, descriptionText: e.target.value })}
                  placeholder="e.g. Free Fire & BGMI champions battle for their moment of glory..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="bannerActiveCheckbox"
                    checked={bannerForm.active}
                    onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <label htmlFor="bannerActiveCheckbox" className="text-xs font-bold text-slate-800">
                    Active / Live on Homepage
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BROWSE GAME CREATE / EDIT */}
      {/* ========================================================================= */}
      {showGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Rajdhani']">
                {editingGame ? 'Edit Game' : 'Add Game to Browse Games'}
              </h3>
              <button onClick={() => setShowGameModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Game Title *</label>
                <input
                  type="text"
                  required
                  value={gameForm.title}
                  onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })}
                  placeholder="e.g. Free Fire MAX, VALORANT, BGMI..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Game Poster Image URL or Upload *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={gameForm.imageUrl}
                    onChange={(e) => setGameForm({ ...gameForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                  <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, (url) => setGameForm({ ...gameForm, imageUrl: url }))}
                    />
                  </label>
                </div>
                {gameForm.imageUrl && (
                  <div className="mt-2 w-28 aspect-4/5 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 mx-auto">
                    <img src={gameForm.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={gameForm.status}
                    onChange={(e) => setGameForm({ ...gameForm, status: e.target.value as any, badge: e.target.value === 'LIVE' ? 'LIVE NOW' : 'COMING SOON' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  >
                    <option value="LIVE">LIVE</option>
                    <option value="COMING_SOON">COMING SOON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={gameForm.badge}
                    onChange={(e) => setGameForm({ ...gameForm, badge: e.target.value })}
                    placeholder="LIVE NOW / COMING SOON"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowGameModal(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  {editingGame ? 'Save Game' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PAST TOURNAMENT CREATE / EDIT */}
      {/* ========================================================================= */}
      {showPastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Rajdhani']">
                {editingPast ? 'Edit Past Tournament' : 'Add Past Tournament'}
              </h3>
              <button onClick={() => setShowPastModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePast} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tournament Title *</label>
                <input
                  type="text"
                  required
                  value={pastForm.title}
                  onChange={(e) => setPastForm({ ...pastForm, title: e.target.value })}
                  placeholder="e.g. BMSD 2025, BMPS 2025..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tag (e.g. Invite / Completed)</label>
                  <input
                    type="text"
                    value={pastForm.tag}
                    onChange={(e) => setPastForm({ ...pastForm, tag: e.target.value })}
                    placeholder="Invite"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dates Span</label>
                  <input
                    type="text"
                    value={pastForm.dates}
                    onChange={(e) => setPastForm({ ...pastForm, dates: e.target.value })}
                    placeholder="18th Sep 2025 to 12th Oct 2025"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Square Poster Image URL or Upload *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={pastForm.imageUrl}
                    onChange={(e) => setPastForm({ ...pastForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                  <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, (url) => setPastForm({ ...pastForm, imageUrl: url }))}
                    />
                  </label>
                </div>
                {pastForm.imageUrl && (
                  <div className="mt-2 w-32 aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 mx-auto">
                    <img src={pastForm.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Winner Team (Optional)</label>
                  <input
                    type="text"
                    value={pastForm.winnerTeam}
                    onChange={(e) => setPastForm({ ...pastForm, winnerTeam: e.target.value })}
                    placeholder="Team Soul"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prize Pool (Optional)</label>
                  <input
                    type="text"
                    value={pastForm.prizePool}
                    onChange={(e) => setPastForm({ ...pastForm, prizePool: e.target.value })}
                    placeholder="₹2,50,000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPastModal(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl text-xs"
                >
                  {editingPast ? 'Save Tournament' : 'Add Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FEATURED LARGE PRIZE CREATE / EDIT */}
      {/* ========================================================================= */}
      {showLargePrizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Rajdhani']">
                {editingLargePrize ? 'Edit Large Prize Tournament' : 'Add Large Prize Showcase'}
              </h3>
              <button onClick={() => setShowLargePrizeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLargePrize} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Showcase Title *</label>
                <input
                  type="text"
                  required
                  value={largePrizeForm.title}
                  onChange={(e) => setLargePrizeForm({ ...largePrizeForm, title: e.target.value })}
                  placeholder="e.g. ( G.C.L ) GLOBAL CRICKET LEAGUE"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wide Banner Image URL or Upload *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={largePrizeForm.imageUrl}
                    onChange={(e) => setLargePrizeForm({ ...largePrizeForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                  <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, (url) => setLargePrizeForm({ ...largePrizeForm, imageUrl: url }))}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Tag</label>
                  <input
                    type="text"
                    value={largePrizeForm.timeTag}
                    onChange={(e) => setLargePrizeForm({ ...largePrizeForm, timeTag: e.target.value })}
                    placeholder="IN 7 MINUTES, 11:30"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Format</label>
                  <input
                    type="text"
                    value={largePrizeForm.subtitle}
                    onChange={(e) => setLargePrizeForm({ ...largePrizeForm, subtitle: e.target.value })}
                    placeholder="1v1 • 8 slots"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prize Pool Display</label>
                  <input
                    type="text"
                    value={largePrizeForm.prizePool}
                    onChange={(e) => setLargePrizeForm({ ...largePrizeForm, prizePool: e.target.value })}
                    placeholder="₹10,000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Icon URL (Optional)</label>
                  <input
                    type="url"
                    value={largePrizeForm.iconUrl}
                    onChange={(e) => setLargePrizeForm({ ...largePrizeForm, iconUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLargePrizeModal(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
                >
                  {editingLargePrize ? 'Save Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

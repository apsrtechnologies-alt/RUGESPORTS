import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Tournament, 
  DepositRequest, 
  WithdrawalRequest, 
  User, 
  PaymentSettings,
  TournamentParticipant,
  GameMode,
  FFMap,
  MatchType,
  BannerSlide
} from '../../types';
import { 
  ShieldCheck, Trophy, ArrowDownLeft, ArrowUpRight, Users, 
  Settings, Plus, Edit2, Trash2, Key, CheckCircle2, XCircle, 
  Copy, RefreshCw, AlertCircle, Eye, LogOut, Check, Sparkles, 
  ExternalLink, Building2, QrCode, Phone, Search, DollarSign, Award,
  Menu, X, ChevronRight, Filter, Clock, Wallet, CheckSquare, Layers,
  Image as ImageIcon, MoveUp, MoveDown, ToggleLeft, ToggleRight, LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HomepageControlTab } from './HomepageControlTab';
import { TournamentSlotInspectorModal } from './TournamentSlotInspectorModal';

interface AdminPortalProps {
  adminPin: string;
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ adminPin, onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'deposits' | 'withdrawals' | 'users' | 'homepage' | 'settings'>('tournaments');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slotInspectorTour, setSlotInspectorTour] = useState<Tournament | null>(null);
  
  const [stats, setStats] = useState<any>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Banner Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: 'BE THE LAST ONE STANDING',
    subtitle: 'COMPETE. SURVIVE. WIN.',
    badge: 'DAILY CASH CUPS',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    linkTab: 'tournaments',
    active: true,
    order: 1,
  });

  // Modals inside Admin
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [roomModalTour, setRoomModalTour] = useState<Tournament | null>(null);
  const [roomInputId, setRoomInputId] = useState('');
  const [roomInputPass, setRoomInputPass] = useState('');

  // Declare Results Modal
  const [resultModalTour, setResultModalTour] = useState<Tournament | null>(null);
  const [tourParticipants, setTourParticipants] = useState<TournamentParticipant[]>([]);
  const [playerKillsMap, setPlayerKillsMap] = useState<{ [userId: string]: number }>({});
  const [playerRankMap, setPlayerRankMap] = useState<{ [userId: string]: number }>({});

  // View Screenshot Modal
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);

  // User Balance Adjustment Modal
  const [adjustUserModal, setAdjustUserModal] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState('Manual bonus / dispute fix');

  // Search & Filter filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [tournamentFilter, setTournamentFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  // New Tournament Form State
  const [tourForm, setTourForm] = useState({
    title: 'Free Fire Bermuda Cash Clash',
    gameMode: 'Solo' as GameMode,
    map: 'Bermuda' as FFMap,
    matchType: 'Battle Royale' as MatchType,
    entryFee: 20,
    prizePool: 650,
    perKill: 10,
    firstPrize: 300,
    secondPrize: 150,
    thirdPrize: 80,
    matchTime: new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 16),
    totalSlots: 48,
    rulesText: 'Emulators strictly banned.\nRoom credentials given 15 min before match.\nJoin allotted slot only.\nTake Booyah screenshot.',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, tourData, depData, withData, userData, setData, bannersData] = await Promise.all([
        api.admin.getStats(adminPin),
        api.getTournaments(),
        api.admin.getDeposits(adminPin),
        api.admin.getWithdrawals(adminPin),
        api.admin.getUsers(adminPin),
        api.admin.getSettings(adminPin),
        api.admin.getBanners(adminPin),
      ]);
      setStats(statsData);
      setTournaments(tourData);
      setDeposits(depData);
      setWithdrawals(withData);
      setUsers(userData);
      setSettings(setData);
      setBanners(bannersData || []);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [adminPin]);

  // Handle Save Banner (Create or Update)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!bannerForm.imageUrl.trim()) {
        showToast('error', 'Please enter a valid image URL');
        return;
      }

      if (editingBanner) {
        await api.admin.updateBanner(adminPin, editingBanner.id, bannerForm);
        showToast('success', 'Banner slide updated!');
      } else {
        await api.admin.createBanner(adminPin, bannerForm);
        showToast('success', 'New homepage banner slide added!');
      }

      setShowBannerModal(false);
      setEditingBanner(null);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner from the homepage slider?')) return;
    try {
      await api.admin.deleteBanner(adminPin, id);
      showToast('success', 'Banner deleted successfully!');
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete banner');
    }
  };

  const handleToggleBannerActive = async (banner: BannerSlide) => {
    try {
      await api.admin.updateBanner(adminPin, banner.id, { active: !banner.active });
      showToast('success', `Banner ${!banner.active ? 'Activated' : 'Paused'}`);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to toggle banner');
    }
  };

  // Handle Save Tournament (Create or Update)
  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: tourForm.title,
        gameMode: tourForm.gameMode,
        map: tourForm.map,
        matchType: tourForm.matchType,
        entryFee: Number(tourForm.entryFee),
        prizePool: Number(tourForm.prizePool),
        perKill: Number(tourForm.perKill),
        firstPrize: Number(tourForm.firstPrize),
        secondPrize: Number(tourForm.secondPrize),
        thirdPrize: Number(tourForm.thirdPrize),
        matchTime: new Date(tourForm.matchTime).toISOString(),
        totalSlots: Number(tourForm.totalSlots),
        rules: tourForm.rulesText.split('\n').filter(r => r.trim().length > 0),
      };

      if (editingTournament) {
        await api.admin.updateTournament(adminPin, editingTournament.id, payload);
        showToast('success', 'Tournament updated successfully!');
      } else {
        await api.admin.createTournament(adminPin, payload);
        showToast('success', 'New Free Fire Tournament created!');
      }

      setShowCreateModal(false);
      setEditingTournament(null);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save tournament');
    }
  };

  const handleDeleteTournament = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? Any registered players will be automatically refunded!`)) return;
    try {
      await api.admin.deleteTournament(adminPin, id);
      showToast('success', 'Tournament deleted and players refunded.');
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Publish Room
  const handlePublishRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomModalTour) return;
    try {
      await api.admin.publishRoom(adminPin, roomModalTour.id, roomInputId, roomInputPass);
      showToast('success', `Room credentials published to ${roomModalTour.joinedCount} registered players!`);
      setRoomModalTour(null);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Open Results Declaration Modal
  const openResultsModal = async (tour: Tournament) => {
    setResultModalTour(tour);
    try {
      const data = await api.admin.getTournamentParticipants(adminPin, tour.id);
      const parts = data.participants || [];
      setTourParticipants(parts);
      const initialKills: any = {};
      const initialRanks: any = {};
      parts.forEach(p => {
        initialKills[p.userId] = p.kills || 0;
        initialRanks[p.userId] = p.rank || 0;
      });
      setPlayerKillsMap(initialKills);
      setPlayerRankMap(initialRanks);
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleDisbursePrizes = async () => {
    if (!resultModalTour) return;
    if (!window.confirm(`Confirm declare results for "${resultModalTour.title}"? Winnings will be immediately credited to player wallets!`)) return;

    try {
      const resultsPayload = tourParticipants.map(p => ({
        userId: p.userId,
        kills: Number(playerKillsMap[p.userId]) || 0,
        rank: Number(playerRankMap[p.userId]) || 0,
      }));

      await api.admin.declareResults(adminPin, resultModalTour.id, resultsPayload);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      showToast('success', 'Results declared & cash prizes distributed into player wallets!');
      setResultModalTour(null);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Deposit Actions
  const handleApproveDeposit = async (id: string, username: string, amount: number) => {
    if (!window.confirm(`Approve deposit of ₹${amount} for ${username}? This will add ₹${amount} to their wallet.`)) return;
    try {
      await api.admin.updateDepositStatus(adminPin, id, 'approved', 'Verified in bank account');
      showToast('success', `Approved ₹${amount} for ${username}!`);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleRejectDeposit = async (id: string, username: string) => {
    const reason = window.prompt('Enter rejection reason (e.g. UTR not found in bank statement):', 'Payment not received in bank');
    if (reason === null) return;
    try {
      await api.admin.updateDepositStatus(adminPin, id, 'rejected', reason);
      showToast('success', `Deposit request rejected for ${username}.`);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Withdrawal Actions
  const handleApproveWithdrawal = async (id: string, username: string, amount: number) => {
    const ref = window.prompt(`Enter Bank / UPI Transaction Reference for ₹${amount} transfer:`, `IMPS${Date.now().toString().slice(-6)}`);
    if (ref === null) return;
    try {
      await api.admin.updateWithdrawalStatus(adminPin, id, 'approved', ref, 'Paid via UPI/Bank');
      showToast('success', `Marked withdrawal of ₹${amount} as Paid!`);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleRejectWithdrawal = async (id: string, username: string, amount: number) => {
    const reason = window.prompt(`Enter rejection reason. ₹${amount} will be refunded to ${username}'s wallet:`, 'Invalid account details');
    if (reason === null) return;
    try {
      await api.admin.updateWithdrawalStatus(adminPin, id, 'rejected', '', reason);
      showToast('success', `Withdrawal rejected and ₹${amount} refunded to user.`);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // User Balance Adjust
  const handleSaveUserBalanceAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUserModal) return;
    try {
      await api.admin.adjustUserBalance(adminPin, adjustUserModal.id, adjustAmount, adjustType, adjustReason);
      showToast('success', `User balance adjusted successfully!`);
      setAdjustUserModal(null);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.admin.updateSettings(adminPin, settings);
      showToast('success', 'Arena & Payment Settings updated successfully!');
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  
  const filteredDeposits = deposits.filter(d => {
    if (depositFilter === 'all') return true;
    return d.status === depositFilter;
  });

  const filteredWithdrawals = withdrawals.filter(w => {
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  });

  const filteredTournaments = tournaments.filter(t => {
    if (tournamentFilter === 'all') return true;
    return t.status === tournamentFilter;
  });

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.freeFireName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.freeFireUid.includes(userSearchQuery) ||
    u.phone.includes(userSearchQuery)
  );

  const navItems = [
    { id: 'tournaments', label: 'Matches & Custom Rooms', icon: Trophy, count: tournaments.length },
    { id: 'homepage', label: 'Homepage Control', icon: Layers },
    { id: 'deposits', label: 'Deposit Requests', icon: ArrowDownLeft, badge: pendingDeposits.length, badgeColor: 'bg-orange-500 text-white' },
    { id: 'withdrawals', label: 'Withdrawal Payouts', icon: ArrowUpRight, badge: pendingWithdrawals.length, badgeColor: 'bg-red-500 text-white' },
    { id: 'users', label: 'Players & Wallets', icon: Users, count: users.length },
    { id: 'settings', label: 'Arena & Payment Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 animate-fadeIn">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 py-3 px-5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 border ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10' : 'bg-red-50 text-red-800 border-red-200 shadow-red-500/10'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 tracking-wider font-['Chakra_Petch'] leading-none block">
                RUG <span className="text-orange-600">|</span> ESPORTS
              </span>
              <span className="text-[10px] text-orange-600 font-bold">Admin Portal</span>
            </div>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5 text-red-500" /> Exit
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-sm
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-black text-lg text-slate-900 tracking-wider font-['Chakra_Petch'] leading-none">
                  RUG <span className="text-orange-600">|</span> ESPORTS
                </h1>
                <span className="text-[11px] text-orange-600 font-bold tracking-wide">
                  Master Control Suite
                </span>
              </div>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 my-4">
            <div 
              onClick={() => { setActiveTab('deposits'); setSidebarOpen(false); }}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                pendingDeposits.length > 0 
                  ? 'bg-orange-50 border-orange-200 text-orange-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">Deposits</span>
              <span className="text-lg font-black font-['Rajdhani'] leading-none block mt-0.5 text-slate-900">
                {pendingDeposits.length} <span className="text-[10px] font-normal text-slate-500">pending</span>
              </span>
            </div>

            <div 
              onClick={() => { setActiveTab('withdrawals'); setSidebarOpen(false); }}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                pendingWithdrawals.length > 0 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500">Payouts</span>
              <span className="text-lg font-black font-['Rajdhani'] leading-none block mt-0.5 text-slate-900">
                {pendingWithdrawals.length} <span className="text-[10px] font-normal text-slate-500">pending</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {'badge' in item && item.badge ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-orange-600' : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  ) : 'count' in item && item.count !== undefined ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg ${isActive ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={loadAllData}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
              <span>Refresh Live Data</span>
            </button>

            <button
              id="exit-admin-desktop-btn"
              onClick={onExitAdmin}
              className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Exit to Player Site</span>
            </button>
          </div>
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* TOP DESKTOP HEADER */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 py-4 items-center justify-between shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Rajdhani'] capitalize">
              {activeTab === 'tournaments' ? 'Matches & Custom Rooms' :
               activeTab === 'homepage' ? 'Homepage Control Suite' :
               activeTab === 'deposits' ? 'Deposit Requests Queue' :
               activeTab === 'withdrawals' ? 'Withdrawal Payout Requests' :
               activeTab === 'users' ? 'Player Directory & Wallets' :
               'Arena & Payment Settings'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'homepage' 
                ? 'Manage hero banner images, browse games list (Free Fire Live, rest Coming Soon), past championships, and large prize cards.' 
                : 'Manage tournaments, payments, custom room credentials, and winner disbursements.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'tournaments' && (
              <button
                id="admin-create-match-desktop-btn"
                onClick={() => {
                  setEditingTournament(null);
                  setTourForm({
                    title: 'Free Fire Bermuda Cash Clash',
                    gameMode: 'Solo',
                    map: 'Bermuda',
                    matchType: 'Battle Royale',
                    entryFee: 20,
                    prizePool: 650,
                    perKill: 10,
                    firstPrize: 300,
                    secondPrize: 150,
                    thirdPrize: 80,
                    matchTime: new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 16),
                    totalSlots: 48,
                    rulesText: 'Emulators strictly banned.\nRoom credentials given 15 min before match.\nJoin allotted slot only.\nTake Booyah screenshot.',
                  });
                  setShowCreateModal(true);
                }}
                className="py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add New Match
              </button>
            )}

            {activeTab === 'banners' && (
              <button
                id="admin-add-banner-desktop-btn"
                onClick={() => {
                  setEditingBanner(null);
                  setBannerForm({
                    title: 'BE THE LAST ONE STANDING',
                    subtitle: 'COMPETE. SURVIVE. WIN.',
                    badge: 'DAILY CASH CUPS',
                    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
                    linkTab: 'tournaments',
                    active: true,
                    order: banners.length + 1,
                  });
                  setShowBannerModal(true);
                }}
                className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add New Banner Slide
              </button>
            )}

            <button
              onClick={loadAllData}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-xl transition"
              title="Refresh All"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            </button>

            <button
              onClick={onExitAdmin}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" /> Exit
            </button>
          </div>
        </header>

        {/* CONTENT CONTAINER */}
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ================================================= */}
          {/* TAB 1: TOURNAMENTS & MATCHES */}
          {/* ================================================= */}
          {activeTab === 'tournaments' && (
            <div className="space-y-4">
              {/* Filter and stats row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTournamentFilter(filter)}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold capitalize transition ${
                          tournamentFilter === filter 
                            ? 'bg-white text-slate-900 shadow-xs font-bold' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Total Matches: <strong className="text-slate-900">{tournaments.length}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span>Active Players: <strong className="text-slate-900">{tournaments.reduce((acc, t) => acc + t.joinedCount, 0)}</strong></span>
                </div>
              </div>

              {filteredTournaments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700">No matches found in this category</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a new match to open registrations for players.</p>
                  <button
                    onClick={() => {
                      setEditingTournament(null);
                      setShowCreateModal(true);
                    }}
                    className="py-2 px-4 bg-orange-500 text-white font-bold rounded-xl text-xs"
                  >
                    + Create First Match
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredTournaments.map((tour) => {
                    const fillPercent = Math.min(100, Math.round((tour.joinedCount / tour.totalSlots) * 100));
                    return (
                      <div key={tour.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs hover:border-slate-300 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                {tour.gameMode}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tour.status === 'upcoming' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                tour.status === 'ongoing' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {tour.status.toUpperCase()}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-base font-['Rajdhani']">{tour.title}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(tour.matchTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-orange-600 font-['Rajdhani'] block">Prize: ₹{tour.prizePool}</span>
                            <span className="text-xs font-semibold text-slate-600">Entry: ₹{tour.entryFee}</span>
                          </div>
                        </div>

                        {/* Slots Progress */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 font-medium">Slots Filled</span>
                            <span className="font-bold text-slate-900">{tour.joinedCount} / {tour.totalSlots}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Prize Distribution breakdown */}
                        <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-center text-[10px]">
                          <div>
                            <span className="text-slate-400 block font-medium">1st Prize</span>
                            <span className="font-bold text-slate-900 font-['Rajdhani'] text-xs">₹{tour.firstPrize}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">2nd Prize</span>
                            <span className="font-bold text-slate-900 font-['Rajdhani'] text-xs">₹{tour.secondPrize}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">3rd Prize</span>
                            <span className="font-bold text-slate-900 font-['Rajdhani'] text-xs">₹{tour.thirdPrize}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Per Kill</span>
                            <span className="font-bold text-emerald-600 font-['Rajdhani'] text-xs">₹{tour.perKill}</span>
                          </div>
                        </div>

                        {/* Room Credentials Box */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Custom Room Credentials</span>
                            <span className="font-mono text-slate-900 font-bold">
                              {tour.customRoomId ? `ID: ${tour.customRoomId} | Pass: ${tour.customRoomPassword || 'None'}` : 'Not Published'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSlotInspectorTour(tour)}
                              className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                              title="View and manage player seat slots"
                            >
                              <Users className="w-3.5 h-3.5" /> View Seats ({tour.joinedCount}/{tour.totalSlots})
                            </button>
                            <button
                              onClick={() => {
                                setRoomModalTour(tour);
                                setRoomInputId(tour.customRoomId || '');
                                setRoomInputPass(tour.customRoomPassword || '');
                              }}
                              className="py-1.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <Key className="w-3.5 h-3.5" /> Set Room ID
                            </button>
                          </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => openResultsModal(tour)}
                            className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Award className="w-4 h-4 text-emerald-600" /> Declare Results & Disburse
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingTournament(tour);
                              setTourForm({
                                title: tour.title,
                                gameMode: tour.gameMode,
                                map: tour.map,
                                matchType: tour.matchType,
                                entryFee: tour.entryFee,
                                prizePool: tour.prizePool,
                                perKill: tour.perKill,
                                firstPrize: tour.firstPrize,
                                secondPrize: tour.secondPrize,
                                thirdPrize: tour.thirdPrize,
                                matchTime: new Date(tour.matchTime).toISOString().slice(0, 16),
                                totalSlots: tour.totalSlots,
                                rulesText: tour.rules?.join('\n') || '',
                              });
                              setShowCreateModal(true);
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
                            title="Edit Match"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteTournament(tour.id, tour.title)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition"
                            title="Delete Match (Refunds all players)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 2: MANUAL DEPOSITS VERIFICATION */}
          {/* ================================================= */}
          {activeTab === 'deposits' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDepositFilter(filter)}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold capitalize transition ${
                          depositFilter === filter 
                            ? 'bg-white text-slate-900 shadow-xs font-bold' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Pending Verification: <strong className="text-orange-600">{pendingDeposits.length}</strong> (₹{stats?.pendingDepositsAmount || 0})
                </div>
              </div>

              {filteredDeposits.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 shadow-xs">
                  No deposit requests found in this view.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Player & IGN</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Bank UTR / Tx ID</th>
                          <th className="py-3 px-4">Screenshot</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDeposits.map((dep) => (
                          <tr key={dep.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{dep.username}</span>
                              <span className="text-[11px] text-slate-500">
                                {dep.userFreeFireName} • {dep.userPhone}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-black text-sm text-slate-900 font-['Rajdhani']">
                                ₹{dep.amount}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 font-semibold select-all">
                                {dep.transactionId}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {dep.screenshotUrl ? (
                                <button
                                  onClick={() => setViewScreenshotUrl(dep.screenshotUrl!)}
                                  className="py-1 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View SS
                                </button>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">No SS</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                                dep.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                dep.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {dep.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {new Date(dep.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {dep.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleApproveDeposit(dep.id, dep.username, dep.amount)}
                                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectDeposit(dep.id, dep.username)}
                                    className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">
                                  {dep.adminNote || 'Processed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 3: WITHDRAWAL PAYOUTS */}
          {/* ================================================= */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setWithdrawalFilter(filter)}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold capitalize transition ${
                          withdrawalFilter === filter 
                            ? 'bg-white text-slate-900 shadow-xs font-bold' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Pending Payouts: <strong className="text-red-600">{pendingWithdrawals.length}</strong> (₹{stats?.pendingWithdrawalsAmount || 0})
                </div>
              </div>

              {filteredWithdrawals.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 shadow-xs">
                  No withdrawal payout requests found in this view.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWithdrawals.map((w) => (
                    <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.status === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                              w.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {w.status.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">{w.payoutMethod}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{w.username}</h4>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-600 font-['Rajdhani'] block">
                            ₹{w.amount}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Payment Destination Details */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        {w.payoutDetails.upiId && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">UPI ID:</span>
                            <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 select-all">
                              {w.payoutDetails.upiId}
                            </span>
                          </div>
                        )}
                        {w.payoutDetails.accountNumber && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">A/C Holder:</span>
                              <span className="text-slate-900 font-bold">{w.payoutDetails.accountHolderName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">A/C Number:</span>
                              <span className="font-mono text-slate-900 font-bold select-all">{w.payoutDetails.accountNumber}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">IFSC:</span>
                              <span className="font-mono text-orange-600 font-bold select-all">{w.payoutDetails.ifsc}</span>
                            </div>
                          </>
                        )}
                        {w.payoutDetails.paytmNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Paytm Mobile:</span>
                            <span className="font-mono text-slate-900 font-bold select-all">{w.payoutDetails.paytmNumber}</span>
                          </div>
                        )}
                      </div>

                      {w.adminReference && (
                        <p className="text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          Tx Ref: {w.adminReference}
                        </p>
                      )}

                      {w.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleApproveWithdrawal(w.id, w.username, w.amount)}
                            className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark as Paid
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(w.id, w.username, w.amount)}
                            className="py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject & Refund
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 4: PLAYERS & WALLETS MANAGER */}
          {/* ================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by IGN, Free Fire UID, Username, Phone..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div className="text-xs text-slate-500">
                  Total Players: <strong className="text-slate-900">{users.length}</strong>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Player Identity</th>
                        <th className="py-3 px-4">Free Fire UID</th>
                        <th className="py-3 px-4">Phone (WhatsApp)</th>
                        <th className="py-3 px-4">Matches</th>
                        <th className="py-3 px-4">Wallet Balance</th>
                        <th className="py-3 px-4">Total Winnings</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{u.freeFireName}</span>
                            <span className="text-[11px] text-slate-500">@{u.username}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {u.freeFireUid}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {u.phone}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {u.matchesPlayed || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-black text-sm text-orange-600 font-['Rajdhani']">
                              ₹{u.walletBalance}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-600 font-['Rajdhani']">
                              ₹{u.totalWinnings || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setAdjustUserModal(u);
                                setAdjustAmount(50);
                              }}
                              className="py-1.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold transition"
                            >
                              Adjust Balance ₹
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 5: ARENA & PAYMENT SETTINGS */}
          {/* ================================================= */}
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* UPI / QR Settings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-orange-600" /> UPI & QR Payment Setup
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Admin UPI ID (for user payments) *
                    </label>
                    <input
                      type="text"
                      value={settings.upiId}
                      onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-orange-500 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Payee Display Name
                    </label>
                    <input
                      type="text"
                      value={settings.upiName}
                      onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Custom QR Code Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/my-qr.png"
                      value={settings.qrCodeUrl}
                      onChange={(e) => setSettings({ ...settings, qrCodeUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Bank Account Settings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-600" /> Bank Account Deposit Information
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={settings.bankName}
                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={settings.ifsc}
                        onChange={(e) => setSettings({ ...settings, ifsc: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase font-mono outline-none focus:border-orange-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={settings.accountNumber}
                      onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-orange-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={settings.accountHolder}
                      onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Limits & Support Links */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Limits & Support Contacts
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Min Deposit (₹)</label>
                      <input
                        type="number"
                        value={settings.minDeposit}
                        onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Min Withdrawal (₹)</label>
                      <input
                        type="number"
                        value={settings.minWithdrawal}
                        onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Support WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={settings.supportWhatsapp}
                      onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Support Telegram Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://t.me/ragesports"
                      value={settings.supportTelegram}
                      onChange={(e) => setSettings({ ...settings, supportTelegram: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Announcement & Admin Secret PIN */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Banner & Admin PIN
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Header Announcement Banner Text
                    </label>
                    <textarea
                      rows={2}
                      value={settings.announcementText}
                      onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admin Secret Access PIN *
                    </label>
                    <input
                      type="text"
                      value={settings.adminSecretPin}
                      onChange={(e) => setSettings({ ...settings, adminSecretPin: e.target.value })}
                      className="w-full bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-900 font-mono font-bold outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  id="save-admin-settings-btn"
                  type="submit"
                  className="py-3 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm shadow-md shadow-orange-500/20 active:scale-95 transition"
                >
                  Save All Settings
                </button>
              </div>
            </form>
          )}

          {/* ================================================= */}
          {/* TAB: HOMEPAGE CONTROL (BANNERS, GAMES, PAST, PRIZES) */}
          {/* ================================================= */}
          {activeTab === 'homepage' && (
            <HomepageControlTab
              adminPin={adminPin}
              tournaments={tournaments}
              onDataChanged={loadAllData}
            />
          )}

        </div>
      </main>

      {/* ================================================= */}
      {/* MODAL: CREATE / EDIT MATCH */}
      {/* ================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-xl text-slate-900 font-['Rajdhani'] mb-4">
              {editingTournament ? 'EDIT FREE FIRE MATCH' : 'CREATE FREE FIRE MATCH'}
            </h3>

            <form onSubmit={handleSaveTournament} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tournament Title *</label>
                <input
                  type="text"
                  value={tourForm.title}
                  onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-orange-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Map</label>
                  <select
                    value={tourForm.map}
                    onChange={(e) => setTourForm({ ...tourForm, map: e.target.value as FFMap })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="Nexterra">Nexterra</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={tourForm.gameMode}
                    onChange={(e) => {
                      const newMode = e.target.value as GameMode;
                      let suggestedSlots = tourForm.totalSlots;
                      if (newMode === '1v1 Custom') suggestedSlots = 2;
                      else if (newMode === '2v2 Custom') suggestedSlots = 4;
                      else if (newMode === 'Clash Squad (4v4)') suggestedSlots = 8;
                      else if (suggestedSlots < 4) suggestedSlots = 48;

                      setTourForm({ 
                        ...tourForm, 
                        gameMode: newMode,
                        totalSlots: suggestedSlots,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  >
                    <option value="Solo">Solo (Battle Royale)</option>
                    <option value="Duo">Duo (Battle Royale)</option>
                    <option value="Squad">Squad (Battle Royale)</option>
                    <option value="1v1 Custom">1v1 Custom (2 Slots)</option>
                    <option value="2v2 Custom">2v2 Custom (4 Slots)</option>
                    <option value="Clash Squad (4v4)">Clash Squad (4v4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entry Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={tourForm.entryFee}
                    onChange={(e) => setTourForm({ ...tourForm, entryFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prize Pool (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={tourForm.prizePool}
                    onChange={(e) => setTourForm({ ...tourForm, prizePool: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-orange-600 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Per Kill (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={tourForm.perKill}
                    onChange={(e) => setTourForm({ ...tourForm, perKill: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-emerald-600 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">1st Prize (₹)</label>
                  <input
                    type="number"
                    value={tourForm.firstPrize}
                    onChange={(e) => setTourForm({ ...tourForm, firstPrize: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">2nd Prize (₹)</label>
                  <input
                    type="number"
                    value={tourForm.secondPrize}
                    onChange={(e) => setTourForm({ ...tourForm, secondPrize: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">3rd Prize (₹)</label>
                  <input
                    type="number"
                    value={tourForm.thirdPrize}
                    onChange={(e) => setTourForm({ ...tourForm, thirdPrize: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Match Start Time</label>
                  <input
                    type="datetime-local"
                    value={tourForm.matchTime}
                    onChange={(e) => setTourForm({ ...tourForm, matchTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Slots / Players (Min 2)</label>
                  <input
                    type="number"
                    min={2}
                    max={48}
                    value={tourForm.totalSlots}
                    onChange={(e) => setTourForm({ ...tourForm, totalSlots: Math.max(2, Number(e.target.value)) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Match Rules (1 per line)</label>
                <textarea
                  rows={3}
                  value={tourForm.rulesText}
                  onChange={(e) => setTourForm({ ...tourForm, rulesText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs shadow-md active:scale-98 transition"
              >
                {editingTournament ? 'Save Match Changes' : 'Create & Open Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL: PUBLISH ROOM ID & PASSWORD */}
      {/* ================================================= */}
      {roomModalTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setRoomModalTour(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 font-['Rajdhani'] mb-1">
              PUBLISH ROOM CREDENTIALS
            </h3>
            <p className="text-xs text-slate-500 mb-4">{roomModalTour.title}</p>

            <form onSubmit={handlePublishRoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Free Fire Custom Room ID *</label>
                <input
                  type="text"
                  placeholder="e.g. 84920184"
                  value={roomInputId}
                  onChange={(e) => setRoomInputId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Password *</label>
                <input
                  type="text"
                  placeholder="e.g. 1234 or 999"
                  value={roomInputPass}
                  onChange={(e) => setRoomInputPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-orange-600 font-mono outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-[11px]">
                ⚡ Once published, these room credentials will instantly appear in the joined players' app!
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-xs shadow-md active:scale-98 transition"
              >
                Publish Credentials to Players
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL: DECLARE RESULTS & DISTRIBUTE PRIZES */}
      {/* ================================================= */}
      {resultModalTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
            <button
              onClick={() => setResultModalTour(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-xl text-slate-900 font-['Rajdhani'] mb-0.5">
              DECLARE RESULTS & AWARD WINNERS
            </h3>
            <p className="text-xs text-orange-600 font-semibold mb-4">{resultModalTour.title}</p>

            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-4 shrink-0 text-center">
              <div>
                <span className="text-slate-400 block text-[10px]">1st Place</span>
                <span className="font-bold text-slate-900">₹{resultModalTour.firstPrize}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">2nd Place</span>
                <span className="font-bold text-slate-900">₹{resultModalTour.secondPrize}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">3rd Place</span>
                <span className="font-bold text-slate-900">₹{resultModalTour.thirdPrize}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Per Kill</span>
                <span className="font-bold text-emerald-600">₹{resultModalTour.perKill}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Assign Kills & Ranks ({tourParticipants.length} Players)
              </span>

              {tourParticipants.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No registered players in this match.</p>
              ) : (
                tourParticipants.map((p) => {
                  const kills = playerKillsMap[p.userId] || 0;
                  const rank = playerRankMap[p.userId] || 0;
                  
                  let rankPrize = 0;
                  if (rank === 1) rankPrize = resultModalTour.firstPrize;
                  else if (rank === 2) rankPrize = resultModalTour.secondPrize;
                  else if (rank === 3) rankPrize = resultModalTour.thirdPrize;
                  const totalCalc = rankPrize + (kills * resultModalTour.perKill);

                  return (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{p.freeFireName}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">UID: {p.freeFireUid} (Slot #{p.slotNumber})</span>
                        </div>
                        <span className="font-black text-orange-600 text-xs font-['Rajdhani']">
                          Payout: ₹{totalCalc}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Rank (1=Booyah, 2, 3...)</label>
                          <input
                            type="number"
                            min={0}
                            max={48}
                            value={rank}
                            onChange={(e) => setPlayerRankMap({ ...playerRankMap, [p.userId]: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold outline-none focus:border-orange-500"
                            placeholder="0 for unranked"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Kills</label>
                          <input
                            type="number"
                            min={0}
                            value={kills}
                            onChange={(e) => setPlayerKillsMap({ ...playerKillsMap, [p.userId]: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-emerald-600 font-bold outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-2 shrink-0">
              <button
                onClick={handleDisbursePrizes}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
              >
                <Award className="w-4 h-4" /> Disburse Cash Prizes to Player Wallets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL: VIEW SCREENSHOT */}
      {/* ================================================= */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setViewScreenshotUrl(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Payment Screenshot Preview
            </h4>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-slate-100 p-2 flex items-center justify-center">
              <img src={viewScreenshotUrl} alt="Payment Receipt" className="max-w-full object-contain rounded-xl shadow-xs" />
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL: ADJUST USER BALANCE */}
      {/* ================================================= */}
      {adjustUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setAdjustUserModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 font-['Rajdhani'] mb-1">
              ADJUST WALLET BALANCE
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Player: <strong className="text-slate-900">{adjustUserModal.username}</strong> (Current: ₹{adjustUserModal.walletBalance})
            </p>

            <form onSubmit={handleSaveUserBalanceAdjust} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-xl font-bold transition ${adjustType === 'add' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}`}
                >
                  + Add Credit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`py-2 rounded-xl font-bold transition ${adjustType === 'deduct' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}`}
                >
                  - Deduct Balance
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Note *</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-xs shadow-md active:scale-98 transition"
              >
                Apply Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL: CREATE / EDIT BANNER SLIDE */}
      {/* ================================================= */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowBannerModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-xl text-slate-900 font-['Rajdhani'] mb-1">
              {editingBanner ? 'EDIT HOMEPAGE BANNER SLIDE' : 'CREATE NEW BANNER SLIDE'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure banner image and promotional text.
            </p>

            {/* Real-time Visual Preview Card */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Live Preview
              </label>
              <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-200">
                <img
                  src={bannerForm.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-center max-w-[70%] z-10">
                  {bannerForm.subtitle && (
                    <span className="text-slate-300 text-[10px] sm:text-xs font-black uppercase tracking-widest font-['Rajdhani'] mb-1">
                      {bannerForm.subtitle}
                    </span>
                  )}
                  {bannerForm.title && (
                    <h4 className="text-white font-black text-sm sm:text-xl font-['Chakra_Petch'] leading-tight tracking-tight uppercase drop-shadow-md">
                      {bannerForm.title}
                    </h4>
                  )}
                  {bannerForm.badge && (
                    <div className="mt-2">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider shadow-sm">
                        {bannerForm.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Banner Image URL *
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or web image link"
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 font-mono text-xs"
                  required
                />
              </div>

              {/* 1-Click HD Preset Wallpapers */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1 text-[11px]">
                  Or Pick Free Fire HD Preset Image:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { label: 'Cyber Battle', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Esports Arena', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Night Warriors', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Desert Clash', url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, imageUrl: preset.url })}
                      className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-[10px] font-bold text-slate-700 truncate"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Main Headline / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BE THE LAST ONE STANDING"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Top Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. COMPETE. SURVIVE. WIN."
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DAILY CASH CUPS"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slide Order (1, 2, 3...)</label>
                  <input
                    type="number"
                    min={1}
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="banner-active-checkbox"
                    checked={bannerForm.active}
                    onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="banner-active-checkbox" className="font-bold text-slate-800 cursor-pointer">
                    Active on Homepage
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="py-2.5 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                >
                  {editingBanner ? 'Save Changes' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================================================= */}
      {/* MODAL: TOURNAMENT SLOT INSPECTOR */}
      {/* ================================================= */}
      {slotInspectorTour && (
        <TournamentSlotInspectorModal
          adminPin={adminPin}
          tournament={slotInspectorTour}
          onClose={() => setSlotInspectorTour(null)}
          onSlotUpdated={loadAllData}
        />
      )}
    </div>
  );
};

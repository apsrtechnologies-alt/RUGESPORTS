import React, { useState, useEffect } from 'react';
import { Tournament, TournamentParticipant } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, Users, ShieldAlert, Key, CheckCircle2, 
  Copy, AlertCircle, Gamepad2, Search, ArrowLeft, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TournamentDetailModalProps {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinedSuccess: () => void;
  onOpenDeposit: () => void;
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  isOpen,
  onClose,
  onJoinedSuccess,
  onOpenDeposit,
}) => {
  const { user, openAuthModal } = useAuth();
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'slots' | 'winners'>('details');
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  // Game ID inputs
  const [ffNameInput, setFfNameInput] = useState('');
  const [ffUidInput, setFfUidInput] = useState('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  useEffect(() => {
    if (tournament && isOpen) {
      api.getTournamentDetails(tournament.id)
        .then((res) => {
          setParticipants(res.participants || []);
          // Auto select first free slot
          const takenSlots = (res.participants || []).map(p => p.slotNumber);
          for (let i = 1; i <= tournament.totalSlots; i++) {
            if (!takenSlots.includes(i)) {
              setSelectedSlot(i);
              break;
            }
          }
        })
        .catch((err) => console.error(err));

      if (user) {
        setFfNameInput(user.freeFireName || user.username || '');
        setFfUidInput(user.freeFireUid || '');
      }

      setError(null);
      setShowJoinForm(false);
      setPlayerSearchQuery('');
    }
  }, [tournament, isOpen, user]);

  if (!isOpen || !tournament) return null;

  const isUserJoined = !!(user && participants.some(p => p.userId === user.id));
  const userParticipant = user ? participants.find(p => p.userId === user.id) : null;
  const isFull = tournament.joinedCount >= tournament.totalSlots;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceedToJoin = () => {
    if (!user) {
      onClose();
      openAuthModal('login');
      return;
    }
    setShowJoinForm(true);
    setError(null);
  };

  const handleConfirmJoinMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user) {
      onClose();
      openAuthModal('login');
      return;
    }

    if (!ffUidInput.trim()) {
      setError('Please enter your Free Fire Game ID (UID).');
      return;
    }

    if (!ffNameInput.trim()) {
      setError('Please enter your Free Fire In-Game Name (IGN).');
      return;
    }

    if (user.walletBalance < tournament.entryFee) {
      setError(`Insufficient wallet balance. You have ₹${user.walletBalance}, but entry fee is ₹${tournament.entryFee}. Please add money.`);
      return;
    }

    setIsJoining(true);
    setError(null);
    try {
      await api.joinTournament(tournament.id, {
        userId: user.id,
        slotNumber: selectedSlot || undefined,
        freeFireName: ffNameInput.trim(),
        freeFireUid: ffUidInput.trim(),
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      setShowJoinForm(false);
      onJoinedSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join match.');
    } finally {
      setIsJoining(false);
    }
  };

  // Filtered players list for the Slots tab
  const filteredParticipants = participants.filter(p => {
    if (!playerSearchQuery) return true;
    const q = playerSearchQuery.toLowerCase();
    return (
      (p.freeFireName || '').toLowerCase().includes(q) ||
      (p.freeFireUid || '').toLowerCase().includes(q) ||
      (p.username || '').toLowerCase().includes(q) ||
      `slot #${p.slotNumber}`.includes(q) ||
      String(p.slotNumber) === q
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        id="tournament-detail-modal-card"
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                {tournament.gameMode}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {tournament.matchType}
              </span>
              {tournament.map && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  🗺️ {tournament.map}
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-900 font-['Rajdhani'] leading-tight">
              {tournament.title}
            </h3>
          </div>
          <button
            id="close-tournament-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs (Only when not in Join Form view) */}
        {!showJoinForm && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl my-3 border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'details' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview & Rules
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                activeTab === 'slots' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Players ({participants.length}/{tournament.totalSlots})
            </button>
            <button
              onClick={() => setActiveTab('winners')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'winners' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tournament.status === 'completed' ? '🏆 Winners' : 'Prize Pool'}
            </button>
          </div>
        )}

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">

          {/* ======================================================== */}
          {/* JOIN REGISTRATION FORM: ASKS FOR GAME ID & CONFIRMATION */}
          {/* ======================================================== */}
          {showJoinForm ? (
            <form onSubmit={handleConfirmJoinMatch} className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
                </button>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  Step 2: Enter Game ID
                </span>
              </div>

              <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-orange-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-orange-700">
                  <Gamepad2 className="w-4 h-4 text-orange-600" />
                  FREE FIRE PLAYER VERIFICATION
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Please provide your exact Free Fire Game ID (UID) and In-Game Name. Custom room invites and prize verifications are strictly linked to this ID.
                </p>
              </div>

              {/* In-Game Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Free Fire In-Game Name (IGN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAISTAR_99, RUG_KILLER"
                  value={ffNameInput}
                  onChange={(e) => setFfNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              {/* Game UID Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                  <span>Free Fire Game ID / UID (Numbers) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Found in FF Profile</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1928471920"
                  value={ffUidInput}
                  onChange={(e) => setFfUidInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              {/* Slot Selection in Join Form */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">
                    Select Your Slot: <span className="text-orange-600 font-extrabold">Slot #{selectedSlot || 'Auto'}</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {tournament.totalSlots - participants.length} slots left
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  {Array.from({ length: tournament.totalSlots }, (_, i) => i + 1).map((slotNum) => {
                    const participant = participants.find(p => p.slotNumber === slotNum);
                    const isTaken = !!participant;
                    const isSelected = selectedSlot === slotNum;

                    return (
                      <button
                        key={slotNum}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setSelectedSlot(slotNum)}
                        className={`h-8 rounded-lg text-[11px] font-bold transition flex flex-col items-center justify-center border ${
                          isTaken
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400'
                        }`}
                      >
                        <span>#{slotNum}</span>
                        <span className="text-[7px] leading-none uppercase">
                          {isTaken ? 'Full' : 'Pick'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wallet Summary Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Match Entry Fee:</span>
                  <span className="font-bold text-slate-900">₹{tournament.entryFee}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Your Wallet Balance:</span>
                  <span className={`font-bold ${user && user.walletBalance < tournament.entryFee ? 'text-red-600' : 'text-emerald-700'}`}>
                    ₹{user?.walletBalance || 0}
                  </span>
                </div>
                {user && user.walletBalance >= tournament.entryFee && (
                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                    <span>Balance After Entry:</span>
                    <span className="font-semibold text-slate-700">₹{user.walletBalance - tournament.entryFee}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{error}</span>
                    {error.includes('Insufficient') && (
                      <button
                        type="button"
                        onClick={() => { onClose(); onOpenDeposit(); }}
                        className="block mt-1 text-xs text-orange-600 font-bold underline"
                      >
                        Click here to Add Money to Wallet
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isJoining ? 'Joining Match...' : `Confirm & Pay ₹${tournament.entryFee}`}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* ROOM CREDENTIALS CARD - Visible if player has joined! */}
              {isUserJoined && (
                <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-orange-700 tracking-wider">
                      <Key className="w-4 h-4 text-orange-600 animate-pulse" />
                      CUSTOM ROOM CREDENTIALS
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300">
                      Your Slot: #{userParticipant?.slotNumber}
                    </span>
                  </div>

                  {tournament.customRoomId ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="p-2.5 bg-white rounded-lg border border-orange-200 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Room ID</span>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-slate-900 font-mono">{tournament.customRoomId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tournament.customRoomId!, 'room_id')}
                            className="p-1 text-slate-400 hover:text-orange-600"
                            title="Copy Room ID"
                          >
                            {copiedField === 'room_id' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-orange-200 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Password</span>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-orange-600 font-mono">{tournament.customRoomPassword || 'None'}</span>
                          {tournament.customRoomPassword && (
                            <button
                              type="button"
                              onClick={() => handleCopy(tournament.customRoomPassword!, 'room_pass')}
                              className="p-1 text-slate-400 hover:text-orange-600"
                              title="Copy Password"
                            >
                              {copiedField === 'room_pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-orange-800 mt-1 font-medium">
                      ⏳ Room ID & Password will be released here 15 minutes before the match start time!
                    </p>
                  )}
                </div>
              )}

              {/* TAB 1: DETAILS & RULES */}
              {activeTab === 'details' && (
                <>
                  {/* Prize Pool Summary Card */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pool</span>
                      <span className="text-base font-black text-orange-600 font-['Rajdhani']">₹{tournament.prizePool}</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Per Kill</span>
                      <span className="text-base font-black text-emerald-700 font-['Rajdhani']">
                        {tournament.perKill > 0 ? `₹${tournament.perKill}` : 'Rank Only'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Entry Fee</span>
                      <span className="text-base font-black text-slate-900 font-['Rajdhani']">
                        {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
                      </span>
                    </div>
                  </div>

                  {/* Registered In-Game Identity Check */}
                  {user && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Your Free Fire Identity</span>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Gamepad2 className="w-3.5 h-3.5 text-orange-600" /> {user.freeFireName} ({user.freeFireUid})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Wallet Balance</span>
                        <span className="text-xs font-black text-orange-600">₹{user.walletBalance}</span>
                      </div>
                    </div>
                  )}

                  {/* Match Rules & Requirements */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
                      Tournament Rules & Fair Play
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-1.5 pl-1">
                      {tournament.rules?.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-orange-500 font-bold">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* TAB 2: SLOTS & JOINED PLAYERS LIST */}
              {activeTab === 'slots' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-orange-600" />
                        Registered Players & Slots
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {participants.length} of {tournament.totalSlots} slots occupied
                      </p>
                    </div>
                    {isUserJoined && (
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                        Your Slot: #{userParticipant?.slotNumber}
                      </span>
                    )}
                  </div>

                  {/* Slots Grid Visualizer */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Room Slot Grid</span>
                      <span className="flex items-center gap-2">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500 inline-block" /> You</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-400 inline-block" /> Taken</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-400 inline-block" /> Selected</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-44 overflow-y-auto p-1">
                      {Array.from({ length: tournament.totalSlots }, (_, i) => i + 1).map((slotNum) => {
                        const participant = participants.find(p => p.slotNumber === slotNum);
                        const isTaken = !!participant;
                        const isUserSlot = user && participant?.userId === user.id;
                        const isSelected = selectedSlot === slotNum;

                        return (
                          <button
                            key={slotNum}
                            type="button"
                            disabled={isTaken || isUserJoined}
                            onClick={() => setSelectedSlot(slotNum)}
                            title={participant ? `Slot #${slotNum}: ${participant.freeFireName} (${participant.freeFireUid})` : `Slot #${slotNum}: Available`}
                            className={`h-9 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center relative border ${
                              isUserSlot
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                : isTaken
                                ? 'bg-slate-200 text-slate-600 border-slate-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 shadow-xs'
                            }`}
                          >
                            <span className="leading-none">#{slotNum}</span>
                            <span className="text-[8px] font-normal truncate max-w-[40px] leading-tight">
                              {isTaken ? (isUserSlot ? 'YOU' : 'FULL') : 'FREE'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search Participants */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search player by name, Game ID, or slot #"
                      value={playerSearchQuery}
                      onChange={(e) => setPlayerSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  {/* Registered Players List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {participants.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <Users className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">No players registered yet</p>
                        <p className="text-[11px] text-slate-500">Be the first player to pick Slot #1 and join this match!</p>
                      </div>
                    ) : filteredParticipants.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        No player found matching "{playerSearchQuery}"
                      </div>
                    ) : (
                      filteredParticipants.map((p) => {
                        const isCurrent = user && p.userId === user.id;
                        return (
                          <div 
                            key={p.id} 
                            className={`p-2.5 rounded-xl text-xs border flex items-center justify-between gap-2 transition ${
                              isCurrent 
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] shrink-0 ${
                                isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                #{p.slotNumber}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 truncate">{p.freeFireName}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  UID: {p.freeFireUid}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopy(p.freeFireUid, `uid_${p.id}`)}
                              className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-slate-200/60 transition shrink-0"
                              title="Copy Free Fire Game ID"
                            >
                              {copiedField === `uid_${p.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: WINNERS / PRIZE POOL */}
              {activeTab === 'winners' && (
                <div className="space-y-3">
                  {/* Prize pool breakdown */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
                      💰 Prize Distribution Chart
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200">
                        <span className="text-amber-700 font-bold flex items-center gap-1.5">
                          🥇 1st Place (Booyah)
                        </span>
                        <span className="font-bold text-slate-900 font-['Rajdhani'] text-sm">₹{tournament.firstPrize}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200">
                        <span className="text-slate-600 font-bold flex items-center gap-1.5">
                          🥈 2nd Place
                        </span>
                        <span className="font-bold text-slate-900 font-['Rajdhani'] text-sm">₹{tournament.secondPrize}</span>
                      </div>
                      {tournament.thirdPrize > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                          <span className="text-amber-800 font-bold flex items-center gap-1.5">
                            🥉 3rd Place
                          </span>
                          <span className="font-bold text-slate-900 font-['Rajdhani'] text-sm">₹{tournament.thirdPrize}</span>
                        </div>
                      )}
                      {tournament.perKill > 0 && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            🎯 Per Kill Bounty
                          </span>
                          <span className="font-bold text-emerald-700 font-['Rajdhani'] text-sm">₹{tournament.perKill} / kill</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Winners list if match completed */}
                  {tournament.status === 'completed' && tournament.winners && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                        🏆 Official Match Winners
                      </span>
                      {tournament.winners.map((w, i) => (
                        <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                              {w.rank || i + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{w.freeFireName}</p>
                              <p className="text-[10px] text-slate-500">UID: {w.freeFireUid} • {w.kills} Kills</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-orange-600 font-['Rajdhani']">
                            +₹{w.prizeAmount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{error}</span>
                    {error.includes('Insufficient') && (
                      <button
                        onClick={() => { onClose(); onOpenDeposit(); }}
                        className="block mt-1.5 text-xs text-orange-600 font-bold underline"
                      >
                        Click here to Add Money to Wallet
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions (Only shown when not inside the join form) */}
        {!showJoinForm && (
          <div className="pt-3 border-t border-slate-100 mt-2 shrink-0">
            {!user ? (
              <button
                id="modal-login-btn"
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/20 active:scale-98"
              >
                Sign In to Join Match (₹{tournament.entryFee})
              </button>
            ) : isUserJoined ? (
              <div className="text-center py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                You are registered in Slot #{userParticipant?.slotNumber}! Room details appear 15m before match.
              </div>
            ) : tournament.status !== 'upcoming' ? (
              <div className="text-center py-2.5 bg-slate-100 rounded-xl text-slate-500 text-xs font-bold">
                Registrations Closed for this Match
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {user.walletBalance < tournament.entryFee ? (
                  <button
                    id="modal-add-money-btn"
                    onClick={() => { onClose(); onOpenDeposit(); }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/20"
                  >
                    Add ₹{tournament.entryFee - user.walletBalance} to Wallet & Join
                  </button>
                ) : (
                  <button
                    id="modal-proceed-join-btn"
                    onClick={handleProceedToJoin}
                    disabled={isFull}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Join Tournament (Enter Game ID & Slot)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

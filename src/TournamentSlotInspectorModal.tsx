import React, { useState, useEffect } from 'react';
import { Tournament, TournamentParticipant } from '../../types';
import { api } from '../../services/api';
import { 
  Users, Search, Copy, Check, Trash2, X, RefreshCw, 
  Shield, Smartphone, Trophy, UserCheck, AlertTriangle
} from 'lucide-react';

interface TournamentSlotInspectorModalProps {
  adminPin: string;
  tournament: Tournament;
  onClose: () => void;
  onSlotUpdated: () => void;
}

export const TournamentSlotInspectorModal: React.FC<TournamentSlotInspectorModalProps> = ({
  adminPin,
  tournament,
  onClose,
  onSlotUpdated,
}) => {
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRoster, setCopiedRoster] = useState(false);
  const [deletingPartId, setDeletingPartId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadParticipants = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.admin.getTournamentParticipants(adminPin, tournament.id);
      setParticipants(data.participants || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load participant slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [tournament.id, adminPin]);

  const handleKickParticipant = async (participant: TournamentParticipant) => {
    const confirmMsg = `Remove player "${participant.freeFireName}" (@${participant.username}) from Slot #${participant.slotNumber}? ${
      tournament.entryFee > 0 ? `Their entry fee of ₹${tournament.entryFee} will be automatically refunded to their wallet.` : ''
    }`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingPartId(participant.id);
    try {
      await api.admin.removeTournamentParticipant(adminPin, tournament.id, participant.id);
      await loadParticipants();
      onSlotUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to remove participant.');
    } finally {
      setDeletingPartId(null);
    }
  };

  // Build full slots array from 1 to totalSlots
  const totalSlots = tournament.totalSlots || 48;
  const participantBySlotMap = new Map<number, TournamentParticipant>();
  participants.forEach(p => {
    participantBySlotMap.set(p.slotNumber, p);
  });

  // Filter slots based on search query
  const query = searchQuery.trim().toLowerCase();

  // Copy Room Slot Roster to clipboard
  const handleCopyRoster = () => {
    const lines = [
      `=== ${tournament.title.toUpperCase()} ROSTER ===`,
      `Mode: ${tournament.gameMode} | Map: ${tournament.map}`,
      `Match Time: ${new Date(tournament.matchTime).toLocaleString()}`,
      `Total Players Joined: ${participants.length}/${totalSlots}`,
      '----------------------------------------',
    ];

    for (let slot = 1; slot <= totalSlots; slot++) {
      const p = participantBySlotMap.get(slot);
      if (p) {
        lines.push(`Slot #${slot}: ${p.freeFireName} (UID: ${p.freeFireUid}) [@${p.username}]`);
      } else {
        lines.push(`Slot #${slot}: [EMPTY]`);
      }
    }

    lines.push('----------------------------------------');
    lines.push('RUG ESPORTS • Official Tournament Arena');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedRoster(true);
    setTimeout(() => setCopiedRoster(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wide">
                Slot & Seat Manager
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {tournament.gameMode} • {tournament.map}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-['Rajdhani'] tracking-wide">
              {tournament.title}
            </h3>
            <p className="text-xs text-slate-300">
              Assigned seats and live participant bookings for this custom room match.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-2xl transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUMMARY STATS & ACTION TOOLBAR */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-2 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500 font-medium block text-[10px]">OCCUPIED SEATS</span>
              <strong className="text-slate-900 text-sm font-black font-['Rajdhani']">
                {participants.length} / {totalSlots}
              </strong>
            </div>

            <div className="px-3.5 py-2 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500 font-medium block text-[10px]">TOTAL PRIZE</span>
              <strong className="text-orange-600 text-sm font-black font-['Rajdhani']">
                ₹{tournament.prizePool}
              </strong>
            </div>

            <div className="px-3.5 py-2 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500 font-medium block text-[10px]">ENTRY FEE</span>
              <strong className="text-slate-900 text-sm font-black font-['Rajdhani']">
                {tournament.entryFee > 0 ? `₹${tournament.entryFee}` : 'FREE'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search slot, IGN, UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={handleCopyRoster}
              className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs active:scale-98 shrink-0"
              title="Copy Room Slot Roster for Custom Room admin"
            >
              {copiedRoster ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedRoster ? 'Copied!' : 'Copy Roster'}</span>
            </button>

            <button
              onClick={loadParticipants}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
              title="Refresh Slots"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* SLOTS LIST & SEAT MATRIX BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span>Loading registered player slot assignments...</span>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* SLOTS VISUAL GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: totalSlots }, (_, i) => i + 1).map((slotNum) => {
                  const p = participantBySlotMap.get(slotNum);
                  
                  // Filter out if searching
                  if (query) {
                    if (!p) return null;
                    const matchesName = p.freeFireName.toLowerCase().includes(query);
                    const matchesUser = p.username.toLowerCase().includes(query);
                    const matchesUid = p.freeFireUid.toLowerCase().includes(query);
                    const matchesSlot = String(slotNum).includes(query);
                    if (!matchesName && !matchesUser && !matchesUid && !matchesSlot) {
                      return null;
                    }
                  }

                  const isOccupied = !!p;

                  return (
                    <div
                      key={slotNum}
                      className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between gap-2 ${
                        isOccupied 
                          ? 'bg-white border-slate-300/90 shadow-2xs hover:border-orange-400' 
                          : 'bg-slate-50/70 border-dashed border-slate-200'
                      }`}
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-xl font-black font-['Rajdhani'] text-xs flex items-center justify-center shrink-0 ${
                            isOccupied 
                              ? 'bg-orange-500 text-white shadow-2xs shadow-orange-500/30' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            #{slotNum}
                          </span>
                          <span className={`text-[11px] font-bold ${isOccupied ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {isOccupied ? 'JOINED / OCCUPIED' : 'OPEN / EMPTY'}
                          </span>
                        </div>

                        {isOccupied && p && (
                          <button
                            onClick={() => handleKickParticipant(p)}
                            disabled={deletingPartId === p.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove and Refund Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Participant Details or Empty Placeholder */}
                      {isOccupied && p ? (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]" title={p.freeFireName}>
                              {p.freeFireName}
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              @{p.username}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-400">UID:</span>
                              <strong className="text-slate-800 font-bold">{p.freeFireUid}</strong>
                            </div>
                            {p.phone && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Phone:</span>
                                <span>{p.phone}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>Joined:</span>
                              <span>{new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 text-center text-slate-400 text-xs">
                          Seat is open for player booking
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            Clicking <strong>Remove & Refund</strong> automatically returns the entry fee back to the player's wallet balance.
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
          >
            Close Seat Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

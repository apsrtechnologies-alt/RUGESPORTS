import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Tournament, TournamentParticipant } from '../types';
import { 
  Swords, Key, Copy, CheckCircle2, Clock, Trophy, 
  MapPin, ShieldAlert, Users, Sparkles, RefreshCw 
} from 'lucide-react';

interface JoinedMatchesViewProps {
  onBrowseMatches: () => void;
  onViewTournamentDetails: (tournament: Tournament) => void;
}

export const JoinedMatchesView: React.FC<JoinedMatchesViewProps> = ({
  onBrowseMatches,
  onViewTournamentDetails,
}) => {
  const { user, openAuthModal } = useAuth();
  const [joinedMatches, setJoinedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);

  const loadJoinedMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const matches = await api.getJoinedTournaments(user.id);
      setJoinedMatches(matches);
    } catch (err) {
      console.error('Failed to load joined matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJoinedMatches();
  }, [user]);

  const handleCopy = (text: string, type: 'id' | 'pass', id: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedPass(id);
      setTimeout(() => setCopiedPass(null), 2000);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
          <Swords className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-['Rajdhani']">Sign In to View Your Matches</h3>
        <p className="text-xs text-slate-600 max-w-xs mx-auto">
          Access your registered Free Fire custom rooms, room credentials, and match statistics.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm shadow-md shadow-orange-500/20 active:scale-95"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const activeMatches = joinedMatches.filter(m => m.status === 'upcoming' || m.status === 'ongoing');
  const completedMatches = joinedMatches.filter(m => m.status === 'completed');
  const displayList = filter === 'active' ? activeMatches : completedMatches;

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header filter & refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            id="tab-my-active-matches"
            onClick={() => setFilter('active')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              filter === 'active'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming & Live ({activeMatches.length})
          </button>
          <button
            id="tab-my-past-matches"
            onClick={() => setFilter('completed')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              filter === 'completed'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Finished ({completedMatches.length})
          </button>
        </div>

        <button
          onClick={loadJoinedMatches}
          className="p-2 text-slate-600 hover:text-orange-600 bg-white border border-slate-200 rounded-xl transition shadow-xs"
          title="Refresh Match Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500">Loading your matches...</div>
      ) : displayList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <p className="text-sm font-bold text-slate-900">
            {filter === 'active' ? 'No Upcoming Free Fire Matches' : 'No Completed Matches Yet'}
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {filter === 'active'
              ? 'Join daily Free Fire matches with high prize pools and per-kill cash!'
              : 'Matches you finish will show your ranks, kills, and prize payouts here.'}
          </p>
          <button
            onClick={onBrowseMatches}
            className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20"
          >
            Explore Free Fire Matches
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((tournament) => {
            const part = tournament.participantDetails as TournamentParticipant;
            const matchDate = new Date(tournament.matchTime);
            const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const dateStr = matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={tournament.id}
                id={`joined-match-${tournament.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs relative overflow-hidden"
              >
                {/* Header Tag row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                      {tournament.gameMode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Your Slot #{part?.slotNumber}
                    </span>
                  </div>

                  {tournament.status === 'ongoing' && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                      🔴 LIVE ROOM
                    </span>
                  )}
                  {tournament.status === 'upcoming' && (
                    <span className="text-[10px] font-bold text-orange-600">
                      ⏳ {dateStr} at {timeStr}
                    </span>
                  )}
                  {tournament.status === 'completed' && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Finished
                    </span>
                  )}
                </div>

                {/* Match Title */}
                <div>
                  <h4 
                    onClick={() => onViewTournamentDetails(tournament)}
                    className="font-bold text-slate-900 text-base font-['Rajdhani'] hover:text-orange-600 cursor-pointer transition"
                  >
                    {tournament.title}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Playing as: <span className="text-orange-600 font-bold">{part?.freeFireName}</span> (UID: {part?.freeFireUid})
                  </p>
                </div>

                {/* Custom Room Credentials Card */}
                {tournament.customRoomId ? (
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-orange-950 flex items-center gap-1.5 tracking-wider">
                        <Key className="w-3.5 h-3.5 text-orange-600" />
                        ROOM CREDENTIALS (READY)
                      </span>
                      <span className="text-[10px] text-orange-800 font-medium">Open Free Fire App & Enter</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white rounded-lg border border-orange-200 flex items-center justify-between shadow-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Room ID</span>
                          <span className="text-sm font-black text-slate-900 font-mono">{tournament.customRoomId}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(tournament.customRoomId!, 'id', tournament.id)}
                          className="p-1 text-slate-400 hover:text-orange-600"
                          title="Copy Room ID"
                        >
                          {copiedId === tournament.id ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="p-2 bg-white rounded-lg border border-orange-200 flex items-center justify-between shadow-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Password</span>
                          <span className="text-sm font-black text-orange-600 font-mono">
                            {tournament.customRoomPassword || 'None'}
                          </span>
                        </div>
                        {tournament.customRoomPassword && (
                          <button
                            onClick={() => handleCopy(tournament.customRoomPassword!, 'pass', tournament.id)}
                            className="p-1 text-slate-400 hover:text-orange-600"
                            title="Copy Password"
                          >
                            {copiedPass === tournament.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : tournament.status !== 'completed' ? (
                  <div className="p-2.5 bg-orange-50/70 rounded-xl border border-orange-200 text-xs text-orange-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Room ID & Password will be released 15 minutes before the match start time!</span>
                  </div>
                ) : null}

                {/* Match Result if completed */}
                {tournament.status === 'completed' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Your Result</span>
                      <span className="text-xs font-bold text-slate-900">
                        {part?.rank ? `Rank #${part.rank}` : 'Participated'} • {part?.kills || 0} Kills
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Winnings</span>
                      <span className="text-sm font-black text-emerald-600 font-['Rajdhani']">
                        {part?.prizeWon ? `+₹${part.prizeWon}` : '₹0'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onViewTournamentDetails(tournament)}
                    className="text-xs text-orange-600 hover:underline font-bold"
                  >
                    View Match Rules & Full Slots
                  </button>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Prize Pool: <strong className="text-slate-900 font-bold">₹{tournament.prizePool}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

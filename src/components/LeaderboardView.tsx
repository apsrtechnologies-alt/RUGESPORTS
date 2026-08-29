import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Crown, Trophy, Swords, Flame, Sparkles, RefreshCw } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaders(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-slate-950 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded text-black">
            ARENA HALL OF FAME
          </span>
          <h3 className="text-2xl font-black font-['Rajdhani'] leading-tight mt-0.5 text-black">
            TOP EARNERS & KILLERS
          </h3>
          <p className="text-xs font-semibold text-slate-900">Highest Cash Winnings in Free Fire Arena</p>
        </div>
        <Crown className="w-12 h-12 text-black/80 shrink-0" />
      </div>

      {/* Top 3 Podium Cards */}
      {leaders.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end">
          {/* #2 Silver */}
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-2.5 text-center shadow-md order-1">
            <span className="w-6 h-6 rounded-full bg-slate-400 text-slate-950 font-black text-xs inline-flex items-center justify-center mb-1">
              2
            </span>
            <p className="text-xs font-bold text-white truncate">{leaders[1]?.freeFireName}</p>
            <span className="text-xs font-black text-amber-400 font-['Rajdhani'] block">
              ₹{leaders[1]?.totalWinnings}
            </span>
            <span className="text-[9px] text-slate-400">{leaders[1]?.totalKills} Kills</span>
          </div>

          {/* #1 Gold */}
          <div className="bg-gradient-to-b from-amber-950/60 to-[#0f172a] border-2 border-amber-500 rounded-2xl p-3 text-center shadow-xl order-2 relative -mt-3">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 rounded-full p-1 shadow-md">
              <Crown className="w-4 h-4" />
            </div>
            <p className="text-xs font-black text-amber-300 truncate mt-1">{leaders[0]?.freeFireName}</p>
            <span className="text-sm font-black text-white font-['Rajdhani'] block">
              ₹{leaders[0]?.totalWinnings}
            </span>
            <span className="text-[10px] text-amber-400/90 font-bold">{leaders[0]?.totalKills} Kills</span>
          </div>

          {/* #3 Bronze */}
          <div className="bg-[#0f172a] border border-amber-900/60 rounded-2xl p-2.5 text-center shadow-md order-3">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs inline-flex items-center justify-center mb-1">
              3
            </span>
            <p className="text-xs font-bold text-white truncate">{leaders[2]?.freeFireName}</p>
            <span className="text-xs font-black text-amber-400 font-['Rajdhani'] block">
              ₹{leaders[2]?.totalWinnings}
            </span>
            <span className="text-[9px] text-slate-400">{leaders[2]?.totalKills} Kills</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
          <span>Rank & Player</span>
          <span>Winnings</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Loading rankings...</div>
        ) : (
          <div className="space-y-1.5">
            {leaders.map((player, index) => (
              <div
                key={player.id}
                id={`leaderboard-row-${player.id}`}
                className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      index === 0
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : index === 1
                        ? 'bg-slate-400 text-slate-950'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{player.freeFireName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      @{player.username} • {player.totalKills || 0} Kills • {player.matchesPlayed || 0} Matches
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-amber-400 font-['Rajdhani']">
                    ₹{player.totalWinnings || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

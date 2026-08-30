import React from 'react';
import { Tournament } from '../types';
import { ChevronRight, Flame, Trophy, CheckCircle2, Clock, Swords } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  isJoined?: boolean;
  onJoinClick: (tournament: Tournament) => void;
  onViewDetails: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  isJoined = false,
  onJoinClick,
  onViewDetails,
}) => {
  const matchDate = new Date(tournament.matchTime);
  const isFull = tournament.joinedCount >= tournament.totalSlots;
  const progressPercent = Math.min(100, Math.round((tournament.joinedCount / tournament.totalSlots) * 100));

  // Determine badge tag (HOT / POPULAR / NEW / LIVE)
  const getBadgeTag = () => {
    if (tournament.status === 'ongoing') return { text: 'LIVE', color: 'bg-emerald-600 text-white' };
    if (tournament.tags?.includes('HOT') || tournament.prizePool >= 1000) return { text: 'HOT', color: 'bg-red-500 text-white' };
    if (tournament.tags?.includes('POPULAR') || tournament.entryFee >= 25) return { text: 'POPULAR', color: 'bg-indigo-600 text-white' };
    if (tournament.tags?.includes('NEW') || tournament.joinedCount <= 5) return { text: 'NEW', color: 'bg-emerald-500 text-white' };
    return { text: tournament.gameMode.toUpperCase(), color: 'bg-slate-900 text-white' };
  };

  const badge = getBadgeTag();

  // Match poster default based on game mode
  const defaultPoster = tournament.bannerUrl || (
    tournament.gameMode.includes('Clash Squad') 
      ? 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80'
      : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80'
  );

  return (
    <div
      id={`tournament-card-${tournament.id}`}
      onClick={() => onViewDetails(tournament)}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-3 flex gap-3.5 items-center cursor-pointer group relative overflow-hidden"
    >
      {/* Left Column: Game Poster with Badges */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
        <img
          src={defaultPoster}
          alt={tournament.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Gradient dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Left Tag Badge (HOT / POPULAR / NEW) */}
        <div className="absolute top-1.5 left-1.5">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm ${badge.color}`}>
            {badge.text}
          </span>
        </div>

        {/* Bottom Mode Text Overlay */}
        <div className="absolute bottom-1.5 inset-x-1.5 text-center">
          <div className="bg-black/75 backdrop-blur-xs border border-white/10 rounded-md py-0.5 px-1 shadow-sm">
            <span className="text-[10px] font-black text-white uppercase tracking-wider font-['Chakra_Petch'] leading-tight block truncate">
              {tournament.matchType === 'Battle Royale' ? 'BATTLE ROYALE' : 'CLASH SQUAD'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Match Details & Actions */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        {/* Title & Chevron */}
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base font-['Rajdhani'] leading-tight truncate group-hover:text-indigo-600 transition">
              {tournament.title}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {tournament.matchType} • {tournament.gameMode} {tournament.map ? `• ${tournament.map}` : ''}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition shrink-0 mt-0.5" />
        </div>

        {/* Prize Pool & Entry Fee Matrix */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              Prize Pool
            </span>
            <span className="text-sm sm:text-base font-black text-indigo-600 font-['Rajdhani'] leading-none">
              ₹{tournament.prizePool.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              Entry Fee
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-600 font-['Rajdhani'] leading-none">
              {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
            </span>
          </div>
        </div>

        {/* Progress Bar & Join CTA Button */}
        <div className="space-y-1.5">
          {/* Progress fill bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10px] font-bold text-slate-500">
              {tournament.joinedCount} / {tournament.totalSlots} Seats Filled
            </span>

            {/* Action CTA */}
            {isJoined ? (
              <button
                type="button"
                id={`btn-joined-${tournament.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(tournament);
                }}
                className="py-1 px-3 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs"
              >
                <CheckCircle2 className="w-3 h-3" /> Joined
              </button>
            ) : tournament.status === 'completed' ? (
              <button
                type="button"
                id={`btn-result-${tournament.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(tournament);
                }}
                className="py-1 px-3 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-200 transition"
              >
                Results
              </button>
            ) : (
              <button
                type="button"
                id={`btn-join-match-${tournament.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinClick(tournament);
                }}
                disabled={isFull}
                className={`py-1 px-4 text-[11px] font-black rounded-lg transition shadow-xs active:scale-95 uppercase tracking-wider ${
                  isFull
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                }`}
              >
                {isFull ? 'Full' : 'Join'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

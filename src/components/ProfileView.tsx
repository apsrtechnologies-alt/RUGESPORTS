import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaymentSettings } from '../types';
import { 
  User, Gamepad2, Trophy, Swords, ShieldCheck, MessageCircle, 
  Send, LogOut, Edit2, Check, X, Flame, AlertTriangle, ExternalLink, HelpCircle 
} from 'lucide-react';

interface ProfileViewProps {
  publicSettings?: Omit<PaymentSettings, 'adminSecretPin'> | null;
  onOpenWallet: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  publicSettings,
  onOpenWallet,
}) => {
  const { user, logout, updateProfile, openAuthModal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [freeFireName, setFreeFireName] = useState(user?.freeFireName || '');
  const [freeFireUid, setFreeFireUid] = useState(user?.freeFireUid || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showFairPlayModal, setShowFairPlayModal] = useState(false);

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-['Rajdhani']">Sign In to Your Player Profile</h3>
        <p className="text-xs text-slate-600 max-w-xs mx-auto">
          Manage your Free Fire in-game credentials, track match history and tournament payouts.
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

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        freeFireName: freeFireName.trim(),
        freeFireUid: freeFireUid.trim(),
        phone: phone.trim(),
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const winRate = user.matchesPlayed > 0 ? Math.round(((user.totalWinnings > 0 ? 1 : 0) / user.matchesPlayed) * 100) : 0;
  const kdRatio = user.matchesPlayed > 0 ? (user.totalKills / user.matchesPlayed).toFixed(1) : '0.0';

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Player ID Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-0.5 shadow-md shadow-orange-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg text-slate-900 font-['Rajdhani']">{user.freeFireName}</h3>
                <span className="text-[9px] bg-orange-50 text-orange-700 font-bold px-1.5 py-0.2 rounded border border-orange-200">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">UID: {user.freeFireUid}</p>
              <p className="text-[11px] text-slate-400">@{user.username}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setFreeFireName(user.freeFireName);
              setFreeFireUid(user.freeFireUid);
              setPhone(user.phone);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
            title="Edit Game Info"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Inline Profile Editor */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Free Fire In-Game Name (IGN)
              </label>
              <input
                type="text"
                value={freeFireName}
                onChange={(e) => setFreeFireName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Free Fire UID (Player ID)
              </label>
              <input
                type="text"
                value={freeFireUid}
                onChange={(e) => setFreeFireUid(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-orange-500"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" /> Save In-Game Details
            </button>
          </div>
        )}

        {saveSuccess && (
          <div className="mt-2 text-center text-xs text-emerald-600 font-bold">
            ✓ In-Game details updated successfully!
          </div>
        )}
      </div>

      {/* Arena Career Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-orange-600" />
          RAG | ESPORTS Career Stats
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Matches Played</span>
            <span className="text-xl font-black text-slate-900 font-['Rajdhani']">{user.matchesPlayed || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Kills</span>
            <span className="text-xl font-black text-orange-600 font-['Rajdhani']">{user.totalKills || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Winnings</span>
            <span className="text-xl font-black text-emerald-600 font-['Rajdhani']">₹{user.totalWinnings || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">K/D Ratio</span>
            <span className="text-xl font-black text-slate-900 font-['Rajdhani']">{kdRatio}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="space-y-2">
        {/* Fair Play Rules Button */}
        <button
          id="btn-fair-play-rules"
          onClick={() => setShowFairPlayModal(true)}
          className="w-full p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-left transition shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Fair Play & Anti-Cheat Policy</p>
              <p className="text-[10px] text-slate-500">Emulators, hacks, teaming rules</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </button>

        {/* WhatsApp Support Link */}
        {publicSettings?.supportWhatsapp && (
          <a
            id="link-whatsapp-support"
            href={`https://wa.me/${publicSettings.supportWhatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Admin,%20I%20need%20help%20with%20RAG%20ESPORTS`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-left transition shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">WhatsApp Customer Support</p>
                <p className="text-[10px] text-slate-500">{publicSettings.supportWhatsapp} (24/7 Match Help)</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        )}

        {/* Telegram Community */}
        {publicSettings?.supportTelegram && (
          <a
            id="link-telegram-support"
            href={publicSettings.supportTelegram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-left transition shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Official Telegram Community</p>
                <p className="text-[10px] text-slate-500">Match alerts, custom room updates & giveaways</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        )}

        {/* Logout Button */}
        <button
          id="btn-logout"
          onClick={logout}
          className="w-full p-3.5 bg-red-50 hover:bg-red-100/70 rounded-2xl border border-red-200 flex items-center justify-between text-left transition text-red-600 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-700">Sign Out Account</p>
              <p className="text-[10px] text-red-500">Logged in as {user.username}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Fair Play Policy Modal */}
      {showFairPlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowFairPlayModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-6 h-6 text-orange-600" />
              <h3 className="font-bold text-lg text-slate-900 font-['Rajdhani']">FAIR PLAY & RULES</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-orange-600 mb-1">1. Device & Emulator Restriction</h5>
                <p className="text-slate-600">Only genuine Android & iOS smartphone players are allowed. PC / Bluestacks / LDPlayer emulators are strictly banned.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-orange-600 mb-1">2. Anti-Teaming & Scripts</h5>
                <p className="text-slate-600">Teaming up with enemies in Solo/Duo matches, using auto-aim, recoil scripts, or antenna hacks will result in permanent ban and forfeiture of all wallet balance.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-orange-600 mb-1">3. Custom Room Slot Discipline</h5>
                <p className="text-slate-600">Players must join their exact allotted slot number in the Free Fire custom room. Joining other player slots will result in kick without refund.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-orange-600 mb-1">4. Screenshots for Dispute</h5>
                <p className="text-slate-600">Always record gameplay or take screenshot of the final kill/Booyah screen. In case of any kill dispute, submit to admin on WhatsApp within 15 minutes of match completion.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

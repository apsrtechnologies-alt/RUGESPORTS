import React, { useState } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, KeyRound, X, AlertCircle } from 'lucide-react';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter the Admin Secret PIN.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const res = await api.admin.verifyPin(pin.trim());
      if (res.success) {
        onSuccess(pin.trim());
        setPin('');
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect Admin PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 font-['Rajdhani']">ADMIN ACCESS</h3>
            <p className="text-[10px] text-slate-500 font-medium">RAG | ESPORTS Master Panel</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter Admin Secret PIN
            </label>
            <input
              id="admin-pin-input"
              type="password"
              placeholder="e.g. 7788"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-center text-lg tracking-widest text-slate-900 font-mono outline-none"
              autoFocus
              required
            />
            <p className="text-[10px] text-slate-500 text-center mt-1">Default PIN: 7788 (Editable in settings)</p>
          </div>

          <button
            id="admin-pin-submit-btn"
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 disabled:opacity-50 active:scale-95 transition"
          >
            {isVerifying ? 'Verifying...' : 'Unlock Admin Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WalletTransaction, PaymentSettings } from '../types';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, Copy, CheckCircle2, 
  Upload, QrCode, Building2, AlertCircle, Clock, ShieldCheck, 
  RefreshCw, FileText, ChevronRight, X, Image as ImageIcon 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletViewProps {
  publicSettings?: Omit<PaymentSettings, 'adminSecretPin'> | null;
  initialOpenDeposit?: boolean;
}

export const WalletView: React.FC<WalletViewProps> = ({
  publicSettings,
  initialOpenDeposit = false,
}) => {
  const { user, refreshUser, openAuthModal } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showDepositModal, setShowDepositModal] = useState(initialOpenDeposit);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'QR Code' | 'Bank Transfer'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer' | 'Paytm'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [paytmNumber, setPaytmNumber] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const minDeposit = publicSettings?.minDeposit || 10;
  const minWithdrawal = publicSettings?.minWithdrawal || 50;

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const txs = await api.getTransactions(user.id);
      setTransactions(txs);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  // Handle Screenshot file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setDepositError('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setDepositError('Image size must be under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
      setDepositError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyUpi = () => {
    if (!publicSettings?.upiId) return;
    navigator.clipboard.writeText(publicSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyBank = () => {
    if (!publicSettings?.accountNumber) return;
    const text = `A/C: ${publicSettings.accountNumber}\nIFSC: ${publicSettings.ifsc}\nName: ${publicSettings.accountHolder}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!transactionId.trim()) {
      setDepositError('Please enter the 12-digit UPI Reference / UTR / Transaction ID.');
      return;
    }

    if (depositAmount < minDeposit) {
      setDepositError(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }

    setDepositSubmitting(true);
    setDepositError(null);
    try {
      const res = await api.submitDeposit({
        userId: user.id,
        amount: depositAmount,
        paymentMethod,
        transactionId: transactionId.trim(),
        screenshotUrl: screenshotBase64,
      });

      setDepositSuccessMsg(res.message);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTransactionId('');
      setScreenshotBase64('');
      refreshUser();
      loadTransactions();
      setTimeout(() => {
        setDepositSuccessMsg(null);
        setShowDepositModal(false);
      }, 3000);
    } catch (err: any) {
      setDepositError(err.message || 'Failed to submit deposit request.');
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (withdrawAmount < minWithdrawal) {
      setWithdrawError(`Minimum withdrawal amount is ₹${minWithdrawal}`);
      return;
    }

    if (user.walletBalance < withdrawAmount) {
      setWithdrawError(`Insufficient wallet balance. You have ₹${user.walletBalance}`);
      return;
    }

    if (payoutMethod === 'UPI' && !upiId.trim()) {
      setWithdrawError('Please enter your UPI ID (e.g. mobile@okhdfcbank)');
      return;
    }

    if (payoutMethod === 'Bank Transfer' && (!accountNumber.trim() || !ifsc.trim() || !accountHolderName.trim())) {
      setWithdrawError('Please fill in complete bank account details.');
      return;
    }

    if (payoutMethod === 'Paytm' && !paytmNumber.trim()) {
      setWithdrawError('Please enter your Paytm mobile number.');
      return;
    }

    setWithdrawSubmitting(true);
    setWithdrawError(null);
    try {
      const res = await api.submitWithdrawal({
        userId: user.id,
        amount: withdrawAmount,
        payoutMethod,
        upiId: upiId.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim(),
        accountHolderName: accountHolderName.trim(),
        paytmNumber: paytmNumber.trim(),
      });

      setWithdrawSuccessMsg(res.message);
      refreshUser();
      loadTransactions();
      setTimeout(() => {
        setWithdrawSuccessMsg(null);
        setShowWithdrawModal(false);
      }, 3000);
    } catch (err: any) {
      setWithdrawError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-['Rajdhani']">Sign In to Access Wallet</h3>
        <p className="text-xs text-slate-600 max-w-xs mx-auto">
          Add money via UPI or QR code, join cash tournaments, and withdraw instant winnings directly to your bank account.
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

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 border border-slate-700 shadow-lg text-white">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              Available Balance
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-amber-400">₹</span>
              <span className="text-4xl font-black text-white font-['Rajdhani'] tracking-tight">
                {user.walletBalance.toFixed(0)}
              </span>
              <span className="text-xs text-slate-300 font-medium ml-1">INR</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300 block">
              Total Winnings
            </span>
            <span className="text-lg font-black text-emerald-400 font-['Rajdhani']">
              ₹{user.totalWinnings || 0}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            id="wallet-add-money-btn"
            onClick={() => { setShowDepositModal(true); setDepositError(null); }}
            className="py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition active:scale-[0.98]"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            Add Money (Deposit)
          </button>

          <button
            id="wallet-withdraw-btn"
            onClick={() => { setShowWithdrawModal(true); setWithdrawError(null); }}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-600 shadow-sm transition active:scale-[0.98]"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5] text-amber-400" />
            Withdraw Money
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 pt-2.5 border-t border-slate-700/80">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Manual Bank Verification & Zero Fees
          </span>
          <button
            onClick={() => { refreshUser(); loadTransactions(); }}
            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Manual Deposit Info banner */}
      <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-950 flex items-start gap-2.5 shadow-xs">
        <QrCode className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-orange-900">How Deposit Works:</p>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Pay via UPI QR / PhonePe / GPay / Paytm to Admin UPI, enter your 12-digit UTR transaction number, and upload screenshot. Admin verifies the credit and adds balance to your wallet within 5-15 mins!
          </p>
        </div>
      </div>

      {/* Transaction History / Passbook */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            Passbook / Transaction History
          </h4>
          <span className="text-[11px] text-slate-500 font-semibold">{transactions.length} Records</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading passbook records...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500">No transactions recorded yet.</p>
            <button
              onClick={() => setShowDepositModal(true)}
              className="mt-2 text-xs text-orange-600 font-bold hover:underline"
            >
              Add Money to join your first Free Fire match!
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'prize_won' || tx.type === 'refund';
              const dateStr = new Date(tx.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  id={`tx-row-${tx.id}`}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'prize_won'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : isCredit
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {tx.type === 'prize_won' ? (
                        '🏆'
                      ) : isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500">{dateStr}</span>
                        {tx.status === 'pending' && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                            Verifying Bank
                          </span>
                        )}
                        {tx.status === 'completed' && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                            Success
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded font-bold border border-red-200">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black font-['Rajdhani'] ${
                        isCredit ? 'text-emerald-600' : 'text-slate-700'
                      }`}
                    >
                      {isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* MANUAL DEPOSIT MODAL */}
      {/* ================================================= */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div 
            id="deposit-modal-card"
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-900"
          >
            <button
              id="close-deposit-modal-btn"
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 font-['Rajdhani']">ADD MONEY TO WALLET</h3>
                <p className="text-[11px] text-orange-600 font-semibold">Scan QR / UPI Pay & Submit Reference</p>
              </div>
            </div>

            {depositSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Deposit Request Submitted!</h4>
                <p className="text-xs text-emerald-700 font-medium">{depositSuccessMsg}</p>
                <p className="text-[11px] text-slate-500">Admin will verify and credit your wallet shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-3.5">
                {/* Amount selection pills */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Deposit Amount (Min ₹{minDeposit})
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[20, 50, 100, 200].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                          depositAmount === amt
                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      id="deposit-amount-input"
                      type="number"
                      min={minDeposit}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 font-bold outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Step 1: Admin Payment Details & QR Code */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-center">
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
                    Step 1: Pay ₹{depositAmount} to Admin QR / UPI
                  </span>

                  {/* QR Code display */}
                  <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-slate-200">
                    <img
                      src={
                        publicSettings?.qrCodeUrl ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${publicSettings?.upiId || 'ragesports@upi'}%26pn=RAG%20ESPORTS%26am=${depositAmount}%26cu=INR`
                      }
                      alt="UPI QR Code"
                      className="w-36 h-36 object-contain mx-auto"
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium">Scan using PhonePe, GPay, Paytm, or BHIM UPI</p>

                  {/* UPI ID copy field */}
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="text-left">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Admin UPI ID</span>
                      <span className="font-mono text-slate-900 font-bold text-xs">{publicSettings?.upiId || 'ragesports@upi'}</span>
                    </div>
                    <button
                      id="copy-upi-btn"
                      type="button"
                      onClick={handleCopyUpi}
                      className="py-1 px-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md text-[11px] flex items-center gap-1 transition"
                    >
                      {copiedUpi ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUpi ? 'Copied' : 'Copy UPI'}
                    </button>
                  </div>

                  {/* Bank Details Dropdown / View */}
                  {publicSettings?.accountNumber && (
                    <div className="text-left p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-orange-600" /> Bank Transfer Details
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyBank}
                          className="text-orange-600 text-[10px] font-bold hover:underline"
                        >
                          {copiedBank ? 'Copied' : 'Copy Bank Info'}
                        </button>
                      </div>
                      <p className="text-slate-600 font-mono">
                        Bank: {publicSettings.bankName} | A/C: {publicSettings.accountNumber} | IFSC: {publicSettings.ifsc}
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 2: Enter Transaction ID / UTR */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Step 2: Enter 12-Digit UTR / Transaction Ref No. *
                  </label>
                  <input
                    id="deposit-utr-input"
                    type="text"
                    placeholder="e.g. 409281729384 or Ref Number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono placeholder:text-slate-400 outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Found in your payment receipt on GPay / PhonePe / Paytm.
                  </p>
                </div>

                {/* Step 3: Upload Screenshot (Optional but recommended) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Step 3: Upload Payment Screenshot (Optional)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {screenshotBase64 ? (
                    <div className="relative p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={screenshotBase64} alt="Screenshot" className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Screenshot Attached
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setScreenshotBase64('')}
                        className="text-xs text-red-600 hover:text-red-700 p-1 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      id="upload-screenshot-btn"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-orange-500 rounded-xl text-xs text-slate-700 font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Upload className="w-4 h-4 text-orange-600" />
                      Attach Payment Screenshot / Receipt
                    </button>
                  )}
                </div>

                {depositError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{depositError}</span>
                  </div>
                )}

                <button
                  id="submit-deposit-btn"
                  type="submit"
                  disabled={depositSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50"
                >
                  {depositSubmitting ? 'Submitting for Admin Verification...' : `Submit Deposit (₹${depositAmount})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MANUAL WITHDRAWAL MODAL */}
      {/* ================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div 
            id="withdrawal-modal-card"
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-900"
          >
            <button
              id="close-withdraw-modal-btn"
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 font-['Rajdhani']">WITHDRAW WINNINGS</h3>
                <p className="text-[11px] text-slate-500">Transfer to your UPI / Bank Account</p>
              </div>
            </div>

            {withdrawSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Withdrawal Request Submitted!</h4>
                <p className="text-xs text-emerald-700 font-medium">{withdrawSuccessMsg}</p>
                <p className="text-[11px] text-slate-500">Admin will process the payout to your account shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
                {/* Current Balance Banner */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Withdrawable Balance</span>
                  <span className="text-base font-black text-orange-600 font-['Rajdhani']">₹{user.walletBalance}</span>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Withdrawal Amount (Min ₹{minWithdrawal}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      id="withdraw-amount-input"
                      type="number"
                      min={minWithdrawal}
                      max={user.walletBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 font-bold outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Payout method tabs */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Payout Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['UPI', 'Bank Transfer', 'Paytm'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayoutMethod(method)}
                        className={`py-2 rounded-lg text-xs font-bold transition border ${
                          payoutMethod === method
                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields based on method */}
                {payoutMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Your UPI ID (VPA) *
                    </label>
                    <input
                      id="withdraw-upi-input"
                      type="text"
                      placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none"
                      required
                    />
                  </div>
                )}

                {payoutMethod === 'Bank Transfer' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="As per bank passbook"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Bank Account Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. 91880012345678"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">IFSC Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono uppercase outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {payoutMethod === 'Paytm' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Paytm Wallet Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit registered Paytm number"
                      value={paytmNumber}
                      onChange={(e) => setPaytmNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none"
                      required
                    />
                  </div>
                )}

                {withdrawError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <button
                  id="submit-withdraw-btn"
                  type="submit"
                  disabled={withdrawSubmitting || user.walletBalance < withdrawAmount}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50"
                >
                  {withdrawSubmitting ? 'Submitting Request...' : `Withdraw ₹${withdrawAmount}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

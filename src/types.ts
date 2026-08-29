export type GameMode = 'Solo' | 'Duo' | 'Squad' | 'Clash Squad (4v4)' | '1v1 Custom' | '2v2 Custom';
export type FFMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra';
export type MatchType = 'Battle Royale' | 'Clash Squad' | 'Per Kill Bounty' | 'Snipers Only' | 'Custom Clash';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface BannerSlide {
  id: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  linkTab?: string;
  tournamentId?: string;
  active: boolean;
  order: number;
  // Detail text under banner (optional)
  headlineText?: string;
  descriptionText?: string;
  buttonText?: string;
}

export interface BrowseGameItem {
  id: string;
  title: string;
  imageUrl: string;
  status: 'LIVE' | 'COMING_SOON';
  badge?: string;
  active: boolean;
  order: number;
  linkTab?: string;
}

export interface PastTournamentItem {
  id: string;
  title: string;
  tag: string; // e.g. "Invite", "Completed", "Grand Finals"
  dates: string; // e.g. "18th Sep 2025 to 12th Oct 2025"
  imageUrl: string;
  active: boolean;
  order: number;
  winnerTeam?: string;
  prizePool?: string;
}

export interface FeaturedLargePrizeItem {
  id: string;
  title: string;
  imageUrl: string;
  iconUrl?: string;
  timeTag: string; // e.g. "IN 7 MINUTES, 11:30"
  subtitle: string; // e.g. "1v1 • 8 slots" or "Squad • 48 slots"
  prizePool: string; // e.g. "₹5,000"
  active: boolean;
  order: number;
  tournamentId?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  freeFireName: string;
  freeFireUid: string;
  walletBalance: number;
  totalWinnings: number;
  matchesPlayed: number;
  totalKills: number;
  createdAt: string;
  isBanned?: boolean;
  avatarUrl?: string;
  googleId?: string;
  isGoogleUser?: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  gameMode: GameMode;
  map: FFMap;
  matchType: MatchType;
  entryFee: number;
  prizePool: number;
  perKill: number;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  matchTime: string; // ISO format or string
  totalSlots: number;
  joinedCount: number;
  status: TournamentStatus;
  customRoomId?: string;
  customRoomPassword?: string;
  customRoomDetailsTime?: string;
  rules: string[];
  bannerUrl?: string;
  tags?: string[];
  winners?: TournamentWinner[];
}

export interface TournamentWinner {
  rank: number;
  userId: string;
  username: string;
  freeFireName: string;
  freeFireUid: string;
  kills: number;
  prizeAmount: number;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  username: string;
  freeFireName: string;
  freeFireUid: string;
  slotNumber: number;
  phone?: string;
  email?: string;
  walletBalance?: number;
  teammates?: { name: string; uid: string }[];
  joinedAt: string;
  paymentStatus: 'paid' | 'refunded';
  kills?: number;
  rank?: number;
  prizeWon?: number;
}

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  userPhone: string;
  userFreeFireName?: string;
  amount: number;
  paymentMethod: 'UPI' | 'QR Code' | 'Bank Transfer' | 'Paytm';
  transactionId: string; // UTR or Ref number
  screenshotUrl?: string;
  status: DepositStatus;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  userFreeFireName?: string;
  amount: number;
  payoutMethod: 'UPI' | 'Bank Transfer' | 'Paytm';
  payoutDetails: {
    upiId?: string;
    accountNumber?: string;
    ifsc?: string;
    accountHolderName?: string;
    paytmNumber?: string;
  };
  status: WithdrawalStatus;
  adminReference?: string;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'entry_fee' | 'prize_won' | 'refund' | 'admin_adjustment';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  referenceId?: string;
}

export interface PaymentSettings {
  upiId: string;
  upiName: string;
  qrCodeUrl: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountHolder: string;
  minDeposit: number;
  minWithdrawal: number;
  supportWhatsapp: string;
  supportTelegram: string;
  announcementText: string;
  announcementActive: boolean;
  adminSecretPin: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'tournament' | 'wallet' | 'system' | 'room_ready';
  timestamp: string;
  linkTab?: string;
}

import { 
  Tournament, 
  User, 
  DepositRequest, 
  WithdrawalRequest, 
  WalletTransaction, 
  PaymentSettings,
  TournamentParticipant,
  BannerSlide,
  BrowseGameItem,
  PastTournamentItem,
  FeaturedLargePrizeItem
} from '../types';

export const API_BASE = '/api';

export const api = {
  // Auth
  async register(data: { username: string; phone: string; email?: string; freeFireName: string; freeFireUid: string }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async login(data: { phone?: string; username?: string }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async loginWithGoogle(data: { 
    credential?: string; 
    code?: string;
    redirectUri?: string;
    email?: string; 
    name?: string; 
    avatar?: string; 
    googleId?: string;
    freeFireName?: string;
    freeFireUid?: string;
  }): Promise<{ user: User; message: string; isNewUser?: boolean }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Google sign-in failed');
    return json;
  },

  async getGoogleConfig(): Promise<{ clientId: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/google-config`);
      if (!res.ok) throw new Error('Failed to fetch google config');
      return await res.json();
    } catch {
      return { clientId: '983391484011-20hvbcpdaen98ed2ms17de8viffm0sf1.apps.googleusercontent.com' };
    }
  },

  async getUser(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/user/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch user');
    return json;
  },

  async updateProfile(id: string, data: { freeFireName?: string; freeFireUid?: string; email?: string; phone?: string }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile');
    return json;
  },

  // Public Settings
  async getPublicSettings(): Promise<Omit<PaymentSettings, 'adminSecretPin'>> {
    const res = await fetch(`${API_BASE}/settings/public`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch settings');
    return json;
  },

  // Public Banners
  async getBanners(): Promise<BannerSlide[]> {
    const res = await fetch(`${API_BASE}/banners`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch banners');
    return json;
  },

  // Public Browse Games
  async getBrowseGames(): Promise<BrowseGameItem[]> {
    const res = await fetch(`${API_BASE}/browse-games`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch browse games');
    return json;
  },

  // Public Past Tournaments
  async getPastTournaments(): Promise<PastTournamentItem[]> {
    const res = await fetch(`${API_BASE}/past-tournaments`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch past tournaments');
    return json;
  },

  // Public Featured Large Prizes
  async getFeaturedLargePrizes(): Promise<FeaturedLargePrizeItem[]> {
    const res = await fetch(`${API_BASE}/featured-large-prizes`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch featured large prizes');
    return json;
  },

  // Tournaments
  async getTournaments(params?: { status?: string; gameMode?: string; map?: string }): Promise<Tournament[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.gameMode) query.append('gameMode', params.gameMode);
    if (params?.map) query.append('map', params.map);

    const res = await fetch(`${API_BASE}/tournaments?${query.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch tournaments');
    return json;
  },

  async getTournamentDetails(id: string): Promise<{ tournament: Tournament; participants: TournamentParticipant[] }> {
    const res = await fetch(`${API_BASE}/tournaments/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch tournament details');
    return json;
  },

  async joinTournament(id: string, data: { 
    userId: string; 
    slotNumber?: number; 
    freeFireName?: string;
    freeFireUid?: string;
    teammates?: { name: string; uid: string }[];
  }): Promise<{ message: string; participant: TournamentParticipant; walletBalance: number }> {
    const res = await fetch(`${API_BASE}/tournaments/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to join match');
    return json;
  },

  async getJoinedTournaments(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/user/${userId}/joined-tournaments`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch joined matches');
    return json;
  },

  // Wallet
  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const res = await fetch(`${API_BASE}/wallet/transactions/${userId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch transactions');
    return json;
  },

  async submitDeposit(data: {
    userId: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    screenshotUrl?: string;
  }): Promise<{ message: string; deposit: DepositRequest }> {
    const res = await fetch(`${API_BASE}/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit deposit');
    return json;
  },

  async submitWithdrawal(data: {
    userId: string;
    amount: number;
    payoutMethod: string;
    upiId?: string;
    accountNumber?: string;
    ifsc?: string;
    accountHolderName?: string;
    paytmNumber?: string;
  }): Promise<{ message: string; withdrawal: WithdrawalRequest; walletBalance: number }> {
    const res = await fetch(`${API_BASE}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit withdrawal');
    return json;
  },

  // Leaderboard
  async getLeaderboard(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/leaderboard`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch leaderboard');
    return json;
  },

  // Admin APIs (Headers with Admin PIN)
  admin: {
    async verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/admin/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Admin authentication failed');
      return json;
    },

    async getStats(pin: string): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch stats');
      return json;
    },

    async createTournament(pin: string, data: any): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create tournament');
      return json;
    },

    async updateTournament(pin: string, id: string, data: any): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update tournament');
      return json;
    },

    async deleteTournament(pin: string, id: string): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/tournaments/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete tournament');
      return json;
    },

    async publishRoom(pin: string, id: string, customRoomId: string, customRoomPassword: string): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/tournaments/${id}/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ customRoomId, customRoomPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to publish room credentials');
      return json;
    },

    async getTournamentParticipants(pin: string, id: string): Promise<{ tournament: Tournament; participants: (TournamentParticipant & { phone?: string; email?: string; walletBalance?: number })[]; totalJoined: number; totalSlots: number }> {
      const res = await fetch(`${API_BASE}/admin/tournaments/${id}/participants`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch participants');
      return json;
    },

    async removeParticipant(pin: string, tourId: string, partId: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/admin/tournaments/${tourId}/participants/${partId}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to remove participant');
      return json;
    },

    async removeTournamentParticipant(pin: string, tourId: string, partId: string): Promise<{ message: string }> {
      return this.removeParticipant(pin, tourId, partId);
    },

    async declareResults(pin: string, id: string, playerResults: { userId: string; kills: number; rank: number }[]): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/tournaments/${id}/declare-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ playerResults }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to declare results and pay winners');
      return json;
    },

    async getDeposits(pin: string): Promise<DepositRequest[]> {
      const res = await fetch(`${API_BASE}/admin/deposits`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch deposits');
      return json;
    },

    async updateDepositStatus(pin: string, id: string, status: 'approved' | 'rejected', adminNote?: string): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/deposits/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ status, adminNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update deposit');
      return json;
    },

    async getWithdrawals(pin: string): Promise<WithdrawalRequest[]> {
      const res = await fetch(`${API_BASE}/admin/withdrawals`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch withdrawals');
      return json;
    },

    async updateWithdrawalStatus(pin: string, id: string, status: 'approved' | 'rejected', adminReference?: string, adminNote?: string): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/withdrawals/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ status, adminReference, adminNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update withdrawal');
      return json;
    },

    async getUsers(pin: string): Promise<User[]> {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch users');
      return json;
    },

    async adjustUserBalance(pin: string, id: string, amount: number, type: 'add' | 'deduct', reason: string): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/users/${id}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ amount, type, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to adjust user balance');
      return json;
    },

    async getSettings(pin: string): Promise<PaymentSettings> {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch admin settings');
      return json;
    },

    async updateSettings(pin: string, data: Partial<PaymentSettings>): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update settings');
      return json;
    },

    // Admin Banners
    async getBanners(pin: string): Promise<BannerSlide[]> {
      const res = await fetch(`${API_BASE}/admin/banners`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch admin banners');
      return json;
    },

    async createBanner(pin: string, data: Partial<BannerSlide>): Promise<{ banner: BannerSlide; message: string }> {
      const res = await fetch(`${API_BASE}/admin/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create banner');
      return json;
    },

    async updateBanner(pin: string, id: string, data: Partial<BannerSlide>): Promise<{ banner: BannerSlide; message: string }> {
      const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update banner');
      return json;
    },

    async deleteBanner(pin: string, id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete banner');
      return json;
    },

    // Admin Browse Games
    async getBrowseGames(pin: string): Promise<BrowseGameItem[]> {
      const res = await fetch(`${API_BASE}/admin/browse-games`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch admin games');
      return json;
    },

    async createBrowseGame(pin: string, data: Partial<BrowseGameItem>): Promise<{ game: BrowseGameItem; message: string }> {
      const res = await fetch(`${API_BASE}/admin/browse-games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create game');
      return json;
    },

    async updateBrowseGame(pin: string, id: string, data: Partial<BrowseGameItem>): Promise<{ game: BrowseGameItem; message: string }> {
      const res = await fetch(`${API_BASE}/admin/browse-games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update game');
      return json;
    },

    async deleteBrowseGame(pin: string, id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/admin/browse-games/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete game');
      return json;
    },

    // Admin Past Tournaments
    async getPastTournaments(pin: string): Promise<PastTournamentItem[]> {
      const res = await fetch(`${API_BASE}/admin/past-tournaments`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch past tournaments');
      return json;
    },

    async createPastTournament(pin: string, data: Partial<PastTournamentItem>): Promise<{ pastTournament: PastTournamentItem; message: string }> {
      const res = await fetch(`${API_BASE}/admin/past-tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add past tournament');
      return json;
    },

    async updatePastTournament(pin: string, id: string, data: Partial<PastTournamentItem>): Promise<{ pastTournament: PastTournamentItem; message: string }> {
      const res = await fetch(`${API_BASE}/admin/past-tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update past tournament');
      return json;
    },

    async deletePastTournament(pin: string, id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/admin/past-tournaments/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete past tournament');
      return json;
    },

    // Admin Featured Large Prizes
    async getFeaturedLargePrizes(pin: string): Promise<FeaturedLargePrizeItem[]> {
      const res = await fetch(`${API_BASE}/admin/featured-large-prizes`, {
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch featured prizes');
      return json;
    },

    async createFeaturedLargePrize(pin: string, data: Partial<FeaturedLargePrizeItem>): Promise<{ item: FeaturedLargePrizeItem; message: string }> {
      const res = await fetch(`${API_BASE}/admin/featured-large-prizes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create featured prize');
      return json;
    },

    async updateFeaturedLargePrize(pin: string, id: string, data: Partial<FeaturedLargePrizeItem>): Promise<{ item: FeaturedLargePrizeItem; message: string }> {
      const res = await fetch(`${API_BASE}/admin/featured-large-prizes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update featured prize');
      return json;
    },

    async deleteFeaturedLargePrize(pin: string, id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/admin/featured-large-prizes/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete featured prize');
      return json;
    },
  }
};

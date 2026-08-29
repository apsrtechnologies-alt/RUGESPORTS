import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  Tournament, 
  User, 
  TournamentParticipant, 
  DepositRequest, 
  WithdrawalRequest, 
  WalletTransaction, 
  PaymentSettings,
  BannerSlide,
  BrowseGameItem,
  PastTournamentItem,
  FeaturedLargePrizeItem
} from './src/types.js';

const app = express();
const PORT = 3000;

// Body parser with 15MB limit for image screenshots
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database directory & file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'esports_db.json');

interface DatabaseSchema {
  users: User[];
  tournaments: Tournament[];
  participants: TournamentParticipant[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  transactions: WalletTransaction[];
  settings: PaymentSettings;
  banners?: BannerSlide[];
  browseGames?: BrowseGameItem[];
  pastTournaments?: PastTournamentItem[];
  featuredLargePrizes?: FeaturedLargePrizeItem[];
}

const defaultSettings: PaymentSettings = {
  upiId: 'ragesports@okaxis',
  upiName: 'RUG ESPORTS ARENA',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=upi://pay?pa=rugesports@okaxis%26pn=RUG%20ESPORTS%26cu=INR',
  bankName: 'State Bank of India',
  accountNumber: '91880012345678',
  ifsc: 'SBIN0004521',
  accountHolder: 'RUG Esports Official',
  minDeposit: 10,
  minWithdrawal: 50,
  supportWhatsapp: '+91 98765 43210',
  supportTelegram: 'https://t.me/rug_esports_official',
  announcementText: '🔥 Welcome to RUG | ESPORTS! Join daily Free Fire cash tournaments with instant payouts.',
  announcementActive: true,
  adminSecretPin: '7788',
};

const defaultBanners: BannerSlide[] = [
  {
    id: 'banner_1',
    title: 'NAYE KHILADI 2026',
    headlineText: 'NAYE KHILADI',
    descriptionText: 'FREE FIRE & BGMI: NAYE KHILADI 2026 crowned its first champions as HEXVORA turned #AbTeriBari into their moment of glory.',
    buttonText: 'Tournament details',
    badge: 'CHAMPIONSHIP',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    linkTab: 'tournaments',
    active: true,
    order: 1,
  },
  {
    id: 'banner_2',
    title: 'CLASH SQUAD MEGA CUP',
    headlineText: 'CLASH SQUAD 4v4',
    descriptionText: 'High-stakes custom room action with gun property disabled and ₹2,000 guaranteed cash prize pool.',
    buttonText: 'Join Battle',
    badge: 'PRIZE POOL ₹2,000',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    linkTab: 'tournaments',
    active: true,
    order: 2,
  },
  {
    id: 'banner_3',
    title: 'PER KILL BOUNTY ARENA',
    headlineText: 'PER KILL BOUNTY',
    descriptionText: 'Earn up to ₹25 per elimination with instant credit straight to your verified UPI wallet.',
    buttonText: 'View Bounties',
    badge: 'INSTANT PAYOUT',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    linkTab: 'wallet',
    active: true,
    order: 3,
  },
];

const defaultBrowseGames: BrowseGameItem[] = [
  {
    id: 'game_ff',
    title: 'Free Fire MAX',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    status: 'LIVE',
    badge: 'LIVE NOW',
    active: true,
    order: 1,
    linkTab: 'tournaments',
  },
  {
    id: 'game_val',
    title: 'VALORANT',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    status: 'COMING_SOON',
    badge: 'COMING SOON',
    active: true,
    order: 2,
  },
  {
    id: 'game_lol',
    title: 'League of Legends',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    status: 'COMING_SOON',
    badge: 'COMING SOON',
    active: true,
    order: 3,
  },
  {
    id: 'game_bgmi',
    title: 'BGMI',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    status: 'COMING_SOON',
    badge: 'COMING SOON',
    active: true,
    order: 4,
  },
  {
    id: 'game_r6',
    title: "Tom Clancy's Rainbow Six",
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    status: 'COMING_SOON',
    badge: 'COMING SOON',
    active: true,
    order: 5,
  },
  {
    id: 'game_cricket',
    title: 'Real Cricket 24',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80',
    status: 'COMING_SOON',
    badge: 'COMING SOON',
    active: true,
    order: 6,
  }
];

const defaultPastTournaments: PastTournamentItem[] = [
  {
    id: 'past_1',
    title: 'BMSD 2025',
    tag: 'Invite',
    dates: '18th Sep 2025 to 12th Oct 2025',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    winnerTeam: 'TEAM SOUL',
    prizePool: '₹25,00,000',
    active: true,
    order: 1,
  },
  {
    id: 'past_2',
    title: 'BMPS 2025 Season 4',
    tag: 'Invite',
    dates: '22nd Aug 2025 to 10th Sep 2025',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    winnerTeam: 'GODLIKE ESPORTS',
    prizePool: '₹50,00,000',
    active: true,
    order: 2,
  },
  {
    id: 'past_3',
    title: 'BGIS 2025 Grand Finals',
    tag: 'Completed',
    dates: '1st May 2025 to 20th May 2025',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    winnerTeam: 'TEAM XSPARK',
    prizePool: '₹1,00,00,000',
    active: true,
    order: 3,
  },
  {
    id: 'past_4',
    title: 'RUG FF Pro Invitational',
    tag: 'Completed',
    dates: '10th Jan 2025 to 25th Jan 2025',
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    winnerTeam: 'TOTAL GAMING',
    prizePool: '₹10,00,000',
    active: true,
    order: 4,
  }
];

const defaultFeaturedLargePrizes: FeaturedLargePrizeItem[] = [
  {
    id: 'flp_1',
    title: '( G.C.L ) GLOBAL CRICKET LEAGUE',
    timeTag: 'IN 7 MINUTES, 11:30',
    subtitle: '1v1 • 8 slots',
    prizePool: '₹1,500',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=100&q=80',
    active: true,
    order: 1,
  },
  {
    id: 'flp_2',
    title: 'FREE FIRE MEGA BOOYAH CUP',
    timeTag: 'IN 37 MINUTES, 12:00',
    subtitle: 'Squad • 48 slots',
    prizePool: '₹5,000',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=100&q=80',
    active: true,
    order: 2,
  },
  {
    id: 'flp_3',
    title: 'CLASH SQUAD GRAND ARENA',
    timeTag: 'TODAY, 18:00',
    subtitle: '4v4 • 16 teams',
    prizePool: '₹3,000',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=100&q=80',
    active: true,
    order: 3,
  }
];

// Start with demo player so visitors can immediately test matches & wallet
const defaultUsers: User[] = [
  {
    id: 'usr_demo_1',
    username: 'RAG_Demon99',
    email: 'demon@ragesports.in',
    phone: '9876543210',
    freeFireName: '⚡DEMON・FF',
    freeFireUid: '1098273645',
    walletBalance: 250,
    totalWinnings: 450,
    matchesPlayed: 8,
    totalKills: 26,
    createdAt: new Date().toISOString(),
  },
];

const defaultTournaments: Tournament[] = [
  {
    id: 'tour_1',
    title: 'FF Daily Battle',
    gameMode: 'Squad',
    map: 'Bermuda',
    matchType: 'Battle Royale',
    entryFee: 20,
    prizePool: 1000,
    perKill: 10,
    firstPrize: 500,
    secondPrize: 300,
    thirdPrize: 200,
    matchTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    totalSlots: 50,
    joinedCount: 32,
    status: 'upcoming',
    rules: [
      'Emulators strictly banned. Mobile players only.',
      'Room ID & Password will be published 15 minutes before match start.',
      'All players must join their assigned slot numbers.',
      'Screenshot required for kill verification.'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    tags: ['HOT', 'BATTLE ROYALE'],
  },
  {
    id: 'tour_2',
    title: 'FF CS Cup',
    gameMode: 'Clash Squad (4v4)',
    map: 'Bermuda',
    matchType: 'Clash Squad',
    entryFee: 30,
    prizePool: 2000,
    perKill: 0,
    firstPrize: 1400,
    secondPrize: 600,
    thirdPrize: 0,
    matchTime: new Date(Date.now() + 3600000 * 5).toISOString(),
    totalSlots: 100,
    joinedCount: 68,
    status: 'upcoming',
    rules: [
      'Clash Squad 4v4 Competitive Mode.',
      'Gun Property: OFF, Gun skins: Allowed, Character skill: Active.',
      'Roof climbing or map glitching results in instant disqualification.',
      'Winnings credited directly to in-app wallet within 10 minutes.'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    tags: ['POPULAR', 'CLASH SQUAD'],
  },
  {
    id: 'tour_3',
    title: 'FF Night Clash',
    gameMode: 'Clash Squad (4v4)',
    map: 'Purgatory',
    matchType: 'Clash Squad',
    entryFee: 10,
    prizePool: 500,
    perKill: 0,
    firstPrize: 350,
    secondPrize: 150,
    thirdPrize: 0,
    matchTime: new Date(Date.now() + 3600000 * 8).toISOString(),
    totalSlots: 40,
    joinedCount: 18,
    status: 'upcoming',
    rules: [
      'Night clash championship.',
      'Fair play monitoring active.',
      'Instant prize payout to player wallet within 10 minutes.'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    tags: ['NEW', 'CLASH SQUAD'],
  }
];

// Helper to read and write database
function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        users: defaultUsers,
        tournaments: defaultTournaments,
        participants: [],
        deposits: [],
        withdrawals: [],
        transactions: [],
        settings: defaultSettings,
        banners: defaultBanners,
        browseGames: defaultBrowseGames,
        pastTournaments: defaultPastTournaments,
        featuredLargePrizes: defaultFeaturedLargePrizes,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.settings) parsed.settings = defaultSettings;
    if (!parsed.users || !Array.isArray(parsed.users)) parsed.users = defaultUsers;
    if (parsed.users.length === 0) parsed.users = defaultUsers;
    if (!parsed.tournaments || !Array.isArray(parsed.tournaments) || parsed.tournaments.length === 0) {
      parsed.tournaments = defaultTournaments;
    }
    if (!parsed.banners || !Array.isArray(parsed.banners) || parsed.banners.length === 0) {
      parsed.banners = defaultBanners;
    }
    if (!parsed.browseGames || !Array.isArray(parsed.browseGames) || parsed.browseGames.length === 0) {
      parsed.browseGames = defaultBrowseGames;
    }
    if (!parsed.pastTournaments || !Array.isArray(parsed.pastTournaments) || parsed.pastTournaments.length === 0) {
      parsed.pastTournaments = defaultPastTournaments;
    }
    if (!parsed.featuredLargePrizes || !Array.isArray(parsed.featuredLargePrizes) || parsed.featuredLargePrizes.length === 0) {
      parsed.featuredLargePrizes = defaultFeaturedLargePrizes;
    }
    if (!parsed.participants) parsed.participants = [];
    if (!parsed.deposits) parsed.deposits = [];
    if (!parsed.withdrawals) parsed.withdrawals = [];
    if (!parsed.transactions) parsed.transactions = [];
    return parsed;
  } catch (error) {
    console.error('Error reading DB:', error);
    return {
      users: defaultUsers,
      tournaments: defaultTournaments,
      participants: [],
      deposits: [],
      withdrawals: [],
      transactions: [],
      settings: defaultSettings,
      banners: defaultBanners,
      browseGames: defaultBrowseGames,
      pastTournaments: defaultPastTournaments,
      featuredLargePrizes: defaultFeaturedLargePrizes,
    };
  }
}

function saveDb(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving DB:', error);
  }
}

// ----------------------------------------------------
// PUBLIC & USER API ENDPOINTS
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Public Payment & Announcement Settings
app.get('/api/settings/public', (req, res) => {
  const db = getDb();
  // Never expose adminSecretPin to public API
  const { adminSecretPin, ...publicSettings } = db.settings;
  res.json(publicSettings);
});

// Public Banners Carousel
app.get('/api/banners', (req, res) => {
  const db = getDb();
  const activeBanners = (db.banners || [])
    .filter(b => b.active)
    .sort((a, b) => a.order - b.order);
  res.json(activeBanners);
});

// Public Browse Games
app.get('/api/browse-games', (req, res) => {
  const db = getDb();
  const games = (db.browseGames || [])
    .filter(g => g.active !== false)
    .sort((a, b) => a.order - b.order);
  res.json(games);
});

// Public Past Tournaments Showcase
app.get('/api/past-tournaments', (req, res) => {
  const db = getDb();
  const past = (db.pastTournaments || [])
    .filter(p => p.active !== false)
    .sort((a, b) => a.order - b.order);
  res.json(past);
});

// Public Featured Large Prize Tournaments
app.get('/api/featured-large-prizes', (req, res) => {
  const db = getDb();
  const prizes = (db.featuredLargePrizes || [])
    .filter(p => p.active !== false)
    .sort((a, b) => a.order - b.order);
  res.json(prizes);
});

// User Registration & Login
app.post('/api/auth/register', (req, res) => {
  const { username, phone, email, freeFireName, freeFireUid, password } = req.body;
  if (!username || !phone || !freeFireName || !freeFireUid) {
    return res.status(400).json({ error: 'Username, Phone, Free Fire IGN, and Free Fire UID are required.' });
  }

  const db = getDb();
  const existingUser = db.users.find(u => u.phone === phone || u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'A user with this phone or username already exists. Please log in.' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    username: username.trim(),
    email: (email || `${username.toLowerCase()}@player.com`).trim(),
    phone: phone.trim(),
    freeFireName: freeFireName.trim(),
    freeFireUid: freeFireUid.trim(),
    walletBalance: 0,
    totalWinnings: 0,
    matchesPlayed: 0,
    totalKills: 0,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  res.json({ user: newUser, message: 'Account created successfully!' });
});

// Google Sign-In / 1-Tap Gmail Authentication
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '983391484011-20hvbcpdaen98ed2ms17de8viffm0sf1.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

app.get('/api/auth/google-config', (req, res) => {
  res.json({
    clientId: GOOGLE_CLIENT_ID,
  });
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, code, redirectUri, email, name, avatar, googleId, freeFireName, freeFireUid } = req.body;
    let userEmail = email;
    let userName = name;
    let userAvatar = avatar;
    let userGoogleId = googleId;

    // 1. If OAuth authorization code was passed, exchange it with Google token endpoint
    if (code) {
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri || `${req.protocol}://${req.get('host')}`,
            grant_type: 'authorization_code',
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const profile = await userRes.json();
          userEmail = profile.email || userEmail;
          userName = profile.name || userName;
          userAvatar = profile.picture || userAvatar;
          userGoogleId = profile.sub || userGoogleId;
        }
      } catch (exErr) {
        console.warn('OAuth code exchange failed, falling back to body payload:', exErr);
      }
    }

    // 2. If Google JWT Credential is provided (Google Identity Services)
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userEmail = payload.email || userEmail;
          userName = payload.name || userName;
          userAvatar = payload.picture || userAvatar;
          userGoogleId = payload.sub || userGoogleId;
        }
      } catch (jwtErr) {
        console.warn('Could not decode JWT payload from Google token, using fallback body values:', jwtErr);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ error: 'Valid Gmail address is required for Google Sign-In.' });
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const db = getDb();

    // Check if user already registered with this email or googleId
    let user = db.users.find(u => 
      (u.email && u.email.toLowerCase() === cleanEmail) || 
      (userGoogleId && u.googleId === userGoogleId)
    );

    if (user) {
      if (user.isBanned) {
        return res.status(403).json({ error: 'Your account has been banned due to fair play policy violation.' });
      }
      // Update avatar or googleId if not present
      if (!user.avatarUrl && userAvatar) user.avatarUrl = userAvatar;
      if (!user.googleId && userGoogleId) user.googleId = userGoogleId;
      saveDb(db);
      return res.json({ user, message: 'Welcome back! Signed in with Google.', isNewUser: false });
    }

    // Create new player account automatically from Google profile
    const derivedUsername = (userName || cleanEmail.split('@')[0])
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 15) || `Player_${Math.floor(1000 + Math.random() * 9000)}`;

    // Ensure unique username
    let finalUsername = derivedUsername;
    let counter = 1;
    while (db.users.some(u => u.username.toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${derivedUsername}${counter++}`;
    }

    const newUser: User = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      username: finalUsername,
      email: cleanEmail,
      phone: '',
      freeFireName: (freeFireName || userName || finalUsername).trim(),
      freeFireUid: (freeFireUid || '').trim(),
      walletBalance: 0,
      totalWinnings: 0,
      matchesPlayed: 0,
      totalKills: 0,
      createdAt: new Date().toISOString(),
      avatarUrl: userAvatar,
      googleId: userGoogleId,
      isGoogleUser: true,
    };

    db.users.push(newUser);
    saveDb(db);

    res.json({ user: newUser, message: 'Google account linked successfully! Welcome to RUG ESPORTS.', isNewUser: true });
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Failed to authenticate with Google. Please try again.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { phone, username } = req.body;
  if (!phone && !username) {
    return res.status(400).json({ error: 'Please enter phone or username.' });
  }

  const db = getDb();
  const query = (phone || username || '').trim().toLowerCase();
  const user = db.users.find(u => u.phone === query || u.username.toLowerCase() === query);

  if (!user) {
    return res.status(404).json({ error: 'Player account not found. Please register first.' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'Your account has been banned due to fair play policy violation.' });
  }

  res.json({ user, message: 'Login successful' });
});

app.get('/api/auth/user/:id', (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/auth/user/:id', (req, res) => {
  const { freeFireName, freeFireUid, email, phone } = req.body;
  const db = getDb();
  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (freeFireName) db.users[userIndex].freeFireName = freeFireName.trim();
  if (freeFireUid) db.users[userIndex].freeFireUid = freeFireUid.trim();
  if (email) db.users[userIndex].email = email.trim();
  if (phone) db.users[userIndex].phone = phone.trim();

  saveDb(db);
  res.json({ user: db.users[userIndex], message: 'Profile updated successfully!' });
});

// Tournaments List
app.get('/api/tournaments', (req, res) => {
  const db = getDb();
  const { status, gameMode, map } = req.query;

  let tournaments = [...db.tournaments];

  if (status && typeof status === 'string') {
    tournaments = tournaments.filter(t => t.status === status);
  }
  if (gameMode && typeof gameMode === 'string') {
    tournaments = tournaments.filter(t => t.gameMode === gameMode);
  }
  if (map && typeof map === 'string') {
    tournaments = tournaments.filter(t => t.map === map);
  }

  // Sort: Upcoming matches first (closest to now), then ongoing, then completed
  tournaments.sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime();
  });

  res.json(tournaments);
});

// Tournament details & participants
app.get('/api/tournaments/:id', (req, res) => {
  const db = getDb();
  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const participants = db.participants.filter(p => p.tournamentId === req.params.id);
  res.json({ tournament, participants });
});

// Join Tournament
app.post('/api/tournaments/:id/join', (req, res) => {
  const { userId, slotNumber, teammates, freeFireName, freeFireUid } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User authentication required.' });
  }

  const db = getDb();
  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found.' });
  }

  if (tournament.status !== 'upcoming') {
    return res.status(400).json({ error: 'Registration closed for this match.' });
  }

  if (tournament.joinedCount >= tournament.totalSlots) {
    return res.status(400).json({ error: 'Match slots are full!' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  // Check if already registered
  const alreadyJoined = db.participants.find(p => p.tournamentId === tournament.id && p.userId === userId);
  if (alreadyJoined) {
    return res.status(400).json({ error: 'You are already registered for this match! Check "My Matches".' });
  }

  // Determine Free Fire In-Game Name & Game UID
  const finalFFName = (freeFireName || user.freeFireName || user.username || '').trim();
  const finalFFUid = (freeFireUid || user.freeFireUid || '').trim();

  if (!finalFFUid) {
    return res.status(400).json({ error: 'Please enter your Free Fire Game ID (UID) to join.' });
  }

  // Auto-update user profile with latest Game ID if updated during join
  if (finalFFName) user.freeFireName = finalFFName;
  if (finalFFUid) user.freeFireUid = finalFFUid;

  // Check wallet balance
  if (user.walletBalance < tournament.entryFee) {
    const needed = tournament.entryFee - user.walletBalance;
    return res.status(400).json({ 
      error: `Insufficient balance in wallet. Need ₹${needed} more to join. Please add money to your wallet.`,
      needsDeposit: true,
      currentBalance: user.walletBalance,
      entryFee: tournament.entryFee
    });
  }

  // Deduct entry fee
  user.walletBalance -= tournament.entryFee;
  user.matchesPlayed = (user.matchesPlayed || 0) + 1;

  // Determine slot number
  const existingSlots = db.participants.filter(p => p.tournamentId === tournament.id).map(p => p.slotNumber);
  let chosenSlot = slotNumber;
  if (!chosenSlot || existingSlots.includes(chosenSlot)) {
    for (let i = 1; i <= tournament.totalSlots; i++) {
      if (!existingSlots.includes(i)) {
        chosenSlot = i;
        break;
      }
    }
  }

  const participant: TournamentParticipant = {
    id: `part_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    tournamentId: tournament.id,
    userId: user.id,
    username: user.username,
    freeFireName: finalFFName,
    freeFireUid: finalFFUid,
    slotNumber: chosenSlot || 1,
    teammates: teammates || [],
    joinedAt: new Date().toISOString(),
    paymentStatus: 'paid',
  };

  tournament.joinedCount += 1;
  db.participants.push(participant);

  // Record wallet transaction
  if (tournament.entryFee > 0) {
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'entry_fee',
      amount: tournament.entryFee,
      description: `Entry fee for ${tournament.title} (Slot #${participant.slotNumber})`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      referenceId: tournament.id,
    };
    db.transactions.unshift(tx);
  }

  saveDb(db);

  res.json({
    message: `Successfully joined ${tournament.title}! Your Slot is #${participant.slotNumber}.`,
    participant,
    walletBalance: user.walletBalance,
  });
});

// My Joined Tournaments (Includes Room ID & Password if revealed)
app.get('/api/user/:userId/joined-tournaments', (req, res) => {
  const db = getDb();
  const userId = req.params.userId;
  const userParticipants = db.participants.filter(p => p.userId === userId);

  const joinedTournaments = userParticipants.map(part => {
    const tour = db.tournaments.find(t => t.id === part.tournamentId);
    if (!tour) return null;

    // Room ID is revealed to registered players if admin entered it
    return {
      ...tour,
      participantDetails: part,
    };
  }).filter(Boolean);

  res.json(joinedTournaments);
});

// Wallet: Submit Manual Deposit Request
app.post('/api/wallet/deposit', (req, res) => {
  const { userId, amount, paymentMethod, transactionId, screenshotUrl } = req.body;
  if (!userId || !amount || !transactionId) {
    return res.status(400).json({ error: 'User ID, Amount, and Transaction UTR / Ref ID are required.' });
  }

  const depositAmount = Number(amount);
  if (isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid deposit amount.' });
  }

  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (depositAmount < db.settings.minDeposit) {
    return res.status(400).json({ error: `Minimum deposit amount is ₹${db.settings.minDeposit}.` });
  }

  // Check if duplicate transaction ID
  const duplicate = db.deposits.find(d => d.transactionId.trim() === transactionId.trim() && d.status !== 'rejected');
  if (duplicate) {
    return res.status(400).json({ error: 'This Transaction UTR / Reference ID has already been submitted.' });
  }

  const depositRequest: DepositRequest = {
    id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId: user.id,
    username: user.username,
    userPhone: user.phone,
    userFreeFireName: user.freeFireName,
    amount: depositAmount,
    paymentMethod: paymentMethod || 'UPI',
    transactionId: transactionId.trim(),
    screenshotUrl: screenshotUrl || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.deposits.unshift(depositRequest);

  // Add pending transaction record
  const tx: WalletTransaction = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    type: 'deposit',
    amount: depositAmount,
    description: `Deposit Request (UTR: ${depositRequest.transactionId}) - Verifying with Bank`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    referenceId: depositRequest.id,
  };
  db.transactions.unshift(tx);

  saveDb(db);

  res.json({
    message: 'Deposit request submitted! Admin will verify bank credit and credit your wallet within 5-15 minutes.',
    deposit: depositRequest,
  });
});

// Wallet: Submit Withdrawal Request
app.post('/api/wallet/withdraw', (req, res) => {
  const { userId, amount, payoutMethod, upiId, accountNumber, ifsc, accountHolderName, paytmNumber } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ error: 'User ID and Amount are required.' });
  }

  const withdrawAmount = Number(amount);
  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (withdrawAmount < db.settings.minWithdrawal) {
    return res.status(400).json({ error: `Minimum withdrawal amount is ₹${db.settings.minWithdrawal}.` });
  }

  if (user.walletBalance < withdrawAmount) {
    return res.status(400).json({ error: `Insufficient wallet balance. You have ₹${user.walletBalance}.` });
  }

  if (payoutMethod === 'UPI' && !upiId) {
    return res.status(400).json({ error: 'Please provide a valid UPI ID (e.g., yourname@okhdfcbank).' });
  }

  if (payoutMethod === 'Bank Transfer' && (!accountNumber || !ifsc || !accountHolderName)) {
    return res.status(400).json({ error: 'Please provide complete Bank Account details (A/C No, IFSC, Holder Name).' });
  }

  // Deduct from wallet immediately to prevent double spending
  user.walletBalance -= withdrawAmount;

  const withdrawalRequest: WithdrawalRequest = {
    id: `with_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId: user.id,
    username: user.username,
    userFreeFireName: user.freeFireName,
    amount: withdrawAmount,
    payoutMethod: payoutMethod || 'UPI',
    payoutDetails: {
      upiId,
      accountNumber,
      ifsc,
      accountHolderName,
      paytmNumber,
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.withdrawals.unshift(withdrawalRequest);

  const tx: WalletTransaction = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    type: 'withdrawal',
    amount: withdrawAmount,
    description: `Withdrawal Request to ${payoutMethod} (${upiId || accountNumber || paytmNumber}) - Processing`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    referenceId: withdrawalRequest.id,
  };
  db.transactions.unshift(tx);

  saveDb(db);

  res.json({
    message: 'Withdrawal request submitted! Admin will transfer funds to your account shortly.',
    withdrawal: withdrawalRequest,
    walletBalance: user.walletBalance,
  });
});

// User Passbook / Transactions
app.get('/api/wallet/transactions/:userId', (req, res) => {
  const db = getDb();
  const userTxs = db.transactions.filter(t => t.userId === req.params.userId);
  res.json(userTxs);
});

// Global Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const db = getDb();
  const sortedByWinnings = [...db.users]
    .sort((a, b) => (b.totalWinnings || 0) - (a.totalWinnings || 0))
    .slice(0, 20)
    .map(u => ({
      id: u.id,
      username: u.username,
      freeFireName: u.freeFireName,
      totalWinnings: u.totalWinnings || 0,
      totalKills: u.totalKills || 0,
      matchesPlayed: u.matchesPlayed || 0,
    }));

  res.json(sortedByWinnings);
});

// ----------------------------------------------------
// SECRET ADMIN API ENDPOINTS (HIDDEN FROM USER PANEL)
// ----------------------------------------------------

// Admin PIN Authentication Middleware / Check
function checkAdminPin(req: express.Request): boolean {
  const pin = req.headers['x-admin-pin'] || req.query.adminPin || req.body?.adminPin;
  const db = getDb();
  return pin === db.settings.adminSecretPin;
}

app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  const db = getDb();
  if (pin === db.settings.adminSecretPin) {
    res.json({ success: true, message: 'Admin authentication verified' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect Admin Secret PIN' });
  }
});

// Admin Dashboard Summary Stats
app.get('/api/admin/stats', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized Admin Access' });

  const db = getDb();
  const pendingDeposits = db.deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = db.withdrawals.filter(w => w.status === 'pending');
  const activeTournaments = db.tournaments.filter(t => t.status === 'upcoming' || t.status === 'ongoing');
  
  const totalPrizePaid = db.tournaments
    .filter(t => t.status === 'completed' && t.winners)
    .reduce((sum, t) => sum + (t.winners?.reduce((ws, w) => ws + w.prizeAmount, 0) || 0), 0);

  const totalUserBalances = db.users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

  res.json({
    totalUsers: db.users.length,
    activeTournamentsCount: activeTournaments.length,
    pendingDepositsCount: pendingDeposits.length,
    pendingWithdrawalsCount: pendingWithdrawals.length,
    totalPrizeDistributed: totalPrizePaid,
    totalUserBalances,
    pendingDepositsAmount: pendingDeposits.reduce((acc, d) => acc + d.amount, 0),
    pendingWithdrawalsAmount: pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0),
  });
});

// Admin: Tournaments CRUD
app.post('/api/admin/tournaments', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const {
    title,
    gameMode,
    map,
    matchType,
    entryFee,
    prizePool,
    perKill,
    firstPrize,
    secondPrize,
    thirdPrize,
    matchTime,
    totalSlots,
    rules,
    tags,
    bannerUrl
  } = req.body;

  if (!title || !gameMode || !map || matchTime === undefined) {
    return res.status(400).json({ error: 'Missing required tournament fields.' });
  }

  const db = getDb();
  const newTour: Tournament = {
    id: `tour_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: title.trim(),
    gameMode: gameMode || 'Solo',
    map: map || 'Bermuda',
    matchType: matchType || 'Battle Royale',
    entryFee: Number(entryFee) || 0,
    prizePool: Number(prizePool) || 0,
    perKill: Number(perKill) || 0,
    firstPrize: Number(firstPrize) || 0,
    secondPrize: Number(secondPrize) || 0,
    thirdPrize: Number(thirdPrize) || 0,
    matchTime: new Date(matchTime).toISOString(),
    totalSlots: Number(totalSlots) || 48,
    joinedCount: 0,
    status: 'upcoming',
    customRoomId: '',
    customRoomPassword: '',
    rules: rules && rules.length > 0 ? rules : [
      'Emulators strictly banned. Mobile players only.',
      'Room ID & Password will be released 15 minutes before the match start time.',
      'Players must join their allotted slot number only.',
      'Take screenshot of victory/kills for verification in case of disputes.'
    ],
    tags: tags || ['Free Fire', 'Official'],
    bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  };

  db.tournaments.unshift(newTour);
  saveDb(db);

  res.json({ tournament: newTour, message: 'Tournament created successfully!' });
});

app.put('/api/admin/tournaments/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  const index = db.tournaments.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const updated = {
    ...db.tournaments[index],
    ...req.body,
    id: db.tournaments[index].id, // keep original ID
  };

  db.tournaments[index] = updated;
  saveDb(db);

  res.json({ tournament: updated, message: 'Tournament updated successfully!' });
});

app.delete('/api/admin/tournaments/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  const index = db.tournaments.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  // Refund players if upcoming
  const tour = db.tournaments[index];
  if (tour.status === 'upcoming' && tour.entryFee > 0) {
    const participants = db.participants.filter(p => p.tournamentId === tour.id);
    participants.forEach(p => {
      const user = db.users.find(u => u.id === p.userId);
      if (user) {
        user.walletBalance += tour.entryFee;
        db.transactions.unshift({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
          userId: user.id,
          type: 'refund',
          amount: tour.entryFee,
          description: `Refund for cancelled tournament: ${tour.title}`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          referenceId: tour.id,
        });
      }
    });
  }

  db.tournaments.splice(index, 1);
  db.participants = db.participants.filter(p => p.tournamentId !== req.params.id);
  saveDb(db);

  res.json({ message: 'Tournament deleted and players refunded (if applicable).' });
});

// Admin: Publish / Update Custom Room ID & Password
app.post('/api/admin/tournaments/:id/room', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { customRoomId, customRoomPassword } = req.body;
  const db = getDb();
  const tour = db.tournaments.find(t => t.id === req.params.id);
  if (!tour) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  tour.customRoomId = (customRoomId || '').trim();
  tour.customRoomPassword = (customRoomPassword || '').trim();
  tour.customRoomDetailsTime = new Date().toISOString();
  if (tour.status === 'upcoming' && tour.customRoomId) {
    tour.status = 'ongoing';
  }

  saveDb(db);
  res.json({ message: 'Custom Room credentials published to registered players!', tournament: tour });
});

// Admin: Get all participants for a tournament (enhanced with user details)
app.get('/api/admin/tournaments/:id/participants', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  const tour = db.tournaments.find(t => t.id === req.params.id);
  if (!tour) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const participants = db.participants.filter(p => p.tournamentId === req.params.id);
  const enhanced = participants.map(p => {
    const user = db.users.find(u => u.id === p.userId);
    return {
      ...p,
      phone: user?.phone || '',
      email: user?.email || '',
      walletBalance: user?.walletBalance || 0,
      totalWinnings: user?.totalWinnings || 0,
      matchesPlayed: user?.matchesPlayed || 0,
    };
  }).sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));

  res.json({
    tournament: tour,
    participants: enhanced,
    totalJoined: enhanced.length,
    totalSlots: tour.totalSlots
  });
});

// Admin: Remove Participant / Kick Slot
app.delete('/api/admin/tournaments/:tourId/participants/:partId', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized Admin Access' });

  const db = getDb();
  const partIndex = db.participants.findIndex(p => p.id === req.params.partId && p.tournamentId === req.params.tourId);
  if (partIndex === -1) {
    return res.status(404).json({ error: 'Participant not found in this match' });
  }

  const part = db.participants[partIndex];
  const tour = db.tournaments.find(t => t.id === req.params.tourId);
  const user = db.users.find(u => u.id === part.userId);

  // Refund entry fee if upcoming match
  if (tour && tour.status === 'upcoming' && tour.entryFee > 0 && user) {
    user.walletBalance += tour.entryFee;
    db.transactions.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
      userId: user.id,
      type: 'refund',
      amount: tour.entryFee,
      description: `Refund for slot removal in ${tour.title} (Slot #${part.slotNumber})`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      referenceId: tour.id,
    });
  }

  if (tour && tour.joinedCount > 0) {
    tour.joinedCount -= 1;
  }

  db.participants.splice(partIndex, 1);
  saveDb(db);

  res.json({ message: `Slot #${part.slotNumber} (${part.freeFireName}) removed and refunded.` });
});

// Admin: Declare Match Results, Record Kills & Auto-Disburse Prizes
app.post('/api/admin/tournaments/:id/declare-results', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { playerResults } = req.body; // Array of { userId, kills, rank }
  if (!playerResults || !Array.isArray(playerResults)) {
    return res.status(400).json({ error: 'playerResults array is required.' });
  }

  const db = getDb();
  const tour = db.tournaments.find(t => t.id === req.params.id);
  if (!tour) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const winnersList: any[] = [];

  playerResults.forEach((result: { userId: string; kills?: number; rank?: number }) => {
    const user = db.users.find(u => u.id === result.userId);
    const participant = db.participants.find(p => p.tournamentId === tour.id && p.userId === result.userId);

    const kills = Number(result.kills) || 0;
    const rank = Number(result.rank) || 0;

    let rankPrize = 0;
    if (rank === 1) rankPrize = tour.firstPrize || 0;
    else if (rank === 2) rankPrize = tour.secondPrize || 0;
    else if (rank === 3) rankPrize = tour.thirdPrize || 0;

    const killPrize = kills * (tour.perKill || 0);
    const totalPrize = rankPrize + killPrize;

    if (participant) {
      participant.kills = kills;
      participant.rank = rank;
      participant.prizeWon = totalPrize;
    }

    if (user) {
      user.totalKills = (user.totalKills || 0) + kills;
      if (totalPrize > 0) {
        user.walletBalance = (user.walletBalance || 0) + totalPrize;
        user.totalWinnings = (user.totalWinnings || 0) + totalPrize;

        // Record prize transaction
        db.transactions.unshift({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          userId: user.id,
          type: 'prize_won',
          amount: totalPrize,
          description: `Prize for ${tour.title} (Rank #${rank > 0 ? rank : 'N/A'}, ${kills} Kills)`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          referenceId: tour.id,
        });

        winnersList.push({
          rank,
          userId: user.id,
          username: user.username,
          freeFireName: user.freeFireName,
          freeFireUid: user.freeFireUid,
          kills,
          prizeAmount: totalPrize,
        });
      }
    }
  });

  tour.status = 'completed';
  tour.winners = winnersList.sort((a, b) => {
    if (a.rank > 0 && b.rank > 0) return a.rank - b.rank;
    return b.prizeAmount - a.prizeAmount;
  });

  saveDb(db);

  res.json({
    message: 'Match results declared and prizes credited directly to player wallets!',
    tournament: tour,
  });
});

// Admin: Get all Deposits
app.get('/api/admin/deposits', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  res.json(db.deposits);
});

// Admin: Approve or Reject Deposit (Updates User Wallet Instantly)
app.post('/api/admin/deposits/:id/status', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { status, adminNote } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Valid status ("approved" or "rejected") is required.' });
  }

  const db = getDb();
  const deposit = db.deposits.find(d => d.id === req.params.id);
  if (!deposit) {
    return res.status(404).json({ error: 'Deposit request not found.' });
  }

  if (deposit.status !== 'pending') {
    return res.status(400).json({ error: `This deposit request has already been ${deposit.status}.` });
  }

  deposit.status = status;
  deposit.adminNote = adminNote || (status === 'approved' ? 'Verified in bank.' : 'Invalid transaction ID or payment not received.');
  deposit.processedAt = new Date().toISOString();

  const user = db.users.find(u => u.id === deposit.userId);

  // Find associated transaction
  const tx = db.transactions.find(t => t.referenceId === deposit.id || (t.userId === deposit.userId && t.type === 'deposit' && t.status === 'pending'));

  if (status === 'approved') {
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + deposit.amount;
    }
    if (tx) {
      tx.status = 'completed';
      tx.description = `Wallet Top-up approved (UTR: ${deposit.transactionId})`;
    } else if (user) {
      db.transactions.unshift({
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'deposit',
        amount: deposit.amount,
        description: `Deposit Approved (UTR: ${deposit.transactionId})`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    }
  } else {
    if (tx) {
      tx.status = 'failed';
      tx.description = `Deposit Rejected: ${deposit.adminNote}`;
    }
  }

  saveDb(db);

  res.json({
    message: status === 'approved' 
      ? `Deposit of ₹${deposit.amount} approved and credited to ${deposit.username}'s wallet!`
      : `Deposit of ₹${deposit.amount} was rejected.`,
    deposit,
    userBalance: user ? user.walletBalance : undefined,
  });
});

// Admin: Get all Withdrawals
app.get('/api/admin/withdrawals', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  res.json(db.withdrawals);
});

// Admin: Approve / Mark as Paid or Reject Withdrawal
app.post('/api/admin/withdrawals/:id/status', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { status, adminReference, adminNote } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Valid status ("approved" or "rejected") is required.' });
  }

  const db = getDb();
  const withdrawal = db.withdrawals.find(w => w.id === req.params.id);
  if (!withdrawal) {
    return res.status(404).json({ error: 'Withdrawal request not found.' });
  }

  if (withdrawal.status !== 'pending') {
    return res.status(400).json({ error: `Withdrawal request already marked as ${withdrawal.status}.` });
  }

  withdrawal.status = status;
  withdrawal.adminReference = adminReference || '';
  withdrawal.adminNote = adminNote || (status === 'approved' ? 'Transferred via UPI/IMPS' : 'Incorrect payout details');
  withdrawal.processedAt = new Date().toISOString();

  const user = db.users.find(u => u.id === withdrawal.userId);
  const tx = db.transactions.find(t => t.referenceId === withdrawal.id || (t.userId === withdrawal.userId && t.type === 'withdrawal' && t.status === 'pending'));

  if (status === 'approved') {
    if (tx) {
      tx.status = 'completed';
      tx.description = `Withdrawal Paid (Ref: ${adminReference || 'Bank Transfer'})`;
    }
  } else {
    // Refund balance back to user
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + withdrawal.amount;
    }
    if (tx) {
      tx.status = 'failed';
      tx.description = `Withdrawal Rejected & Refunded: ${withdrawal.adminNote}`;
    }
    // Add refund transaction record
    if (user) {
      db.transactions.unshift({
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'refund',
        amount: withdrawal.amount,
        description: `Refund for rejected withdrawal: ${withdrawal.adminNote}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveDb(db);

  res.json({
    message: status === 'approved'
      ? `Withdrawal of ₹${withdrawal.amount} marked as Paid!`
      : `Withdrawal of ₹${withdrawal.amount} rejected and funds refunded to user.`,
    withdrawal,
  });
});

// Admin: Manage Users & Balance Adjustment
app.get('/api/admin/users', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  res.json(db.users);
});

app.post('/api/admin/users/:id/adjust-balance', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, reason, type } = req.body; // type: 'add' | 'deduct'
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid amount.' });
  }

  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (type === 'deduct') {
    user.walletBalance = Math.max(0, (user.walletBalance || 0) - numAmount);
  } else {
    user.walletBalance = (user.walletBalance || 0) + numAmount;
  }

  db.transactions.unshift({
    id: `tx_${Date.now()}`,
    userId: user.id,
    type: 'admin_adjustment',
    amount: numAmount,
    description: `Admin Balance ${type === 'deduct' ? 'Deduction' : 'Credit'}: ${reason || 'Manual Adjustment'}`,
    status: 'completed',
    createdAt: new Date().toISOString(),
  });

  saveDb(db);

  res.json({ message: `Balance updated. New Balance: ₹${user.walletBalance}`, user });
});

// Admin: Banner Management CRUD
app.get('/api/admin/banners', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  const banners = [...(db.banners || [])].sort((a, b) => a.order - b.order);
  res.json(banners);
});

app.post('/api/admin/banners', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { title, subtitle, badge, imageUrl, linkTab, tournamentId, active, order, headlineText, descriptionText, buttonText } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Banner image URL or file is required.' });
  }

  const db = getDb();
  if (!db.banners) db.banners = [];

  const newBanner: BannerSlide = {
    id: `banner_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: (title || '').trim(),
    subtitle: (subtitle || '').trim(),
    badge: (badge || '').trim(),
    imageUrl: imageUrl.trim(),
    linkTab: linkTab || 'tournaments',
    tournamentId: tournamentId || undefined,
    active: active !== false,
    order: Number(order) || (db.banners.length + 1),
    headlineText: headlineText ? headlineText.trim() : undefined,
    descriptionText: descriptionText ? descriptionText.trim() : undefined,
    buttonText: buttonText ? buttonText.trim() : 'Tournament details',
  };

  db.banners.push(newBanner);
  saveDb(db);
  res.json({ banner: newBanner, message: 'Banner created successfully!' });
});

app.put('/api/admin/banners/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.banners) db.banners = [];

  const index = db.banners.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Banner not found' });
  }

  const updated: BannerSlide = {
    ...db.banners[index],
    ...req.body,
    id: db.banners[index].id,
  };

  db.banners[index] = updated;
  saveDb(db);
  res.json({ banner: updated, message: 'Banner updated successfully!' });
});

app.delete('/api/admin/banners/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.banners) db.banners = [];

  const index = db.banners.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Banner not found' });
  }

  db.banners.splice(index, 1);
  saveDb(db);
  res.json({ message: 'Banner deleted successfully!' });
});

// Admin: Browse Games CRUD
app.get('/api/admin/browse-games', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  const games = [...(db.browseGames || [])].sort((a, b) => a.order - b.order);
  res.json(games);
});

app.post('/api/admin/browse-games', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { title, imageUrl, status, badge, active, order, linkTab } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Game title and image URL are required.' });
  }

  const db = getDb();
  if (!db.browseGames) db.browseGames = [];

  const newGame: BrowseGameItem = {
    id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: title.trim(),
    imageUrl: imageUrl.trim(),
    status: status === 'LIVE' ? 'LIVE' : 'COMING_SOON',
    badge: badge ? badge.trim() : (status === 'LIVE' ? 'LIVE NOW' : 'COMING SOON'),
    active: active !== false,
    order: Number(order) || (db.browseGames.length + 1),
    linkTab: linkTab || 'tournaments',
  };

  db.browseGames.push(newGame);
  saveDb(db);
  res.json({ game: newGame, message: 'Game added successfully!' });
});

app.put('/api/admin/browse-games/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.browseGames) db.browseGames = [];

  const index = db.browseGames.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const updated: BrowseGameItem = {
    ...db.browseGames[index],
    ...req.body,
    id: db.browseGames[index].id,
  };

  db.browseGames[index] = updated;
  saveDb(db);
  res.json({ game: updated, message: 'Game updated successfully!' });
});

app.delete('/api/admin/browse-games/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.browseGames) db.browseGames = [];

  const index = db.browseGames.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }

  db.browseGames.splice(index, 1);
  saveDb(db);
  res.json({ message: 'Game removed successfully!' });
});

// Admin: Past Tournaments CRUD
app.get('/api/admin/past-tournaments', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  const past = [...(db.pastTournaments || [])].sort((a, b) => a.order - b.order);
  res.json(past);
});

app.post('/api/admin/past-tournaments', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { title, tag, dates, imageUrl, winnerTeam, prizePool, active, order } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Tournament title and poster image URL are required.' });
  }

  const db = getDb();
  if (!db.pastTournaments) db.pastTournaments = [];

  const newPast: PastTournamentItem = {
    id: `past_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: title.trim(),
    tag: tag ? tag.trim() : 'Invite',
    dates: dates ? dates.trim() : 'Dates TBA',
    imageUrl: imageUrl.trim(),
    winnerTeam: winnerTeam ? winnerTeam.trim() : undefined,
    prizePool: prizePool ? prizePool.trim() : undefined,
    active: active !== false,
    order: Number(order) || (db.pastTournaments.length + 1),
  };

  db.pastTournaments.push(newPast);
  saveDb(db);
  res.json({ pastTournament: newPast, message: 'Past tournament added!' });
});

app.put('/api/admin/past-tournaments/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.pastTournaments) db.pastTournaments = [];

  const index = db.pastTournaments.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Past tournament not found' });
  }

  const updated: PastTournamentItem = {
    ...db.pastTournaments[index],
    ...req.body,
    id: db.pastTournaments[index].id,
  };

  db.pastTournaments[index] = updated;
  saveDb(db);
  res.json({ pastTournament: updated, message: 'Past tournament updated!' });
});

app.delete('/api/admin/past-tournaments/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.pastTournaments) db.pastTournaments = [];

  const index = db.pastTournaments.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Past tournament not found' });
  }

  db.pastTournaments.splice(index, 1);
  saveDb(db);
  res.json({ message: 'Past tournament deleted!' });
});

// Admin: Featured Large Prize Tournaments CRUD
app.get('/api/admin/featured-large-prizes', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  const prizes = [...(db.featuredLargePrizes || [])].sort((a, b) => a.order - b.order);
  res.json(prizes);
});

app.post('/api/admin/featured-large-prizes', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { title, imageUrl, iconUrl, timeTag, subtitle, prizePool, active, order, tournamentId } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Title and image URL are required.' });
  }

  const db = getDb();
  if (!db.featuredLargePrizes) db.featuredLargePrizes = [];

  const newItem: FeaturedLargePrizeItem = {
    id: `flp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: title.trim(),
    imageUrl: imageUrl.trim(),
    iconUrl: iconUrl ? iconUrl.trim() : undefined,
    timeTag: timeTag ? timeTag.trim() : 'LIVE SOON',
    subtitle: subtitle ? subtitle.trim() : '1v1 • Custom',
    prizePool: prizePool ? prizePool.trim() : '₹1,000',
    active: active !== false,
    order: Number(order) || (db.featuredLargePrizes.length + 1),
    tournamentId: tournamentId || undefined,
  };

  db.featuredLargePrizes.push(newItem);
  saveDb(db);
  res.json({ item: newItem, message: 'Large prize tournament showcase created!' });
});

app.put('/api/admin/featured-large-prizes/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.featuredLargePrizes) db.featuredLargePrizes = [];

  const index = db.featuredLargePrizes.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const updated: FeaturedLargePrizeItem = {
    ...db.featuredLargePrizes[index],
    ...req.body,
    id: db.featuredLargePrizes[index].id,
  };

  db.featuredLargePrizes[index] = updated;
  saveDb(db);
  res.json({ item: updated, message: 'Large prize tournament showcase updated!' });
});

app.delete('/api/admin/featured-large-prizes/:id', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getDb();
  if (!db.featuredLargePrizes) db.featuredLargePrizes = [];

  const index = db.featuredLargePrizes.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  db.featuredLargePrizes.splice(index, 1);
  saveDb(db);
  res.json({ message: 'Item deleted!' });
});

// Admin: Settings CRUD
app.get('/api/admin/settings', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  res.json(db.settings);
});

app.put('/api/admin/settings', (req, res) => {
  if (!checkAdminPin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDb();
  db.settings = {
    ...db.settings,
    ...req.body,
  };

  saveDb(db);
  res.json({ settings: db.settings, message: 'Payment and arena settings updated successfully!' });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 FF Esports Arena server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

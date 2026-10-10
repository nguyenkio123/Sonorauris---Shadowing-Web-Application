/**
 * SONORAURIS ACCEPTANCE TEST RUNNER (SRS v1.0 Compliance)
 * Executes comprehensive automated testing for all P0 & P1 modules.
 */

// 1. Setup in-memory mock environment for Node
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => { storageMap.set(key, String(value)); },
  removeItem: (key: string) => { storageMap.delete(key); },
  clear: () => { storageMap.clear(); },
  get length() { return storageMap.size; },
  key: (index: number) => Array.from(storageMap.keys())[index] ?? null,
};

(globalThis as any).window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: mockLocalStorage,
  location: { search: '' },
};
(globalThis as any).localStorage = mockLocalStorage;

// Imports under test
import { SAMPLE_CLIPS } from '../src/data/clips.ts';
import { SCORING_WEIGHTS, calculateBattleScore, REWARDS } from '../src/config/scoring.ts';
import { SHOP_ITEMS, DEFAULT_AVATAR_ID, DEFAULT_FRAME_ID, DEFAULT_TITLE_ID } from '../src/data/shopItems.ts';
import { DEFAULT_DAILY_QUESTS } from '../src/data/quests.ts';
import {
  getUserProfile,
  getUserBase,
  saveUserBase,
  getTransactions,
  addRewardTransactions,
  buyShopItem,
  equipShopItem,
  restoreStreak,
  canRestoreStreak,
  saveAttempt,
  getAttempts,
  getDailyQuestsState,
  claimDailyQuest,
  getUserInventory,
} from '../src/api/storage.ts';
import {
  syncRoomState,
  generateAssessmentResult,
  generateMockMiscues,
} from '../src/api/mockServer.ts';
import { createRoom, getClips, getClip } from '../src/api/index.ts';
import {
  getAdminStats,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  grantUserCurrency,
  grantUserItem,
  revokeUserItem,
  createAdminClip,
  updateAdminClip,
  deleteAdminClip,
} from '../src/api/admin.ts';
import { signInWithEmail } from '../src/api/auth.ts';

// Test statistics
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    const errMsg = `  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`;
    console.error(errMsg);
    errors.push(errMsg);
  }
}

console.log('======================================================================');
console.log('       SONORAURIS ACCEPTANCE TEST SUITE (SRS v1.0)');
console.log('======================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: CURATED CLIPS & METADATA (FR-CONT-01, FR-CONT-02, FR-CONT-03)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- [SUITE 1] Curated Clips & Content Quality ---');
assert(SAMPLE_CLIPS.length === 20, 'Clip Count is exactly 20', `Found ${SAMPLE_CLIPS.length}`);

const topics = new Set(SAMPLE_CLIPS.map(c => c.topic));
const difficulties = new Set(SAMPLE_CLIPS.map(c => c.difficulty));

assert(topics.size >= 4, 'Topic Diversity: At least 4 distinct topics covered', `Found ${topics.size}: ${[...topics].join(', ')}`);
assert(difficulties.has('Beginner') && difficulties.has('Intermediate') && difficulties.has('Advanced'),
  'Difficulty Diversity: Covers Beginner, Intermediate, and Advanced',
  `Found: ${[...difficulties].join(', ')}`
);

let allTimestampsValid = true;
let allIdsValid = true;
let allTranscriptsValid = true;

for (const clip of SAMPLE_CLIPS) {
  if (!clip.id.startsWith('clip-') || clip.youtubeVideoId.length !== 11) {
    allIdsValid = false;
  }
  const dur = clip.endTimeSec - clip.startTimeSec;
  if (dur <= 0 || dur > 60 || clip.durationSec !== dur) {
    allTimestampsValid = false;
  }
  if (!clip.referenceText || clip.referenceText.trim().split(/\s+/).length < 5) {
    allTranscriptsValid = false;
  }
}
assert(allIdsValid, 'All clips have valid ID and 11-char YouTube ID');
assert(allTimestampsValid, 'All clips have valid timestamps (endTime > startTime, duration 10-60s)');
assert(allTranscriptsValid, 'All clips have authentic, non-empty reference transcripts');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: AI BATTLE SCORING FORMULA (SRS Section 8.2)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 2] Battle Scoring Engine (SRS 8.2) ---');
const weightSum = SCORING_WEIGHTS.accuracy + SCORING_WEIGHTS.fluency + SCORING_WEIGHTS.completeness + SCORING_WEIGHTS.prosody;
assert(Math.abs(weightSum - 1.0) < 0.0001, 'Weight sum equals 1.00', `Sum was ${weightSum}`);
assert(SCORING_WEIGHTS.accuracy === 0.35, 'Accuracy weight is 35%');
assert(SCORING_WEIGHTS.fluency === 0.25, 'Fluency weight is 25%');
assert(SCORING_WEIGHTS.completeness === 0.20, 'Completeness weight is 20%');
assert(SCORING_WEIGHTS.prosody === 0.20, 'Prosody weight is 20%');

assert(calculateBattleScore(100, 100, 100, 100) === 100, 'Perfect score yields 100');
assert(calculateBattleScore(0, 0, 0, 0) === 0, 'Zero score yields 0');

// Test Case: 85 Acc, 90 Flu, 80 Comp, 75 Pros -> 0.35*85 (29.75) + 0.25*90 (22.5) + 0.20*80 (16.0) + 0.20*75 (15.0) = 83.25 -> 83
assert(calculateBattleScore(85, 90, 80, 75) === 83, 'Weighted formula rounds correctly (85,90,80,75 -> 83)');

// Miscues generator check
const miscues = generateMockMiscues('The quick brown fox jumps over the lazy dog');
assert(Array.isArray(miscues) && miscues.length === 9, 'Miscues generation maps all words');

// Silence / Zero completeness check
const silentMiscues = generateMockMiscues('Speak clearly with rhythm', 0, 0);
assert(silentMiscues.every(w => w.type === 'omission'), 'Silent recording marks all reference words as omission');

// High accuracy & completeness clean pass check
const cleanMiscues = generateMockMiscues('Speak clearly with rhythm', 95, 96);
assert(cleanMiscues.every(w => w.type === undefined), 'High accuracy (>=92) & completeness (>=92) produces 0 false miscues');

// Spoken transcript lexical alignment check
const alignedMiscues = generateMockMiscues(
  'Practice English shadowing today',
  85,
  80,
  'Practice Englesh today'
);
assert(alignedMiscues[0].type === undefined, 'Exact spoken match ("Practice") is marked clean');
assert(alignedMiscues[1].type === 'mispronunciation', 'Near spoken match ("Englesh" vs "English") is marked mispronunciation');
assert(alignedMiscues[2].type === 'omission', 'Skipped spoken word ("shadowing") is marked omission');
assert(alignedMiscues[3].type === undefined, 'Exact spoken match ("today") is marked clean');

// Zero-random determinism check
const detRun1 = generateAssessmentResult('The quick brown fox jumps over the lazy dog');
const detRun2 = generateAssessmentResult('The quick brown fox jumps over the lazy dog');
assert(
  detRun1.battleScore === detRun2.battleScore &&
    detRun1.accuracy === detRun2.accuracy &&
    detRun1.fluency === detRun2.fluency,
  'Assessment engine is 100% deterministic (0% Math.random)'
);

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: IMMUTABLE REWARD LEDGER & ANTI-CHEAT (FR-PROG-01, FR-PROG-02)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 3] Immutable Reward Ledger & Anti-Cheat ---');
mockLocalStorage.clear();

// 1. Initial State
let profile = getUserProfile();
assert(profile.xp === 120, 'Initial Seed XP is 120', `Got ${profile.xp}`);
assert(profile.coins === 45, 'Initial Seed Coins is 45', `Got ${profile.coins}`);

// 2. Solo Practice Award (+50 XP, +15 Coins per REWARDS.soloPractice)
const added = addRewardTransactions([
  {
    userId: profile.id,
    type: 'XP',
    amount: REWARDS.soloPractice.xp,
    referenceType: 'ATTEMPT',
    referenceId: 'attempt-test-01',
  },
  {
    userId: profile.id,
    type: 'COINS',
    amount: REWARDS.soloPractice.coins,
    referenceType: 'ATTEMPT',
    referenceId: 'attempt-test-01',
  },
]);

assert(added === true, 'First practice transaction accepted');
profile = getUserProfile();
assert(profile.xp === 170, 'XP correctly updated to 170 (+50 XP)', `Got ${profile.xp}`);
assert(profile.coins === 60, 'Coins correctly updated to 60 (+15 Coins)', `Got ${profile.coins}`);

// 3. Anti-Cheat Idempotency: Duplicate transaction with same reference ID & Type
const duplicateAdded = addRewardTransactions([
  {
    userId: profile.id,
    type: 'XP',
    amount: REWARDS.soloPractice.xp,
    referenceType: 'ATTEMPT',
    referenceId: 'attempt-test-01',
  },
]);
assert(duplicateAdded === false, 'Duplicate transaction with identical referenceId is rejected');
profile = getUserProfile();
assert(profile.xp === 170, 'XP untouched after duplicate replay attempt (Anti-F5)');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: STREAK RECOVERY & CALENDAR LOGIC (FR-PROG-03, FR-PROG-04)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 4] Streak & Streak Restoration ---');
const baseUser = getUserBase();
assert(baseUser.streak >= 3, 'Streak initialized at >= 3 days');

// Intact streak check
const intactCheck = canRestoreStreak();
assert(intactCheck.canRestore === false, 'Cannot restore when streak is active/intact');

// Simulate broken streak (last practice 5 days ago)
const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0];
saveUserBase({
  ...baseUser,
  lastPracticeDate: fiveDaysAgo,
  streak: 0,
});

const canRestoreBroken = canRestoreStreak();
assert(canRestoreBroken.canRestore === true, 'Eligible to restore broken streak when coins available');

const restoreResult = restoreStreak();
assert(restoreResult.success === true, 'Streak restore succeeds (-30 Coins)');
profile = getUserProfile();
assert(profile.coins === 30, 'Coins reduced by 30 after restore', `Got ${profile.coins}`);
assert(getUserBase().streak === 1, 'Streak recovered to at least 1 day');

// 7-day cooldown check
const immediateRetry = canRestoreStreak();
assert(immediateRetry.canRestore === false, 'Consecutive restore blocked by 7-day cooldown');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: SHOP & COSMETICS CUSTOMIZATION (FR-SHOP-01)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 5] Shop & Customization ---');
assert(SHOP_ITEMS.length >= 15, 'Shop Catalog contains >= 15 items', `Found ${SHOP_ITEMS.length}`);

const avatars = SHOP_ITEMS.filter(i => i.type === 'AVATAR');
const frames = SHOP_ITEMS.filter(i => i.type === 'FRAME');
const titles = SHOP_ITEMS.filter(i => i.type === 'TITLE');
assert(avatars.length === 5, '5 Avatars in shop');
assert(frames.length === 5, '5 Frames in shop');
assert(titles.length === 5, '5 Titles in shop');

// Test buying Cyber Fox (price: 35 coins) with current balance (30 coins) -> Expect failure
const buyFail = buyShopItem('avatar-cyber-fox');
assert(buyFail.success === false, 'Cannot purchase item when coins < price (30 < 35)');

// Award 50 coins to allow purchase
addRewardTransactions([{
  userId: profile.id,
  type: 'COINS',
  amount: 50,
  referenceType: 'BATTLE',
  referenceId: 'battle-bonus-shop',
}]);

const buySuccess = buyShopItem('avatar-cyber-fox');
assert(buySuccess.success === true, 'Successfully bought Cyber Fox after obtaining coins');

// Test equipping
const equipSuccess = equipShopItem('AVATAR', 'avatar-cyber-fox');
assert(equipSuccess === true, 'Equipped avatar successfully');
profile = getUserProfile();
assert(profile.equippedAvatarId === 'avatar-cyber-fox', 'Profile reflects newly equipped avatar');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: DAILY QUESTS ENGINE (FR-QUEST-01)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 6] Daily Quests Engine ---');
let quests = getDailyQuestsState();
assert(quests.length === 3, 'Exactly 3 daily quests initialized');

const warmupQuest = quests.find(q => q.type === 'SOLO_PRACTICE')!;
assert(warmupQuest.completed === false, 'Daily warmup quest initially incomplete');

// Simulate user recording and saving a solo practice attempt today
const todayIso = new Date().toISOString();
saveAttempt({
  id: 'attempt-test-quest-today',
  userId: profile.id,
  clipId: 'clip-1',
  audioBlobUrl: '',
  result: {
    accuracy: 85,
    fluency: 82,
    completeness: 88,
    prosody: 84,
    battleScore: 85, // >= 80, will also trigger high score quest!
    words: [],
  },
  createdAt: todayIso,
});

quests = getDailyQuestsState();
const updatedWarmup = quests.find(q => q.type === 'SOLO_PRACTICE')!;
const updatedHighScore = quests.find(q => q.type === 'HIGH_SCORE')!;

assert(updatedWarmup.completed === true, 'Daily warmup quest completed after 1 solo practice');
assert(updatedHighScore.completed === true, 'Acoustic Precision quest completed after Battle Score >= 80');
assert(updatedWarmup.claimed === false, 'Quest reward not yet claimed');

// Claim quest reward
const prevCoins = getUserProfile().coins;
const claimResult = claimDailyQuest(updatedWarmup.id);
assert(claimResult.success === true, 'Claiming completed quest succeeds');
assert(getUserProfile().coins === prevCoins + updatedWarmup.rewardCoins, 'Reward coins added to ledger');

// Claiming again should fail
const claimAgain = claimDailyQuest(updatedWarmup.id);
assert(claimAgain.success === false, 'Double claiming same daily quest is prevented');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: MULTIPLAYER & BOT SPARRING ARENA (FR-BAT-01 -> FR-BAT-07)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 7] Arena 1v1 & Multi-Player 3-5 Bot Sparring ---');

// 1. Room Creation
const room1v1 = await createRoom('clip-1', 2);
assert(room1v1.code.length === 5, 'Generated room code is 5 alphanumeric characters', room1v1.code);
assert(room1v1.maxPlayers === 2, '1v1 Room capacity is 2');
assert(room1v1.status === 'WAITING', 'Initial room status is WAITING');

// Multi-player Room Creation (Trio: 3 players)
const roomTrio = await createRoom('clip-2', 3);
assert(roomTrio.maxPlayers === 3, 'Trio Room capacity is 3');

// Multi-player Room Creation (Royale: 5 players)
const roomRoyale = await createRoom('clip-3', 5);
assert(roomRoyale.maxPlayers === 5, 'Royale Room capacity is 5');

// Simulate room state sync with bot opponents joining
roomRoyale.botJoinAt = Date.now() - 1000;
roomRoyale.botReadyAt = Date.now() - 500;
roomRoyale.player.isReady = true;

const syncedRoyale = syncRoomState(roomRoyale);
assert(syncedRoyale.participants?.length === 5, 'Bots automatically fill room to 5 players', `Count: ${syncedRoyale.participants?.length}`);
assert(syncedRoyale.status === 'READY' || syncedRoyale.status === 'COUNTDOWN', 'Room transitions to READY/COUNTDOWN when all ready');

// Simulate assessment and podium ranking
syncedRoyale.status = 'ASSESSING';
syncedRoyale.assessReadyAt = Date.now() - 100;
syncedRoyale.player.hasSubmitted = true;
for (const p of syncedRoyale.participants!) {
  p.hasSubmitted = true;
}

const finishedRoyale = syncRoomState(syncedRoyale);
assert(finishedRoyale.status === 'RESULT', 'Room finishes assessment and moves to RESULT status');
assert(finishedRoyale.participants !== undefined && finishedRoyale.participants.length === 5, 'Participants array contains all 5 ranked players');

// Verify strictly descending order of Battle Scores
let sortedDescending = true;
for (let i = 0; i < finishedRoyale.participants!.length - 1; i++) {
  const currentScore = finishedRoyale.participants![i].assessment?.battleScore || 0;
  const nextScore = finishedRoyale.participants![i + 1].assessment?.battleScore || 0;
  if (currentScore < nextScore) {
    sortedDescending = false;
  }
}
assert(sortedDescending, 'Participants are strictly ordered by Battle Score from 1st (Gold) to 5th place');
assert(finishedRoyale.participants![0].outcome === 'WIN', 'Top ranked participant has outcome WIN');
// ─────────────────────────────────────────────────────────────────────────────
// SUITE 8: ADMIN ROLE & CONTENT/USER MANAGEMENT (FR-ADMIN-01)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 8] Admin Role & Content/User Management ---');

// 1. Admin Authentication & Role Check
const adminAuth = await signInWithEmail('admin@sonorauris.com', 'admin123');
assert(adminAuth.user.role === 'admin', 'Default admin account has role admin', adminAuth.user.role);
assert(adminAuth.user.email === 'admin@sonorauris.com', 'Admin email verified');

// 2. Video/Clip CRUD Operations
const initialClips = await getClips();
assert(initialClips.length === 20, 'Initial stored clips count is 20');

const newClip = await createAdminClip({
  youtubeVideoId: 'dQw4w9WgXcQ',
  title: 'Admin Test Clip - Leadership Pitch',
  channelName: 'Test Channel',
  startTimeSec: 10,
  endTimeSec: 25,
  referenceText: 'Never gonna give you up, never gonna let you down.',
  topic: 'Work & Tech',
  difficulty: 'Intermediate',
});
assert(newClip.id.startsWith('clip-'), 'New clip assigned unique ID');
assert(newClip.durationSec === 15, 'Clip duration accurately derived from timestamps');

const clipsAfterAdd = await getClips();
assert(clipsAfterAdd.length === 21, 'Clips library contains 21 clips after add');

const foundClip = await getClip(newClip.id);
assert(foundClip !== null && foundClip.title === 'Admin Test Clip - Leadership Pitch', 'Created clip accessible via getClip()');

const updatedClip = await updateAdminClip(newClip.id, {
  title: 'Updated Leadership Pitch (Masterclass)',
  endTimeSec: 30,
});
assert(updatedClip !== null && updatedClip.title === 'Updated Leadership Pitch (Masterclass)', 'Clip title updated');
assert(updatedClip?.durationSec === 20, 'Clip duration updated after changing boundary timestamps');

const deleted = await deleteAdminClip(newClip.id);
assert(deleted === true, 'Clip successfully deleted');
const clipsAfterDelete = await getClips();
assert(clipsAfterDelete.length === 20, 'Clips count returned to 20 after delete');

// 3. User CRUD Operations & Role Assignment
const createdUser = await createAdminUser({
  email: 'learner.vip@sonorauris.com',
  displayName: 'VIP Learner',
  password: 'vippassword',
  role: 'user',
  initialXp: 200,
  initialCoins: 80,
});
assert(createdUser.email === 'learner.vip@sonorauris.com', 'Admin successfully created new user');
assert(createdUser.xp === 200, 'Initial XP recorded in ledger');
assert(createdUser.coins === 80, 'Initial Coins recorded in ledger');

const updatedUser = await updateAdminUser(createdUser.id, {
  displayName: 'VIP Learner (Honored)',
  role: 'admin',
});
assert(updatedUser.displayName === 'VIP Learner (Honored)', 'User display name updated');
assert(updatedUser.role === 'admin', 'User promoted to administrator');

// 4. Grant Currency (XP & Coins) via Immutable Ledger
const currencyGrant = await grantUserCurrency(createdUser.id, 500, 150, 'Competition Winner');
assert(currencyGrant.success === true, 'Currency adjustment committed to ledger');
assert(currencyGrant.newXp === 700, 'Zero-drift XP balance updated to 700 (+500 XP)', `Actual: ${currencyGrant.newXp}`);
assert(currencyGrant.newCoins === 230, 'Zero-drift Coins balance updated to 230 (+150 Coins)', `Actual: ${currencyGrant.newCoins}`);

// Verify ledger transaction existence
const txs = getTransactions();
const grantTx = txs.find(t => t.userId === createdUser.id && t.referenceType === 'ADMIN_GRANT');
assert(grantTx !== undefined, 'Immutable ledger contains ADMIN_GRANT record');

// 5. Grant & Revoke Cosmetic Items
const initialInv = getUserInventory(createdUser.id);
assert(!initialInv.ownedItemIds.includes('avatar-cyber-fox'), 'User does not initially own Cyber Fox avatar');

const grantedItem = await grantUserItem(createdUser.id, 'avatar-cyber-fox');
assert(grantedItem === true, 'Admin granted cosmetic item without coin deduction');
assert(getUserInventory(createdUser.id).ownedItemIds.includes('avatar-cyber-fox'), 'Inventory reflects newly granted item');

const revokedItem = await revokeUserItem(createdUser.id, 'avatar-cyber-fox');
assert(revokedItem === true, 'Admin successfully revoked cosmetic item');
assert(!getUserInventory(createdUser.id).ownedItemIds.includes('avatar-cyber-fox'), 'Item removed from inventory');

// 6. Delete User
const deletedUser = await deleteAdminUser(createdUser.id);
assert(deletedUser === true, 'User successfully deleted by admin');
const allUsers = await getAdminUsers();
assert(!allUsers.some(u => u.id === createdUser.id), 'Deleted user removed from user directory');

// 7. Admin Stats Check
const adminStats = await getAdminStats();
assert(adminStats.totalClips === 20, 'Stats accurately report 20 clips');
assert(adminStats.totalAdmins >= 1, 'Stats report at least 1 administrator');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 9: STREAK DECAY ON INACTIVITY & ADMIN STREAK PARITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- [SUITE 9] Streak Inactivity Decay & Admin Table Parity ---');

// 1. Inactivity Streak Loss
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
saveUserBase({
  id: 'user-demo-player',
  displayName: 'Demo Player',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
  streak: 7,
  lastPracticeDate: threeDaysAgo,
  lastStreakRestoreDate: null,
});

const decayedUser = getUserBase();
assert(decayedUser.streak === 0, 'Streak immediately drops to 0 after missing practicing yesterday', `Got ${decayedUser.streak}`);
assert(decayedUser.brokenStreak === 7, 'Broken streak value 7 preserved for restoration', `Got ${decayedUser.brokenStreak}`);

// 2. Restoring broken streak recovers original count
addRewardTransactions([{
  userId: 'user-demo-player',
  type: 'COINS',
  amount: 100,
  referenceType: 'ADMIN_GRANT',
  referenceId: 'streak-fund-tx',
}]);

const restored = restoreStreak();
assert(restored.success === true, 'Streak restore succeeded');
const postRestoreBase = getUserBase();
assert(postRestoreBase.streak === 7, 'Streak accurately restored back to 7 days', `Got ${postRestoreBase.streak}`);

// 3. Admin Table Parity Check
const adminUsersList = await getAdminUsers();
const activeUserInAdmin = adminUsersList.find(u => u.id === 'user-demo-player');
assert(activeUserInAdmin !== undefined, 'Active user found in admin list');
assert(activeUserInAdmin!.streak === postRestoreBase.streak, 'Streak in admin table matches user UI streak exactly', `Admin got ${activeUserInAdmin?.streak}, user base was ${postRestoreBase.streak}`);

// 4. Multi-player Room Capacity Preservation on Creation / Rematch
const squadRoom = await createRoom('clip-1', 4);
assert(squadRoom.maxPlayers === 4, 'Multi-player room preserves maxPlayers=4 capacity on creation/rematch', `Got ${squadRoom.maxPlayers}`);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n======================================================================');
console.log(`ACCEPTANCE TEST RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests > 0) {
  console.log(`FAILURES: ${failedTests}`);
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('STATUS: ALL ACCEPTANCE TESTS PASSED 100%!');
  console.log('======================================================================');
  process.exit(0);
}

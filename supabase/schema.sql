-- ==============================================================================
-- SONORAURIS: Competitive English Shadowing MVP v1.0
-- Comprehensive Database Schema for PostgreSQL & Supabase (SRS Section 12)
-- Includes: Auth Triggers, Realtime Publications, Zero-drift Ledger, 
--           Admin Roles, 20 Curated Clips Seed & Shop Cosmetics Catalog.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (FR-AUTH-01, FR-AUTH-02, FR-ADMIN-01)
-- Stores profile metadata, streak, cosmetic loadouts, and role privileges
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'Learner',
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
    streak INT NOT NULL DEFAULT 0,
    last_practice_date DATE,
    last_streak_restore_date TIMESTAMP WITH TIME ZONE,
    equipped_avatar_id TEXT DEFAULT 'avatar-default',
    equipped_frame_id TEXT DEFAULT 'frame-none',
    equipped_title_id TEXT DEFAULT 'title-learner',
    role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. VIDEOS TABLE (Metadata only per SRS Section 11 & copyright rules)
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    youtube_video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    source_url TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CLIPS TABLE (Curated benchmark references per SRS Section 11 & 12)
CREATE TABLE IF NOT EXISTS public.clips (
    id TEXT PRIMARY KEY,
    video_id TEXT REFERENCES public.videos(id) ON DELETE SET NULL,
    youtube_video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    source_url TEXT,
    channel_name TEXT DEFAULT 'YouTube',
    start_time_sec INT NOT NULL,
    end_time_sec INT NOT NULL,
    duration_sec INT NOT NULL,
    reference_text TEXT NOT NULL,
    topic TEXT NOT NULL, -- 'Daily Life', 'Work & Tech', 'Movies & Culture', 'Debate & Opinion', 'Science & Nature'
    difficulty TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
    locale TEXT NOT NULL DEFAULT 'en-US',
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ATTEMPTS TABLE (Solo Shadowing AI Assessments per SRS FR-AI-01 -> FR-AI-03)
CREATE TABLE IF NOT EXISTS public.attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    clip_id TEXT REFERENCES public.clips(id) ON DELETE CASCADE,
    accuracy NUMERIC(5, 2) NOT NULL,
    fluency NUMERIC(5, 2) NOT NULL,
    completeness NUMERIC(5, 2) NOT NULL,
    prosody NUMERIC(5, 2) NOT NULL,
    battle_score INT NOT NULL,
    miscues JSONB DEFAULT '[]'::jsonb,
    is_mock BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. REWARD TRANSACTIONS TABLE (Immutable Ledger Pattern per SRS FR-PROG-01, FR-PROG-02)
-- Strict idempotency guarantee: (user_id, reference_type, reference_id, type)
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id TEXT PRIMARY KEY DEFAULT ('tx-' || replace(uuid_generate_v4()::text, '-', '')),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'XP' | 'COINS'
    amount INT NOT NULL,
    reference_type TEXT NOT NULL, -- 'SEED' | 'ATTEMPT' | 'BATTLE' | 'SHOP' | 'STREAK_RESTORE' | 'QUEST' | 'ADMIN_GRANT'
    reference_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reward_tx_idempotency 
ON public.reward_transactions (user_id, reference_type, reference_id, type);

-- 7. BATTLE ROOMS TABLE (1v1 & 3-5 Multiplayer Arena State Machine per SRS Section 10)
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    code VARCHAR(5) UNIQUE NOT NULL, -- e.g. 'SH7A2'
    clip_id TEXT REFERENCES public.clips(id) ON DELETE SET NULL,
    host_user_id TEXT,
    status TEXT NOT NULL DEFAULT 'WAITING', 
    -- Status enum: 'WAITING', 'READY', 'COUNTDOWN', 'RECORDING', 'SUBMITTING', 'ASSESSING', 'RESULT', 'FINISHED'
    room_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);

-- 8. SHOP ITEMS TABLE (Cosmetics Catalog per SRS FR-SHOP-01)
CREATE TABLE IF NOT EXISTS public.shop_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'AVATAR' | 'FRAME' | 'TITLE'
    name TEXT NOT NULL,
    description TEXT,
    price INT NOT NULL DEFAULT 0,
    asset_value TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'Common', -- 'Common' | 'Rare' | 'Epic' | 'Legendary'
    active BOOLEAN DEFAULT true
);

-- 9. USER ITEMS TABLE (Owned Cosmetics)
CREATE TABLE IF NOT EXISTS public.user_items (
    user_id TEXT NOT NULL,
    item_id TEXT REFERENCES public.shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, item_id)
);

-- ==============================================================================
-- 9B. SAFE MIGRATION FOR EXISTING DATABASES (Idempotent Upgrade)
-- ==============================================================================
DO $$
BEGIN
  -- Safe conversion of UUID columns to TEXT if upgrading from older schema
  ALTER TABLE IF EXISTS public.attempts DROP CONSTRAINT IF EXISTS attempts_user_id_fkey;
  ALTER TABLE IF EXISTS public.reward_transactions DROP CONSTRAINT IF EXISTS reward_transactions_user_id_fkey;
  ALTER TABLE IF EXISTS public.user_items DROP CONSTRAINT IF EXISTS user_items_user_id_fkey;
  ALTER TABLE IF EXISTS public.rooms DROP CONSTRAINT IF EXISTS rooms_host_user_id_fkey;

  ALTER TABLE IF EXISTS public.users ALTER COLUMN id TYPE TEXT USING id::text;
  ALTER TABLE IF EXISTS public.attempts ALTER COLUMN id TYPE TEXT USING id::text;
  ALTER TABLE IF EXISTS public.attempts ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  ALTER TABLE IF EXISTS public.reward_transactions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  ALTER TABLE IF EXISTS public.user_items ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  ALTER TABLE IF EXISTS public.rooms ALTER COLUMN id TYPE TEXT USING id::text;
  ALTER TABLE IF EXISTS public.rooms ALTER COLUMN host_user_id TYPE TEXT USING host_user_id::text;

  -- Add missing columns to users table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
      ALTER TABLE public.users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_streak_restore_date') THEN
      ALTER TABLE public.users ADD COLUMN last_streak_restore_date TIMESTAMP WITH TIME ZONE;
    END IF;
  END IF;

  -- Add missing columns to clips table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clips') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'channel_name') THEN
      ALTER TABLE public.clips ADD COLUMN channel_name TEXT DEFAULT 'YouTube';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'source_url') THEN
      ALTER TABLE public.clips ADD COLUMN source_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'thumbnail_url') THEN
      ALTER TABLE public.clips ADD COLUMN thumbnail_url TEXT;
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==============================================================================
-- 10. AUTH TRIGGER: AUTO-SYNC AUTH.USERS -> PUBLIC.USERS
-- ==============================================================================
-- Ensures that whenever someone signs up via Supabase Auth, a profile row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, role)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id::text),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 11. SUPABASE REALTIME CONFIGURATION (Idempotent publication subscription)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reward_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_transactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'clips'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clips;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==============================================================================
-- 12. DERIVED BALANCES VIEW (Zero-drift Ledger Balance per SRS Section 9)
-- ==============================================================================
CREATE OR REPLACE VIEW public.user_balances AS
SELECT 
    u.id AS user_id,
    u.display_name,
    u.avatar_url,
    u.streak,
    u.role,
    COALESCE(SUM(CASE WHEN rt.type = 'XP' THEN rt.amount ELSE 0 END), 0) AS total_xp,
    COALESCE(SUM(CASE WHEN rt.type = 'COINS' THEN rt.amount ELSE 0 END), 0) AS total_coins
FROM public.users u
LEFT JOIN public.reward_transactions rt ON u.id = rt.user_id
GROUP BY u.id, u.display_name, u.avatar_url, u.streak, u.role;

-- ==============================================================================
-- 13. PERMISSIONS & RLS CONFIGURATION FOR CLIENT APP (Permissive for Competition)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clips DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reward_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shop_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_items DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 14. SEED DATA: 20 CURATED BENCHMARK CLIPS
-- ==============================================================================
INSERT INTO public.clips (
    id, youtube_video_id, title, source_url, channel_name, thumbnail_url,
    start_time_sec, end_time_sec, duration_sec, reference_text, topic, difficulty, locale
) VALUES
(
    'clip-1',
    'UF8uR6Z6KLc',
    'Finding What You Love',
    'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    'Stanford University',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    26,
    40,
    14,
    'I am honored to be with you today for your commencement from one of the finest universities in the world. Truth be told, I never graduated from college.',
    'Debate & Opinion',
    'Beginner',
    'en-US'
),
(
    'clip-2',
    'eIho2S0ZahI',
    'How to Speak so That People Want to Listen',
    'https://www.youtube.com/watch?v=eIho2S0ZahI',
    'TED',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    14,
    24,
    10,
    'The human voice: It''s the instrument we all play. It''s the most powerful sound in the world, probably. It''s the only one that can start a war or say "I love you."',
    'Daily Life',
    'Beginner',
    'en-US'
),
(
    'clip-3',
    'JnfBXjWm7hc',
    'Try Something New for 30 Days',
    'https://www.youtube.com/watch?v=JnfBXjWm7hc',
    'TED',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    15,
    28,
    13,
    'A few years ago, I felt like I was stuck in a rut, so I decided to follow in the footsteps of the great American philosopher, Morgan Spurlock, and try something new for 30 days.',
    'Movies & Culture',
    'Intermediate',
    'en-US'
),
(
    'clip-4',
    'qp0HIF3SfI4',
    'How Great Leaders Inspire Action',
    'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    'TED',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    16,
    27,
    11,
    'How do you explain when things don''t go as we assume? Or better, how do you explain when others are able to achieve things that seem to defy all of the assumptions?',
    'Work & Tech',
    'Intermediate',
    'en-US'
),
(
    'clip-5',
    'wupToqz1e2g',
    'Pale Blue Dot: A Vision of the Human Future',
    'https://www.youtube.com/watch?v=wupToqz1e2g',
    'Carl Sagan',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    154,
    167,
    13,
    'The Earth is the only world known so far to harbor life. There is nowhere else, at least in the near future, to which our species could migrate.',
    'Science & Nature',
    'Advanced',
    'en-US'
),
(
    'clip-6',
    '7sb3x6_h_VU',
    'The Danger of a Single Story',
    'https://www.youtube.com/watch?v=7sb3x6_h_VU',
    'TED',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    45,
    58,
    13,
    'Stories matter. Many stories matter. Stories have been used to dispossess and to malign, but stories can also be used to empower and to humanize.',
    'Movies & Culture',
    'Intermediate',
    'en-US'
),
(
    'clip-7',
    'Ks-_Mh1QhMc',
    'Your Body Language May Shape Who You Are',
    'https://www.youtube.com/watch?v=Ks-_Mh1QhMc',
    'TED',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    110,
    124,
    14,
    'Our nonverbals govern how other people think and feel about us. There''s a lot of evidence that body language affects how we perceive each other.',
    'Daily Life',
    'Intermediate',
    'en-US'
),
(
    'clip-8',
    'Lp7E973zozc',
    'The Power of Vulnerability',
    'https://www.youtube.com/watch?v=Lp7E973zozc',
    'TED',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80',
    34,
    46,
    12,
    'Connection is why we''re here. It''s what gives purpose and meaning to our lives. This is what it''s all about, no matter whether you talk to people.',
    'Debate & Opinion',
    'Beginner',
    'en-US'
),
(
    'clip-9',
    'arj7oStGLkU',
    'Inside the Mind of a Master Procrastinator',
    'https://www.youtube.com/watch?v=arj7oStGLkU',
    'TED',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    21,
    33,
    12,
    'So in college, I was a government major, which means I had to write a lot of papers. Now, when a normal student writes a paper, they spread the work out.',
    'Work & Tech',
    'Beginner',
    'en-US'
),
(
    'clip-10',
    'Y6bbMZkKNgk',
    'The Thrilling Potential of SixthSense Technology',
    'https://www.youtube.com/watch?v=Y6bbMZkKNgk',
    'TED',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    52,
    64,
    12,
    'We grew up interacting with the physical objects around us. There are an enormous number of them that we use every day, but computing was locked inside machines.',
    'Science & Nature',
    'Advanced',
    'en-US'
),
(
    'clip-11',
    'iCvmsMzlF7o',
    'The Power of Introverts in a World That Can''t Stop Talking',
    'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    'TED',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    42,
    55,
    13,
    'When I was nine years old, I went off to summer camp for the first time. And my mother packed me a suitcase full of books, which to me seemed like a perfectly natural thing.',
    'Daily Life',
    'Intermediate',
    'en-US'
),
(
    'clip-12',
    'RRb43P2bMhI',
    'Grit: The Power of Passion and Perseverance',
    'https://www.youtube.com/watch?v=RRb43P2bMhI',
    'TED',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    10,
    22,
    12,
    'When I was twenty-seven years old, I left a very demanding job in management consulting for a job that was even more demanding: teaching seventh graders math.',
    'Debate & Opinion',
    'Beginner',
    'en-US'
),
(
    'clip-13',
    'C4Cfh043Wf4',
    'How to Build Your Creative Confidence',
    'https://www.youtube.com/watch?v=C4Cfh043Wf4',
    'TED',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    65,
    78,
    13,
    'I remember when my best friend Brian was making a horse out of clay. And one of the girls looked over and said: That looks terrible! That doesn''t look like a horse at all.',
    'Work & Tech',
    'Intermediate',
    'en-US'
),
(
    'clip-14',
    'ReRcHdeUG9Y',
    'How Great Leaders Build Trust',
    'https://www.youtube.com/watch?v=ReRcHdeUG9Y',
    'TED',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    25,
    37,
    12,
    'Trust is the foundation for everything we do. But if we can learn to trust one another more, we can have unprecedented human progress.',
    'Work & Tech',
    'Beginner',
    'en-US'
),
(
    'clip-15',
    '6Af6b_wyiwI',
    'Where Good Ideas Come From',
    'https://www.youtube.com/watch?v=6Af6b_wyiwI',
    'RiverheadBooks',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    30,
    44,
    14,
    'One of the fascinating things about ideas is that they very rarely come in a great flash of insight. They typically spend a long time dormant in the background.',
    'Science & Nature',
    'Intermediate',
    'en-US'
),
(
    'clip-16',
    'Wb1ZqjW11b8',
    'Why We Laugh',
    'https://www.youtube.com/watch?v=Wb1ZqjW11b8',
    'TED',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    40,
    52,
    12,
    'Laughter is an ancient evolutionary behavior that binds social groups together. Humans laugh thirty times more when they are with other people.',
    'Daily Life',
    'Advanced',
    'en-US'
),
(
    'clip-17',
    '3Q9i5-VjV5g',
    'The Mystery of Consciousness',
    'https://www.youtube.com/watch?v=3Q9i5-VjV5g',
    'TED',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
    80,
    93,
    13,
    'Right now, you have billions of microscopic neurons firing electrical impulses inside your brain, generating this vivid subjective experience of reality.',
    'Science & Nature',
    'Advanced',
    'en-US'
),
(
    'clip-18',
    'eO0Jm_3wNII',
    'The Art of Active Listening',
    'https://www.youtube.com/watch?v=eO0Jm_3wNII',
    'TEDx Talks',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    18,
    30,
    12,
    'Most people do not listen with the intent to understand; they listen with the intent to reply. Active listening requires silence, patience, and true empathy.',
    'Movies & Culture',
    'Beginner',
    'en-US'
),
(
    'clip-19',
    '2VjJ5vK7M7M',
    'The Philosophy of Stoicism',
    'https://www.youtube.com/watch?v=2VjJ5vK7M7M',
    'TED-Ed',
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
    12,
    26,
    14,
    'Stoicism was designed to be a practical philosophy for unpredictable times. It reminds us that while we cannot control the world, we can master our reactions.',
    'Debate & Opinion',
    'Intermediate',
    'en-US'
),
(
    'clip-20',
    '9CsqtAomM0k',
    'Mastering the Art of Rhetoric',
    'https://www.youtube.com/watch?v=9CsqtAomM0k',
    'TED-Ed',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    15,
    29,
    14,
    'Ethos, pathos, and logos remain the foundational pillars of effective public speaking. Balance credibility, emotion, and logic to captivate any audience.',
    'Debate & Opinion',
    'Advanced',
    'en-US'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    reference_text = EXCLUDED.reference_text,
    start_time_sec = EXCLUDED.start_time_sec,
    end_time_sec = EXCLUDED.end_time_sec,
    duration_sec = EXCLUDED.duration_sec,
    topic = EXCLUDED.topic,
    difficulty = EXCLUDED.difficulty;

-- ==============================================================================
-- 15. SEED DATA: COSMETICS CATALOG (AVATARS, FRAMES, TITLES)
-- ==============================================================================
INSERT INTO public.shop_items (
    id, type, name, description, price, asset_value, rarity, active
) VALUES
(
    'avatar-default',
    'AVATAR',
    'Standard Echo',
    'The default clean robotic soundwave avatar for every shadowing aspirant.',
    0,
    'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
    'Common',
    true
),
(
    'avatar-cyber-fox',
    'AVATAR',
    'Cyber Fox',
    'Sleek neon fox with razor-sharp acoustic receptors for flawless cadence.',
    35,
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberFox',
    'Rare',
    true
),
(
    'avatar-echo-bot',
    'AVATAR',
    'Echo Unit 01',
    'A dedicated phoneme analyzer robot programmed for 99% accuracy.',
    45,
    'https://api.dicebear.com/7.x/bottts/svg?seed=EchoUnit01',
    'Rare',
    true
),
(
    'avatar-grand-orator',
    'AVATAR',
    'Grand Orator',
    'Noble debater and classical English speaker with commanding resonance.',
    60,
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Orator',
    'Epic',
    true
),
(
    'avatar-valkyrie',
    'AVATAR',
    'Cadence Valkyrie',
    'Elite contender who turns pronunciation battles into effortless art.',
    80,
    'https://api.dicebear.com/7.x/adventurer/svg?seed=CadenceValkyrie',
    'Legendary',
    true
),
(
    'frame-none',
    'FRAME',
    'Clean Minimalist',
    'Standard Airbnb border without decorative aura or glowing effects.',
    0,
    'ring-1 ring-[#ebebeb]',
    'Common',
    true
),
(
    'frame-bronze',
    'FRAME',
    'Bronze Contender',
    'Warm bronze aura earned by dedicated daily rhythm shadowers.',
    20,
    'ring-2 ring-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.35)]',
    'Rare',
    true
),
(
    'frame-golden',
    'FRAME',
    'Solar Resonance',
    'Gleaming gold champion frame with radiant soundwave luminescence.',
    50,
    'ring-2 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]',
    'Epic',
    true
),
(
    'frame-cyber',
    'FRAME',
    'Cyber Emerald',
    'Futuristic matrix pulse with radiant emerald edge lighting.',
    65,
    'ring-2 ring-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.6)]',
    'Epic',
    true
),
(
    'frame-celestial',
    'FRAME',
    'Celestial Nova',
    'Deep cosmic amethyst & ultra-violet aura for legendary English masters.',
    90,
    'ring-2 ring-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.7)]',
    'Legendary',
    true
),
(
    'title-learner',
    'TITLE',
    'Shadowing Learner',
    'Every grand journey in speech starts with listening attentively.',
    0,
    'Shadowing Learner',
    'Common',
    true
),
(
    'title-cadence',
    'TITLE',
    'Cadence Explorer',
    'Attuned to speech rhythm, pauses, and pitch variations.',
    25,
    'Cadence Explorer',
    'Rare',
    true
),
(
    'title-rhythm',
    'TITLE',
    'Rhythm Striker',
    'Quick-reacting shadow master who replicates native tempos with ease.',
    35,
    'Rhythm Striker',
    'Rare',
    true
),
(
    'title-fluent',
    'TITLE',
    'Fluent Virtuoso',
    'Speech that flows like music without friction or hesitation.',
    50,
    'Fluent Virtuoso',
    'Epic',
    true
),
(
    'title-master',
    'TITLE',
    'Phonetic Grandmaster',
    'The supreme badge of pronunciation precision and 1v1 dominance.',
    75,
    'Phonetic Grandmaster',
    'Legendary',
    true
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 16. SEED DATA: DEFAULT ADMINISTRATOR USER
-- ==============================================================================
INSERT INTO public.users (
    id, email, display_name, avatar_url, role
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@sonorauris.com',
    'System Admin',
    'https://api.dicebear.com/7.x/bottts/svg?seed=AdminSonorauris',
    'admin'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

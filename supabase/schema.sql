-- ==============================================================================
-- SONORAURIS: Competitive English Shadowing MVP v1.0
-- Database Schema for PostgreSQL & Supabase (SRS Section 12)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (FR-AUTH-01, FR-AUTH-02)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'Learner',
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoPlayer',
    streak INT NOT NULL DEFAULT 0,
    last_practice_date DATE,
    last_streak_restore_date TIMESTAMP WITH TIME ZONE,
    equipped_avatar_id TEXT DEFAULT 'avatar-default',
    equipped_frame_id TEXT DEFAULT 'frame-none',
    equipped_title_id TEXT DEFAULT 'title-learner',
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
    video_id TEXT REFERENCES public.videos(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    title TEXT NOT NULL,
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'XP' | 'COINS'
    amount INT NOT NULL,
    reference_type TEXT NOT NULL, -- 'SEED' | 'ATTEMPT' | 'BATTLE' | 'SHOP' | 'STREAK_RESTORE'
    reference_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reward_tx_idempotency 
ON public.reward_transactions (user_id, reference_type, reference_id, type);

-- 7. BATTLE ROOMS TABLE (1v1 Arena State Machine per SRS Section 10)
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    code VARCHAR(5) UNIQUE NOT NULL, -- e.g. 'SH7A2'
    clip_id TEXT REFERENCES public.clips(id),
    host_user_id UUID REFERENCES public.users(id),
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
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_id TEXT REFERENCES public.shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, item_id)
);

-- ==============================================================================
-- SUPABASE REALTIME CONFIGURATION (Multiplayer 1v1 Rooms)
-- ==============================================================================
-- Enable Realtime publication for rooms and transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_transactions;

-- ==============================================================================
-- DERIVED BALANCES VIEW (Zero-drift Ledger Balance per SRS 9)
-- ==============================================================================
CREATE OR REPLACE VIEW public.user_balances AS
SELECT 
    u.id AS user_id,
    u.display_name,
    u.avatar_url,
    u.streak,
    COALESCE(SUM(CASE WHEN rt.type = 'XP' THEN rt.amount ELSE 0 END), 0) AS total_xp,
    COALESCE(SUM(CASE WHEN rt.type = 'COINS' THEN rt.amount ELSE 0 END), 0) AS total_coins
FROM public.users u
LEFT JOIN public.reward_transactions rt ON u.id = rt.user_id
GROUP BY u.id, u.display_name, u.avatar_url, u.streak;

-- ==============================================================================
-- PERMISSIONS & RLS CONFIGURATION FOR CLIENT APP (MVP / Competition)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Disable RLS so client app can access tables without blocking:
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clips DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.room_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reward_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shop_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_items DISABLE ROW LEVEL SECURITY;


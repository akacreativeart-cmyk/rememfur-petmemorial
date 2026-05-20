
-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MEMORIALS
CREATE TABLE public.memorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'other',
  birth_date DATE,
  passing_date DATE,
  epitaph TEXT,
  story TEXT,
  hero_image_url TEXT,
  transformed_image_url TEXT,
  transform_style TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memorials ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_memorials_owner ON public.memorials(owner_id);
CREATE INDEX idx_memorials_public ON public.memorials(is_public, created_at DESC);
CREATE POLICY "Public memorials viewable by everyone" ON public.memorials FOR SELECT USING (is_public = true OR auth.uid() = owner_id);
CREATE POLICY "Owners can insert memorials" ON public.memorials FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update memorials" ON public.memorials FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete memorials" ON public.memorials FOR DELETE USING (auth.uid() = owner_id);
CREATE TRIGGER trg_memorials_updated BEFORE UPDATE ON public.memorials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PHOTOS
CREATE TABLE public.memorial_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memorial_photos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_photos_memorial ON public.memorial_photos(memorial_id);
CREATE POLICY "Photos viewable when memorial is" ON public.memorial_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND (m.is_public = true OR m.owner_id = auth.uid()))
);
CREATE POLICY "Owners manage photos insert" ON public.memorial_photos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND m.owner_id = auth.uid())
);
CREATE POLICY "Owners manage photos delete" ON public.memorial_photos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND m.owner_id = auth.uid())
);

-- CANDLES
CREATE TABLE public.candles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  lit_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lit_by_name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_candles_memorial ON public.candles(memorial_id, created_at DESC);
CREATE POLICY "Candles viewable with memorial" ON public.candles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND (m.is_public = true OR m.owner_id = auth.uid()))
);
CREATE POLICY "Authenticated users can light candles" ON public.candles FOR INSERT TO authenticated WITH CHECK (
  lit_by = auth.uid() AND EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND (m.is_public = true OR m.owner_id = auth.uid()))
);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_messages_memorial ON public.messages(memorial_id, created_at DESC);
CREATE POLICY "Messages viewable with memorial" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND (m.is_public = true OR m.owner_id = auth.uid()))
);
CREATE POLICY "Authenticated users can post messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.memorials m WHERE m.id = memorial_id AND (m.is_public = true OR m.owner_id = auth.uid()))
);
CREATE POLICY "Authors can delete messages" ON public.messages FOR DELETE USING (author_id = auth.uid());

-- JOURNAL
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_journal_author ON public.journal_entries(author_id, created_at DESC);
CREATE POLICY "Authors view own journal" ON public.journal_entries FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Authors insert own journal" ON public.journal_entries FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors update own journal" ON public.journal_entries FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors delete own journal" ON public.journal_entries FOR DELETE USING (author_id = auth.uid());
CREATE TRIGGER trg_journal_updated BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('transformed', 'transformed', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read pet-photos" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Auth upload pet-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner update pet-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete pet-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read transformed" ON storage.objects FOR SELECT USING (bucket_id = 'transformed');
CREATE POLICY "Auth upload transformed" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'transformed' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Auth upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

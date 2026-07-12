
-- pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'other',
  breed TEXT,
  birthdate DATE,
  adoption_date DATE,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pets TO authenticated;
GRANT ALL ON public.pets TO service_role;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their pets" ON public.pets FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert their pets" ON public.pets FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update their pets" ON public.pets FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete their pets" ON public.pets FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER pets_set_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX pets_owner_idx ON public.pets(owner_id);

-- pet_records table
CREATE TABLE public.pet_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('health','vaccination','grooming','insurance','birthday','other')),
  title TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pet_records TO authenticated;
GRANT ALL ON public.pet_records TO service_role;
ALTER TABLE public.pet_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their pet records" ON public.pet_records FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_records.pet_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owners insert their pet records" ON public.pet_records FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_records.pet_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owners update their pet records" ON public.pet_records FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_records.pet_id AND p.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_records.pet_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owners delete their pet records" ON public.pet_records FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_records.pet_id AND p.owner_id = auth.uid()));
CREATE TRIGGER pet_records_set_updated_at BEFORE UPDATE ON public.pet_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX pet_records_pet_idx ON public.pet_records(pet_id);
CREATE INDEX pet_records_kind_idx ON public.pet_records(pet_id, kind);

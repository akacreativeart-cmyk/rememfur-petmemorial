
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('candle','paw','comment','message','follow')),
  memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE,
  post_id UUID,
  preview TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notifications_recipient_created_idx ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX notifications_recipient_unread_idx ON public.notifications(recipient_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users mark their own notifications read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Trigger: candle lit on a memorial -> notify owner
CREATE OR REPLACE FUNCTION public.notify_on_candle()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner UUID;
BEGIN
  SELECT owner_id INTO owner FROM public.memorials WHERE id = NEW.memorial_id;
  IF owner IS NOT NULL AND owner <> COALESCE(NEW.lit_by, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications(recipient_id, actor_id, actor_name, type, memorial_id, preview)
    VALUES (owner, NEW.lit_by, NEW.lit_by_name, 'candle', NEW.memorial_id, LEFT(COALESCE(NEW.message,''), 140));
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_on_candle AFTER INSERT ON public.candles
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_candle();

-- Trigger: message on a memorial -> notify owner
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner UUID;
BEGIN
  SELECT owner_id INTO owner FROM public.memorials WHERE id = NEW.memorial_id;
  IF owner IS NOT NULL AND owner <> NEW.author_id THEN
    INSERT INTO public.notifications(recipient_id, actor_id, type, memorial_id, preview)
    VALUES (owner, NEW.author_id, 'message', NEW.memorial_id, LEFT(NEW.body, 140));
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_on_message AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

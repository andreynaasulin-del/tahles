-- Submissions table: profile submissions from Telegram bot
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 99),
  city text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('incall', 'outcall', 'both')),
  price_min integer NOT NULL,
  price_max integer NOT NULL,
  photo_file_ids text[] NOT NULL DEFAULT '{}',
  whatsapp text NOT NULL,
  description text DEFAULT '',
  telegram_user_id bigint NOT NULL,
  telegram_username text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Allow service role full access
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on submissions"
  ON public.submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

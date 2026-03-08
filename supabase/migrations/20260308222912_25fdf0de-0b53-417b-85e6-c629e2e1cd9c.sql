
CREATE TABLE public.job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  type text NOT NULL DEFAULT 'Full-Time',
  salary text NOT NULL,
  requirements text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings" ON public.job_listings
  FOR SELECT USING (active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert listings" ON public.job_listings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update listings" ON public.job_listings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete listings" ON public.job_listings
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

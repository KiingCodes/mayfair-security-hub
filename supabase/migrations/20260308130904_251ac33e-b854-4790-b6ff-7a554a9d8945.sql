
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table (company info for clients)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, company_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'company');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'guard');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Job Applications
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  experience TEXT,
  message TEXT,
  cv_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view applications" ON public.job_applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Guard Check-ins
CREATE TABLE public.guard_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guard_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guard_name TEXT NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'on_duty',
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guard_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guards can insert checkins" ON public.guard_checkins FOR INSERT WITH CHECK (auth.uid() = guard_id);
CREATE POLICY "Clients and admins can view checkins" ON public.guard_checkins FOR SELECT 
  USING (public.has_role(auth.uid(), 'client') OR public.has_role(auth.uid(), 'admin') OR auth.uid() = guard_id);

-- Patrol Reports
CREATE TABLE public.patrol_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guard_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guard_name TEXT NOT NULL,
  location TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'patrol_log',
  summary TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patrol_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guards can insert reports" ON public.patrol_reports FOR INSERT WITH CHECK (auth.uid() = guard_id);
CREATE POLICY "Clients and admins can view reports" ON public.patrol_reports FOR SELECT 
  USING (public.has_role(auth.uid(), 'client') OR public.has_role(auth.uid(), 'admin') OR auth.uid() = guard_id);

-- Incidents
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guards can report incidents" ON public.incidents FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Clients and admins can view incidents" ON public.incidents FOR SELECT 
  USING (public.has_role(auth.uid(), 'client') OR public.has_role(auth.uid(), 'admin') OR auth.uid() = reported_by);

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contact submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view submissions" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', false);

CREATE POLICY "Anyone can upload CVs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cv-uploads');
CREATE POLICY "Admins can view CVs" ON storage.objects FOR SELECT USING (bucket_id = 'cv-uploads' AND public.has_role(auth.uid(), 'admin'));

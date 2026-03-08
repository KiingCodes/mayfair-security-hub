
-- Staff profiles table
CREATE TABLE public.staff_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  psira_number TEXT,
  psira_expiry DATE,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  position TEXT DEFAULT 'guard',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Staff can view/edit own profile, admin can see all
CREATE POLICY "Staff can view own profile" ON public.staff_profiles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can insert own profile" ON public.staff_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update own profile" ON public.staff_profiles
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete staff profiles" ON public.staff_profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Gallery items table
CREATE TABLE public.gallery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Public read, admin CRUD
CREATE POLICY "Anyone can view gallery" ON public.gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert gallery" ON public.gallery_items
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update gallery" ON public.gallery_items
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete gallery" ON public.gallery_items
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);

-- Storage bucket for staff photos
INSERT INTO storage.buckets (id, name, public) VALUES ('staff-photos', 'staff-photos', true);

-- Storage policies for gallery-images
CREATE POLICY "Anyone can view gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Admin can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for staff-photos
CREATE POLICY "Anyone can view staff photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'staff-photos');

CREATE POLICY "Staff can upload own photo" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'staff-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admin can delete staff photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'staff-photos' AND public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on staff_profiles
CREATE TRIGGER update_staff_profiles_updated_at
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on gallery_items
CREATE TRIGGER update_gallery_items_updated_at
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Admin can manage all user_roles
CREATE POLICY "Admin can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

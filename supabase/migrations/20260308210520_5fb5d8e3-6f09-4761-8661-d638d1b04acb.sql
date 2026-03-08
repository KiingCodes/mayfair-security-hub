
-- Storage bucket for shared files
INSERT INTO storage.buckets (id, name, public)
VALUES ('shared-files', 'shared-files', false)
ON CONFLICT (id) DO NOTHING;

-- Metadata table for shared files
CREATE TABLE public.shared_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text,
  uploaded_by uuid NOT NULL,
  client_id uuid NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

-- Clients see their own files, admins see all
CREATE POLICY "Clients can view own files"
  ON public.shared_files FOR SELECT
  USING (auth.uid() = client_id OR has_role(auth.uid(), 'admin'));

-- Clients and admins can upload
CREATE POLICY "Authenticated users can insert files"
  ON public.shared_files FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND (
      has_role(auth.uid(), 'admin')
      OR auth.uid() = client_id
    )
  );

-- Admins can delete any, clients can delete own uploads
CREATE POLICY "Users can delete files"
  ON public.shared_files FOR DELETE
  USING (
    has_role(auth.uid(), 'admin')
    OR (auth.uid() = uploaded_by AND auth.uid() = client_id)
  );

-- Storage RLS: clients access their own folder, admins access all
CREATE POLICY "Clients can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'shared-files'
    AND (
      has_role(auth.uid(), 'admin')
      OR (position(auth.uid()::text in name) > 0)
    )
  );

CREATE POLICY "Users can view shared files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'shared-files'
    AND (
      has_role(auth.uid(), 'admin')
      OR (position(auth.uid()::text in name) > 0)
    )
  );

CREATE POLICY "Users can delete shared files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'shared-files'
    AND (
      has_role(auth.uid(), 'admin')
      OR (position(auth.uid()::text in name) > 0)
    )
  );

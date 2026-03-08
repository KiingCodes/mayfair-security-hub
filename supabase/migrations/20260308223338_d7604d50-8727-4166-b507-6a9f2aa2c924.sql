
CREATE POLICY "Admin can update applications" ON public.job_applications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

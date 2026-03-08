
-- Allow admin to update incidents (for resolving)
CREATE POLICY "Admin can update incidents" ON public.incidents
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

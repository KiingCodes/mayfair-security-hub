
-- Create emergency_alerts table
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  severity TEXT NOT NULL DEFAULT 'critical',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own alerts
CREATE POLICY "Clients can create alerts" ON public.emergency_alerts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Clients can view own alerts
CREATE POLICY "Clients can view own alerts" ON public.emergency_alerts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Admin can update alerts (resolve them)
CREATE POLICY "Admin can update alerts" ON public.emergency_alerts
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;

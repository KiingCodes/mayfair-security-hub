
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert notifications (via trigger with security definer)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: notify all clients when a patrol report is filed
CREATE OR REPLACE FUNCTION public.notify_clients_on_patrol_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT ur.user_id,
    'New Patrol Report',
    'A patrol report has been filed at ' || NEW.location || ' by ' || NEW.guard_name,
    'patrol',
    '/tracking'
  FROM public.user_roles ur
  WHERE ur.role = 'client';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_patrol_report_created
  AFTER INSERT ON public.patrol_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clients_on_patrol_report();

-- Trigger function: notify all clients when an incident is reported
CREATE OR REPLACE FUNCTION public.notify_clients_on_incident()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT ur.user_id,
    'Incident Reported: ' || NEW.incident_type,
    NEW.description || ' — Location: ' || NEW.location || ' (Severity: ' || NEW.severity || ')',
    'incident',
    '/tracking'
  FROM public.user_roles ur
  WHERE ur.role = 'client';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_incident_created
  AFTER INSERT ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clients_on_incident();

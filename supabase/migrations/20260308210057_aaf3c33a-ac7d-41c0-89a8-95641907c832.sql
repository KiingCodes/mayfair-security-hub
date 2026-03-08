
-- Email notification preferences per user
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_incidents boolean NOT NULL DEFAULT true,
  email_emergency_alerts boolean NOT NULL DEFAULT true,
  email_patrol_digest boolean NOT NULL DEFAULT true,
  email_cancellation_updates boolean NOT NULL DEFAULT true,
  email_welcome boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create preferences for new users via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();

-- Seed preferences for existing users who don't have them
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.notification_preferences)
ON CONFLICT DO NOTHING;

-- Updated_at trigger
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Helper function to check if user wants a specific email type
CREATE OR REPLACE FUNCTION public.user_wants_email(p_user_id uuid, p_email_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE p_email_type
    WHEN 'incident_reported' THEN COALESCE((SELECT email_incidents FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'incident_resolved' THEN COALESCE((SELECT email_incidents FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'emergency_alert_confirmed' THEN COALESCE((SELECT email_emergency_alerts FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'emergency_alert_resolved' THEN COALESCE((SELECT email_emergency_alerts FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'patrol_digest' THEN COALESCE((SELECT email_patrol_digest FROM notification_preferences WHERE user_id = p_user_id), true)
    WHEN 'cancellation_update' THEN COALESCE((SELECT email_cancellation_updates FROM notification_preferences WHERE user_id = p_user_id), true)
    ELSE true
  END;
$$;

-- Update email trigger functions to check preferences

CREATE OR REPLACE FUNCTION public.email_on_incident_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_emails text[];
BEGIN
  SELECT COALESCE(array_agg(DISTINCT u.email), '{}')
  INTO client_emails
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'client' AND u.email IS NOT NULL
    AND user_wants_email(ur.user_id, 'incident_reported');

  IF array_length(client_emails, 1) > 0 THEN
    PERFORM send_client_email(
      'incident_reported',
      client_emails,
      jsonb_build_object(
        'incident_type', NEW.incident_type,
        'location', NEW.location,
        'severity', NEW.severity,
        'description', NEW.description,
        'reporter_name', NEW.reporter_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.email_on_incident_resolved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_emails text[];
BEGIN
  IF OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
    SELECT COALESCE(array_agg(DISTINCT u.email), '{}')
    INTO client_emails
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'client' AND u.email IS NOT NULL
      AND user_wants_email(ur.user_id, 'incident_resolved');

    IF array_length(client_emails, 1) > 0 THEN
      PERFORM send_client_email(
        'incident_resolved',
        client_emails,
        jsonb_build_object(
          'incident_type', NEW.incident_type,
          'location', NEW.location,
          'status', NEW.status
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.email_on_emergency_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  IF user_wants_email(NEW.user_id, 'emergency_alert_confirmed') THEN
    user_email := get_user_email(NEW.user_id);
    IF user_email IS NOT NULL THEN
      PERFORM send_client_email(
        'emergency_alert_confirmed',
        ARRAY[user_email],
        jsonb_build_object(
          'alert_type', NEW.alert_type,
          'location', COALESCE(NEW.location, 'Not specified'),
          'time', to_char(NEW.created_at, 'YYYY-MM-DD HH24:MI:SS')
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.email_on_alert_resolved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  IF OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
    IF user_wants_email(NEW.user_id, 'emergency_alert_resolved') THEN
      user_email := get_user_email(NEW.user_id);
      IF user_email IS NOT NULL THEN
        PERFORM send_client_email(
          'emergency_alert_resolved',
          ARRAY[user_email],
          jsonb_build_object(
            'alert_type', NEW.alert_type,
            'admin_notes', COALESCE(NEW.admin_notes, 'Resolved by admin'),
            'resolved_at', to_char(COALESCE(NEW.resolved_at, now()), 'YYYY-MM-DD HH24:MI:SS')
          )
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.email_on_cancellation_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    IF user_wants_email(NEW.user_id, 'cancellation_update') THEN
      user_email := get_user_email(NEW.user_id);
      IF user_email IS NOT NULL THEN
        PERFORM send_client_email(
          'cancellation_update',
          ARRAY[user_email],
          jsonb_build_object(
            'status', NEW.status,
            'reason', NEW.reason
          )
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

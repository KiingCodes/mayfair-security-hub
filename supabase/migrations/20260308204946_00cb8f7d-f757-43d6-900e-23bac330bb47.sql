
-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Helper function to send client emails via edge function
CREATE OR REPLACE FUNCTION public.send_client_email(
  email_type text,
  recipient_emails text[],
  email_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  anon_key text;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  -- Fall back to hardcoded values if settings not available
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://xvuzbnqyxiuywtasimdu.supabase.co';
  END IF;
  IF anon_key IS NULL OR anon_key = '' THEN
    anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dXpibnF5eGl1eXd0YXNpbWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzM0NTcsImV4cCI6MjA4ODU0OTQ1N30.lh8fCmIEzDxsSkkaZm-422QMHEFagLzLEhRrbWuTu7g';
  END IF;

  PERFORM extensions.http_post(
    supabase_url || '/functions/v1/send-client-email',
    jsonb_build_object(
      'type', email_type,
      'to', to_jsonb(recipient_emails),
      'data', email_data
    )::text,
    'application/json',
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || anon_key)
    ],
    5000
  );
END;
$$;

-- Get all client emails helper
CREATE OR REPLACE FUNCTION public.get_client_emails()
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT u.email), '{}')
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'client' AND u.email IS NOT NULL;
$$;

-- Get single user email
CREATE OR REPLACE FUNCTION public.get_user_email(uid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = uid LIMIT 1;
$$;

-- 1. Trigger: Email clients when incident is created
CREATE OR REPLACE FUNCTION public.email_on_incident_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_emails text[];
BEGIN
  client_emails := get_client_emails();
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

CREATE TRIGGER email_incident_created
  AFTER INSERT ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.email_on_incident_created();

-- 2. Trigger: Email clients when incident is resolved
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
    client_emails := get_client_emails();
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

CREATE TRIGGER email_incident_resolved
  AFTER UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.email_on_incident_resolved();

-- 3. Trigger: Confirmation email to client who triggered emergency alert
CREATE OR REPLACE FUNCTION public.email_on_emergency_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
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
  RETURN NEW;
END;
$$;

CREATE TRIGGER email_emergency_alert_created
  AFTER INSERT ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.email_on_emergency_alert();

-- 4. Trigger: Email client when emergency alert is resolved
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
  RETURN NEW;
END;
$$;

CREATE TRIGGER email_alert_resolved
  AFTER UPDATE ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.email_on_alert_resolved();

-- 5. Trigger: Email client when cancellation request is updated
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
  RETURN NEW;
END;
$$;

CREATE TRIGGER email_cancellation_updated
  AFTER UPDATE ON public.contract_cancellations
  FOR EACH ROW
  EXECUTE FUNCTION public.email_on_cancellation_update();

-- 6. Trigger: Email clients when patrol report is filed
CREATE OR REPLACE FUNCTION public.email_on_patrol_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_emails text[];
BEGIN
  client_emails := get_client_emails();
  IF array_length(client_emails, 1) > 0 THEN
    PERFORM send_client_email(
      'patrol_report',
      client_emails,
      jsonb_build_object(
        'guard_name', NEW.guard_name,
        'location', NEW.location,
        'report_type', NEW.report_type,
        'summary', NEW.summary
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER email_patrol_report_created
  AFTER INSERT ON public.patrol_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.email_on_patrol_report();

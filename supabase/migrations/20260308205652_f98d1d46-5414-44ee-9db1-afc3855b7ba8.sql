
-- Trigger: notify client when their emergency alert status changes
CREATE OR REPLACE FUNCTION public.notify_on_alert_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Alert created: confirm to user
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      '🚨 Emergency Alert Sent',
      'Your ' || NEW.alert_type || ' alert has been received. Help is on the way.',
      'incident',
      '/portal'
    );
  END IF;

  -- Alert resolved
  IF TG_OP = 'UPDATE' AND OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      '✅ Emergency Alert Resolved',
      'Your ' || NEW.alert_type || ' alert has been resolved. ' || COALESCE(NEW.admin_notes, ''),
      'info',
      '/portal'
    );
  END IF;

  -- Alert responding
  IF TG_OP = 'UPDATE' AND OLD.status != 'responding' AND NEW.status = 'responding' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      '🏃 Response Team Dispatched',
      'A team is responding to your ' || NEW.alert_type || ' alert.',
      'incident',
      '/portal'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_alert_status
  AFTER INSERT OR UPDATE ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_alert_status_change();

-- Trigger: notify client when their cancellation request is updated
CREATE OR REPLACE FUNCTION public.notify_on_cancellation_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      CASE NEW.status
        WHEN 'approved' THEN '✅ Cancellation Approved'
        WHEN 'rejected' THEN '❌ Cancellation Declined'
        ELSE '📋 Cancellation Update'
      END,
      'Your contract cancellation request has been ' || NEW.status || '.',
      'info',
      '/portal'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_cancellation_status
  AFTER UPDATE ON public.contract_cancellations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_cancellation_update();

-- Trigger: notify client when incident status changes (resolved/closed)
CREATE OR REPLACE FUNCTION public.notify_on_incident_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status != NEW.status AND NEW.status IN ('resolved', 'closed') THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT ur.user_id,
      '✅ Incident ' || initcap(NEW.status) || ': ' || NEW.incident_type,
      'The incident at ' || NEW.location || ' has been ' || NEW.status || '.',
      'info',
      '/tracking'
    FROM public.user_roles ur
    WHERE ur.role = 'client';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_incident_status_change
  AFTER UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_incident_status_change();

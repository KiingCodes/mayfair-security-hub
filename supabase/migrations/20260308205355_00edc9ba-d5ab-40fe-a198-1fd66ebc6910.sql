
-- Remove the per-report patrol email trigger (keep the in-app notification trigger)
DROP TRIGGER IF EXISTS email_patrol_report_created ON public.patrol_reports;
DROP FUNCTION IF EXISTS public.email_on_patrol_report();

-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

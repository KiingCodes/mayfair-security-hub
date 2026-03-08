
-- Trigger: notify client via in-app + email when a file is shared with them
CREATE OR REPLACE FUNCTION public.notify_on_file_shared()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Only notify when someone else shares a file with the client (admin -> client)
  IF NEW.uploaded_by != NEW.client_id THEN
    -- In-app notification
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.client_id,
      '📁 New File Shared',
      'A new file has been shared with you: ' || NEW.file_name,
      'info',
      '/portal'
    );

    -- Email notification (respects preferences)
    user_email := get_user_email(NEW.client_id);
    IF user_email IS NOT NULL THEN
      PERFORM send_client_email(
        'file_shared',
        ARRAY[user_email],
        jsonb_build_object(
          'file_name', NEW.file_name,
          'description', COALESCE(NEW.description, 'No description'),
          'file_size', NEW.file_size
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_file_shared
  AFTER INSERT ON public.shared_files
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_file_shared();

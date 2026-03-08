import { useState, useEffect } from "react";
import { Mail, AlertTriangle, Shield, FileText, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Preferences {
  email_incidents: boolean;
  email_emergency_alerts: boolean;
  email_patrol_digest: boolean;
  email_cancellation_updates: boolean;
  email_welcome: boolean;
}

const defaultPrefs: Preferences = {
  email_incidents: true,
  email_emergency_alerts: true,
  email_patrol_digest: true,
  email_cancellation_updates: true,
  email_welcome: true,
};

const prefItems: { key: keyof Preferences; label: string; description: string; icon: typeof Mail }[] = [
  { key: "email_incidents", label: "Incident Alerts", description: "Emails when incidents are reported or resolved", icon: AlertTriangle },
  { key: "email_emergency_alerts", label: "Emergency Alerts", description: "Confirmation & resolution emails for panic alerts", icon: Shield },
  { key: "email_patrol_digest", label: "Daily Patrol Digest", description: "Morning summary of overnight patrol activity", icon: FileText },
  { key: "email_cancellation_updates", label: "Cancellation Updates", description: "Status updates on contract cancellation requests", icon: XCircle },
  { key: "email_welcome", label: "Welcome Email", description: "Welcome email upon registration", icon: Mail },
];

const EmailPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          email_incidents: data.email_incidents,
          email_emergency_alerts: data.email_emergency_alerts,
          email_patrol_digest: data.email_patrol_digest,
          email_cancellation_updates: data.email_cancellation_updates,
          email_welcome: data.email_welcome,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const toggle = async (key: keyof Preferences) => {
    if (!user) return;
    const newVal = !prefs[key];
    setSaving(key);
    setPrefs((p) => ({ ...p, [key]: newVal }));

    const { error } = await supabase
      .from("notification_preferences")
      .update({ [key]: newVal })
      .eq("user_id", user.id);

    if (error) {
      setPrefs((p) => ({ ...p, [key]: !newVal }));
      toast({ title: "Error", description: "Failed to update preference.", variant: "destructive" });
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <motion.div
        className="bg-muted rounded-2xl p-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading email preferences…</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-muted rounded-2xl p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
    >
      <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
        <Mail className="w-5 h-5 text-primary" /> Email Notifications
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Choose which email notifications you'd like to receive
      </p>
      <div className="space-y-4">
        {prefItems.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={() => toggle(key)}
              disabled={saving === key}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmailPreferences;

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Flame, ShieldAlert, Eye, Heart, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const ALERT_TYPES = [
  { value: "intrusion", label: "Intrusion / Break-in", icon: ShieldAlert, color: "text-destructive" },
  { value: "suspicious_activity", label: "Suspicious Activity", icon: Eye, color: "text-accent" },
  { value: "fire", label: "Fire / Smoke", icon: Flame, color: "text-orange-500" },
  { value: "medical", label: "Medical Emergency", icon: Heart, color: "text-pink-500" },
  { value: "other", label: "Other Emergency", icon: AlertTriangle, color: "text-yellow-500" },
];

const PanicButton = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedType) return;
    setSubmitting(true);

    try {
      // Insert the alert
      const { error } = await supabase.from("emergency_alerts").insert({
        user_id: user.id,
        alert_type: selectedType,
        description: description.trim() || null,
        location: location.trim() || null,
        severity: "critical",
      });

      if (error) throw error;

      // Send email notification to admin
      const alertLabel = ALERT_TYPES.find(a => a.value === selectedType)?.label || selectedType;
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "emergency_alert",
          data: {
            alert_type: alertLabel,
            description: description.trim() || "No details provided",
            location: location.trim() || "Not specified",
            user_email: user.email || "Unknown",
            time: new Date().toLocaleString(),
          },
        },
      });

      toast({
        title: "🚨 Emergency Alert Sent!",
        description: "Our team has been notified and will respond immediately.",
      });

      setOpen(false);
      setSelectedType("");
      setDescription("");
      setLocation("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setSubmitting(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-lg py-8 rounded-2xl shadow-lg animate-pulse hover:animate-none transition-all"
        size="lg"
      >
        <AlertTriangle className="w-7 h-7 mr-3" />
        🚨 EMERGENCY PANIC BUTTON
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6" /> Emergency Alert
            </DialogTitle>
            <DialogDescription>
              Select the type of emergency. Our team will be notified instantly via email and in-app alerts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Alert Type Selection */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">What type of emergency?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALERT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.value
                        ? "border-destructive bg-destructive/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <type.icon className={`w-5 h-5 ${type.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label>Your Location / Address</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 123 Main Street, Johannesburg"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Additional Details (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's happening..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedType}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-6 text-base"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending Alert...</>
              ) : (
                <><Send className="w-5 h-5 mr-2" /> Send Emergency Alert NOW</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PanicButton;

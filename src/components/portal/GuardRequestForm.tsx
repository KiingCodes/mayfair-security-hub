import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Users, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

const GuardRequestForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    location: "",
    date_needed: "",
    time_needed: "",
    duration: "8 hours",
    num_guards: 1,
    reason: "",
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["my-guard-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guard_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase.from("guard_requests").insert({
      user_id: user.id,
      location: form.location,
      date_needed: form.date_needed,
      time_needed: form.time_needed || null,
      duration: form.duration,
      num_guards: form.num_guards,
      reason: form.reason || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Submitted", description: "Your guard request has been sent for review." });
      setOpen(false);
      setForm({ location: "", date_needed: "", time_needed: "", duration: "8 hours", num_guards: 1, reason: "" });
      queryClient.invalidateQueries({ queryKey: ["my-guard-requests"] });
    }
    setSubmitting(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-accent/10 text-accent border-accent/20";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Request additional security personnel for events or sites.</p>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Request
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="bg-background rounded-lg p-4 animate-pulse h-20" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No guard requests yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Click "New Request" to request additional guards.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <div key={r.id} className="bg-background rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{r.location}</p>
                    <Badge variant="outline" className={statusColor(r.status)}>{r.status}</Badge>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>Date: {new Date(r.date_needed).toLocaleDateString()}</span>
                    {r.time_needed && <span>Time: {r.time_needed}</span>}
                    <span>Guards: {r.num_guards}</span>
                    <span>Duration: {r.duration}</span>
                  </div>
                  {r.reason && <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>}
                  {r.admin_notes && (
                    <p className="text-xs text-primary mt-1 font-medium">Admin: {r.admin_notes}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Additional Guards</DialogTitle>
            <DialogDescription>Fill in the details and our team will review your request.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Location *</Label>
              <Input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. 123 Main St, Johannesburg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date Needed *</Label>
                <Input required type="date" value={form.date_needed} onChange={e => setForm({ ...form, date_needed: e.target.value })} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={form.time_needed} onChange={e => setForm({ ...form, time_needed: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Number of Guards *</Label>
                <Input required type="number" min={1} max={50} value={form.num_guards} onChange={e => setForm({ ...form, num_guards: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Duration *</Label>
                <Select value={form.duration} onValueChange={v => setForm({ ...form, duration: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="8 hours">8 hours</SelectItem>
                    <SelectItem value="12 hours">12 hours</SelectItem>
                    <SelectItem value="24 hours">24 hours</SelectItem>
                    <SelectItem value="Multi-day">Multi-day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Reason / Notes</Label>
              <Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Event type, special requirements..." rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuardRequestForm;

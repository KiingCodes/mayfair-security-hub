import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Eye, AlertTriangle, Clock, MapPin, Shield,
  XCircle, Trash2, Send, Download, Users
} from "lucide-react";
import PanicButton from "./PanicButton";
import AlertHistory from "./AlertHistory";
import ClientFiles from "./ClientFiles";
import ClientInvoices from "./ClientInvoices";
import ClientContracts from "./ClientContracts";
import GuardRequestForm from "./GuardRequestForm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelDialog, setCancelDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("client-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "guard_checkins" }, () => {
        queryClient.invalidateQueries({ queryKey: ["guard-checkins"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        queryClient.invalidateQueries({ queryKey: ["incidents"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "patrol_reports" }, () => {
        queryClient.invalidateQueries({ queryKey: ["patrol-reports"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: checkins = [] } = useQuery({
    queryKey: ["guard-checkins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guard_checkins")
        .select("*")
        .order("checked_in_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["patrol-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patrol_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: cancellations = [] } = useQuery({
    queryKey: ["my-cancellations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_cancellations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCancelRequest = async () => {
    if (!user || !cancelReason.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("contract_cancellations").insert({
      user_id: user.id,
      reason: cancelReason.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Submitted", description: "Your cancellation request has been sent to our team." });
      setCancelDialog(false);
      setCancelReason("");
      queryClient.invalidateQueries({ queryKey: ["my-cancellations"] });
    }
    setSubmitting(false);
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("profiles").delete().eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    toast({ title: "Profile Deleted", description: "Your profile has been removed. Signing out..." });
    setDeleteDialog(false);
    setTimeout(() => signOut(), 1500);
    setSubmitting(false);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Panic Button */}
        <div className="mb-8">
          <PanicButton />
        </div>

        {/* Alert History */}
        <AlertHistory />

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Shield} label="Active Guards" value={checkins.filter(c => c.status === "on_duty").length} color="text-primary" />
          <StatCard icon={Clock} label="Check-ins Today" value={checkins.length} />
          <StatCard icon={AlertTriangle} label="Open Incidents" value={incidents.filter(i => i.status === "open").length} color="text-accent" />
          <StatCard icon={FileText} label="Patrol Reports" value={reports.length} />
        </div>

        {/* Main Feature Tabs */}
        <Tabs defaultValue="invoices" className="mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
            <TabsTrigger value="invoices" className="gap-1.5">
              <FileText className="w-4 h-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <Eye className="w-4 h-4" /> Reports
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-1.5">
              <Download className="w-4 h-4" /> Contracts
            </TabsTrigger>
            <TabsTrigger value="guards" className="gap-1.5">
              <Users className="w-4 h-4" /> Guards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <div className="bg-muted rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> My Invoices
              </h3>
              <ClientInvoices />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="bg-muted rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" /> Patrol Reports
              </h3>
              {reports.length === 0 ? (
                <p className="text-muted-foreground text-sm">No patrol reports yet.</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <div key={r.id} className="bg-background rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{r.summary}</p>
                          <p className="text-xs text-muted-foreground">{r.guard_name} — {r.location}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{r.report_type}</span>
                      </div>
                      {r.details && <p className="text-xs text-muted-foreground mt-2">{r.details}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contracts">
            <div className="bg-muted rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" /> My Contracts
              </h3>
              <ClientContracts />
            </div>
          </TabsContent>

          <TabsContent value="guards">
            <div className="bg-muted rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Request Guards
              </h3>
              <GuardRequestForm />
            </div>
          </TabsContent>
        </Tabs>

        {/* Shared Files */}
        <div className="mb-8">
          <ClientFiles />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground" onClick={() => setCancelDialog(true)}>
            <XCircle className="w-4 h-4 mr-2" /> Request Contract Cancellation
          </Button>
        </div>

        {/* Cancellation Requests */}
        {cancellations.length > 0 && (
          <div className="bg-muted rounded-2xl p-6 mb-8">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-accent" /> My Cancellation Requests
            </h3>
            <div className="space-y-3">
              {cancellations.map((c: any) => (
                <div key={c.id} className="bg-background rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm">{c.reason}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={c.status === "pending" ? "default" : c.status === "approved" ? "secondary" : "destructive"}>
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-muted rounded-2xl p-6">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Recent Check-ins
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live
              </span>
            </h3>
            {checkins.length === 0 ? (
              <p className="text-muted-foreground text-sm">No check-ins yet.</p>
            ) : (
              <div className="space-y-3">
                {checkins.slice(0, 5).map((c) => (
                  <div key={c.id} className="bg-background rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{c.guard_name}</p>
                      <p className="text-xs text-muted-foreground">{c.location}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${c.status === "on_duty" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {c.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(c.checked_in_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-muted rounded-2xl p-6">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" /> Recent Incidents
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> Live
              </span>
            </h3>
            {incidents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No incidents reported.</p>
            ) : (
              <div className="space-y-3">
                {incidents.slice(0, 5).map((i) => (
                  <div key={i.id} className="bg-background rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{i.incident_type}</p>
                        <p className="text-xs text-muted-foreground">{i.location}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        i.severity === "high" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      }`}>
                        {i.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{i.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Contract Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Contract Cancellation</DialogTitle>
            <DialogDescription>
              Please provide a reason for your cancellation request. Our team will review it and get back to you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for cancellation</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please explain why you'd like to cancel..."
                rows={4}
              />
            </div>
            <Button onClick={handleCancelRequest} className="w-full" disabled={submitting || !cancelReason.trim()}>
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Your Profile</DialogTitle>
            <DialogDescription>
              This will permanently delete your profile data. You will be signed out. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProfile} disabled={submitting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {submitting ? "Deleting..." : "Delete Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color?: string }) => (
  <div className="bg-muted rounded-xl p-6">
    <Icon className={`w-8 h-8 mb-2 ${color || "text-foreground"}`} />
    <p className="text-3xl font-heading font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default ClientDashboard;

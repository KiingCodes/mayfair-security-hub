import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Eye, AlertTriangle, Clock, MapPin, Shield } from "lucide-react";

const ClientDashboard = () => {
  const { user } = useAuth();

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

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Shield} label="Active Guards" value={checkins.filter(c => c.status === "on_duty").length} color="text-primary" />
          <StatCard icon={Clock} label="Check-ins Today" value={checkins.length} />
          <StatCard icon={AlertTriangle} label="Open Incidents" value={incidents.filter(i => i.status === "open").length} color="text-accent" />
          <StatCard icon={FileText} label="Patrol Reports" value={reports.length} />
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Check-ins */}
          <div className="bg-muted rounded-2xl p-6">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Recent Check-ins
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

          {/* Recent Incidents */}
          <div className="bg-muted rounded-2xl p-6">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" /> Recent Incidents
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

        {/* Patrol Reports */}
        <div className="mt-8 bg-muted rounded-2xl p-6">
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
      </div>
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

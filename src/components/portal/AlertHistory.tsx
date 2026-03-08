import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AlertHistory = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("my-alerts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_alerts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["my-alerts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: alerts = [] } = useQuery({
    queryKey: ["my-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  if (alerts.length === 0) return null;

  return (
    <div className="bg-muted rounded-2xl p-6 mb-8">
      <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" /> My Emergency Alerts
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Live
        </span>
      </h3>
      <div className="space-y-3">
        {alerts.map((a: any) => (
          <div key={a.id} className="bg-background rounded-lg p-3 flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm capitalize">{a.alert_type.replace("_", " ")}</p>
              {a.location && <p className="text-xs text-muted-foreground">{a.location}</p>}
              {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(a.created_at).toLocaleString()}
              </p>
              {a.admin_notes && (
                <p className="text-xs mt-1 text-primary font-medium">Admin: {a.admin_notes}</p>
              )}
            </div>
            <Badge
              variant={a.status === "active" ? "destructive" : a.status === "responding" ? "default" : "secondary"}
              className="shrink-0 flex items-center gap-1"
            >
              {a.status === "active" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {a.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertHistory;

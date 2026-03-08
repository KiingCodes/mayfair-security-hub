import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClientContracts = () => {
  const { user } = useAuth();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["my-contracts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_contracts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-background rounded-lg p-4 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No contracts available.</p>
        <p className="text-sm text-muted-foreground mt-1">Your service agreements will appear here once uploaded by the admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map((c: any) => (
        <div key={c.id} className="bg-background rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold text-sm">{c.title}</p>
            {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {c.file_name} · Uploaded {new Date(c.created_at).toLocaleDateString()}
            </p>
          </div>
          <a href={c.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" /> Download
            </Button>
          </a>
        </div>
      ))}
    </div>
  );
};

export default ClientContracts;

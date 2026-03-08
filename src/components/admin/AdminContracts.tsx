import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Plus, Trash2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface AdminContractsProps {
  clients: { user_id: string; company_name: string | null }[];
}

const AdminContracts = ({ clients }: AdminContractsProps) => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ client_id: "", title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    const { data } = await supabase
      .from("client_contracts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setContracts(data);
  };

  const handleUpload = async () => {
    if (!form.client_id || !form.title || !file) {
      toast({ title: "Error", description: "Client, title, and file are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const path = `contracts/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("shared-files").upload(path, file);
    if (uploadError) {
      toast({ title: "Upload Error", description: uploadError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    const { data: signedData } = await supabase.storage.from("shared-files").createSignedUrl(path, 31536000);

    const { error } = await supabase.from("client_contracts").insert({
      client_id: form.client_id,
      title: form.title,
      description: form.description || null,
      file_url: signedData?.signedUrl || "",
      file_name: file.name,
    });

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Uploaded", description: "Contract uploaded for client." });

    setDialog(false);
    setSubmitting(false);
    setForm({ client_id: "", title: "", description: "" });
    setFile(null);
    fetchContracts();
  };

  const deleteContract = async (id: string) => {
    const { error } = await supabase.from("client_contracts").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchContracts(); }
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.user_id === clientId);
    return c?.company_name || clientId.slice(0, 8) + "...";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" /> Contracts ({contracts.length})
        </h2>
        <Button onClick={() => setDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Upload Contract
        </Button>
      </div>

      {contracts.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No contracts uploaded. Click "Upload Contract" to add one.</p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold">{c.title}</TableCell>
                  <TableCell>{getClientName(c.client_id)}</TableCell>
                  <TableCell>
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      {c.file_name}
                    </a>
                  </TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteContract(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client *</Label>
              <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.user_id} value={c.user_id}>
                      {c.company_name || c.user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Service Agreement 2026" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Contract File *</Label>
              <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={handleUpload} className="w-full" disabled={submitting}>
              <Upload className="w-4 h-4 mr-2" />
              {submitting ? "Uploading..." : "Upload Contract"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContracts;

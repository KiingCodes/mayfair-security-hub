import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Plus, Trash2, Edit, Save, Upload, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface AdminInvoicesProps {
  clients: { user_id: string; company_name: string | null }[];
}

const AdminInvoices = ({ clients }: AdminInvoicesProps) => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    invoice_number: "",
    description: "",
    amount: "",
    status: "unpaid",
    due_date: "",
    file_url: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInvoices(data);
  };

  const openDialog = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({
        client_id: item.client_id,
        invoice_number: item.invoice_number,
        description: item.description || "",
        amount: String(item.amount),
        status: item.status,
        due_date: item.due_date || "",
        file_url: item.file_url || "",
      });
    } else {
      setEditing(null);
      setForm({ client_id: "", invoice_number: "", description: "", amount: "", status: "unpaid", due_date: "", file_url: "" });
    }
    setFile(null);
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.client_id || !form.invoice_number || !form.amount) {
      toast({ title: "Error", description: "Client, invoice number, and amount are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    let fileUrl = form.file_url;
    if (file) {
      const path = `invoices/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("shared-files").upload(path, file);
      if (uploadError) {
        toast({ title: "Upload Error", description: uploadError.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { data: signedData } = await supabase.storage.from("shared-files").createSignedUrl(path, 31536000);
      fileUrl = signedData?.signedUrl || "";
    }

    const payload = {
      client_id: form.client_id,
      invoice_number: form.invoice_number,
      description: form.description || null,
      amount: parseFloat(form.amount),
      status: form.status,
      due_date: form.due_date || null,
      file_url: fileUrl || null,
    };

    if (editing) {
      const { error } = await supabase.from("invoices").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Updated", description: "Invoice updated." });
    } else {
      const { error } = await supabase.from("invoices").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Created", description: "Invoice created." });
        // Send email notification to client
        const { data: userData } = await supabase.rpc("get_user_email", { uid: form.client_id });
        if (userData) {
          supabase.functions.invoke("send-client-email", {
            body: {
              type: "invoice_created",
              to: [userData],
              data: {
                invoice_number: form.invoice_number,
                amount: parseFloat(form.amount).toLocaleString("en-ZA", { minimumFractionDigits: 2 }),
                due_date: form.due_date ? new Date(form.due_date).toLocaleDateString() : null,
                description: form.description || null,
                status: form.status,
                portal_url: `${window.location.origin}/portal`,
              },
            },
          }).catch(() => {});
        }
      }
    }

    setDialog(false);
    setSubmitting(false);
    fetchInvoices();
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchInvoices(); }
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.user_id === clientId);
    return c?.company_name || clientId.slice(0, 8) + "...";
  };

  const statusColor = (s: string) => {
    if (s === "paid") return "secondary";
    if (s === "overdue") return "destructive";
    return "default";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Invoices ({invoices.length})
        </h2>
        <Button onClick={() => openDialog()} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Create Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No invoices yet. Click "Create Invoice" to get started.</p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-semibold">{inv.invoice_number}</TableCell>
                  <TableCell>{getClientName(inv.client_id)}</TableCell>
                  <TableCell>R{Number(inv.amount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(inv.status) as any}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openDialog(inv)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteInvoice(inv.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
            <DialogTitle>{editing ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Invoice # *</Label>
                <Input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-001" />
              </div>
              <div>
                <Label>Amount (ZAR) *</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Invoice PDF</Label>
              <Input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
              {form.file_url && !file && <p className="text-xs text-muted-foreground mt-1">Existing file attached</p>}
            </div>
            <Button onClick={handleSave} className="w-full" disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving..." : editing ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoices;

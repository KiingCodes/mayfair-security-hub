import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface AdminGuardRequestsProps {
  clients: { user_id: string; company_name: string | null }[];
}

const AdminGuardRequests = ({ clients }: AdminGuardRequestsProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [notesDialog, setNotesDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("guard_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    const update: any = { status };
    if (notes) update.admin_notes = notes;
    const { error } = await supabase.from("guard_requests").update(update).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Updated", description: `Request ${status}.` });

      // Send email notification to client on approve/reject
      if (status === "approved" || status === "rejected") {
        const req = requests.find(r => r.id === id);
        if (req) {
          const { data: userEmail } = await supabase.rpc("get_user_email", { uid: req.user_id });
          if (userEmail) {
            supabase.functions.invoke("send-client-email", {
              body: {
                type: "guard_request_update",
                to: [userEmail],
                data: {
                  status,
                  location: req.location,
                  date_needed: new Date(req.date_needed).toLocaleDateString(),
                  num_guards: req.num_guards,
                  duration: req.duration,
                  admin_notes: notes || null,
                },
              },
            }).catch(() => {});
          }
        }
      }

      setNotesDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    }
  };

  const openNotesDialog = (req: any) => {
    setSelectedRequest(req);
    setAdminNotes(req.admin_notes || "");
    setNotesDialog(true);
  };

  const getClientName = (userId: string) => {
    const c = clients.find(cl => cl.user_id === userId);
    return c?.company_name || userId.slice(0, 8) + "...";
  };

  const statusColor = (s: string): any => {
    if (s === "approved") return "secondary";
    if (s === "rejected") return "destructive";
    return "default";
  };

  const pending = requests.filter(r => r.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Guard Requests ({requests.length})
          {pending > 0 && (
            <Badge variant="destructive" className="ml-2">{pending} pending</Badge>
          )}
        </h2>
      </div>

      {requests.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No guard requests yet.</p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guards</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id} className={r.status === "pending" ? "bg-accent/5" : ""}>
                  <TableCell>{getClientName(r.user_id)}</TableCell>
                  <TableCell className="font-semibold">{r.location}</TableCell>
                  <TableCell>
                    {new Date(r.date_needed).toLocaleDateString()}
                    {r.time_needed && <span className="text-muted-foreground text-xs block">{r.time_needed}</span>}
                  </TableCell>
                  <TableCell>{r.num_guards}</TableCell>
                  <TableCell>{r.duration}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus(r.id, "approved")}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(r.id, "rejected")}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => openNotesDialog(r)}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={notesDialog} onOpenChange={setNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guard Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <p><strong>Client:</strong> {getClientName(selectedRequest.user_id)}</p>
                <p><strong>Location:</strong> {selectedRequest.location}</p>
                <p><strong>Date:</strong> {new Date(selectedRequest.date_needed).toLocaleDateString()} {selectedRequest.time_needed}</p>
                <p><strong>Guards:</strong> {selectedRequest.num_guards} · <strong>Duration:</strong> {selectedRequest.duration}</p>
                {selectedRequest.reason && <p><strong>Reason:</strong> {selectedRequest.reason}</p>}
              </div>
              <div>
                <Label>Admin Notes</Label>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes for the client..." rows={3} />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => updateStatus(selectedRequest.id, "approved", adminNotes)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => updateStatus(selectedRequest.id, "rejected", adminNotes)}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
              {adminNotes && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => updateStatus(selectedRequest.id, selectedRequest.status, adminNotes)}
                >
                  Save Notes Only
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGuardRequests;

import { useState, useEffect } from "react";
import { Eye, Download, CheckCircle, XCircle, Clock, Mail, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string | null;
  message: string | null;
  cv_url: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["pending", "reviewed", "shortlisted", "interview", "hired", "rejected"];

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { variant: "secondary", icon: Clock },
  reviewed: { variant: "outline", icon: Eye },
  shortlisted: { variant: "default", icon: CheckCircle },
  interview: { variant: "default", icon: Briefcase },
  hired: { variant: "default", icon: CheckCircle },
  rejected: { variant: "destructive", icon: XCircle },
};

interface AdminJobApplicationsProps {
  onPendingCount?: (count: number) => void;
}

const AdminJobApplications = ({ onPendingCount }: AdminJobApplicationsProps) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setApplications(data as JobApplication[]);
      onPendingCount?.(data.filter((a) => a.status === "pending").length);
    }
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Application marked as ${status}.` });
      fetchApplications();
      if (viewing?.id === id) setViewing({ ...viewing!, status });
    }
  };

  const downloadCv = async (cvPath: string, applicantName: string) => {
    const { data, error } = await supabase.storage.from("cv-uploads").createSignedUrl(cvPath, 300);
    if (error || !data?.signedUrl) {
      toast({ title: "Error", description: "Could not generate download link.", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const filtered = filterStatus === "all" ? applications : applications.filter((a) => a.status === filterStatus);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-heading font-bold">Job Applications ({applications.length})</h3>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No applications found.</p>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>CV</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => {
                const cfg = statusConfig[app.status] || statusConfig.pending;
                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.position}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(app.created_at)}</TableCell>
                    <TableCell>
                      {app.cv_url ? (
                        <Button size="sm" variant="ghost" onClick={() => downloadCv(app.cv_url!, app.name)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant} className="capitalize">
                        <cfg.icon className="w-3 h-3 mr-1" />
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setViewing(app)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{viewing.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="font-semibold">{viewing.position}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${viewing.email}`} className="text-sm text-primary hover:underline">{viewing.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${viewing.phone}`} className="text-sm text-primary hover:underline">{viewing.phone}</a>
                </div>
              </div>
              {viewing.experience && (
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-sm">{viewing.experience}</p>
                </div>
              )}
              {viewing.message && (
                <div>
                  <p className="text-xs text-muted-foreground">Additional Information</p>
                  <p className="text-sm whitespace-pre-wrap">{viewing.message}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Applied {formatDate(viewing.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  {viewing.cv_url && (
                    <Button size="sm" variant="outline" onClick={() => downloadCv(viewing.cv_url!, viewing.name)}>
                      <Download className="w-4 h-4 mr-2" /> Download CV
                    </Button>
                  )}
                  <Select value={viewing.status} onValueChange={(v) => updateStatus(viewing.id, v)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobApplications;

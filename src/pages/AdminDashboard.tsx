import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Image, Users, UserCheck, Trash2, Edit, Plus, Upload,
  LogOut, LayoutDashboard, AlertTriangle, FileText, X, Save, XCircle, CheckCircle,
  Bell, ShieldAlert, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GALLERY_CATEGORIES = [
  { value: "guards", label: "Guards on Duty" },
  { value: "vehicles", label: "Patrol Vehicles" },
  { value: "training", label: "Training" },
  { value: "cctv", label: "CCTV & Alarms" },
  { value: "fencing", label: "Electric Fencing" },
];

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryDialog, setGalleryDialog] = useState(false);
  const [editingGallery, setEditingGallery] = useState<any>(null);
  const [galleryForm, setGalleryForm] = useState({ title: "", description: "", category: "guards" });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Staff state
  const [staffProfiles, setStaffProfiles] = useState<any[]>([]);
  
  // Client state
  const [clients, setClients] = useState<any[]>([]);

  // Incidents state
  const [incidents, setIncidents] = useState<any[]>([]);

  // Cancellations state
  const [cancellations, setCancellations] = useState<any[]>([]);

  // Emergency alerts state
  const [alerts, setAlerts] = useState<any[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Stats
  const [stats, setStats] = useState({ gallery: 0, staff: 0, clients: 0, incidents: 0, cancellations: 0, alerts: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  // Realtime for emergency alerts
  useEffect(() => {
    const channel = supabase
      .channel("admin-alerts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_alerts" }, () => {
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAll = async () => {
    const [galleryRes, staffRes, clientsRes, incidentsRes, cancelRes, alertsRes] = await Promise.all([
      supabase.from("gallery_items").select("*").order("sort_order"),
      supabase.from("staff_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("incidents").select("*").order("created_at", { ascending: false }),
      supabase.from("contract_cancellations").select("*").order("created_at", { ascending: false }),
      supabase.from("emergency_alerts").select("*").order("created_at", { ascending: false }),
    ]);

    if (galleryRes.data) setGalleryItems(galleryRes.data);
    if (staffRes.data) setStaffProfiles(staffRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    if (incidentsRes.data) setIncidents(incidentsRes.data);
    if (cancelRes.data) setCancellations(cancelRes.data);
    if (alertsRes.data) setAlerts(alertsRes.data);

    setStats({
      gallery: galleryRes.data?.length || 0,
      staff: staffRes.data?.length || 0,
      clients: clientsRes.data?.length || 0,
      incidents: incidentsRes.data?.filter(i => i.status === "open").length || 0,
      cancellations: cancelRes.data?.filter(c => c.status === "pending").length || 0,
      alerts: alertsRes.data?.filter(a => a.status === "active").length || 0,
    });
  };

  // Gallery CRUD
  const openGalleryDialog = (item?: any) => {
    if (item) {
      setEditingGallery(item);
      setGalleryForm({ title: item.title, description: item.description || "", category: item.category });
    } else {
      setEditingGallery(null);
      setGalleryForm({ title: "", description: "", category: "guards" });
    }
    setGalleryFile(null);
    setGalleryDialog(true);
  };

  const handleGallerySave = async () => {
    setUploading(true);
    try {
      let imageUrl = editingGallery?.image_url || "";

      if (galleryFile) {
        const ext = galleryFile.name.split(".").pop();
        const path = `${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("gallery-images")
          .upload(path, galleryFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      if (!imageUrl) {
        toast({ title: "Error", description: "Please upload an image.", variant: "destructive" });
        setUploading(false);
        return;
      }

      const payload = {
        title: galleryForm.title,
        description: galleryForm.description,
        category: galleryForm.category,
        image_url: imageUrl,
      };

      if (editingGallery) {
        const { error } = await supabase.from("gallery_items").update(payload).eq("id", editingGallery.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Gallery item updated." });
      } else {
        const { error } = await supabase.from("gallery_items").insert(payload);
        if (error) throw error;
        toast({ title: "Added", description: "Gallery item added." });
      }

      setGalleryDialog(false);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const deleteGalleryItem = async (id: string) => {
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Gallery item removed." });
      fetchAll();
    }
  };

  // Staff management
  const deleteStaffProfile = async (id: string) => {
    const { error } = await supabase.from("staff_profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Staff profile removed." });
      fetchAll();
    }
  };

  const updateIncidentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("incidents").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Incident marked as ${status}.` });
      fetchAll();
    }
  };

  const updateCancellationStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contract_cancellations").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Cancellation request ${status}.` });
      fetchAll();
    }
  };

  const updateAlertStatus = async (id: string, status: string, notes?: string) => {
    const updateData: any = { status };
    if (status === "resolved") updateData.resolved_at = new Date().toISOString();
    if (notes) updateData.admin_notes = notes;
    const { error } = await supabase.from("emergency_alerts").update(updateData).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Alert marked as ${status}.` });
      setRespondingId(null);
      setAdminNotes("");
      fetchAll();
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="py-6 gradient-hero">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-heading font-bold text-white">Admin Dashboard</h1>
          </div>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-foreground" onClick={signOut}>
            <LogOut className="mr-2 w-4 h-4" /> Sign Out
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              🚨 Alerts
              {stats.alerts > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0 animate-pulse">{stats.alerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="cancellations">
              Cancellations
              {stats.cancellations > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">{stats.cancellations}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              {[
                { label: "Active Alerts", value: stats.alerts, icon: ShieldAlert, color: "text-destructive" },
                { label: "Gallery Items", value: stats.gallery, icon: Image, color: "text-primary" },
                { label: "Staff Members", value: stats.staff, icon: UserCheck, color: "text-primary" },
                { label: "Clients", value: stats.clients, icon: Users, color: "text-primary" },
                { label: "Open Incidents", value: stats.incidents, icon: AlertTriangle, color: "text-accent" },
                { label: "Pending Cancellations", value: stats.cancellations, icon: XCircle, color: "text-accent" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="bg-card border rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-heading font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-heading font-bold mb-4">Recent Incidents</h3>
                {incidents.slice(0, 5).map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{inc.incident_type}</p>
                      <p className="text-xs text-muted-foreground">{inc.location}</p>
                    </div>
                    <Badge variant={inc.status === "open" ? "destructive" : "secondary"}>{inc.status}</Badge>
                  </div>
                ))}
                {incidents.length === 0 && <p className="text-muted-foreground text-sm">No incidents reported.</p>}
              </div>

              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-heading font-bold mb-4">Recent Staff</h3>
                {staffProfiles.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.full_name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{s.position}</p>
                    </div>
                  </div>
                ))}
                {staffProfiles.length === 0 && <p className="text-muted-foreground text-sm">No staff profiles yet.</p>}
              </div>
            </div>
          </TabsContent>

          {/* Emergency Alerts */}
          <TabsContent value="alerts">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-destructive" /> Emergency Alerts
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Real-time
                </span>
              </h2>
            </div>

            {alerts.filter(a => a.status === "active").length > 0 && (
              <div className="bg-destructive/10 border-2 border-destructive rounded-xl p-4 mb-6">
                <p className="font-bold text-destructive flex items-center gap-2">
                  <Bell className="w-5 h-5 animate-bounce" />
                  {alerts.filter(a => a.status === "active").length} active alert(s) require immediate attention!
                </p>
              </div>
            )}

            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`bg-card border rounded-xl p-5 ${
                    alert.status === "active" ? "border-destructive shadow-lg" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold capitalize text-base">
                          {alert.alert_type.replace("_", " ")}
                        </span>
                        <Badge variant={
                          alert.status === "active" ? "destructive" :
                          alert.status === "responding" ? "default" : "secondary"
                        }>
                          {alert.status}
                        </Badge>
                        <Badge variant="outline">{alert.severity}</Badge>
                      </div>
                      {alert.location && <p className="text-sm text-muted-foreground">📍 {alert.location}</p>}
                      {alert.description && <p className="text-sm mt-1">{alert.description}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                      {alert.admin_notes && (
                        <p className="text-sm mt-2 text-primary bg-primary/5 rounded p-2">
                          <strong>Notes:</strong> {alert.admin_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {alert.status === "active" && (
                        <>
                          <Button size="sm" onClick={() => updateAlertStatus(alert.id, "responding")}>
                            <Bell className="w-4 h-4 mr-1" /> Responding
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRespondingId(alert.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === "responding" && (
                        <Button size="sm" variant="outline" onClick={() => setRespondingId(alert.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>

                  {respondingId === alert.id && (
                    <div className="mt-4 flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Resolution notes</Label>
                        <Input
                          value={adminNotes}
                          onChange={(e: any) => setAdminNotes(e.target.value)}
                          placeholder="How was this resolved?"
                        />
                      </div>
                      <Button size="sm" onClick={() => updateAlertStatus(alert.id, "resolved", adminNotes)}>
                        Confirm
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setRespondingId(null); setAdminNotes(""); }}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No emergency alerts. All clear!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Gallery Management */}
          <TabsContent value="gallery">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold">Gallery Management</h2>
              <Button onClick={() => openGalleryDialog()} className="btn-primary-glow">
                <Plus className="w-4 h-4 mr-2" /> Add Image
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-card border rounded-xl overflow-hidden group">
                  <div className="aspect-video relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button size="sm" variant="secondary" onClick={() => openGalleryDialog(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteGalleryItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-heading font-bold text-sm">{item.title}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">{item.category}</Badge>
                  </div>
                </div>
              ))}
              {galleryItems.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No gallery items yet. Click "Add Image" to get started.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Staff Management */}
          <TabsContent value="staff">
            <h2 className="text-xl font-heading font-bold mb-6">Staff Management</h2>
            <div className="bg-card border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>PSIRA</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffProfiles.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt={s.full_name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          {s.full_name}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{s.position}</TableCell>
                      <TableCell>{s.psira_number || "—"}</TableCell>
                      <TableCell>{s.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" onClick={() => deleteStaffProfile(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {staffProfiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No staff profiles yet. Staff members will appear here once they create their profiles.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Clients Management */}
          <TabsContent value="clients">
            <h2 className="text-xl font-heading font-bold mb-6">Client Management</h2>
            <div className="bg-card border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.company_name || "—"}</TableCell>
                      <TableCell>{c.phone || "—"}</TableCell>
                      <TableCell>{c.address || "—"}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {clients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No clients registered yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Incidents */}
          <TabsContent value="incidents">
            <h2 className="text-xl font-heading font-bold mb-6">Incident Reports</h2>
            <div className="bg-card border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc) => (
                    <TableRow key={inc.id}>
                      <TableCell className="font-medium">{inc.incident_type}</TableCell>
                      <TableCell>{inc.location}</TableCell>
                      <TableCell>
                        <Badge variant={inc.severity === "high" ? "destructive" : inc.severity === "medium" ? "default" : "secondary"}>
                          {inc.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{inc.reporter_name}</TableCell>
                      <TableCell>
                        <Badge variant={inc.status === "open" ? "destructive" : "secondary"}>{inc.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {inc.status === "open" && (
                          <Button size="sm" variant="outline" onClick={() => updateIncidentStatus(inc.id, "resolved")}>
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {incidents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No incidents reported.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Cancellations */}
          <TabsContent value="cancellations">
            <h2 className="text-xl font-heading font-bold mb-6">Contract Cancellation Requests</h2>
            <div className="bg-card border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancellations.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium max-w-xs truncate">{c.reason}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "pending" ? "default" : c.status === "approved" ? "secondary" : "destructive"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {c.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => updateCancellationStatus(c.id, "approved")}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateCancellationStatus(c.id, "rejected")}>
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {cancellations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No cancellation requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Gallery Dialog */}
      <Dialog open={galleryDialog} onOpenChange={setGalleryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGallery ? "Edit Gallery Item" : "Add Gallery Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={galleryForm.title}
                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                placeholder="e.g. Guard on Night Duty"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={galleryForm.description}
                onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={galleryForm.category} onValueChange={(v) => setGalleryForm({ ...galleryForm, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} />
              {editingGallery?.image_url && !galleryFile && (
                <img src={editingGallery.image_url} alt="Current" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>
            <Button onClick={handleGallerySave} className="w-full btn-primary-glow" disabled={uploading || !galleryForm.title}>
              <Save className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : editingGallery ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;

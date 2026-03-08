import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Image, Users, UserCheck, Trash2, Edit, Plus, Upload,
  LogOut, LayoutDashboard, AlertTriangle, FileText, X, Save, XCircle, CheckCircle,
  Bell, ShieldAlert, CheckCircle2, ArrowLeft, Activity, Download, KeyRound
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
import { Link } from "react-router-dom";
import DateRangeFilter from "@/components/admin/DateRangeFilter";

const GALLERY_CATEGORIES = [
  { value: "guards", label: "Guards on Duty" },
  { value: "vehicles", label: "Patrol Vehicles" },
  { value: "training", label: "Training" },
  { value: "cctv", label: "CCTV & Alarms" },
  { value: "fencing", label: "Electric Fencing" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const exportToCsv = (filename: string, rows: Record<string, any>[], columns?: string[]) => {
  if (rows.length === 0) return;
  const keys = columns || Object.keys(rows[0]);
  const header = keys.join(",");
  const csv = [header, ...rows.map(row =>
    keys.map(k => {
      const val = row[k] ?? "";
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  )].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

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
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", position: "guard" });
  const [inviteResult, setInviteResult] = useState<{ email: string; temp_password: string } | null>(null);
  const [inviting, setInviting] = useState(false);
  
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

  // Date range filter state
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const filterByDate = (rows: any[], dateField = "created_at") => {
    if (!dateFrom && !dateTo) return rows;
    return rows.filter(row => {
      const d = new Date(row[dateField]);
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        if (d < start) return false;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  };

  // Reset date filter when switching tabs
  useEffect(() => {
    setDateFrom(undefined);
    setDateTo(undefined);
  }, [activeTab]);

  // Filtered data
  const filteredStaff = useMemo(() => filterByDate(staffProfiles), [staffProfiles, dateFrom, dateTo]);
  const filteredClients = useMemo(() => filterByDate(clients), [clients, dateFrom, dateTo]);
  const filteredIncidents = useMemo(() => filterByDate(incidents), [incidents, dateFrom, dateTo]);
  const filteredCancellations = useMemo(() => filterByDate(cancellations), [cancellations, dateFrom, dateTo]);
  const filteredAlerts = useMemo(() => filterByDate(alerts), [alerts, dateFrom, dateTo]);

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

  const deleteStaffProfile = async (id: string) => {
    const { error } = await supabase.from("staff_profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Staff profile removed." });
      fetchAll();
    }
  };
  const handleInviteStaff = async () => {
    if (!inviteForm.email || !inviteForm.full_name) return;
    setInviting(true);
    setInviteResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("invite-staff", {
        body: {
          email: inviteForm.email,
          full_name: inviteForm.full_name,
          position: inviteForm.position,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setInviteResult({ email: data.email, temp_password: data.temp_password });
      toast({ title: "Staff Invited!", description: `Account created for ${inviteForm.full_name}.` });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setInviting(false);
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

  const statCards = [
    { label: "Active Alerts", value: stats.alerts, icon: ShieldAlert, gradient: "from-destructive to-destructive/80", urgent: stats.alerts > 0 },
    { label: "Gallery Items", value: stats.gallery, icon: Image, gradient: "from-primary to-primary/80" },
    { label: "Staff Members", value: stats.staff, icon: UserCheck, gradient: "from-primary to-primary/80" },
    { label: "Clients", value: stats.clients, icon: Users, gradient: "from-primary to-primary/80" },
    { label: "Open Incidents", value: stats.incidents, icon: AlertTriangle, gradient: "from-accent to-accent/80", urgent: stats.incidents > 0 },
    { label: "Pending Cancels", value: stats.cancellations, icon: XCircle, gradient: "from-accent to-accent/80", urgent: stats.cancellations > 0 },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--charcoal))] via-[hsl(var(--green-dark))] to-[hsl(var(--charcoal))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.2),transparent_60%)]" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/20">
                <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-black text-primary-foreground tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-primary-foreground/70 flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                  System Overview & Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/portal">
                <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Portal
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={signOut}
              >
                <LogOut className="mr-2 w-4 h-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-card border rounded-2xl p-1.5 mb-8 shadow-sm">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-1 bg-transparent h-auto">
              {[
                { value: "overview", label: "Overview", icon: LayoutDashboard },
                { value: "alerts", label: "Alerts", icon: ShieldAlert, badge: stats.alerts },
                { value: "gallery", label: "Gallery", icon: Image },
                { value: "staff", label: "Staff", icon: UserCheck },
                { value: "clients", label: "Clients", icon: Users },
                { value: "incidents", label: "Incidents", icon: AlertTriangle, badge: stats.incidents },
                { value: "cancellations", label: "Cancels", icon: XCircle, badge: stats.cancellations },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`relative overflow-hidden rounded-2xl p-5 text-primary-foreground bg-gradient-to-br ${stat.gradient} shadow-md hover:shadow-lg transition-shadow ${stat.urgent ? 'ring-2 ring-destructive/50 ring-offset-2 ring-offset-background' : ''}`}
                  {...fadeUp}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="absolute top-3 right-3 opacity-20">
                    <stat.icon className="w-10 h-10" />
                  </div>
                  <p className="text-xs font-medium opacity-90 mb-1">{stat.label}</p>
                  <p className="text-3xl font-heading font-black">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div className="bg-card border rounded-2xl shadow-sm overflow-hidden" {...fadeUp}>
                <div className="px-6 py-4 border-b bg-muted/50">
                  <h3 className="font-heading font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    Recent Incidents
                  </h3>
                </div>
                <div className="divide-y">
                  {incidents.slice(0, 5).map((inc) => (
                    <div key={inc.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">{inc.incident_type}</p>
                        <p className="text-xs text-muted-foreground">{inc.location}</p>
                      </div>
                      <Badge variant={inc.status === "open" ? "destructive" : "secondary"} className="text-xs">{inc.status}</Badge>
                    </div>
                  ))}
                  {incidents.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-8">No incidents reported.</p>
                  )}
                </div>
              </motion.div>

              <motion.div className="bg-card border rounded-2xl shadow-sm overflow-hidden" {...fadeUp} transition={{ delay: 0.1 }}>
                <div className="px-6 py-4 border-b bg-muted/50">
                  <h3 className="font-heading font-bold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    Recent Staff
                  </h3>
                </div>
                <div className="divide-y">
                  {staffProfiles.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt={s.full_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-secondary-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{s.position}</p>
                      </div>
                    </div>
                  ))}
                  {staffProfiles.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-8">No staff profiles yet.</p>
                  )}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Emergency Alerts */}
          <TabsContent value="alerts">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-destructive" /> Emergency Alerts
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2 bg-muted px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Real-time
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                <Button variant="outline" size="sm" onClick={() => exportToCsv("alerts", filteredAlerts, ["alert_type", "severity", "status", "location", "description", "admin_notes", "created_at", "resolved_at"])} disabled={filteredAlerts.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>

            {alerts.filter(a => a.status === "active").length > 0 && (
              <motion.div 
                className="bg-destructive/10 border-2 border-destructive rounded-2xl p-5 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="font-bold text-destructive flex items-center gap-2">
                  <Bell className="w-5 h-5 animate-bounce" />
                  {alerts.filter(a => a.status === "active").length} active alert(s) require immediate attention!
                </p>
              </motion.div>
            )}

            <div className="space-y-4">
              {filteredAlerts.map((alert: any) => (
                <motion.div
                  key={alert.id}
                  className={`bg-card border-2 rounded-2xl p-6 transition-all ${
                    alert.status === "active" ? "border-destructive shadow-lg shadow-destructive/10" : "border-border"
                  }`}
                  {...fadeUp}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-bold capitalize text-base">
                          {alert.alert_type.replace("_", " ")}
                        </span>
                        <Badge variant={
                          alert.status === "active" ? "destructive" :
                          alert.status === "responding" ? "default" : "secondary"
                        }>
                          {alert.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                      </div>
                      {alert.location && <p className="text-sm text-muted-foreground">📍 {alert.location}</p>}
                      {alert.description && <p className="text-sm mt-1.5">{alert.description}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                      {alert.admin_notes && (
                        <div className="text-sm mt-3 bg-primary/5 border border-primary/10 rounded-xl p-3">
                          <strong>Notes:</strong> {alert.admin_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {alert.status === "active" && (
                        <>
                          <Button size="sm" className="shadow-sm" onClick={() => updateAlertStatus(alert.id, "responding")}>
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
                    <div className="mt-4 flex gap-2 items-end border-t pt-4">
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
                </motion.div>
              ))}
              {filteredAlerts.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">No emergency alerts. All clear!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Gallery Management */}
          <TabsContent value="gallery">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" /> Gallery Management
              </h2>
              <Button onClick={() => openGalleryDialog()} className="bg-primary hover:bg-primary/90 shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Add Image
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, i) => (
                <motion.div 
                  key={item.id} 
                  className="bg-card border rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
                  {...fadeUp}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="aspect-video relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button size="sm" variant="secondary" className="shadow-md" onClick={() => openGalleryDialog(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" className="shadow-md" onClick={() => deleteGalleryItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-heading font-bold text-sm">{item.title}</h4>
                    <Badge variant="outline" className="mt-1.5 text-xs capitalize">{item.category}</Badge>
                  </div>
                </motion.div>
              ))}
              {galleryItems.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <Image className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">No gallery items yet.</p>
                  <p className="text-sm mt-1">Click "Add Image" to get started.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Staff Management */}
          <TabsContent value="staff">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> Staff Management
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                <Button size="sm" onClick={() => { setInviteDialog(true); setInviteResult(null); setInviteForm({ email: "", full_name: "", position: "guard" }); }} className="bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="w-4 h-4 mr-2" /> Invite Staff
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportToCsv("staff", filteredStaff, ["full_name", "position", "psira_number", "phone", "email", "status", "created_at"])} disabled={filteredStaff.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>PSIRA</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((s) => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt={s.full_name} className="w-9 h-9 rounded-full object-cover ring-2 ring-border" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-secondary-foreground" />
                            </div>
                          )}
                          {s.full_name}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{s.position}</TableCell>
                      <TableCell className="font-mono text-xs">{s.psira_number || "—"}</TableCell>
                      <TableCell>{s.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" className="shadow-sm" onClick={() => deleteStaffProfile(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStaff.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        No staff profiles yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Clients Management */}
          <TabsContent value="clients">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Client Management
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                <Button variant="outline" size="sm" onClick={() => exportToCsv("clients", filteredClients, ["company_name", "phone", "address", "created_at"])} disabled={filteredClients.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Company</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-semibold">{c.company_name || "—"}</TableCell>
                      <TableCell>{c.phone || "—"}</TableCell>
                      <TableCell>{c.address || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {filteredClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" /> Incident Reports
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                <Button variant="outline" size="sm" onClick={() => exportToCsv("incidents", filteredIncidents, ["incident_type", "location", "severity", "reporter_name", "status", "description", "created_at"])} disabled={filteredIncidents.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((inc) => (
                    <TableRow key={inc.id} className="hover:bg-muted/30">
                      <TableCell className="font-semibold">{inc.incident_type}</TableCell>
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
                            <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredIncidents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <XCircle className="w-5 h-5 text-accent" /> Contract Cancellation Requests
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                <Button variant="outline" size="sm" onClick={() => exportToCsv("cancellations", filteredCancellations, ["reason", "status", "created_at", "updated_at"])} disabled={filteredCancellations.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCancellations.map((c: any) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium max-w-xs truncate">{c.reason}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
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
                  {filteredCancellations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        <XCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
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
            <DialogTitle className="font-heading">{editingGallery ? "Edit Gallery Item" : "Add Gallery Item"}</DialogTitle>
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
                <img src={editingGallery.image_url} alt="Current" className="mt-2 h-24 rounded-xl object-cover" />
              )}
            </div>
            <Button onClick={handleGallerySave} className="w-full bg-primary hover:bg-primary/90 shadow-md" disabled={uploading || !galleryForm.title}>
              <Save className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : editingGallery ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Staff Dialog */}
      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Invite Staff Member</DialogTitle>
          </DialogHeader>
          {inviteResult ? (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="font-semibold text-sm mb-3">Account created! Share these credentials:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-background rounded-lg p-2.5">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-mono font-semibold">{inviteResult.email}</span>
                  </div>
                  <div className="flex justify-between bg-background rounded-lg p-2.5">
                    <span className="text-muted-foreground">Temp Password:</span>
                    <span className="font-mono font-semibold">{inviteResult.temp_password}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Staff should change their password after first login via Settings.
                </p>
              </div>
              <Button className="w-full" onClick={() => { setInviteDialog(false); setInviteResult(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="staff@example.com"
                />
              </div>
              <div>
                <Label>Position</Label>
                <Select value={inviteForm.position} onValueChange={(v) => setInviteForm({ ...inviteForm, position: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guard">Guard</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="control_room">Control Room</SelectItem>
                    <SelectItem value="patrol">Patrol Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleInviteStaff}
                className="w-full bg-primary hover:bg-primary/90 shadow-md"
                disabled={inviting || !inviteForm.email || !inviteForm.full_name}
              >
                <Plus className="w-4 h-4 mr-2" />
                {inviting ? "Creating Account..." : "Create Staff Account"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;

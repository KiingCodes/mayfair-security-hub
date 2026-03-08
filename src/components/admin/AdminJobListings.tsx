import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  requirements: string[];
  active: boolean;
  sort_order: number | null;
  created_at: string;
}

const AdminJobListings = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<JobListing | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    type: "Full-Time",
    salary: "",
    requirements: "",
    active: true,
    sort_order: 0,
  });

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .order("sort_order");
    if (!error && data) setListings(data as JobListing[]);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const openDialog = (item?: JobListing) => {
    if (item) {
      setEditing(item);
      setForm({
        title: item.title,
        location: item.location,
        type: item.type,
        salary: item.salary,
        requirements: item.requirements.join("\n"),
        active: item.active,
        sort_order: item.sort_order ?? 0,
      });
    } else {
      setEditing(null);
      setForm({ title: "", location: "", type: "Full-Time", salary: "", requirements: "", active: true, sort_order: 0 });
    }
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.location || !form.salary) {
      toast({ title: "Error", description: "Title, location, and salary are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const requirements = form.requirements.split("\n").map(r => r.trim()).filter(Boolean);
    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      type: form.type.trim(),
      salary: form.salary.trim(),
      requirements,
      active: form.active,
      sort_order: form.sort_order,
    };

    try {
      if (editing) {
        const { error } = await supabase.from("job_listings").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Job listing updated." });
      } else {
        const { error } = await supabase.from("job_listings").insert(payload);
        if (error) throw error;
        toast({ title: "Added", description: "Job listing created." });
      }
      setDialog(false);
      fetchListings();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from("job_listings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Job listing removed." });
      fetchListings();
    }
  };

  const toggleActive = async (item: JobListing) => {
    const { error } = await supabase.from("job_listings").update({ active: !item.active }).eq("id", item.id);
    if (!error) fetchListings();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold">Job Listings ({listings.length})</h3>
        <Button onClick={() => openDialog()} className="btn-primary-glow">
          <Plus className="w-4 h-4 mr-2" /> Add Listing
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No job listings yet. Add your first one!</p>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.location}</TableCell>
                  <TableCell className="text-muted-foreground">{item.type}</TableCell>
                  <TableCell className="text-primary font-semibold">{item.salary}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleActive(item)}
                    >
                      {item.active ? <><CheckCircle className="w-3 h-3 mr-1" /> Active</> : <><XCircle className="w-3 h-3 mr-1" /> Inactive</>}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openDialog(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteListing(item.id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Job Listing" : "Add Job Listing"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Job Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Security Guard (Armed)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Gauteng Region" />
              </div>
              <div>
                <Label>Type</Label>
                <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Full-Time / Shift Work" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary *</Label>
                <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. R8,000 – R12,000/month" />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>Requirements (one per line)</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder={"PSIRA Grade B or higher\nValid firearm competency\nClean criminal record"}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
              <Label>Active (visible on careers page)</Label>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDialog(false)}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="btn-primary-glow">
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobListings;

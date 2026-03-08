import { useState, useEffect } from "react";
import {
  Upload, FileText, Trash2, Download, Loader2, File, Search, Eye,
  Image as ImageIcon, FileSpreadsheet, FileArchive, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import FilePreview from "@/components/shared/FilePreview";
import DropZone from "@/components/shared/DropZone";

interface SharedFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  uploaded_by: string;
  client_id: string;
  description: string | null;
  created_at: string;
}

interface ClientOption {
  user_id: string;
  company_name: string | null;
}

const fileIcon = (mime: string | null) => {
  if (!mime) return File;
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.includes("spreadsheet") || mime.includes("csv") || mime.includes("excel")) return FileSpreadsheet;
  if (mime.includes("zip") || mime.includes("archive")) return FileArchive;
  return FileText;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const canPreview = (mime: string | null) => mime?.startsWith("image/") || mime === "application/pdf";

const AdminFiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "client");
      if (!roles) return;
      const clientIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, company_name").in("user_id", clientIds);
      if (profiles) setClients(profiles.map((p) => ({ user_id: p.user_id, company_name: p.company_name })));
    };
    fetchClients();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    const query = supabase.from("shared_files").select("*").order("created_at", { ascending: false });
    if (selectedClient && selectedClient !== "all") query.eq("client_id", selectedClient);
    const { data } = await query;
    if (data) setFiles(data as SharedFile[]);
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [selectedClient]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedClient || selectedClient === "all") {
      if (!selectedClient || selectedClient === "all") toast({ title: "Select a client first", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum 20MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const filePath = `${selectedClient}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("shared-files").upload(filePath, file);
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { error: insertErr } = await supabase.from("shared_files").insert({
      file_name: file.name, file_path: filePath, file_size: file.size,
      mime_type: file.type || null, uploaded_by: user.id, client_id: selectedClient,
      description: description || null,
    });
    if (insertErr) {
      toast({ title: "Error", description: insertErr.message, variant: "destructive" });
    } else {
      toast({ title: "File shared", description: `${file.name} shared with client.` });
      setDescription("");
      fetchFiles();
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDownload = async (file: SharedFile) => {
    const { data, error } = await supabase.storage.from("shared-files").download(file.file_path);
    if (error || !data) {
      toast({ title: "Download failed", description: error?.message, variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = file.file_name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (file: SharedFile) => {
    await supabase.storage.from("shared-files").remove([file.file_path]);
    const { error } = await supabase.from("shared_files").delete().eq("id", file.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "File deleted" });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    }
  };

  const getClientLabel = (clientId: string) => {
    const c = clients.find((cl) => cl.user_id === clientId);
    return c?.company_name || clientId.slice(0, 8);
  };

  const filteredFiles = files.filter((f) =>
    !searchQuery || f.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Client Selector & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">Client</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger><SelectValue placeholder="All clients" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.user_id} value={c.user_id}>{c.company_name || c.user_id.slice(0, 8)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search files…" className="pl-9" />
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="border-2 border-dashed border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Label className="text-xs text-muted-foreground mb-1 block">Description (optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Monthly invoice" className="text-sm" />
          </div>
          <div className="relative">
            <Button disabled={uploading || !selectedClient || selectedClient === "all"} className="relative">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? "Uploading…" : "Share File"}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} disabled={uploading || !selectedClient || selectedClient === "all"} />
            </Button>
          </div>
        </div>
        {(!selectedClient || selectedClient === "all") && (
          <p className="text-xs text-muted-foreground mt-2">Select a specific client to upload files</p>
        )}
      </div>

      {/* File List */}
      {loading ? (
        <div className="flex items-center gap-2 justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No files found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => {
            const Icon = fileIcon(file.mime_type);
            const isAdmin = file.uploaded_by !== file.client_id;
            const previewable = canPreview(file.mime_type);
            return (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => previewable && setPreviewFile(file)}>
                  <p className={`text-sm font-medium truncate ${previewable ? "hover:text-primary" : ""}`}>
                    {file.file_name}
                    {previewable && <Eye className="w-3 h-3 inline ml-1.5 opacity-50" />}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {getClientLabel(file.client_id)}</span>
                    <span>•</span>
                    <span>{formatSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                    {file.description && (<><span>•</span><span className="truncate">{file.description}</span></>)}
                    <span>•</span>
                    <span className={isAdmin ? "text-primary" : "text-accent"}>{isAdmin ? "Admin" : "Client"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {previewable && (
                    <Button size="icon" variant="ghost" onClick={() => setPreviewFile(file)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => handleDownload(file)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(file)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      {previewFile && (
        <FilePreview
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileName={previewFile.file_name}
          filePath={previewFile.file_path}
          mimeType={previewFile.mime_type}
          onDownload={() => handleDownload(previewFile)}
        />
      )}
    </div>
  );
};

export default AdminFiles;

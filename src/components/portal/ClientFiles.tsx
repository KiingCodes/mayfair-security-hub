import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload, FileText, Trash2, Download, Loader2, File, Eye,
  Image as ImageIcon, FileSpreadsheet, FileArchive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const ClientFiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);

  const fetchFiles = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("shared_files")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setFiles(data as SharedFile[]);
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 20MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("shared-files").upload(filePath, file);
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { error: insertErr } = await supabase.from("shared_files").insert({
      file_name: file.name, file_path: filePath, file_size: file.size,
      mime_type: file.type || null, uploaded_by: user.id, client_id: user.id,
      description: description || null,
    });
    if (insertErr) {
      toast({ title: "Error", description: insertErr.message, variant: "destructive" });
    } else {
      toast({ title: "File uploaded", description: file.name });
      setDescription("");
      fetchFiles();
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDownload = async (file: SharedFile) => {
    const { data, error } = await supabase.storage.from("shared-files").download(file.file_path);
    if (error || !data) {
      toast({ title: "Download failed", description: error?.message || "Unknown error", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = file.file_name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (file: SharedFile) => {
    if (file.uploaded_by !== user?.id) return;
    await supabase.storage.from("shared-files").remove([file.file_path]);
    const { error } = await supabase.from("shared_files").delete().eq("id", file.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "File deleted" });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    }
  };

  return (
    <motion.div className="bg-card border rounded-2xl p-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Shared Files
        </h3>
      </div>

      {/* Upload */}
      <div className="border-2 border-dashed border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Label className="text-xs text-muted-foreground mb-1 block">Description (optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Insurance certificate" className="text-sm" />
          </div>
          <div className="relative">
            <Button disabled={uploading} className="relative">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? "Uploading…" : "Upload File"}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} disabled={uploading} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Max 20MB per file</p>
      </div>

      {/* File List */}
      {loading ? (
        <div className="flex items-center gap-2 justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading files…</span>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No files shared yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = fileIcon(file.mime_type);
            const isOwn = file.uploaded_by === user?.id;
            const previewable = canPreview(file.mime_type);
            return (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => previewable && setPreviewFile(file)}>
                  <p className={`text-sm font-medium truncate ${previewable ? "hover:text-primary" : ""}`}>
                    {file.file_name}
                    {previewable && <Eye className="w-3 h-3 inline ml-1.5 opacity-50" />}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                    {file.description && (<><span>•</span><span className="truncate">{file.description}</span></>)}
                    <span>•</span>
                    <span className={isOwn ? "text-primary" : "text-accent"}>{isOwn ? "You" : "Admin"}</span>
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
                  {isOwn && (
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(file)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
    </motion.div>
  );
};

export default ClientFiles;

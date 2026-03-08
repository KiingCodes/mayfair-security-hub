import { useState } from "react";
import { X, Download, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface FilePreviewProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  filePath: string;
  mimeType: string | null;
  onDownload: () => void;
}

const FilePreview = ({ open, onClose, fileName, filePath, mimeType, onDownload }: FilePreviewProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isImage = mimeType?.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const canPreview = isImage || isPdf;

  const loadPreview = async () => {
    if (url) return;
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase.storage
      .from("shared-files")
      .createSignedUrl(filePath, 300); // 5 min
    if (err || !data?.signedUrl) {
      setError(true);
    } else {
      setUrl(data.signedUrl);
    }
    setLoading(false);
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      loadPreview();
    } else {
      onClose();
      // Clean up after close
      setTimeout(() => { setUrl(null); setError(false); }, 300);
    }
  };

  if (!canPreview) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <p className="text-sm font-medium truncate flex-1 mr-4">{fileName}</p>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
            {url && (
              <Button size="icon" variant="ghost" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center min-h-[300px] max-h-[calc(90vh-60px)] overflow-auto bg-background">
          {loading && (
            <div className="flex flex-col items-center gap-2 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading preview…</span>
            </div>
          )}
          {error && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Preview unavailable</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" /> Download instead
              </Button>
            </div>
          )}
          {url && !loading && !error && isImage && (
            <img
              src={url}
              alt={fileName}
              className="max-w-full max-h-[calc(90vh-80px)] object-contain"
            />
          )}
          {url && !loading && !error && isPdf && (
            <iframe
              src={url}
              title={fileName}
              className="w-full h-[calc(90vh-60px)]"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;

import { useState, useRef, DragEvent, ReactNode } from "react";
import { Upload } from "lucide-react";

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  disabled?: boolean;
  children: ReactNode;
}

const DropZone = ({ onFileDrop, disabled, children }: DropZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer?.items?.length) setDragging(true);
  };

  const handleDragOut = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    if (disabled) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) onFileDrop(file);
  };

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="relative"
    >
      {children}
      {dragging && !disabled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload className="w-8 h-8 animate-bounce" />
            <p className="text-sm font-semibold">Drop file here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;

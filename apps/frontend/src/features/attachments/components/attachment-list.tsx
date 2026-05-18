"use client";

import { useRef, useState } from "react";
import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/features/attachments/api/use-attachments";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Upload, Trash2, FileText, Loader2 } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface AttachmentListProps {
  leadId?: string;
  customerId?: string;
  taskId?: string;
}

export function AttachmentList({ leadId, customerId, taskId }: AttachmentListProps) {
  const { data, isLoading } = useAttachments({ leadId, customerId, taskId });
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAttachment.mutate({ file, leadId, customerId, taskId });
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    uploadAttachment.mutate({ file, leadId, customerId, taskId });
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploadAttachment.isPending}
        />
        <div className="flex flex-col items-center gap-2">
          {uploadAttachment.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploadAttachment.isPending
              ? "Uploading..."
              : "Click or drag file to upload"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-4">Loading attachments...</p>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <Paperclip className="h-6 w-6 mb-2 opacity-50" />
          <p className="text-sm">No attachments yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {data?.data.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 rounded-lg border p-3 group"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {attachment.size ? formatFileSize(attachment.size) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {attachment.downloadUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-7 px-2"
                    >
                      <a
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => deleteAttachment.mutate(attachment.id)}
                    disabled={deleteAttachment.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

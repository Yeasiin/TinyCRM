"use client";

import { useState } from "react";
import { useNotes, useCreateNote, useDeleteNote } from "@/features/notes/api/use-notes";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Send, Trash2, FileText } from "lucide-react";

interface NotesTimelineProps {
  leadId?: string;
  customerId?: string;
}

export function NotesTimeline({ leadId, customerId }: NotesTimelineProps) {
  const [content, setContent] = useState("");
  const { data, isLoading } = useNotes({ leadId, customerId });
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const handleSubmit = () => {
    if (!content.trim()) return;
    createNote.mutate(
      {
        content: content.trim(),
        leadId,
        customerId,
      },
      {
        onSuccess: () => setContent(""),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <Button
          size="icon"
          className="shrink-0 self-end"
          onClick={handleSubmit}
          disabled={!content.trim() || createNote.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading notes...
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
            </div>
          ) : (
            data?.data.map((note) => (
              <div key={note.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {note.author?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {note.author?.name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteNote.mutate(note.id)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

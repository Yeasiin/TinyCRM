export interface Note {
  id: string;
  userId: string;
  leadId: string | null;
  customerId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CreateNoteInput {
  content: string;
  leadId?: string;
  customerId?: string;
}

export interface NotesResponse {
  data: Note[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

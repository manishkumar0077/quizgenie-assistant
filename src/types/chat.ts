
export interface Chat {
  id: string;
  title: string;
  created_at: string;
  document_id: string | null;
}

export interface Message {
  type: string;
  content: string;
}

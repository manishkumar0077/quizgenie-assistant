
export interface Chat {
  id: string;
  title: string;
  created_at: string;
  document_id: string | null;
}

export interface Message {
  type: string;
  content: string | {
    answer: string;
    suggestions: Array<{
      title: string;
      video_id: string;
      thumbnail_url: string;
      description: string;
    }>;
  };
}

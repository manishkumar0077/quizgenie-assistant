export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_history: {
        Row: {
          chat_id: string | null
          created_at: string
          id: string
          message: string
          role: string
          user_id: string
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          id?: string
          message: string
          role: string
          user_id: string
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          id?: string
          message?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          analyzed_content: Json | null
          content: string | null
          created_at: string
          document_type: string | null
          file_type: string
          file_url: string | null
          filename: string
          id: string
          quiz_metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analyzed_content?: Json | null
          content?: string | null
          created_at?: string
          document_type?: string | null
          file_type: string
          file_url?: string | null
          filename: string
          id?: string
          quiz_metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analyzed_content?: Json | null
          content?: string | null
          created_at?: string
          document_type?: string | null
          file_type?: string
          file_url?: string | null
          filename?: string
          id?: string
          quiz_metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          id: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      study_files: {
        Row: {
          created_at: string | null
          extracted_text: string | null
          file_path: string
          file_type: string
          filename: string
          google_drive_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_text?: string | null
          file_path: string
          file_type: string
          filename: string
          google_drive_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_text?: string | null
          file_path?: string
          file_type?: string
          filename?: string
          google_drive_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string | null
          file_path: string
          filename: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          filename: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          filename?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_suggestions: {
        Row: {
          chat_id: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          video_id: string
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          video_id: string
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_suggestions_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

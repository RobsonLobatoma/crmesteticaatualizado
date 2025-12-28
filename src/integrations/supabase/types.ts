export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      appointment_sales: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_status: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_sales_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_id: string | null
          created_at: string | null
          duration_minutes: number
          end_datetime: string
          equipment_id: string | null
          id: string
          notes: string | null
          professional_id: string | null
          recurrence_parent_id: string | null
          recurrence_type: string | null
          room_id: string | null
          send_sms: boolean | null
          service_id: string | null
          start_datetime: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          duration_minutes?: number
          end_datetime: string
          equipment_id?: string | null
          id?: string
          notes?: string | null
          professional_id?: string | null
          recurrence_parent_id?: string | null
          recurrence_type?: string | null
          room_id?: string | null
          send_sms?: boolean | null
          service_id?: string | null
          start_datetime: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          duration_minutes?: number
          end_datetime?: string
          equipment_id?: string | null
          id?: string
          notes?: string | null
          professional_id?: string | null
          recurrence_parent_id?: string | null
          recurrence_type?: string | null
          room_id?: string | null
          send_sms?: boolean | null
          service_id?: string | null
          start_datetime?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_recurrence_parent_id_fkey"
            columns: ["recurrence_parent_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_responsibles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_statuses: {
        Row: {
          color: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          user_id?: string
        }
        Relationships: []
      }
      equipments: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          compareceu: string | null
          complemento: string | null
          contato: string
          cpf: string | null
          created_at: string
          data: string | null
          data_agendamento: string | null
          data_avaliacao: string | null
          data_entrada: string | null
          data_fechamento: string | null
          data_nascimento: string | null
          data_ultimo_contato: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          numero: string | null
          observacao: string | null
          origem: string | null
          procedimento: string | null
          responsavel: string | null
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string
          valor_fechado: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          compareceu?: string | null
          complemento?: string | null
          contato: string
          cpf?: string | null
          created_at?: string
          data?: string | null
          data_agendamento?: string | null
          data_avaliacao?: string | null
          data_entrada?: string | null
          data_fechamento?: string | null
          data_nascimento?: string | null
          data_ultimo_contato?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacao?: string | null
          origem?: string | null
          procedimento?: string | null
          responsavel?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
          valor_fechado?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          compareceu?: string | null
          complemento?: string | null
          contato?: string
          cpf?: string | null
          created_at?: string
          data?: string | null
          data_agendamento?: string | null
          data_avaliacao?: string | null
          data_entrada?: string | null
          data_fechamento?: string | null
          data_nascimento?: string | null
          data_ultimo_contato?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacao?: string | null
          origem?: string | null
          procedimento?: string | null
          responsavel?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          valor_fechado?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          duration: string | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_type: string | null
          youtube_url: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_type?: string | null
          youtube_url: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_type?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
      professional_absences: {
        Row: {
          absence_type: string | null
          created_at: string | null
          end_date: string
          end_time: string | null
          id: string
          professional_id: string
          reason: string | null
          start_date: string
          start_time: string | null
          user_id: string
        }
        Insert: {
          absence_type?: string | null
          created_at?: string | null
          end_date: string
          end_time?: string | null
          id?: string
          professional_id: string
          reason?: string | null
          start_date: string
          start_time?: string | null
          user_id: string
        }
        Update: {
          absence_type?: string | null
          created_at?: string | null
          end_date?: string
          end_time?: string | null
          id?: string
          professional_id?: string
          reason?: string | null
          start_date?: string
          start_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_absences_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          features: Json
          id: string
          is_active: boolean
          name: string
          payment_url: string | null
          price: number
          price_period: string | null
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          payment_url?: string | null
          price: number
          price_period?: string | null
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          payment_url?: string | null
          price?: number
          price_period?: string | null
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "user"],
    },
  },
} as const

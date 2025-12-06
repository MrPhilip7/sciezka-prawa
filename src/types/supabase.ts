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
      bills: {
        Row: {
          id: string
          sejm_id: string
          title: string
          description: string | null
          status: 'co_creation' | 'preconsultation' | 'draft' | 'submitted' | 'first_reading' | 'committee' | 'second_reading' | 'third_reading' | 'senate' | 'presidential' | 'published' | 'rejected'
          ministry: string | null
          submission_date: string | null
          last_updated: string
          external_url: string | null
          document_type: string | null
          submitter_type: string | null
          category: string | null
          term: number | null
          tags: string[] | null
          submission_year: number | null
          is_hidden: boolean
          hidden_by: string | null
          hidden_at: string | null
          hidden_reason: string | null
          last_edited_by: string | null
          rcl_id: string | null
          consultation_start_date: string | null
          consultation_end_date: string | null
          consultation_url: string | null
          impact_assessment_url: string | null
          simple_language_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sejm_id: string
          title: string
          description?: string | null
          status?: 'co_creation' | 'preconsultation' | 'draft' | 'submitted' | 'first_reading' | 'committee' | 'second_reading' | 'third_reading' | 'senate' | 'presidential' | 'published' | 'rejected'
          ministry?: string | null
          submission_date?: string | null
          last_updated?: string
          external_url?: string | null
          document_type?: string | null
          submitter_type?: string | null
          category?: string | null
          term?: number | null
          tags?: string[] | null
          submission_year?: number | null
          rcl_id?: string | null
          consultation_start_date?: string | null
          consultation_end_date?: string | null
          consultation_url?: string | null
          impact_assessment_url?: string | null
          simple_language_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sejm_id?: string
          title?: string
          description?: string | null
          status?: 'co_creation' | 'preconsultation' | 'draft' | 'submitted' | 'first_reading' | 'committee' | 'second_reading' | 'third_reading' | 'senate' | 'presidential' | 'published' | 'rejected'
          ministry?: string | null
          submission_date?: string | null
          last_updated?: string
          external_url?: string | null
          document_type?: string | null
          submitter_type?: string | null
          category?: string | null
          term?: number | null
          tags?: string[] | null
          submission_year?: number | null
          rcl_id?: string | null
          consultation_start_date?: string | null
          consultation_end_date?: string | null
          consultation_url?: string | null
          impact_assessment_url?: string | null
          simple_language_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bill_events: {
        Row: {
          id: string
          bill_id: string
          event_type: string
          event_date: string
          description: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          event_type: string
          event_date: string
          description?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          event_type?: string
          event_date?: string
          description?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_events_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          }
        ]
      }
      user_alerts: {
        Row: {
          id: string
          user_id: string
          bill_id: string
          is_active: boolean
          notify_email: boolean
          notify_push: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bill_id: string
          is_active?: boolean
          notify_email?: boolean
          notify_push?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bill_id?: string
          is_active?: boolean
          notify_email?: boolean
          notify_push?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alerts_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          query: string
          filters: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          query: string
          filters?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          query?: string
          filters?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'moderator' | 'admin' | 'super_admin'
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'moderator' | 'admin' | 'super_admin'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'moderator' | 'admin' | 'super_admin'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string
          target_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type: string
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_type?: string
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
      bill_status: 'draft' | 'submitted' | 'first_reading' | 'committee' | 'second_reading' | 'third_reading' | 'senate' | 'presidential' | 'published' | 'rejected'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type BillStatus = Database['public']['Enums']['bill_status']
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'

export type Bill = Tables<'bills'>
export type BillEvent = Tables<'bill_events'>
export type UserAlert = Tables<'user_alerts'>
export type SavedSearch = Tables<'saved_searches'>
export type Profile = Tables<'profiles'>
export type AdminLog = Tables<'admin_logs'>
export type SystemSetting = Tables<'system_settings'>

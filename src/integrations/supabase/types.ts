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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      citizen_reports: {
        Row: {
          ai_analysis: string | null
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          photo_url: string | null
          project_id: string | null
          submitted_by: string | null
          verified: boolean | null
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          photo_url?: string | null
          project_id?: string | null
          submitted_by?: string | null
          verified?: boolean | null
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          photo_url?: string | null
          project_id?: string | null
          submitted_by?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_proposals: {
        Row: {
          created_at: string | null
          created_by: string | null
          district: string | null
          id: string
          project_id: string | null
          proposed_use: Json | null
          recovered_amount_est: number | null
          state: string | null
          status: string | null
          submitted_to: string | null
          success_description: string | null
          success_story: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          district?: string | null
          id?: string
          project_id?: string | null
          proposed_use?: Json | null
          recovered_amount_est?: number | null
          state?: string | null
          status?: string | null
          submitted_to?: string | null
          success_description?: string | null
          success_story?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          district?: string | null
          id?: string
          project_id?: string | null
          proposed_use?: Json | null
          recovered_amount_est?: number | null
          state?: string | null
          status?: string | null
          submitted_to?: string | null
          success_description?: string | null
          success_story?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "community_proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      nagrikbot_conversations: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          module_context: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          module_context?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          module_context?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nagrikbot_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          block: string | null
          citizen_reports: Json | null
          claimed_completion_date: string | null
          construction_detected: boolean | null
          created_at: string | null
          district: string | null
          evidence_points: Json | null
          executing_agency: string | null
          gemini_analysis: string | null
          ghost_score: number | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          progress_score: number | null
          project_type: string | null
          release_date: string | null
          rti_status: string | null
          sanctioned_amount: number | null
          satellite_image_url: string | null
          severity: string | null
          state: string | null
          status: string | null
        }
        Insert: {
          block?: string | null
          citizen_reports?: Json | null
          claimed_completion_date?: string | null
          construction_detected?: boolean | null
          created_at?: string | null
          district?: string | null
          evidence_points?: Json | null
          executing_agency?: string | null
          gemini_analysis?: string | null
          ghost_score?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          progress_score?: number | null
          project_type?: string | null
          release_date?: string | null
          rti_status?: string | null
          sanctioned_amount?: number | null
          satellite_image_url?: string | null
          severity?: string | null
          state?: string | null
          status?: string | null
        }
        Update: {
          block?: string | null
          citizen_reports?: Json | null
          claimed_completion_date?: string | null
          construction_detected?: boolean | null
          created_at?: string | null
          district?: string | null
          evidence_points?: Json | null
          executing_agency?: string | null
          gemini_analysis?: string | null
          ghost_score?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          progress_score?: number | null
          project_type?: string | null
          release_date?: string | null
          rti_status?: string | null
          sanctioned_amount?: number | null
          satellite_image_url?: string | null
          severity?: string | null
          state?: string | null
          status?: string | null
        }
        Relationships: []
      }
      rtis: {
        Row: {
          annexure: Json | null
          body_english: string | null
          body_hindi: string | null
          department: string | null
          filed_at: string | null
          generated_at: string | null
          id: string
          pio_address: string | null
          pio_name: string | null
          project_id: string | null
          response_due: string | null
          rti_type: string | null
          status: string | null
          subject_line: string | null
          tracking_number: string | null
          user_id: string | null
        }
        Insert: {
          annexure?: Json | null
          body_english?: string | null
          body_hindi?: string | null
          department?: string | null
          filed_at?: string | null
          generated_at?: string | null
          id?: string
          pio_address?: string | null
          pio_name?: string | null
          project_id?: string | null
          response_due?: string | null
          rti_type?: string | null
          status?: string | null
          subject_line?: string | null
          tracking_number?: string | null
          user_id?: string | null
        }
        Update: {
          annexure?: Json | null
          body_english?: string | null
          body_hindi?: string | null
          department?: string | null
          filed_at?: string | null
          generated_at?: string | null
          id?: string
          pio_address?: string | null
          pio_name?: string | null
          project_id?: string | null
          response_due?: string | null
          rti_type?: string | null
          status?: string | null
          subject_line?: string | null
          tracking_number?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rtis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rtis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_matches: {
        Row: {
          application_status: string | null
          applied_at: string | null
          documents_required: Json | null
          eligibility_score: number | null
          id: string
          matched_at: string | null
          prefilled_data: Json | null
          scheme_id: string | null
          user_id: string | null
        }
        Insert: {
          application_status?: string | null
          applied_at?: string | null
          documents_required?: Json | null
          eligibility_score?: number | null
          id?: string
          matched_at?: string | null
          prefilled_data?: Json | null
          scheme_id?: string | null
          user_id?: string | null
        }
        Update: {
          application_status?: string | null
          applied_at?: string | null
          documents_required?: Json | null
          eligibility_score?: number | null
          id?: string
          matched_at?: string | null
          prefilled_data?: Json | null
          scheme_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_matches_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          application_url: string | null
          benefit_description: string | null
          benefit_value: string | null
          category: string | null
          created_at: string | null
          deadline: string | null
          education_required: string | null
          eligibility_summary: string | null
          eligible_castes: string | null
          eligible_genders: string | null
          id: string
          is_active: boolean | null
          max_age: number | null
          min_age: number | null
          min_income_limit: number | null
          ministry: string | null
          name: string
          occupation_required: string | null
          portal_name: string | null
          requires_bpl: boolean | null
          scheme_type: string | null
          state_specific: string | null
        }
        Insert: {
          application_url?: string | null
          benefit_description?: string | null
          benefit_value?: string | null
          category?: string | null
          created_at?: string | null
          deadline?: string | null
          education_required?: string | null
          eligibility_summary?: string | null
          eligible_castes?: string | null
          eligible_genders?: string | null
          id?: string
          is_active?: boolean | null
          max_age?: number | null
          min_age?: number | null
          min_income_limit?: number | null
          ministry?: string | null
          name: string
          occupation_required?: string | null
          portal_name?: string | null
          requires_bpl?: boolean | null
          scheme_type?: string | null
          state_specific?: string | null
        }
        Update: {
          application_url?: string | null
          benefit_description?: string | null
          benefit_value?: string | null
          category?: string | null
          created_at?: string | null
          deadline?: string | null
          education_required?: string | null
          eligibility_summary?: string | null
          eligible_castes?: string | null
          eligible_genders?: string | null
          id?: string
          is_active?: boolean | null
          max_age?: number | null
          min_age?: number | null
          min_income_limit?: number | null
          ministry?: string | null
          name?: string
          occupation_required?: string | null
          portal_name?: string | null
          requires_bpl?: boolean | null
          scheme_type?: string | null
          state_specific?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          age: number | null
          auth_id: string | null
          bank_account_type: string | null
          bpl_status: boolean | null
          caste_category: string | null
          created_at: string | null
          district: string | null
          education_level: string | null
          education_stream: string | null
          email: string | null
          employer_type: string | null
          gender: string | null
          household_size: number | null
          id: string
          land_holding_acres: number | null
          monthly_income: number | null
          name: string | null
          occupation: string | null
          phone: string | null
          pincode: string | null
          preferred_language: string | null
          profile_complete: boolean | null
          ration_card_type: string | null
          state: string | null
        }
        Insert: {
          age?: number | null
          auth_id?: string | null
          bank_account_type?: string | null
          bpl_status?: boolean | null
          caste_category?: string | null
          created_at?: string | null
          district?: string | null
          education_level?: string | null
          education_stream?: string | null
          email?: string | null
          employer_type?: string | null
          gender?: string | null
          household_size?: number | null
          id?: string
          land_holding_acres?: number | null
          monthly_income?: number | null
          name?: string | null
          occupation?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_language?: string | null
          profile_complete?: boolean | null
          ration_card_type?: string | null
          state?: string | null
        }
        Update: {
          age?: number | null
          auth_id?: string | null
          bank_account_type?: string | null
          bpl_status?: boolean | null
          caste_category?: string | null
          created_at?: string | null
          district?: string | null
          education_level?: string | null
          education_stream?: string | null
          email?: string | null
          employer_type?: string | null
          gender?: string | null
          household_size?: number | null
          id?: string
          land_holding_acres?: number | null
          monthly_income?: number | null
          name?: string | null
          occupation?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_language?: string | null
          profile_complete?: boolean | null
          ration_card_type?: string | null
          state?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const

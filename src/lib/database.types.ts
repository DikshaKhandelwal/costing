export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      components: {
        Row: {
          id: string
          product_id: string
          description: string
          length: number | null
          width: number | null
          height: number | null
          pieces: number
          cft: number | null
          rate: number
          material_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          description: string
          length?: number | null
          width?: number | null
          height?: number | null
          pieces?: number
          cft?: number | null
          rate?: number
          material_id?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          description?: string
          length?: number | null
          width?: number | null
          height?: number | null
          pieces?: number
          cft?: number | null
          rate?: number
          material_id?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          name: string
          rate_per_cft: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rate_per_cft: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rate_per_cft?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      material_price_tiers: {
        Row: {
          id: string
          material_id: string
          min_size: number
          max_size: number
          thickness: number
          rate_per_cft: number
          created_at: string
        }
        Insert: {
          id?: string
          material_id: string
          min_size: number
          max_size: number
          thickness: number
          rate_per_cft: number
          created_at?: string
        }
        Update: {
          id?: string
          material_id?: string
          min_size?: number
          max_size?: number
          thickness?: number
          rate_per_cft?: number
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          product_type: string
          overall_length: number | null
          overall_width: number | null
          overall_height: number | null
          designer_name: string | null
          reference_number: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          product_type: string
          overall_length?: number | null
          overall_width?: number | null
          overall_height?: number | null
          designer_name?: string | null
          reference_number?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          product_type?: string
          overall_length?: number | null
          overall_width?: number | null
          overall_height?: number | null
          designer_name?: string | null
          reference_number?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_extras: {
        Row: {
          id: string
          product_id: string
          labour: number
          polish: number
          hardware: number
          cnc: number
          foam: number
          iron_weight: number
          iron_rate: number
          ma_percentage: number
          profit_percentage: number
          gst_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          labour?: number
          polish?: number
          hardware?: number
          cnc?: number
          foam?: number
          iron_weight?: number
          iron_rate?: number
          ma_percentage?: number
          profit_percentage?: number
          gst_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          labour?: number
          polish?: number
          hardware?: number
          cnc?: number
          foam?: number
          iron_weight?: number
          iron_rate?: number
          ma_percentage?: number
          profit_percentage?: number
          gst_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_custom_costs: {
        Row: {
          id: string
          product_id: string
          label: string
          amount: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          label: string
          amount: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          label?: string
          amount?: number
          sort_order?: number
          created_at?: string
        }
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
  }
}

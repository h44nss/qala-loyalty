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
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'customer'
          full_name: string
          phone_number: string
          instagram_username: string | null
          current_stamp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'customer'
          full_name: string
          phone_number: string
          instagram_username?: string | null
          current_stamp?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: 'admin' | 'customer'
          full_name?: string
          phone_number?: string
          instagram_username?: string | null
          current_stamp?: number
          updated_at?: string
        }
        Relationships: any[]
      }
      stamp_tokens: {
        Row: {
          id: string
          token_code: string
          stamp_amount: number
          status: 'unused' | 'used' | 'expired'
          generated_by: string | null
          used_by: string | null
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          token_code: string
          stamp_amount: number
          status?: 'unused' | 'used' | 'expired'
          generated_by?: string | null
          used_by?: string | null
          expires_at: string
        }
        Update: {
          status?: 'unused' | 'used' | 'expired'
          used_by?: string | null
          used_at?: string | null
        }
        Relationships: any[]
      }
      stamp_history: {
        Row: {
          id: string
          customer_id: string
          type: 'earn' | 'redeem'
          amount: number
          balance_after: number
          related_token_id: string | null
          related_redemption_id: string | null
          created_at: string
        }
        Insert: any
        Update: any
        Relationships: any[]
      }
      reward_redemptions: {
        Row: {
          id: string
          customer_id: string
          stamps_used: number
          verified_by: string
          redeemed_at: string
        }
        Insert: any
        Update: any
        Relationships: any[]
      }
      settings: {
        Row: {
          key: string
          value: string
        }
        Update: {
          value?: string
        }
        Insert: any
        Relationships: any[]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_stamp_token: {
        Args: {
          p_customer_id: string
          p_token_code: string
        }
        Returns: {
          success: boolean
          message: string
          new_balance: number
        }
      }
      generate_stamp_token: {
        Args: {
          p_admin_id: string
          p_stamp_amount: number
        }
        Returns: {
          id: string
          token_code: string
          stamp_amount: number
          status: string
          expires_at: string
        }[]
      }
      redeem_reward: {
        Args: {
          p_customer_id: string
          p_admin_id: string
        }
        Returns: {
          success: boolean
          message: string
          new_balance: number
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

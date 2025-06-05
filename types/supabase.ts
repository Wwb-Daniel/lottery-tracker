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
      lotteries: {
        Row: {
          id: string
          name: string
          country: string
          website: string
          draw_times: string[]
          logo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          website: string
          draw_times: string[]
          logo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          website?: string
          draw_times?: string[]
          logo?: string | null
          created_at?: string
        }
      }
      results: {
        Row: {
          id: string
          lottery_id: string
          draw_date: string
          draw_time: string
          numbers: number[]
          created_at: string
        }
        Insert: {
          id?: string
          lottery_id: string
          draw_date: string
          draw_time: string
          numbers: number[]
          created_at?: string
        }
        Update: {
          id?: string
          lottery_id?: string
          draw_date?: string
          draw_time?: string
          numbers?: number[]
          created_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          lottery_id: string
          numbers: number[]
          confidence: number
          predicted_for_date: string
          created_at: string
        }
        Insert: {
          id?: string
          lottery_id: string
          numbers: number[]
          confidence: number
          predicted_for_date: string
          created_at?: string
        }
        Update: {
          id?: string
          lottery_id?: string
          numbers?: number[]
          confidence?: number
          predicted_for_date?: string
          created_at?: string
        }
      }
      scraping_logs: {
        Row: {
          id: string
          lottery_id: string
          status: string
          message: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lottery_id: string
          status: string
          message: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lottery_id?: string
          status?: string
          message?: string
          details?: Json | null
          created_at?: string
        }
      }
    }
  }
}
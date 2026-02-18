// AUTO-GENERATED skeleton — populate with: pnpm db:types (after applying schema.sql to Supabase)
// DO NOT EDIT MANUALLY once generated

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Enum types ──────────────────────────────────────────────────────────────
export type UserRole = 'client' | 'advertiser' | 'admin'
export type ServiceType = 'incall' | 'outcall' | 'both'
export type Gender = 'male' | 'female' | 'trans' | 'other'
export type TxStatus = 'pending' | 'paid' | 'failed'
export type TxPurpose = 'unlock' | 'vip' | 'boost' | 'verification'
export type AiDecision = 'approved' | 'rejected' | 'pending'

// ── Row types ────────────────────────────────────────────────────────────────
export interface UserRow {
  id: string
  tg_id: number | null
  email: string | null
  role: UserRole
  created_at: string
}

export interface AdRow {
  id: string
  user_id: string
  nickname: string
  description: string | null
  age: number | null
  verified_age: boolean
  verified: boolean
  vip_status: boolean
  service_type: ServiceType
  gender: Gender
  target_audience: string[] | null
  language: string[] | null
  price_min: number | null
  price_max: number | null
  geo_point: unknown | null
  city: string | null
  online_status: boolean
  photos: string[]
  source: string | null
  source_id: string | null
  rating_avg: number | null
  rating_count: number | null
  views_count: number | null
  raw_data: Json | null
  created_at: string
  updated_at: string
}

export interface ProfileChangeRow {
  id: string
  ad_id: string
  change_type: string
  changed_fields: string[] | null
  before_json: Json | null
  after_json: Json | null
  created_at: string
}

export interface AdCommentRow {
  id: string
  ad_id: string
  comment_key: string | null
  author_name: string | null
  rating: number | null
  text: string | null
  created_at: string
  raw_json: Json | null
}

export interface CategoryRow {
  id: string
  name: string
  slug: string
}

export interface AdCategoryRow {
  ad_id: string
  category_id: string
}

export interface ContactRow {
  ad_id: string
  phone: string | null
  telegram_username: string | null
  whatsapp: string | null
}

export interface TransactionRow {
  id: string
  user_id: string
  amount: number
  currency: string
  status: TxStatus
  purpose: TxPurpose
  provider: string
  provider_tx_id: string | null
  created_at: string
}

export interface UnlockRow {
  id: string
  client_id: string
  ad_id: string
  tx_id: string | null
  created_at: string
}

export interface BoostRow {
  id: string
  ad_id: string
  city: string | null
  category_id: string | null
  start_at: string
  end_at: string
}

export interface AiScreeningRow {
  id: string
  ad_id: string
  decision: AiDecision
  score: number | null
  notes: string | null
  created_at: string
}

// ── Insert types (omit auto-generated fields) ────────────────────────────────
export type UserInsert = Omit<UserRow, 'created_at'>
export type UserUpdate = Partial<Omit<UserRow, 'id' | 'created_at'>>

export type AdInsert = Omit<AdRow, 'id' | 'created_at' | 'updated_at'>
export type AdUpdate = Partial<AdInsert>

export type CategoryInsert = Omit<CategoryRow, 'id'>
export type CategoryUpdate = Partial<CategoryInsert>

export type AdCategoryInsert = AdCategoryRow
export type AdCategoryUpdate = Partial<AdCategoryRow>

export type ContactInsert = ContactRow
export type ContactUpdate = Partial<Omit<ContactRow, 'ad_id'>>

export type TransactionInsert = Omit<TransactionRow, 'id' | 'created_at'>
export type TransactionUpdate = Partial<Omit<TransactionRow, 'id' | 'created_at'>>

export type UnlockInsert = Omit<UnlockRow, 'id' | 'created_at'>
export type UnlockUpdate = Partial<Omit<UnlockRow, 'id' | 'created_at'>>

export type BoostInsert = Omit<BoostRow, 'id'>
export type BoostUpdate = Partial<BoostInsert>

export type AiScreeningInsert = Omit<AiScreeningRow, 'id' | 'created_at'>
export type AiScreeningUpdate = Partial<AiScreeningInsert>

export type ProfileChangeInsert = Omit<ProfileChangeRow, 'id' | 'created_at'>
export type AdCommentInsert = Omit<AdCommentRow, 'id' | 'created_at'>

// ── Supabase Database type (used to type createClient<Database>()) ───────────
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
      }
      advertisements: {
        Row: AdRow
        Insert: AdInsert
        Update: AdUpdate
      }
      categories: {
        Row: CategoryRow
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      ad_categories: {
        Row: AdCategoryRow
        Insert: AdCategoryInsert
        Update: AdCategoryUpdate
      }
      contacts: {
        Row: ContactRow
        Insert: ContactInsert
        Update: ContactUpdate
      }
      transactions: {
        Row: TransactionRow
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
      unlocks: {
        Row: UnlockRow
        Insert: UnlockInsert
        Update: UnlockUpdate
      }
      boosts: {
        Row: BoostRow
        Insert: BoostInsert
        Update: BoostUpdate
      }
      ai_screenings: {
        Row: AiScreeningRow
        Insert: AiScreeningInsert
        Update: AiScreeningUpdate
      }
      profile_changes: {
        Row: ProfileChangeRow
        Insert: ProfileChangeInsert
        Update: Partial<ProfileChangeInsert>
      }
      ad_comments: {
        Row: AdCommentRow
        Insert: AdCommentInsert
        Update: Partial<AdCommentInsert>
      }
    }
    Enums: {
      user_role: UserRole
      service_type: ServiceType
      gender: Gender
      tx_status: TxStatus
      tx_purpose: TxPurpose
      ai_decision: AiDecision
    }
  }
}

import { AdInsert, ContactInsert, AdCommentInsert } from '@vm/db'

export interface RawTitiListing {
    source_id: string
    url: string
    name: string
    city: string | null
    age: number | null
    price_min: number | null
    price_max: number | null
    preview_image: string | null
    is_verified: boolean
    is_vip: boolean
    views_today: number | null
    online_status: boolean
}

export interface RawTitiProfile extends RawTitiListing {
    description: string | null
    photos: string[]
    categories: string[]
    languages: string[]
    service_type: 'incall' | 'outcall' | 'both'
    contacts: {
        phone?: string
        whatsapp?: string
        telegram?: string
    }
    comments: RawTitiComment[]
    rating_avg: number | null
    rating_count: number | null
}

export interface RawTitiComment {
    comment_key: string
    author: string | null
    text: string | null
    rating: number | null
    date_raw: string | null
}

export interface NormalizedData {
    ad: AdInsert & { source: string; source_id: string; raw_data: any }
    contacts: ContactInsert
    comments: AdCommentInsert[]
}

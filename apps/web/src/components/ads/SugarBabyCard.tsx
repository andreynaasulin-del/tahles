'use client'

import Image from 'next/image'
import Link from 'next/link'

export interface SugarBabyCardProps {
  id: string
  nickname: string
  age?: number
  city?: string
  photos: string[]
  description?: string
  telegram?: string | null
  whatsapp?: string | null
  raw_data?: {
    _category?: string
    hair_color?: string
    height_weight?: string
    breast_size?: string
    waist?: string
    hobbies?: string
    working_hours?: string
    asks_selfie?: boolean
    has_video?: boolean
    pricing_text?: string
  }
}

export function SugarBabyCard({
  id,
  nickname,
  age,
  city,
  photos,
  description,
  telegram,
  whatsapp,
  raw_data,
}: SugarBabyCardProps) {
  const primaryPhoto = photos?.[0]
  const photoCount = photos?.length ?? 0

  // ---------- hashtags ----------
  const hashtags: string[] = ['#оплата_наличными_при_встрече']
  if (raw_data?.has_video) hashtags.push('#с_видео')
  if (raw_data?.asks_selfie) hashtags.push('#просит_селфи')

  // ---------- physical line ----------
  const physParts: string[] = []
  if (raw_data?.height_weight) physParts.push(raw_data.height_weight)
  if (raw_data?.breast_size) physParts.push(raw_data.breast_size)
  if (raw_data?.hair_color) physParts.push(raw_data.hair_color)
  const physLine = physParts.join(' · ')

  // ---------- contact ----------
  const contactHref = telegram
    ? `https://t.me/${telegram.replace(/^@/, '')}`
    : whatsapp
      ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`
      : null
  const contactLabel = telegram ? '✈️ Написать в Telegram' : 'Написать в WhatsApp'
  const contactBg = telegram ? 'bg-[#0088cc]' : 'bg-[#25D366]'

  return (
    <div className="rounded-2xl overflow-hidden bg-[#111] border border-white/[0.06] hover:border-velvet-500/40 transition-all duration-200 flex flex-col">
      {/* ── Photo ── */}
      <Link href={`/ad/${id}`}>
        <div className="relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden cursor-pointer">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto}
              alt={nickname}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={85}
              unoptimized
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
              <span className="text-5xl">📷</span>
              <span className="text-sm font-bold">פוטו לפי בקשה</span>
            </div>
          )}

          {/* photo count badge */}
          {photoCount > 1 && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold bg-black/60 text-white">
              +{photoCount - 1} 🖼
            </span>
          )}
        </div>
      </Link>

      {/* ── Hashtags ── */}
      <div className="px-3 pt-3 flex flex-wrap gap-1.5">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-velvet-500/15 text-velvet-400 whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ── Hebrew labels ── */}
      <div className="px-3 pt-1.5 flex gap-2">
        <span className="text-[11px] text-white/40 font-bold">״מאחרת״</span>
        <span className="text-[11px] text-white/40 font-bold">״מתארחת״</span>
      </div>

      {/* ── Name & params ── */}
      <div className="px-3 pt-2.5 space-y-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-white text-base truncate">{nickname}</span>
          {age && <span className="text-sm text-white/40 font-bold">{age}</span>}
        </div>

        {physLine && (
          <p className="text-xs text-white/50 font-bold">{physLine}</p>
        )}

        {raw_data?.hobbies && (
          <p className="text-xs text-white/50">
            <span className="mr-1">🎯</span>
            {raw_data.hobbies}
          </p>
        )}

        {raw_data?.working_hours && (
          <p className="text-xs text-white/50">
            <span className="mr-1">⏰</span>
            {raw_data.working_hours}
          </p>
        )}
      </div>

      {/* ── Description ── */}
      {description && (
        <p className="px-3 pt-2 text-xs text-white/40 line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* ── spacer ── */}
      <div className="flex-1" />

      {/* ── Contact button ── */}
      {contactHref && (
        <div className="px-3 pb-3 pt-3">
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full text-center py-3 rounded-xl font-black text-white text-sm tracking-wide ${contactBg} hover:brightness-110 transition-all duration-150`}
            onClick={(e) => e.stopPropagation()}
          >
            {contactLabel}
          </a>
        </div>
      )}
    </div>
  )
}

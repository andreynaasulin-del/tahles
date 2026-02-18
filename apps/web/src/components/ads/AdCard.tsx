'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { AdRow } from '@vm/db'

type AdCardProps = Pick<
  AdRow,
  | 'id'
  | 'nickname'
  | 'age'
  | 'verified'
  | 'vip_status'
  | 'online_status'
  | 'price_min'
  | 'price_max'
  | 'city'
  | 'photos'
> & {
  distanceMeters?: number
}

export function AdCard({
  id,
  nickname,
  age,
  verified,
  vip_status,
  online_status,
  price_min,
  price_max,
  city,
  photos,
  distanceMeters,
}: AdCardProps) {
  const { t } = useTranslation()
  const primaryPhoto = photos?.[0]
  const extraPhotos = photos?.slice(1) ?? []

  function formatPrice(min?: number | null, max?: number | null): string {
    if (!min && !max) return t('price_on_request')
    if (min && !max) return `${t('from_price')} \u20AC${min}`
    if (!min && max) return `${t('up_to_price')} \u20AC${max}`
    return `\u20AC${min}\u2013\u20AC${max}`
  }

  function formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`
    return `${(meters / 1000).toFixed(1)} km`
  }

  return (
    <div className="group block rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-200">
      {/* Main photo — clear teaser */}
      <Link href={`/ad/${id}`}>
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto}
              alt={nickname}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-4xl">
              {'\uD83D\uDC86'}
            </div>
          )}

          {/* Online indicator */}
          {online_status && (
            <span className="absolute top-2 end-2 w-3 h-3 rounded-full bg-green-400 ring-2 ring-white" />
          )}

          {/* Badges */}
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {vip_status && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-velvet-500 text-white">
                {t('vip')}
              </span>
            )}
            {!vip_status && verified && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/90 text-velvet-700 border border-velvet-300">
                {t('verified')}
              </span>
            )}
          </div>

          {/* Photo count */}
          {photos && photos.length > 1 && (
            <span className="absolute bottom-2 end-2 px-1.5 py-0.5 rounded text-xs bg-black/60 text-white">
              +{photos.length - 1} {t('photos')}
            </span>
          )}
        </div>
      </Link>

      {/* Blurred extra photos strip */}
      {extraPhotos.length > 0 && (
        <div className="flex gap-1 p-1.5 bg-gray-50">
          {extraPhotos.slice(0, 3).map((photo, i) => (
            <div
              key={i}
              className="relative flex-1 aspect-square rounded-md overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                // Could trigger unlock modal here
                window.location.href = `/ad/${id}?unlock=true`
              }}
            >
              {/* Blurred photo */}
              <Image
                src={photo}
                alt={`${nickname} ${i + 2}`}
                fill
                className="object-cover blur-lg scale-110"
                sizes="80px"
              />
              {/* Dark overlay + lock */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-0.5">
                <Lock className="w-3.5 h-3.5 text-white" />
                <span className="text-[8px] font-bold text-white tracking-wider leading-tight text-center px-0.5">
                  {t('unlock_to_text')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="p-3 space-y-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold text-sm truncate">{nickname}</span>
          {age && (
            <span className="text-xs text-muted-foreground shrink-0">{age}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <span>{formatPrice(price_min, price_max)}</span>
          {city && <span>{'\u00B7'} {city}</span>}
          {distanceMeters !== undefined && (
            <span>{'\u00B7'} {formatDistance(distanceMeters)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

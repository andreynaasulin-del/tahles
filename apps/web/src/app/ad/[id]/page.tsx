'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface PriceRow {
  duration: string
  type: string
  amount: number
}

interface Comment {
  id: string
  author: string | null
  text: string | null
  rating: number | null
  date: string | null
}

interface AdProfile {
  id: string
  nickname: string
  description: string | null
  age: number | null
  city: string | null
  photos: string[]
  verified: boolean
  vip_status: boolean
  online_status: boolean
  service_type: string | null
  price_min: number | null
  price_max: number | null
  rating_avg: number | null
  rating_count: number | null
  created_at: string | null
  source: string | null
  phone: string | null
  whatsapp: string | null
  telegram: string | null
  comments: Comment[]
  videos: string[]
  priceTable: PriceRow[]
  physicalParams: Record<string, string>
  services: string[]
  shortDescription: string | null
  payments: string | null
  parking: string | null
  region: string | null
  registrationDate: string | null
  showsCount: number | null
  commentsCount: number
}

// Media item: photo or video (mixed gallery)
interface MediaItem {
  type: 'photo' | 'video'
  url: string
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  } catch { return dateStr }
}

function StarRating({ rating }: { rating: number }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} className="text-yellow-400">&#9733;</span>)
    } else if (i - rating < 1) {
      stars.push(<span key={i} className="text-yellow-400/50">&#9733;</span>)
    } else {
      stars.push(<span key={i} className="text-white/10">&#9733;</span>)
    }
  }
  return <div className="flex gap-0.5 text-lg">{stars}</div>
}

const PARAM_LABELS: Record<string, string> = {
  ethnicity: 'Ethnicity',
  nationality: 'Nationality',
  sexuality: 'Sexuality',
  eye_color: 'Eyes',
  hair_color: 'Hair',
  height: 'Height',
  weight: 'Weight',
  breast_size: 'Breast',
}

// ── Swipe Gallery Hook (GPU-accelerated, no re-renders during swipe) ────────
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 50) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchDelta = useRef(0)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    touchDelta.current = 0
    if (imgRef.current) {
      imgRef.current.style.transition = 'none'
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.touches[0].clientX - touchStart.current.x
    touchDelta.current = dx
    // Direct DOM manipulation — no React re-render
    if (imgRef.current) {
      imgRef.current.style.transform = `translateX(${dx * 0.3}px)`
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    const dx = touchDelta.current
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 0.2s ease-out'
      imgRef.current.style.transform = 'translateX(0)'
    }
    if (Math.abs(dx) > threshold) {
      if (dx < 0) {
        setSwipeDirection('left')
        onSwipeLeft()
      } else {
        setSwipeDirection('right')
        onSwipeRight()
      }
    }
    touchStart.current = null
    setTimeout(() => setSwipeDirection(null), 400)
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { onTouchStart, onTouchMove, onTouchEnd, swipeDirection, imgRef }
}

// ── Favorites (localStorage) ────────────────────────────────────────────────
function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tahles_favorites')
      if (saved) setFavorites(JSON.parse(saved))
    } catch {}
  }, [])

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      try { localStorage.setItem('tahles_favorites', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isFav = useCallback((id: string) => favorites.includes(id), [favorites])

  return { toggle, isFav }
}

export default function AdProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [ad, setAd] = useState<AdProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMedia, setActiveMedia] = useState(0)
  const [showAllComments, setShowAllComments] = useState(false)
  const [showHeartAnim, setShowHeartAnim] = useState(false)
  const { toggle: toggleFav, isFav } = useFavorites()

  useEffect(() => {
    if (!params.id) return
    setLoading(true)
    fetch(`/api/ad/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAd(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  // Build mixed media gallery: photos + videos interleaved
  const mediaItems: MediaItem[] = []
  if (ad) {
    // First photo, then videos, then rest of photos (like titti layout)
    if (ad.photos.length > 0) {
      mediaItems.push({ type: 'photo', url: ad.photos[0] })
    }
    for (const v of ad.videos) {
      mediaItems.push({ type: 'video', url: v })
    }
    for (let i = 1; i < ad.photos.length; i++) {
      mediaItems.push({ type: 'photo', url: ad.photos[i] })
    }
  }

  const goNext = useCallback(() => {
    setActiveMedia(prev => (prev < mediaItems.length - 1 ? prev + 1 : prev))
  }, [mediaItems.length])

  const goPrev = useCallback(() => {
    setActiveMedia(prev => (prev > 0 ? prev - 1 : prev))
  }, [])

  const handleSwipeRight = useCallback(() => {
    if (!ad) return
    toggleFav(ad.id)
    setShowHeartAnim(true)
    setTimeout(() => setShowHeartAnim(false), 600)
  }, [ad, toggleFav])

  const { onTouchStart, onTouchMove, onTouchEnd, swipeDirection, imgRef } = useSwipe(goNext, handleSwipeRight)

  // Preload adjacent images for instant swipe
  useEffect(() => {
    const preload = (idx: number) => {
      if (idx >= 0 && idx < mediaItems.length && mediaItems[idx].type === 'photo') {
        const img = new Image()
        img.referrerPolicy = 'no-referrer'
        img.src = mediaItems[idx].url
      }
    }
    preload(activeMedia + 1)
    preload(activeMedia + 2)
    preload(activeMedia - 1)
  }, [activeMedia, mediaItems])

  const handleWhatsapp = () => {
    const num = ad?.whatsapp || ad?.phone
    if (!num) return
    const clean = num.replace(/\D/g, '')
    const profileUrl = `https://tahles-web.vercel.app/ad/${ad.id}`
    const text = encodeURIComponent(`Hi ${ad.nickname}, I found you on Tahles ${profileUrl} and would like to meet you`)
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank')
  }

  const handlePhone = () => {
    const num = ad?.phone
    if (!num) return
    window.open(`tel:${num}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-velvet-400/30 border-t-velvet-400 rounded-full animate-spin" />
          <span className="text-white/30 text-sm font-bold tracking-wider uppercase">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">404</div>
          <p className="text-white/40 mb-6">Profile not found</p>
          <button onClick={() => router.push('/')} className="px-6 py-2 rounded-xl bg-velvet-500/20 text-velvet-400 font-bold text-sm">
            Back to search
          </button>
        </div>
      </div>
    )
  }

  const visibleComments = showAllComments ? ad.comments : ad.comments.slice(0, 3)
  const hasPhysicalParams = Object.keys(ad.physicalParams).length > 0
  const currentMedia = mediaItems[activeMedia]
  const isFavorite = isFav(ad.id)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[900px] mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span className="text-sm font-bold">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { toggleFav(ad.id) }}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? '#e74c6f' : 'none'} stroke={isFavorite ? '#e74c6f' : 'rgba(255,255,255,0.3)'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <span className="text-sm font-bold text-white/30 uppercase tracking-widest">Tahles</span>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 pb-32">

        {/* Swipeable Media Gallery */}
        <section className="pt-4 mb-6">
          <div
            className="relative w-full aspect-[3/4] max-h-[500px] rounded-3xl overflow-hidden bg-white/5 mb-3 select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {mediaItems.length > 0 && currentMedia ? (
              currentMedia.type === 'video' ? (
                <video
                  key={currentMedia.url}
                  src={currentMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  ref={imgRef}
                  src={currentMedia.url}
                  alt={ad.nickname}
                  className="w-full h-full object-cover will-change-transform"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget
                    if (!img.dataset.retried) {
                      img.dataset.retried = '1'
                      img.src = currentMedia.url + (currentMedia.url.includes('?') ? '&' : '?') + 'r=1'
                    }
                  }}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/10">
                {ad.nickname.charAt(0)}
              </div>
            )}

            {/* Heart animation on swipe right */}
            {showHeartAnim && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="text-7xl animate-bounce opacity-90">
                  {isFavorite ? '❤️' : '💔'}
                </div>
              </div>
            )}

            {/* Swipe hints */}
            {swipeDirection === 'right' && (
              <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center pointer-events-none">
                <span className="text-5xl">❤️</span>
              </div>
            )}
            {swipeDirection === 'left' && (
              <div className="absolute inset-0 bg-white/5 flex items-center justify-center pointer-events-none">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            )}

            {/* Online badge */}
            {ad.online_status && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold text-green-400">Online</span>
              </div>
            )}

            {/* VIP / Verified badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {ad.vip_status && (
                <span className="px-3 py-1.5 rounded-full bg-velvet-500/20 backdrop-blur-sm border border-velvet-500/30 text-velvet-300 text-xs font-bold">
                  VIP
                </span>
              )}
              {ad.verified && (
                <span className="px-3 py-1.5 rounded-full bg-sky-500/20 backdrop-blur-sm border border-sky-500/30 text-sky-400 text-xs font-bold">
                  Verified
                </span>
              )}
            </div>

            {/* Progress dots */}
            {mediaItems.length > 1 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {mediaItems.map((item, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeMedia
                        ? 'w-6 bg-white/80'
                        : 'w-1.5 bg-white/20'
                    } ${item.type === 'video' ? 'bg-velvet-400/60' : ''}`}
                  />
                ))}
              </div>
            )}

            {/* Media counter + type indicator */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {currentMedia?.type === 'video' && (
                  <span className="px-2 py-1 rounded-md bg-velvet-500/30 text-velvet-300 text-[10px] font-bold uppercase">Video</span>
                )}
                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white/70 font-bold">
                  {activeMedia + 1} / {mediaItems.length}
                </span>
              </div>
            )}

            {/* Desktop click navigation */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-0 top-0 w-1/3 h-full opacity-0 cursor-pointer"
              aria-label="Previous"
            />
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-0 top-0 w-1/3 h-full opacity-0 cursor-pointer"
              aria-label="Next"
            />
          </div>

          {/* Swipe hint text */}
          {mediaItems.length > 1 && (
            <div className="flex items-center justify-center gap-6 text-[10px] text-white/15 font-bold uppercase tracking-widest mb-2">
              <span>← next photo</span>
              <span>swipe right → favorite</span>
            </div>
          )}

          {/* Thumbnails (scrollable) */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {mediaItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(i)}
                  className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeMedia ? 'border-velvet-400 scale-105' : 'border-white/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Name + Core Info */}
        <section className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {ad.nickname}
                {ad.age && <span className="text-white/30 font-medium text-2xl ml-2">{ad.age}</span>}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-white/40">
                {ad.city && <span className="flex items-center gap-1">📍 {ad.city}</span>}
                {ad.region && ad.region !== ad.city && <span className="flex items-center gap-1">🏙️ {ad.region}</span>}
                {ad.service_type && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-xs font-bold uppercase">
                    {ad.service_type}
                  </span>
                )}
              </div>
            </div>
            {ad.rating_avg != null && ad.rating_avg > 0 && (
              <div className="text-right">
                <StarRating rating={ad.rating_avg} />
                <div className="text-xs text-white/30 mt-1">
                  {ad.rating_avg.toFixed(1)} ({ad.rating_count || 0} votes)
                </div>
              </div>
            )}
          </div>

          {/* Stats row — only real data */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/30">
            {ad.registrationDate && (
              <span>📅 Registered: {ad.registrationDate}</span>
            )}
            {!ad.registrationDate && ad.created_at && (
              <span>📅 Added: {formatDate(ad.created_at)}</span>
            )}
            {ad.showsCount != null && ad.showsCount > 0 && (
              <span>👁 {ad.showsCount.toLocaleString()} views</span>
            )}
            {ad.commentsCount > 0 && (
              <span>💬 {ad.commentsCount} reviews</span>
            )}
            {ad.videos.length > 0 && (
              <span>🎥 {ad.videos.length} video{ad.videos.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </section>

        {/* Mention Tahles hint */}
        {(ad.whatsapp || ad.phone) && (
          <div className="text-center text-[10px] text-white/15 uppercase tracking-widest font-bold mb-6">
            Mention "Tahles" for VIP treatment
          </div>
        )}

        {/* Short Description */}
        {ad.shortDescription && (
          <section className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-sm text-white/60 italic">{ad.shortDescription}</p>
          </section>
        )}

        {/* About / Description */}
        {ad.description && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">About</h2>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{ad.description}</p>
            </div>
          </section>
        )}

        {/* Physical Parameters */}
        {hasPhysicalParams && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(ad.physicalParams).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">
                    {PARAM_LABELS[key] || key}
                  </div>
                  <div className="text-sm text-white/70 font-medium">{val}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {ad.services.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">Services</h2>
            <div className="flex flex-wrap gap-2">
              {ad.services.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-velvet-500/10 border border-velvet-500/20 text-velvet-300 text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Price Table */}
        {ad.priceTable.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">Prices</h2>
            <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
              {ad.priceTable.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i > 0 ? 'border-t border-white/[0.04]' : ''
                  } ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.01]'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white/60">{row.duration}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/30 uppercase font-bold">
                      {row.type}
                    </span>
                  </div>
                  <span className="text-sm font-black text-velvet-400">
                    {row.amount.toLocaleString()} ₪
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Price fallback */}
        {ad.priceTable.length === 0 && ad.price_min && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">Price</h2>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-2xl font-black text-velvet-400">
                from {ad.price_min.toLocaleString()} ₪
              </span>
            </div>
          </section>
        )}

        {/* Extra info */}
        {(ad.payments || ad.parking) && (
          <section className="mb-8">
            <div className="flex gap-4">
              {ad.payments && (
                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">Payments</div>
                  <div className="text-sm text-white/60">{ad.payments}</div>
                </div>
              )}
              {ad.parking && (
                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">Parking</div>
                  <div className="text-sm text-white/60">{ad.parking}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Comments */}
        {ad.comments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">
              Reviews ({ad.comments.length})
            </h2>
            <div className="flex flex-col gap-3">
              {visibleComments.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-velvet-500/20 flex items-center justify-center text-xs font-bold text-velvet-300">
                        {(c.author || 'A').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-white/70">{c.author || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.rating != null && c.rating > 0 && <StarRating rating={c.rating} />}
                      {c.date && (
                        <span className="text-[10px] text-white/20">{formatDate(c.date)}</span>
                      )}
                    </div>
                  </div>
                  {c.text && (
                    <p className="text-sm text-white/50 leading-relaxed">{c.text}</p>
                  )}
                </div>
              ))}
              {ad.comments.length > 3 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-xs font-bold text-velvet-400 hover:text-velvet-300 transition-colors uppercase tracking-wider"
                >
                  Show all {ad.comments.length} reviews
                </button>
              )}
            </div>
          </section>
        )}

        {/* Comments count fallback */}
        {ad.comments.length === 0 && ad.commentsCount > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">
              Reviews ({ad.commentsCount})
            </h2>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <p className="text-sm text-white/30">{ad.commentsCount} reviews available on source</p>
            </div>
          </section>
        )}

      </main>

      {/* Fixed bottom CTA */}
      {(ad.whatsapp || ad.phone) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent">
          <div className="max-w-[900px] mx-auto flex gap-3">
            <button
              onClick={handleWhatsapp}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-[#25D366]/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </button>
            <button
              onClick={() => toggleFav(ad.id)}
              className={`px-5 py-4 rounded-2xl border transition-all active:scale-[0.98] ${
                isFavorite
                  ? 'bg-velvet-500/20 border-velvet-500/40 text-velvet-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
            {ad.phone && (
              <button
                onClick={handlePhone}
                className="px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-sm transition-all active:scale-[0.98]"
              >
                📞
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

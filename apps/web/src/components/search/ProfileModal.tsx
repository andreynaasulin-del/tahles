'use client'

import React, { useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Ad } from '@/app/page'

interface ProfileModalProps {
    ad: Ad
    onClose: () => void
}

export function ProfileModal({ ad, onClose }: ProfileModalProps) {
    const { t } = useTranslation()

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    const mainPhoto = ad.photos?.[0]
    const otherPhotos = ad.photos?.slice(1) || []

    const handleWhatsapp = () => {
        const num = ad.whatsapp || ad.phone
        if (num) {
            const cleanNum = num.replace(/\D/g, '')
            window.open(`https://wa.me/${cleanNum}?text=Hi ${ad.nickname}, I found you on Tahles`, '_blank')
        }
    }

    const formatPrice = (min?: number | null, max?: number | null) => {
        if (!min && !max) return 'Wait for offer'
        if (min && max) return `${min} - ${max} ₪`
        if (min) return `From ${min} ₪`
        return `Up to ${max} ₪`
    }

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[85vh] bg-[#0d0d0d] rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">

                {/* Close Button Mob */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-black/70 transition-colors sm:hidden"
                >
                    ✕
                </button>

                {/* Left: Gallery (Scrollable) */}
                <div className="w-full sm:w-[55%] bg-[#050505] overflow-y-auto sm:overflow-y-scroll no-scrollbar h-[50vh] sm:h-auto relative group">

                    {/* Main Photo / Video placeholder if implemented later */}
                    <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-full overflow-hidden">
                        {mainPhoto ? (
                            <img
                                src={mainPhoto}
                                alt={ad.nickname}
                                className="w-full h-full object-cover scale-[1.08] object-[center_20%]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 bg-white/5 text-4xl font-bold">
                                {ad.nickname.charAt(0)}
                            </div>
                        )}

                        {/* VIP badge overlay */}
                        {ad.vip_status && (
                            <div className="absolute top-4 left-4 px-3 py-1 bg-velvet-500/90 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg border border-white/10 backdrop-blur-md">
                                VIP Selection
                            </div>
                        )}
                    </div>

                    {/* Thumbnails grid if more photos */}
                    {otherPhotos.length > 0 && (
                        <div className="grid grid-cols-2 gap-1 p-1">
                            {otherPhotos.map((photo, i) => (
                                <div key={i} className="aspect-[3/4] relative overflow-hidden">
                                    <img src={photo} className="w-full h-full object-cover scale-[1.08] object-[center_20%]" alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info & Actions */}
                <div className="flex-1 flex flex-col h-[50vh] sm:h-auto bg-[#121212] relative">

                    {/* Close Desktop */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors hidden sm:flex"
                    >
                        ✕
                    </button>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                        <div className="flex flex-col gap-1 mb-6">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                                {ad.nickname}
                                {ad.verified && (
                                    <span className="text-sky-400" title="Verified">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
                                <span>{ad.age} years</span>
                                <span>•</span>
                                <span>{ad.city || 'Israel'}</span>
                                <span>•</span>
                                <span className={ad.online_status ? 'text-green-400' : ''}>
                                    {ad.online_status ? 'Online now' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {/* Price Tag */}
                        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 inline-flex flex-col gap-1 min-w-[200px]">
                            <span className="text-xs uppercase tracking-widest text-white/30 font-bold">Rates</span>
                            <span className="text-2xl font-bold text-velvet-300">
                                {formatPrice(ad.price_min, ad.price_max)}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="prose prose-invert prose-sm text-white/70 leading-relaxed mb-8 whitespace-pre-line">
                            {ad.description || 'No description provided.'}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-white/5 pt-6 mb-8">
                            <div>
                                <span className="block text-white/30 text-xs uppercase mb-1">Service</span>
                                <span className="text-white font-medium capitalize">{ad.service_type || 'Various'}</span>
                            </div>
                            <div>
                                <span className="block text-white/30 text-xs uppercase mb-1">Reviews</span>
                                <div className="flex items-center gap-1 text-white font-medium">
                                    <span className="text-yellow-500">★</span>
                                    <span>{ad.comments_count || 0}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-white/30 text-xs uppercase mb-1">Registered</span>
                                <span className="text-white font-medium">
                                    {ad.created_at ? new Date(ad.created_at).toLocaleDateString() : 'Recently'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-white/30 text-xs uppercase mb-1">ID</span>
                                <span className="text-white/50 font-mono text-xs">#{ad.id.slice(0, 8)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Bottom Actions */}
                    <div className="p-4 sm:p-6 bg-[#121212] border-t border-white/5 z-10">
                        <button
                            onClick={handleWhatsapp}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg uppercase tracking-wider shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98] group"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="group-hover:scale-110 transition-transform"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            Chat on WhatsApp
                        </button>
                        <div className="text-center mt-3 text-xs text-white/30 uppercase tracking-widest font-bold">
                            Mention "Tahles" for VIP treatment
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

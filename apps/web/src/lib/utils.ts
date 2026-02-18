import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  min?: number | null,
  max?: number | null
): string {
  if (!min && !max) return 'Price on request'
  if (min && !max) return `From €${min}`
  if (!min && max) return `Up to €${max}`
  return `€${min}–€${max}`
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function formatUnlockPrice(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
}

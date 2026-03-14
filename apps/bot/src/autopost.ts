import { Bot, InlineKeyboard, InputMediaPhoto } from 'grammy'
import { getRandomProfile, type Profile } from './db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POSTED_FILE = path.join(__dirname, '..', 'data', 'posted_ids.json')
const SITE = 'https://tahles.top'
const COOLDOWN_HOURS = 48

interface PostedRecord {
  id: string
  postedAt: number
}

function loadPosted(): PostedRecord[] {
  try {
    return JSON.parse(fs.readFileSync(POSTED_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function savePosted(records: PostedRecord[]) {
  fs.mkdirSync(path.dirname(POSTED_FILE), { recursive: true })
  fs.writeFileSync(POSTED_FILE, JSON.stringify(records, null, 2))
}

function getExcludeIds(): string[] {
  const records = loadPosted()
  const cutoff = Date.now() - COOLDOWN_HOURS * 3600 * 1000
  // Return IDs posted within cooldown window
  return records.filter(r => r.postedAt > cutoff).map(r => r.id)
}

function markPosted(id: string) {
  const records = loadPosted()
  records.push({ id, postedAt: Date.now() })
  // Keep only last 200 records
  savePosted(records.slice(-200))
}

export async function postToChannel(bot: Bot) {
  const channelId = process.env.CHANNEL_ID || '@tahles_ads'
  const excludeIds = getExcludeIds()

  const profile = await getRandomProfile(excludeIds)
  if (!profile) {
    console.log('[autopost] No available profiles to post')
    return
  }

  console.log(`[autopost] Posting: ${profile.nickname} (${profile.city})`)

  const text = formatChannelPost(profile)
  const kb = new InlineKeyboard()
  if (profile.whatsapp) {
    const waNum = profile.whatsapp.replace(/\D/g, '')
    kb.url('📱 WhatsApp', `https://wa.me/${waNum}`)
  }
  kb.url('🌐 פרופיל מלא', `${SITE}/ad/${profile.id}`)
  kb.row()
  kb.url('🔍 עוד פרופילים ב-Tahles', SITE)

  try {
    if (profile.photos.length >= 2) {
      // Send as media group (first photo with caption)
      const media: InputMediaPhoto[] = profile.photos.slice(0, 3).map((url, i) => ({
        type: 'photo',
        media: url,
        ...(i === 0 ? { caption: text, parse_mode: 'Markdown' as const } : {}),
      }))

      await bot.api.sendMediaGroup(channelId, media)
      // Send buttons as separate message (media groups can't have inline buttons)
      await bot.api.sendMessage(channelId, `👆 *${profile.nickname}* — לפרטים נוספים:`, {
        parse_mode: 'Markdown',
        reply_markup: kb,
      })
    } else if (profile.photos.length === 1) {
      await bot.api.sendPhoto(channelId, profile.photos[0], {
        caption: text,
        parse_mode: 'Markdown',
        reply_markup: kb,
      })
    } else {
      await bot.api.sendMessage(channelId, text, {
        parse_mode: 'Markdown',
        reply_markup: kb,
      })
    }

    markPosted(profile.id)
    console.log(`[autopost] ✅ Posted ${profile.nickname} to ${channelId}`)
  } catch (err) {
    console.error(`[autopost] ❌ Failed to post:`, err)
  }
}

function formatChannelPost(p: Profile): string {
  const lines = []
  lines.push(`🔥 *${p.nickname}*`)
  if (p.city) lines.push(`📍 ${p.city}`)
  if (p.age) lines.push(`🎂 גיל: ${p.age}`)

  if (p.price_min && p.price_max) {
    lines.push(`💰 ${p.price_min}–${p.price_max}₪`)
  } else if (p.price_min) {
    lines.push(`💰 מ-${p.price_min}₪`)
  }

  lines.push('')
  lines.push('✅ WhatsApp מאומת')
  lines.push(`✅ פרופיל מאומת ב-Tahles`)
  lines.push('')
  lines.push(`👉 *[tahles.top](${SITE}/ad/${p.id})*`)

  return lines.join('\n')
}

import type { Bot } from 'grammy'
import { InlineKeyboard } from 'grammy'
import type { BotContext } from './publish.js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Admin IDs ──────────────────────────────────────────────────────────
export const ADMIN_IDS: number[] = (process.env.ADMIN_IDS || '')
  .split(',')
  .map((s) => parseInt(s.trim()))
  .filter(Boolean)

export function isAdmin(userId: number): boolean {
  return ADMIN_IDS.includes(userId)
}

// ── Notify admins about new submission ────────────────────────────────
export async function notifyAdmins(bot: Bot<BotContext>, submission: {
  id: string
  nickname: string
  age?: number
  city?: string
  serviceType?: string
  priceMin?: number
  priceMax?: number
  whatsapp?: string
  description?: string
  photos?: string[]
  telegramId?: number
  telegramUsername?: string
}) {
  const price = submission.priceMin && submission.priceMax
    ? `${submission.priceMin}–${submission.priceMax}₪`
    : submission.priceMin ? `מ-${submission.priceMin}₪` : '—'

  const text =
    `🆕 *מודעה חדשה לאישור*\n\n` +
    `👤 *שם:* ${submission.nickname}\n` +
    `🎂 *גיל:* ${submission.age || '—'}\n` +
    `📍 *עיר:* ${submission.city || '—'}\n` +
    `🏠 *שירות:* ${submission.serviceType || '—'}\n` +
    `💰 *מחיר:* ${price}\n` +
    `📱 *WhatsApp:* ${submission.whatsapp || '—'}\n` +
    (submission.telegramUsername ? `🐦 *TG:* @${submission.telegramUsername}\n` : '') +
    (submission.description ? `\n📝 ${submission.description}\n` : '') +
    `\n🆔 \`${submission.id}\``

  const kb = new InlineKeyboard()
    .text('✅ Апрув', `approve:${submission.id}`)
    .text('❌ Отклонить', `reject:${submission.id}`)

  for (const adminId of ADMIN_IDS) {
    try {
      // Send photos if any
      if (submission.photos && submission.photos.length > 0) {
        if (submission.photos.length === 1) {
          await bot.api.sendPhoto(adminId, submission.photos[0], {
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: kb,
          })
        } else {
          // Send first photo with caption + buttons
          await bot.api.sendPhoto(adminId, submission.photos[0], {
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: kb,
          })
          // Send remaining photos as group
          const mediaGroup = submission.photos.slice(1, 10).map((url) => ({
            type: 'photo' as const,
            media: url,
          }))
          if (mediaGroup.length > 0) {
            await bot.api.sendMediaGroup(adminId, mediaGroup)
          }
        }
      } else {
        await bot.api.sendMessage(adminId, text, {
          parse_mode: 'Markdown',
          reply_markup: kb,
        })
      }
    } catch (err) {
      console.error(`Failed to notify admin ${adminId}:`, err)
    }
  }
}

// ── Notify girl that her ad is approved ───────────────────────────────
async function notifyGirlApproved(bot: Bot<BotContext>, telegramId: number, profileId: string) {
  try {
    const kb = new InlineKeyboard()
      .url('🌐 הפרופיל שלי', `https://tahles.top/ad/${profileId}`)
      .row()
      .url('📤 שתפי בטלגרם', `https://t.me/share/url?url=https://tahles.top/ad/${profileId}&text=הפרופיל שלי ב-Tahles 💎`)
    await bot.api.sendMessage(telegramId,
      `🎉 *המודעה שלך אושרה ועלתה לאתר!*\n\n` +
      `שתפי את הלינק עם הלקוחות שלך 👇`,
      { parse_mode: 'Markdown', reply_markup: kb }
    )
  } catch {}
}

// ── Notify girl that her ad is rejected ───────────────────────────────
async function notifyGirlRejected(bot: Bot<BotContext>, telegramId: number, reason?: string) {
  try {
    await bot.api.sendMessage(telegramId,
      `❌ *המודעה שלך לא אושרה*\n\n` +
      (reason ? `סיבה: ${reason}\n\n` : '') +
      `ניתן לשלוח מחדש עם /publish`,
      { parse_mode: 'Markdown' }
    )
  } catch {}
}

// ── Register admin handlers ────────────────────────────────────────────
export function registerAdminHandlers(bot: Bot<BotContext>) {

  // Middleware: admin-only guard
  const adminOnly = async (ctx: BotContext, next: () => Promise<void>) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) {
      await ctx.reply('⛔ Нет доступа')
      return
    }
    await next()
  }

  // ── /stats ──
  bot.command('stats', adminOnly, async (ctx) => {
    const [{ count: total }, { count: pending }, { count: approved }, { count: rejected }] =
      await Promise.all([
        supabase.from('submissions').select('*', { count: 'exact', head: true }),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      ])

    await ctx.reply(
      `📊 *Статистика заявок*\n\n` +
      `📥 Всего: *${total}*\n` +
      `⏳ На модерации: *${pending}*\n` +
      `✅ Одобрено: *${approved}*\n` +
      `❌ Отклонено: *${rejected}*`,
      { parse_mode: 'Markdown' }
    )
  })

  // ── /pending ── list pending submissions
  bot.command('pending', adminOnly, async (ctx) => {
    const { data } = await supabase
      .from('submissions')
      .select('id, nickname, city, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!data || data.length === 0) {
      await ctx.reply('✅ Нет заявок на модерации')
      return
    }

    const kb = new InlineKeyboard()
    let text = `⏳ *Ожидают модерации (${data.length}):*\n\n`
    for (const s of data) {
      text += `• *${s.nickname}* (${s.city || '—'}) — \`${s.id.slice(0, 8)}\`\n`
      kb.text(`✅ ${s.nickname}`, `approve:${s.id}`)
        .text(`❌`, `reject:${s.id}`)
        .row()
    }

    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: kb })
  })

  // ── /approve ID ──
  bot.command('approve', adminOnly, async (ctx) => {
    const id = ctx.match?.trim()
    if (!id) return ctx.reply('Использование: /approve <id>')
    await handleApprove(bot, ctx, id)
  })

  // ── /reject ID ──
  bot.command('reject', adminOnly, async (ctx) => {
    const parts = ctx.match?.trim().split(' ')
    const id = parts?.[0]
    const reason = parts?.slice(1).join(' ')
    if (!id) return ctx.reply('Использование: /reject <id> [причина]')
    await handleReject(bot, ctx, id, reason)
  })

  // ── Callback: approve:ID ──
  bot.callbackQuery(/^approve:(.+)$/, adminOnly, async (ctx) => {
    const id = ctx.match[1]
    await ctx.answerCallbackQuery('⏳ Обрабатываю...')
    await handleApprove(bot, ctx, id)
  })

  // ── Callback: reject:ID ──
  bot.callbackQuery(/^reject:(.+)$/, adminOnly, async (ctx) => {
    const id = ctx.match[1]
    await ctx.answerCallbackQuery()

    // Ask for reason
    await ctx.reply(
      `❌ Отклонить заявку \`${id.slice(0, 8)}\`\n\nОтправь причину (или /skip чтобы без причины):`,
      { parse_mode: 'Markdown' }
    )

    // Store pending reject in simple map (single admin scenario)
    pendingRejects.set(ctx.from!.id, id)
  })

  // ── Handle reject reason text ──
  const pendingRejects = new Map<number, string>()

  bot.command('skip', adminOnly, async (ctx) => {
    const id = pendingRejects.get(ctx.from!.id)
    if (!id) return ctx.reply('Нет активного отклонения')
    pendingRejects.delete(ctx.from!.id)
    await handleReject(bot, ctx, id)
  })

  bot.on('message:text', async (ctx, next) => {
    if (!ctx.from || !isAdmin(ctx.from.id)) return next()
    const id = pendingRejects.get(ctx.from.id)
    if (!id) return next()
    pendingRejects.delete(ctx.from.id)
    await handleReject(bot, ctx, id, ctx.message.text)
  })
}

// ── Approve helper ─────────────────────────────────────────────────────
async function handleApprove(bot: Bot<BotContext>, ctx: BotContext, id: string) {
  const { data, error } = await supabase
    .from('submissions')
    .update({ status: 'approved' })
    .eq('id', id)
    .select('nickname, telegram_id, id')
    .single()

  if (error || !data) {
    await ctx.reply(`❌ Не найдено: \`${id}\``, { parse_mode: 'Markdown' })
    return
  }

  // Also insert into profiles table if exists
  const { data: sub } = await supabase.from('submissions').select('*').eq('id', id).single()
  if (sub) {
    await supabase.from('profiles').upsert({
      id: sub.id,
      nickname: sub.nickname,
      age: sub.age,
      city: sub.city,
      service_type: sub.service_type,
      price_min: sub.price_min,
      price_max: sub.price_max,
      whatsapp: sub.whatsapp,
      description: sub.description,
      photos: sub.photos,
      status: 'active',
      created_at: new Date().toISOString(),
    }).catch(() => {})
  }

  await ctx.reply(`✅ *${data.nickname}* одобрена и опубликована!`, { parse_mode: 'Markdown' })

  // Notify the girl
  if (data.telegram_id) {
    await notifyGirlApproved(bot, data.telegram_id, data.id)
  }
}

// ── Reject helper ──────────────────────────────────────────────────────
async function handleReject(bot: Bot<BotContext>, ctx: BotContext, id: string, reason?: string) {
  const { data, error } = await supabase
    .from('submissions')
    .update({ status: 'rejected', reject_reason: reason || null })
    .eq('id', id)
    .select('nickname, telegram_id')
    .single()

  if (error || !data) {
    await ctx.reply(`❌ Не найдено: \`${id}\``, { parse_mode: 'Markdown' })
    return
  }

  await ctx.reply(
    `❌ *${data.nickname}* отклонена` + (reason ? `\nПричина: ${reason}` : ''),
    { parse_mode: 'Markdown' }
  )

  // Notify the girl
  if (data.telegram_id) {
    await notifyGirlRejected(bot, data.telegram_id, reason)
  }
}

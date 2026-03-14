import { Bot, InlineKeyboard, InputFile } from 'grammy'
import { searchProfiles, getProfileCount, getCitiesWithCounts, type Profile } from './db.js'

const SITE = 'https://tahles.top'

export function createBot(token: string) {
  const bot = new Bot(token)

  // ── /start ──
  bot.command('start', async (ctx) => {
    const count = await getProfileCount()
    const kb = new InlineKeyboard()
      .text('🔍 חיפוש', 'search_prompt')
      .text('🏙 ערים', 'cities')
      .row()
      .webApp('🌐 פתח את Tahles', SITE)

    await ctx.reply(
      `👋 ברוך הבא ל-*Tahles Bot*!\n\n` +
      `🔥 *${count}+* פרופילים מאומתים של נערות ליווי, חשפניות, מעסות ועוד\n` +
      `✅ מספרי וואטסאפ מאומתים 100%\n\n` +
      `השתמש בכפתורים למטה או שלח שם / עיר לחיפוש:`,
      { parse_mode: 'Markdown', reply_markup: kb }
    )
  })

  // ── /cities ──
  bot.command('cities', handleCities)
  bot.callbackQuery('cities', async (ctx) => {
    await ctx.answerCallbackQuery()
    await handleCities(ctx)
  })

  async function handleCities(ctx: any) {
    const cities = await getCitiesWithCounts()
    if (cities.length === 0) return ctx.reply('אין ערים כרגע')

    const kb = new InlineKeyboard()
    for (let i = 0; i < cities.length; i++) {
      kb.text(`${cities[i].city} (${cities[i].count})`, `city:${cities[i].city}`)
      if (i % 2 === 1) kb.row()
    }

    await ctx.reply('🏙 *בחר עיר:*', { parse_mode: 'Markdown', reply_markup: kb })
  }

  // ── City callback ──
  bot.callbackQuery(/^city:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const city = ctx.match[1]
    const profiles = await searchProfiles({ city, limit: 5 })
    if (profiles.length === 0) {
      return ctx.reply(`לא נמצאו תוצאות ב-${city}`)
    }
    for (const p of profiles) {
      await sendProfileCard(ctx, p)
    }
  })

  // ── Search prompt callback ──
  bot.callbackQuery('search_prompt', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply('🔍 שלח שם, עיר או קטגוריה לחיפוש:')
  })

  // ── /search command ──
  bot.command('search', async (ctx) => {
    const query = ctx.match
    if (!query) return ctx.reply('שלח: /search תל אביב')
    const profiles = await searchProfiles({ query, limit: 5 })
    if (profiles.length === 0) return ctx.reply('לא נמצאו תוצאות 😔')
    for (const p of profiles) await sendProfileCard(ctx, p)
  })

  // ── Free text search ──
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text
    if (text.startsWith('/')) return // skip commands

    const profiles = await searchProfiles({ query: text, limit: 5 })
    if (profiles.length === 0) {
      return ctx.reply(`לא נמצאו תוצאות עבור "${text}" 😔\nנסה שם אחר או עיר`)
    }

    await ctx.reply(`🔍 נמצאו ${profiles.length} תוצאות:`)
    for (const p of profiles) await sendProfileCard(ctx, p)
  })

  // ── Inline query ──
  bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query
    const profiles = await searchProfiles({ query: query || undefined, limit: 10 })

    const results = profiles.map((p) => ({
      type: 'article' as const,
      id: p.id,
      title: `${p.nickname} — ${p.city || 'ישראל'}`,
      description: formatPrice(p),
      thumbnail_url: p.photos[0] || undefined,
      input_message_content: {
        message_text: formatProfileText(p),
        parse_mode: 'Markdown' as const,
      },
      reply_markup: profileButtons(p),
    }))

    await ctx.answerInlineQuery(results, { cache_time: 60 })
  })

  return bot
}

// ── Helpers ──

function formatPrice(p: Profile): string {
  if (p.price_min && p.price_max) return `💰 ${p.price_min}–${p.price_max}₪`
  if (p.price_min) return `💰 מ-${p.price_min}₪`
  return ''
}

function formatProfileText(p: Profile): string {
  const lines = [`🔥 *${p.nickname}*`]
  if (p.city) lines.push(`📍 ${p.city}`)
  if (p.age) lines.push(`🎂 ${p.age}`)
  const price = formatPrice(p)
  if (price) lines.push(price)
  lines.push(`✅ WhatsApp מאומת`)
  lines.push(`\n👉 [פרופיל מלא](${SITE}/ad/${p.id})`)
  return lines.join('\n')
}

function profileButtons(p: Profile): InlineKeyboard {
  const kb = new InlineKeyboard()
  if (p.whatsapp) {
    const waNum = p.whatsapp.replace(/\D/g, '')
    kb.url('📱 WhatsApp', `https://wa.me/${waNum}`)
  }
  kb.url('🌐 לאתר', `${SITE}/ad/${p.id}`)
  return kb
}

async function sendProfileCard(ctx: any, p: Profile) {
  const text = formatProfileText(p)
  const kb = profileButtons(p)

  try {
    if (p.photos.length > 0) {
      await ctx.replyWithPhoto(p.photos[0], {
        caption: text,
        parse_mode: 'Markdown',
        reply_markup: kb,
      })
    } else {
      await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: kb })
    }
  } catch (err) {
    // Photo might fail (URL expired), fallback to text
    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: kb })
  }
}

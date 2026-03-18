import { Bot, InlineKeyboard } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import { searchProfiles, getProfileCount, getCitiesWithCounts, type Profile } from './db.js'
import { publishConversation, type BotContext } from './publish.js'
import { registerAdminHandlers } from './admin.js'

const SITE = 'https://tahles.top'

export function createBot(token: string) {
  const bot = new Bot<BotContext>(token)

  // ── Middleware: conversations ──
  bot.use(conversations())
  bot.use(createConversation(publishConversation))

  // ── /start ──
  bot.command('start', async (ctx) => {
    // Check if deep-linked from publish button
    const payload = ctx.match
    if (payload === 'publish' || payload?.startsWith('publish')) {
      await ctx.conversation.enter('publishConversation')
      return
    }

    const count = await getProfileCount()
    const kb = new InlineKeyboard()
      .webApp(`🔥 כל המודעות (${count})`, SITE)
      .row()
      .webApp('🇪🇺 אירופאיות', `${SITE}/escorts/european`)
      .webApp('💃 לטיניות', `${SITE}/escorts/latina`)
      .row()
      .webApp('🌸 אסיאתיות', `${SITE}/escorts/asian`)
      .webApp('👩 העצמאיות', `${SITE}/escorts/independent`)
      .row()
      .text('📤 פרסום מודעה', 'start_publish')
      .row()
      .url('📞 פנייה לשירות לקוחות', 'https://t.me/tahles_support')

    await ctx.reply(
      `היי גבר! זה הבוט *Tahles* 💎\n\n` +
      `*${count}* פרופילים מאומתים של בנות מהממות ועצמאיות – הכל דיסקרטי, ישיר לך ל-WhatsApp בלי אף מתווך. 🔥\n\n` +
      `מוכן לפינוק אמיתי? 👇\n` +
      `*בחר עכשיו מה הוייב שלך…*`,
      { parse_mode: 'Markdown', reply_markup: kb }
    )
  })

  // ── /publish command ──
  bot.command('publish', async (ctx) => {
    await ctx.conversation.enter('publishConversation')
  })

  // ── /cancel command (exits conversation) ──
  bot.command('cancel', async (ctx) => {
    await ctx.conversation.exit('publishConversation')
    await ctx.reply('❌ בוטל')
  })

  // ── Publish callback from /start button ──
  bot.callbackQuery('start_publish', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.conversation.enter('publishConversation')
  })

  // ── /cities ──
  bot.command('cities', handleCities)

  // City slug mapping for URL buttons
  const CITY_SLUGS: Record<string, string> = {
    'תל אביב': 'tel-aviv', 'Tel Aviv': 'tel-aviv',
    'חיפה': 'haifa', 'Haifa': 'haifa',
    'ירושלים': 'jerusalem', 'Jerusalem': 'jerusalem',
    'אילת': 'eilat', 'Eilat': 'eilat',
    'נתניה': 'netanya', 'Netanya': 'netanya',
    'בת ים': 'bat-yam', 'Bat Yam': 'bat-yam',
    'באר שבע': 'beer-sheva', 'Beer Sheva': 'beer-sheva',
    'אשדוד': 'ashdod', 'Ashdod': 'ashdod',
    'ראשון לציון': 'rishon-lezion', 'Rishon LeZion': 'rishon-lezion',
    'הרצליה': 'herzliya', 'Herzliya': 'herzliya',
    'חדרה': 'hadera', 'Hadera': 'hadera',
  }

  async function handleCities(ctx: any) {
    const cities = await getCitiesWithCounts()
    if (cities.length === 0) return ctx.reply('אין ערים כרגע')

    const kb = new InlineKeyboard()
    for (let i = 0; i < cities.length; i++) {
      const slug = CITY_SLUGS[cities[i].city] || cities[i].city.toLowerCase().replace(/\s+/g, '-')
      kb.webApp(`${cities[i].city} (${cities[i].count})`, `${SITE}/${slug}`)
      if (i % 2 === 1) kb.row()
    }

    await ctx.reply('🏙 *בחר עיר — פתח ישר באתר:*', { parse_mode: 'Markdown', reply_markup: kb })
  }

  // ── Search prompt callback (legacy, still handle) ──
  bot.callbackQuery('search_prompt', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply('🔍 שלח שם, עיר או קטגוריה לחיפוש:')
  })

  // ── Cities callback (legacy, still handle) ──
  bot.callbackQuery('cities', async (ctx) => {
    await ctx.answerCallbackQuery()
    await handleCities(ctx)
  })

  // ── City callback (legacy, still handle) ──
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

  // ── Admin handlers ──
  registerAdminHandlers(bot)

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
  kb.webApp('🌐 לאתר', `${SITE}/ad/${p.id}`)
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

import { Bot, InlineKeyboard } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import { searchProfiles, getProfileCount, getCitiesWithCounts, type Profile } from './db.js'
import { publishConversation, type BotContext, pendingCategories } from './publish.js'
import { registerAdminHandlers } from './admin.js'

const SITE = 'https://tahles.top'

export function createBot(token: string) {
  const bot = new Bot<BotContext>(token)

  // ── Middleware: conversations ──
  bot.use(conversations())
  bot.use(createConversation(publishConversation))

  // ── Error handler — log and answer stale callbacks ──
  bot.catch((err) => {
    console.error('[bot] Error:', err.message)
    try { err.ctx?.answerCallbackQuery?.() } catch {}
  })

  // ── /start ──
  bot.command('start', async (ctx) => {
    const payload = ctx.match
    if (payload === 'publish' || payload?.startsWith('publish')) {
      // Deep link: show category selection first
      await showCategorySelection(ctx, payload)
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
      .text('⭐ פרסום מודעה', 'start_publish')
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
    await showCategorySelection(ctx)
  })

  // ── /cancel command (exits conversation) ──
  bot.command('cancel', async (ctx) => {
    try { await ctx.conversation.exit('publishConversation') } catch {}
    const userId = ctx.from?.id
    if (userId) pendingCategories.delete(userId)
    await ctx.reply('❌ בוטל')
  })

  // ── "Add Profile" button → show category selection ──
  bot.callbackQuery('start_publish', async (ctx) => {
    await ctx.answerCallbackQuery()
    try { await ctx.conversation.exit('publishConversation') } catch {}
    await showCategorySelection(ctx)
  })

  // ── Category selected → enter conversation ──
  bot.callbackQuery(/^pub_cat:/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const userId = ctx.from?.id
    if (!userId) return

    const category = ctx.callbackQuery.data.replace('pub_cat:', '')
    console.log(`[bot] User ${userId} selected category: ${category}`)

    // Read stored language (set during showCategorySelection)
    const prev = pendingCategories.get(userId)
    const lang = prev?.startsWith('__lang:') ? prev.replace('__lang:', '') : 'he'

    // Store category + language for the conversation to pick up
    pendingCategories.set(userId, `${category}|${lang}`)

    // Exit any existing conversation, then enter fresh
    try { await ctx.conversation.exit('publishConversation') } catch {}
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

  // ── Legacy callbacks ──
  bot.callbackQuery('search_prompt', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply('🔍 שלח שם, עיר או קטגוריה לחיפוש:')
  })

  bot.callbackQuery('cities', async (ctx) => {
    await ctx.answerCallbackQuery()
    await handleCities(ctx)
  })

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
    if (text.startsWith('/')) return

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

  // ── Admin handlers (MUST be before catch-all) ──
  registerAdminHandlers(bot)

  // ── Catch-all for any unhandled callback queries (MUST be LAST — prevents hanging) ──
  bot.on('callback_query:data', async (ctx) => {
    console.log(`[bot] Unhandled callback: ${ctx.callbackQuery.data}`)
    await ctx.answerCallbackQuery()
  })

  return bot
}

// ── Show category selection (before entering conversation) ──
async function showCategorySelection(ctx: any, payload?: string) {
  // Detect language from deep link payload
  const langMap: Record<string, Record<string, string>> = {
    welcome: {
      en: '📤 *Publish your ad on Tahles*\n\nWe\'ll go through a few quick steps to create your profile.\nYou can cancel anytime with /cancel\n\nLet\'s start! 👇',
      ru: '📤 *Размещение анкеты на Tahles*\n\nСейчас пройдём несколько шагов для создания вашего профиля.\nОтменить можно в любой момент — /cancel\n\nНачнём! 👇',
      he: '📤 *פרסום מודעה ב-Tahles*\n\nעכשיו נעבור על כמה שלבים קצרים כדי ליצור את הפרופיל שלך.\nאפשר לבטל בכל שלב עם /cancel\n\nבואי נתחיל! 👇',
    },
    ask_category: {
      en: '📂 *Choose ad category:*',
      ru: '📂 *Выберите категорию объявления:*',
      he: '📂 *בחרי קטגוריה למודעה:*',
    },
    cat_sugar: { en: '💎 Sugar Baby', ru: '💎 Sugar Baby', he: '💎 Sugar Baby' },
    cat_regular: { en: '📋 Regular ad', ru: '📋 Обычное объявление', he: '📋 מודעה רגילה' },
  }

  const langMatch = (payload || '').match(/publish_(\w+)/)
  const lang = (['en', 'ru', 'he'].includes(langMatch?.[1] || '') ? langMatch![1] : 'he') as string

  // Store language for conversation to pick up
  const userId = ctx.from?.id
  if (userId) {
    pendingCategories.set(userId, `__lang:${lang}`)
  }

  await ctx.reply(langMap.welcome[lang] || langMap.welcome.he, { parse_mode: 'Markdown' })

  const catKb = new InlineKeyboard()
    .text(langMap.cat_sugar[lang] || langMap.cat_sugar.he, 'pub_cat:sugar_baby').row()
    .text(langMap.cat_regular[lang] || langMap.cat_regular.he, 'pub_cat:regular')

  await ctx.reply(langMap.ask_category[lang] || langMap.ask_category.he, {
    parse_mode: 'Markdown',
    reply_markup: catKb,
  })
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
    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: kb })
  }
}

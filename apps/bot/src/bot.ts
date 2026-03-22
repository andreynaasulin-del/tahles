import { Bot, InlineKeyboard } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import { searchProfiles, getProfileCount, getCitiesWithCounts, type Profile } from './db.js'
import { publishConversation, type BotContext, pendingCategories } from './publish.js'
import { registerAdminHandlers } from './admin.js'

const SITE = 'https://tahles.top'

// ── Store user language preference (userId → lang) ──
const userLangs = new Map<number, string>()

// ── Multilingual texts for /start menu ──
const menuTexts: Record<string, Record<string, string>> = {
  greeting: {
    en: `Hey! This is *Tahles* bot 💎\n\n*{count}* verified profiles of gorgeous & independent girls – discreet, direct to WhatsApp, no middlemen. 🔥\n\nReady for a real experience? 👇\n*Choose what you like…*`,
    ru: `Привет! Это бот *Tahles* 💎\n\n*{count}* проверенных анкет шикарных и независимых девушек – дискретно, напрямую в WhatsApp, без посредников. 🔥\n\nГотов к настоящему опыту? 👇\n*Выбирай…*`,
    he: `היי גבר! זה הבוט *Tahles* 💎\n\n*{count}* פרופילים מאומתים של בנות מהממות ועצמאיות – הכל דיסקרטי, ישיר לך ל-WhatsApp בלי אף מתווך. 🔥\n\nמוכן לפינוק אמיתי? 👇\n*בחר עכשיו מה הוייב שלך…*`,
  },
  all_profiles: { en: '🔥 All Profiles ({count})', ru: '🔥 Все анкеты ({count})', he: '🔥 כל המודעות ({count})' },
  european: { en: '🇪🇺 European', ru: '🇪🇺 Европейки', he: '🇪🇺 אירופאיות' },
  latina: { en: '💃 Latina', ru: '💃 Латинки', he: '💃 לטיניות' },
  asian: { en: '🌸 Asian', ru: '🌸 Азиатки', he: '🌸 אסיאתיות' },
  independent: { en: '👩 Independent', ru: '👩 Независимые', he: '👩 העצמאיות' },
  add_profile: { en: '⭐ Add Profile', ru: '⭐ Разместить анкету', he: '⭐ פרסום מודעה' },
  support: { en: '📞 Contact Support', ru: '📞 Поддержка', he: '📞 פנייה לשירות לקוחות' },
  choose_city: { en: '🏙 *Choose a city:*', ru: '🏙 *Выберите город:*', he: '🏙 *בחר עיר — פתח ישר באתר:*' },
  no_cities: { en: 'No cities available', ru: 'Нет доступных городов', he: 'אין ערים כרגע' },
  cancelled: { en: '❌ Cancelled', ru: '❌ Отменено', he: '❌ בוטל' },
  search_prompt: { en: '🔍 Send a name, city, or category to search:', ru: '🔍 Отправь имя, город или категорию:', he: '🔍 שלח שם, עיר או קטגוריה לחיפוש:' },
  no_results: { en: 'No results found 😔', ru: 'Ничего не найдено 😔', he: 'לא נמצאו תוצאות 😔' },
  results_found: { en: '🔍 Found {n} results:', ru: '🔍 Найдено {n} результатов:', he: '🔍 נמצאו {n} תוצאות:' },
  welcome_publish: {
    en: '📤 *Publish your ad on Tahles*\n\nWe\'ll go through a few quick steps to create your profile.\nYou can cancel anytime with /cancel\n\nLet\'s start! 👇',
    ru: '📤 *Размещение анкеты на Tahles*\n\nСейчас пройдём несколько шагов для создания вашего профиля.\nОтменить можно в любой момент — /cancel\n\nНачнём! 👇',
    he: '📤 *פרסום מודעה ב-Tahles*\n\nעכשיו נעבור על כמה שלבים קצרים כדי ליצור את הפרופיל שלך.\nאפשר לבטל בכל שלב עם /cancel\n\nבואי נתחיל! 👇',
  },
  ask_category: { en: '📂 *Choose ad category:*', ru: '📂 *Выберите категорию:*', he: '📂 *בחרי קטגוריה למודעה:*' },
  cat_sugar: { en: '💎 Sugar Baby', ru: '💎 Sugar Baby', he: '💎 Sugar Baby' },
  cat_regular: { en: '📋 Regular ad', ru: '📋 Обычное объявление', he: '📋 מודעה רגילה' },
}

function mt(key: string, lang: string, vars?: Record<string, string | number>): string {
  let text = menuTexts[key]?.[lang] ?? menuTexts[key]?.he ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

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

  // ── /start → ALWAYS show language selection first ──
  bot.command('start', async (ctx) => {
    console.log(`[bot] /start from user ${ctx.from?.id}, payload: "${ctx.match}"`)

    const payload = ctx.match

    // Deep link: /start publish_en → skip lang selection, go to category
    if (payload?.startsWith('publish_')) {
      const langCode = payload.replace('publish_', '')
      if (['en', 'ru', 'he'].includes(langCode)) {
        const userId = ctx.from?.id
        if (userId) {
          userLangs.set(userId, langCode)
          pendingCategories.set(userId, `__lang:${langCode}`)
        }
        await showCategorySelection(ctx, langCode)
        return
      }
    }

    // Deep link: /start publish → show lang selection for publish
    if (payload === 'publish') {
      await showLanguageSelection(ctx, 'publish')
      return
    }

    // Normal /start → show language selection
    await showLanguageSelection(ctx, 'menu')
  })

  // ── /publish command ──
  bot.command('publish', async (ctx) => {
    console.log(`[bot] /publish from user ${ctx.from?.id}`)
    await showLanguageSelection(ctx, 'publish')
  })

  // ── /cancel command ──
  bot.command('cancel', async (ctx) => {
    const userId = ctx.from?.id
    const lang = (userId && userLangs.get(userId)) || 'he'
    try { await ctx.conversation.exit('publishConversation') } catch {}
    if (userId) pendingCategories.delete(userId)
    await ctx.reply(mt('cancelled', lang))
  })

  // ── Language selected for MENU → show main menu ──
  bot.callbackQuery(/^start_lang_menu:/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const userId = ctx.from?.id
    const lang = ctx.callbackQuery.data.replace('start_lang_menu:', '')
    console.log(`[bot] User ${userId} selected menu language: ${lang}`)
    if (userId) userLangs.set(userId, lang)
    await showMainMenu(ctx, lang)
  })

  // ── Language selected for PUBLISH → show category selection ──
  bot.callbackQuery(/^start_lang_publish:/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const userId = ctx.from?.id
    const lang = ctx.callbackQuery.data.replace('start_lang_publish:', '')
    console.log(`[bot] User ${userId} selected publish language: ${lang}`)
    if (userId) {
      userLangs.set(userId, lang)
      pendingCategories.set(userId, `__lang:${lang}`)
    }
    await showCategorySelection(ctx, lang)
  })

  // Also handle old pub_lang_sel: format (backwards compat)
  bot.callbackQuery(/^pub_lang_sel:/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const userId = ctx.from?.id
    const lang = ctx.callbackQuery.data.replace('pub_lang_sel:', '')
    console.log(`[bot] User ${userId} selected language (legacy): ${lang}`)
    if (userId) {
      userLangs.set(userId, lang)
      pendingCategories.set(userId, `__lang:${lang}`)
    }
    await showCategorySelection(ctx, lang)
  })

  // ── "Add Profile" button → show language selection for publish ──
  bot.callbackQuery('start_publish', async (ctx) => {
    await ctx.answerCallbackQuery()
    console.log(`[bot] User ${ctx.from?.id} clicked Add Profile`)
    try { await ctx.conversation.exit('publishConversation') } catch {}
    await showLanguageSelection(ctx, 'publish')
  })

  // ── Category selected → enter conversation ──
  bot.callbackQuery(/^pub_cat:/, async (ctx) => {
    await ctx.answerCallbackQuery()
    const userId = ctx.from?.id
    if (!userId) return

    const category = ctx.callbackQuery.data.replace('pub_cat:', '')
    console.log(`[bot] User ${userId} selected category: ${category}`)

    // Read stored language
    const prev = pendingCategories.get(userId)
    const lang = prev?.startsWith('__lang:') ? prev.replace('__lang:', '') : (userLangs.get(userId) || 'he')

    // Store category + language for the conversation to pick up
    pendingCategories.set(userId, `${category}|${lang}`)

    // Exit any existing conversation, then enter fresh
    try { await ctx.conversation.exit('publishConversation') } catch {}
    await ctx.conversation.enter('publishConversation')
  })

  // ── /cities ──
  bot.command('cities', handleCities)

  // City slug mapping
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
    const userId = ctx.from?.id
    const lang = (userId && userLangs.get(userId)) || 'he'
    const cities = await getCitiesWithCounts()
    if (cities.length === 0) return ctx.reply(mt('no_cities', lang))

    const kb = new InlineKeyboard()
    for (let i = 0; i < cities.length; i++) {
      const slug = CITY_SLUGS[cities[i].city] || cities[i].city.toLowerCase().replace(/\s+/g, '-')
      kb.webApp(`${cities[i].city} (${cities[i].count})`, `${SITE}/${slug}`)
      if (i % 2 === 1) kb.row()
    }

    await ctx.reply(mt('choose_city', lang), { parse_mode: 'Markdown', reply_markup: kb })
  }

  // ── Legacy callbacks ──
  bot.callbackQuery('search_prompt', async (ctx) => {
    await ctx.answerCallbackQuery()
    const lang = (ctx.from?.id && userLangs.get(ctx.from.id)) || 'he'
    await ctx.reply(mt('search_prompt', lang))
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
      return ctx.reply(`No results for ${city}`)
    }
    for (const p of profiles) {
      await sendProfileCard(ctx, p)
    }
  })

  // ── /search command ──
  bot.command('search', async (ctx) => {
    const query = ctx.match
    if (!query) return ctx.reply('Send: /search Tel Aviv')
    const profiles = await searchProfiles({ query, limit: 5 })
    if (profiles.length === 0) return ctx.reply(mt('no_results', (ctx.from?.id && userLangs.get(ctx.from.id)) || 'he'))
    for (const p of profiles) await sendProfileCard(ctx, p)
  })

  // ── Free text search ──
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text
    if (text.startsWith('/')) return

    const lang = (ctx.from?.id && userLangs.get(ctx.from.id)) || 'he'
    const profiles = await searchProfiles({ query: text, limit: 5 })
    if (profiles.length === 0) {
      return ctx.reply(mt('no_results', lang))
    }

    await ctx.reply(mt('results_found', lang, { n: profiles.length }))
    for (const p of profiles) await sendProfileCard(ctx, p)
  })

  // ── Inline query ──
  bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query
    const profiles = await searchProfiles({ query: query || undefined, limit: 10 })

    const results = profiles.map((p) => ({
      type: 'article' as const,
      id: p.id,
      title: `${p.nickname} — ${p.city || 'Israel'}`,
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

  // ── Catch-all for any unhandled callback queries (MUST be LAST) ──
  bot.on('callback_query:data', async (ctx) => {
    console.log(`[bot] Unhandled callback: ${ctx.callbackQuery.data}`)
    await ctx.answerCallbackQuery()
  })

  return bot
}

// ── Show language selection ──
// mode: 'menu' = show main menu after, 'publish' = show category selection after
async function showLanguageSelection(ctx: any, mode: 'menu' | 'publish') {
  const prefix = mode === 'menu' ? 'start_lang_menu' : 'start_lang_publish'
  const kb = new InlineKeyboard()
    .text('🇮🇱 עברית', `${prefix}:he`)
    .text('🇷🇺 Русский', `${prefix}:ru`)
    .text('🇬🇧 English', `${prefix}:en`)

  await ctx.reply('🌐 *Choose your language / בחרי שפה / Выбери язык:*', {
    parse_mode: 'Markdown',
    reply_markup: kb,
  })
}

// ── Show main menu (after language is chosen) ──
async function showMainMenu(ctx: any, lang: string) {
  const count = await getProfileCount()
  const kb = new InlineKeyboard()
    .webApp(mt('all_profiles', lang, { count }), SITE)
    .row()
    .webApp(mt('european', lang), `${SITE}/escorts/european`)
    .webApp(mt('latina', lang), `${SITE}/escorts/latina`)
    .row()
    .webApp(mt('asian', lang), `${SITE}/escorts/asian`)
    .webApp(mt('independent', lang), `${SITE}/escorts/independent`)
    .row()
    .text(mt('add_profile', lang), 'start_publish')
    .row()
    .url(mt('support', lang), 'https://t.me/tahles_support')

  await ctx.reply(mt('greeting', lang, { count }), {
    parse_mode: 'Markdown',
    reply_markup: kb,
  })
}

// ── Show category selection (after language is chosen for publish) ──
async function showCategorySelection(ctx: any, lang: string) {
  await ctx.reply(mt('welcome_publish', lang), { parse_mode: 'Markdown' })

  const catKb = new InlineKeyboard()
    .text(mt('cat_sugar', lang), 'pub_cat:sugar_baby').row()
    .text(mt('cat_regular', lang), 'pub_cat:regular')

  await ctx.reply(mt('ask_category', lang), {
    parse_mode: 'Markdown',
    reply_markup: catKb,
  })
}

// ── Helpers ──

function formatPrice(p: Profile): string {
  if (p.price_min && p.price_max) return `💰 ${p.price_min}–${p.price_max}₪`
  if (p.price_min) return `💰 from ${p.price_min}₪`
  return ''
}

function formatProfileText(p: Profile): string {
  const lines = [`🔥 *${p.nickname}*`]
  if (p.city) lines.push(`📍 ${p.city}`)
  if (p.age) lines.push(`🎂 ${p.age}`)
  const price = formatPrice(p)
  if (price) lines.push(price)
  lines.push(`✅ Verified WhatsApp`)
  lines.push(`\n👉 [Full profile](${SITE}/ad/${p.id})`)
  return lines.join('\n')
}

function profileButtons(p: Profile): InlineKeyboard {
  const kb = new InlineKeyboard()
  if (p.whatsapp) {
    const waNum = p.whatsapp.replace(/\D/g, '')
    kb.url('📱 WhatsApp', `https://wa.me/${waNum}`)
  }
  kb.webApp('🌐 Website', `${SITE}/ad/${p.id}`)
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

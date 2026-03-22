import type { Conversation, ConversationFlavor } from '@grammyjs/conversations'
import type { Context, Bot } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { saveSubmission } from './db.js'
import { notifyAdmins } from './admin.js'

export type BotContext = ConversationFlavor<Context>
export type BotConversation = Conversation<BotContext>

type Lang = 'en' | 'ru' | 'he'

// ── Shared state: category selected before entering conversation ──
// Key = userId, Value = "category" or "__lang:xx" (pre-selection)
export const pendingCategories = new Map<number, string>()

// ── i18n ──────────────────────────────────────────────────────────────
const i18n: Record<string, Record<Lang, string>> = {
  welcome: {
    en: '📤 *Publish your ad on Tahles*\n\nWe\'ll go through a few quick steps to create your profile.\nYou can cancel anytime with /cancel\n\nLet\'s start! 👇',
    ru: '📤 *Размещение анкеты на Tahles*\n\nСейчас пройдём несколько шагов для создания вашего профиля.\nОтменить можно в любой момент — /cancel\n\nНачнём! 👇',
    he: '📤 *פרסום מודעה ב-Tahles*\n\nעכשיו נעבור על כמה שלבים קצרים כדי ליצור את הפרופיל שלך.\nאפשר לבטל בכל שלב עם /cancel\n\nבואי נתחיל! 👇',
  },
  ask_name: {
    en: '1️⃣ *What\'s your name?* (displayed in the ad)',
    ru: '1️⃣ *Как тебя зовут?* (имя в анкете)',
    he: '1️⃣ *מה השם שלך?* (השם שיופיע במודעה)',
  },
  ask_age: {
    en: '2️⃣ *How old are you?*',
    ru: '2️⃣ *Сколько тебе лет?*',
    he: '2️⃣ *בת כמה את?*',
  },
  age_invalid: {
    en: '⚠️ Age must be between 18 and 99. Try again:',
    ru: '⚠️ Возраст должен быть от 18 до 99. Попробуй снова:',
    he: '⚠️ גיל חייב להיות בין 18 ל-99. נסי שוב:',
  },
  ask_city: {
    en: '3️⃣ *What city are you in?*',
    ru: '3️⃣ *В каком городе?*',
    he: '3️⃣ *באיזו עיר את?*',
  },
  city_other: {
    en: '🏙 Other city',
    ru: '🏙 Другой город',
    he: '🏙 עיר אחרת',
  },
  city_type: {
    en: 'Type your city name:',
    ru: 'Напиши название города:',
    he: 'הקלידי את שם העיר:',
  },
  ask_service: {
    en: '4️⃣ *Service type:*',
    ru: '4️⃣ *Тип услуги:*',
    he: '4️⃣ *סוג שירות:*',
  },
  service_incall: {
    en: '🏠 Incall',
    ru: '🏠 У меня',
    he: '🏠 אצלי (Incall)',
  },
  service_outcall: {
    en: '🚗 Outcall',
    ru: '🚗 Выезд',
    he: '🚗 אצלך (Outcall)',
  },
  service_both: {
    en: '🔄 Both',
    ru: '🔄 Оба варианта',
    he: '🔄 גם וגם (Both)',
  },
  ask_price: {
    en: '5️⃣ *Price per hour (₪)*\n\nSend min and max separated by a dash\nExample: `500-1000`',
    ru: '5️⃣ *Цена за час (₪)*\n\nОтправь мин и макс через дефис\nПример: `500-1000`',
    he: '5️⃣ *מחיר לשעה בשקלים*\n\nשלחי מחיר מינימום ומקסימום מופרדים ב-מקף\nלדוגמה: `500-1000`',
  },
  price_invalid: {
    en: '⚠️ Wrong format. Send like: `500-1000`',
    ru: '⚠️ Неверный формат. Отправь как: `500-1000`',
    he: '⚠️ פורמט לא נכון. שלחי כמו: `500-1000`',
  },
  ask_services: {
    en: '5️⃣b *What services do you offer?*\n\nSelect all that apply, then tap "Done" 👇',
    ru: '5️⃣b *Какие услуги ты предлагаешь?*\n\nВыбери всё подходящее, затем нажми "Готово" 👇',
    he: '5️⃣b *אילו שירותים את מציעה?*\n\nבחרי את כל מה שמתאים, ואז לחצי "סיימתי" 👇',
  },
  services_done: {
    en: '✅ Done',
    ru: '✅ Готово',
    he: '✅ סיימתי',
  },
  services_selected: {
    en: '✔ {s} selected. Pick more or tap "Done"',
    ru: '✔ {s} выбрано. Выбери ещё или нажми "Готово"',
    he: '✔ {s} נבחרו. בחרי עוד או לחצי "סיימתי"',
  },
  ask_height: {
    en: '📏 *Height (cm)?* (or Skip)',
    ru: '📏 *Рост (см)?* (или Пропустить)',
    he: '📏 *גובה (ס"מ)?* (או דלגי)',
  },
  ask_breast: {
    en: '👙 *Breast size?*',
    ru: '👙 *Размер груди?*',
    he: '👙 *מידת חזה?*',
  },
  ask_hair: {
    en: '💇 *Hair color?*',
    ru: '💇 *Цвет волос?*',
    he: '💇 *צבע שיער?*',
  },
  ask_languages: {
    en: '🗣 *Languages you speak?*\n\nSelect all, then tap "Done"',
    ru: '🗣 *На каких языках говоришь?*\n\nВыбери все, затем "Готово"',
    he: '🗣 *באילו שפות את מדברת?*\n\nבחרי הכל, ואז "סיימתי"',
  },
  skip: {
    en: '⏭ Skip',
    ru: '⏭ Пропустить',
    he: '⏭ דלגי',
  },
  ask_photos: {
    en: '6️⃣ *Send photos* (1-10)\n\nSend one or more photos, then tap "Done" 👇',
    ru: '6️⃣ *Отправь фото* (1-10)\n\nОтправь одно или несколько фото, затем нажми "Готово" 👇',
    he: '6️⃣ *שלחי תמונות* (1-10)\n\nשלחי תמונה אחת או כמה, ואחרי שתסיימי לחצי על "סיימתי" 👇',
  },
  photos_done: {
    en: '✅ Done sending photos',
    ru: '✅ Готово',
    he: '✅ סיימתי לשלוח תמונות',
  },
  photos_min: {
    en: '⚠️ You must send at least one photo!',
    ru: '⚠️ Нужно отправить хотя бы одно фото!',
    he: '⚠️ חייבת לשלוח לפחות תמונה אחת!',
  },
  photos_received: {
    en: '📸 Photo {n} received. Send more or tap "Done"',
    ru: '📸 Фото {n} получено. Отправь ещё или нажми "Готово"',
    he: '📸 התקבלה תמונה {n}. שלחי עוד או לחצי "סיימתי"',
  },
  ask_whatsapp: {
    en: '7️⃣ *WhatsApp number*\n\nSend with country code\nExample: `972501234567`',
    ru: '7️⃣ *Номер WhatsApp*\n\nОтправь с кодом страны\nПример: `972501234567`',
    he: '7️⃣ *מספר WhatsApp*\n\nשלחי את המספר עם קידומת מדינה\nלדוגמה: `972501234567`',
  },
  whatsapp_invalid: {
    en: '⚠️ Invalid number. Send digits only, like: `972501234567`',
    ru: '⚠️ Неверный номер. Только цифры, как: `972501234567`',
    he: '⚠️ מספר לא תקין. שלחי ספרות בלבד, כמו: `972501234567`',
  },
  ask_desc: {
    en: '8️⃣ *Short description* (optional)\n\nWrite a few words about yourself, or tap "Skip"',
    ru: '8️⃣ *Краткое описание* (не обязательно)\n\nНапиши пару слов о себе, или нажми "Пропустить"',
    he: '8️⃣ *תיאור קצר* (אופציונלי)\n\nכתבי כמה מילים על עצמך, או לחצי "דלגי"',
  },
  desc_skip: {
    en: '⏭ Skip',
    ru: '⏭ Пропустить',
    he: '⏭ דלגי',
  },
  generating_desc: {
    en: '✨ Generating a professional description...',
    ru: '✨ Генерируем профессиональное описание...',
    he: '✨ מייצרת תיאור מקצועי...',
  },
  summary_header: {
    en: '📋 *Your ad summary:*\n',
    ru: '📋 *Итог вашей анкеты:*\n',
    he: '📋 *סיכום המודעה שלך:*\n',
  },
  summary_name: { en: '👤 Name: *{v}*', ru: '👤 Имя: *{v}*', he: '👤 שם: *{v}*' },
  summary_age: { en: '🎂 Age: *{v}*', ru: '🎂 Возраст: *{v}*', he: '🎂 גיל: *{v}*' },
  summary_city: { en: '📍 City: *{v}*', ru: '📍 Город: *{v}*', he: '📍 עיר: *{v}*' },
  summary_service: { en: '🏠 Service: *{v}*', ru: '🏠 Услуга: *{v}*', he: '🏠 שירות: *{v}*' },
  summary_price: { en: '💰 Price: *{v}₪*', ru: '💰 Цена: *{v}₪*', he: '💰 מחיר: *{v}₪*' },
  summary_photos: { en: '📸 Photos: *{v}*', ru: '📸 Фото: *{v}*', he: '📸 תמונות: *{v}*' },
  summary_wa: { en: '📱 WhatsApp: *{v}*', ru: '📱 WhatsApp: *{v}*', he: '📱 WhatsApp: *{v}*' },
  summary_desc: { en: '📝 Description: {v}', ru: '📝 Описание: {v}', he: '📝 תיאור: {v}' },
  summary_services: { en: '🎯 Services: *{v}*', ru: '🎯 Услуги: *{v}*', he: '🎯 שירותים: *{v}*' },
  summary_params: { en: '📐 Details: *{v}*', ru: '📐 Параметры: *{v}*', he: '📐 פרטים: *{v}*' },
  summary_langs: { en: '🗣 Languages: *{v}*', ru: '🗣 Языки: *{v}*', he: '🗣 שפות: *{v}*' },
  confirm_q: { en: '\n✅ *All correct?*', ru: '\n✅ *Всё верно?*', he: '\n✅ *הכל נכון?*' },
  btn_confirm: { en: '✅ Confirm & publish', ru: '✅ Подтвердить', he: '✅ אישור ופרסום' },
  btn_cancel: { en: '❌ Cancel', ru: '❌ Отмена', he: '❌ ביטול' },
  saving: { en: '⏳ Saving...', ru: '⏳ Сохраняем...', he: '⏳ שומרת...' },
  success: {
    en: '🎉 *Your ad was submitted successfully!*\n\nIt\'s pending approval. We\'ll notify you once it goes live!\n\n🔗 Meanwhile, share Tahles with your clients 👇',
    ru: '🎉 *Ваша анкета отправлена!*\n\nОна на модерации. Мы уведомим, когда она появится на сайте!\n\n🔗 А пока — поделись Tahles с клиентами 👇',
    he: '🎉 *המודעה נשלחה בהצלחה!*\n\nהמודעה שלך ממתינה לאישור. נעדכן אותך ברגע שהיא תעלה לאוויר!\n\n🔗 בינתיים, שתפי את Tahles עם הלקוחות שלך 👇',
  },
  share_tg: { en: '📤 Share on Telegram', ru: '📤 Поделиться в Telegram', he: '📤 שתפי בטלגרם' },
  share_wa: { en: '📱 Share on WhatsApp', ru: '📱 Поделиться в WhatsApp', he: '📱 שתפי בוואטסאפ' },
  error: {
    en: '❌ Error saving. Try again later or contact @tahles_support',
    ru: '❌ Ошибка сохранения. Попробуй позже или напиши @tahles_support',
    he: '❌ שגיאה בשמירה. נסי שוב מאוחר יותר או פני ל @tahles_support',
  },
  cancelled: { en: '❌ Cancelled', ru: '❌ Отменено', he: '❌ בוטל' },
  cancelled_restart: {
    en: '❌ Cancelled. Start again with /publish',
    ru: '❌ Отменено. Начать заново — /publish',
    he: '❌ בוטל. אפשר להתחיל מחדש עם /publish',
  },
  cat_sugar: {
    en: '💎 Sugar Baby',
    ru: '💎 Sugar Baby',
    he: '💎 Sugar Baby',
  },
  cat_regular: {
    en: '📋 Regular ad',
    ru: '📋 Обычное объявление',
    he: '📋 מודעה רגילה',
  },
}

function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  let text = i18n[key]?.[lang] ?? i18n[key]?.en ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

// ── Grok API — generates profile description ─────────────────────────
async function generateDescription(
  lang: Lang,
  data: { nickname: string; age: number; city: string; serviceType: string; priceMin: number; priceMax: number }
): Promise<string | null> {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY
  if (!apiKey) return null

  const langName = { en: 'English', ru: 'Russian', he: 'Hebrew' }[lang]
  const prompt = `Write a short (2-3 sentences), professional and attractive escort profile description in ${langName}.
Name: ${data.nickname}, Age: ${data.age}, City: ${data.city}, Service: ${data.serviceType}, Price: ${data.priceMin}-${data.priceMax}₪/hr.
Keep it classy, no explicit content. Return ONLY the description text, nothing else.`

  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'grok-4-0709',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}

// ── Cities ──
const CITIES = [
  'תל אביב', 'חיפה', 'ירושלים', 'אילת', 'נתניה',
  'בת ים', 'באר שבע', 'אשדוד', 'ראשון לציון', 'הרצליה', 'חדרה',
]

// ── Service options for multi-select (values always Hebrew for site) ──
const SERVICE_OPTIONS: Record<Lang, { label: string; value: string }[]> = {
  he: [
    { label: 'דירה פרטית', value: 'דירה פרטית' },
    { label: 'ליווי', value: 'ליווי' },
    { label: 'עיסוי', value: 'עיסוי' },
    { label: 'דומינציה', value: 'דומינציה' },
    { label: 'זוגות', value: 'זוגות' },
    { label: 'סטריפטיז', value: 'סטריפטיז' },
    { label: 'BDSM', value: 'BDSM' },
    { label: 'GFE', value: 'GFE' },
  ],
  ru: [
    { label: 'Квартира', value: 'דירה פרטית' },
    { label: 'Эскорт', value: 'ליווי' },
    { label: 'Массаж', value: 'עיסוי' },
    { label: 'Доминация', value: 'דומינציה' },
    { label: 'Для пар', value: 'זוגות' },
    { label: 'Стриптиз', value: 'סטריפטיז' },
    { label: 'BDSM', value: 'BDSM' },
    { label: 'GFE', value: 'GFE' },
  ],
  en: [
    { label: 'Private apt', value: 'דירה פרטית' },
    { label: 'Escort', value: 'ליווי' },
    { label: 'Massage', value: 'עיסוי' },
    { label: 'Domination', value: 'דומינציה' },
    { label: 'Couples', value: 'זוגות' },
    { label: 'Striptease', value: 'סטריפטיז' },
    { label: 'BDSM', value: 'BDSM' },
    { label: 'GFE', value: 'GFE' },
  ],
}

// ── Hair color options (values stored in Hebrew for site display) ──
const HAIR_OPTIONS: Record<Lang, { label: string; value: string }[]> = {
  he: [
    { label: '🖤 שחור', value: 'שחור' },
    { label: '🤎 חום', value: 'חום' },
    { label: '💛 בלונד', value: 'בלונד' },
    { label: '❤️ ג\'ינג\'י', value: "ג'ינג'י" },
  ],
  ru: [
    { label: '🖤 Чёрные', value: 'שחור' },
    { label: '🤎 Каштан', value: 'חום' },
    { label: '💛 Блонд', value: 'בלונד' },
    { label: '❤️ Рыжие', value: "ג'ינג'י" },
  ],
  en: [
    { label: '🖤 Black', value: 'שחור' },
    { label: '🤎 Brown', value: 'חום' },
    { label: '💛 Blonde', value: 'בלונד' },
    { label: '❤️ Red', value: "ג'ינג'י" },
  ],
}

// ── Breast size options (values in Hebrew) ──
const BREAST_OPTIONS: Record<Lang, { label: string; value: string }[]> = {
  he: [
    { label: 'קטן', value: 'קטן' },
    { label: 'בינוני', value: 'בינוני' },
    { label: 'גדול', value: 'גדול' },
  ],
  ru: [
    { label: 'Маленькая', value: 'קטן' },
    { label: 'Средняя', value: 'בינוני' },
    { label: 'Большая', value: 'גדול' },
  ],
  en: [
    { label: 'Small', value: 'קטן' },
    { label: 'Medium', value: 'בינוני' },
    { label: 'Large', value: 'גדול' },
  ],
}

// ── Language options (values in Hebrew for site display) ──
const LANG_OPTIONS = [
  { label: '🇮🇱 עברית', value: 'עברית' },
  { label: '🇷🇺 Русский', value: 'רוסית' },
  { label: '🇬🇧 English', value: 'אנגלית' },
  { label: '🇪🇸 Español', value: 'ספרדית' },
  { label: '🇷🇴 Română', value: 'רומנית' },
  { label: '🇹🇭 ไทย', value: 'תאית' },
]

const SITE = 'https://tahles.top'
const DATA_SEPARATOR = '\n---DATA---\n'

/**
 * Publish profile conversation — full wizard flow inside Telegram bot.
 */
export async function publishConversation(conversation: BotConversation, ctx: BotContext, botInstance?: Bot<BotContext>) {
  const userId = ctx.from?.id

  // ── Read category & language from pre-conversation state ──
  // Format: "category|lang" (e.g. "sugar_baby|en") or "__lang:xx"
  const stored = userId ? pendingCategories.get(userId) : undefined
  let adCategory = 'regular'
  let lang: Lang = 'he'

  if (stored && stored.includes('|')) {
    const [cat, lng] = stored.split('|')
    adCategory = cat
    if (['en', 'ru', 'he'].includes(lng)) lang = lng as Lang
  } else {
    // Fallback: parse from deep link
    const startPayload = (ctx.match as string) || ''
    const langMatch = startPayload.match(/publish_(\w+)/)
    if (langMatch && ['en', 'ru', 'he'].includes(langMatch[1])) lang = langMatch[1] as Lang
  }

  // Clean up stored state
  if (userId) pendingCategories.delete(userId)

  console.log(`[publish] Started for user ${userId}, category=${adCategory}, lang=${lang}`)

  // ── Step 1: Nickname ──
  await ctx.reply(t('ask_name', lang), { parse_mode: 'Markdown' })
  const nameMsg = await conversation.waitFor('message:text')
  const nickname = nameMsg.message.text.trim()
  if (nickname === '/cancel') return await ctx.reply(t('cancelled', lang))

  // ── Step 2: Age ──
  await ctx.reply(t('ask_age', lang), { parse_mode: 'Markdown' })
  let age = 0
  while (true) {
    const ageMsg = await conversation.waitFor('message:text')
    if (ageMsg.message.text === '/cancel') return await ctx.reply(t('cancelled', lang))
    age = parseInt(ageMsg.message.text, 10)
    if (age >= 18 && age <= 99) break
    await ctx.reply(t('age_invalid', lang))
  }

  // ── Step 3: City ──
  const cityKb = new InlineKeyboard()
  for (let i = 0; i < CITIES.length; i++) {
    cityKb.text(CITIES[i], `pub_city:${CITIES[i]}`)
    if (i % 3 === 2) cityKb.row()
  }
  cityKb.row().text(t('city_other', lang), 'pub_city:other')

  await ctx.reply(t('ask_city', lang), { parse_mode: 'Markdown', reply_markup: cityKb })
  const cityCallback = await conversation.waitForCallbackQuery(/^pub_city:/)
  await cityCallback.answerCallbackQuery()
  let city = cityCallback.match![0].replace('pub_city:', '')

  if (city === 'other') {
    await ctx.reply(t('city_type', lang))
    const cityText = await conversation.waitFor('message:text')
    if (cityText.message.text === '/cancel') return await ctx.reply(t('cancelled', lang))
    city = cityText.message.text.trim()
  }

  // ── Step 4: Service type ──
  const serviceKb = new InlineKeyboard()
    .text(t('service_incall', lang), 'pub_service:incall').row()
    .text(t('service_outcall', lang), 'pub_service:outcall').row()
    .text(t('service_both', lang), 'pub_service:both')

  await ctx.reply(t('ask_service', lang), { parse_mode: 'Markdown', reply_markup: serviceKb })
  const serviceCallback = await conversation.waitForCallbackQuery(/^pub_service:/)
  await serviceCallback.answerCallbackQuery()
  const serviceType = serviceCallback.match![0].replace('pub_service:', '') as 'incall' | 'outcall' | 'both'

  // ── Step 5: Price ──
  await ctx.reply(t('ask_price', lang), { parse_mode: 'Markdown' })
  let priceMin = 0
  let priceMax = 0
  while (true) {
    const priceMsg = await conversation.waitFor('message:text')
    if (priceMsg.message.text === '/cancel') return await ctx.reply(t('cancelled', lang))
    const parts = priceMsg.message.text.replace(/\s/g, '').split('-')
    priceMin = parseInt(parts[0], 10)
    priceMax = parseInt(parts[1] || parts[0], 10)
    if (priceMin > 0 && priceMax >= priceMin) break
    await ctx.reply(t('price_invalid', lang), { parse_mode: 'Markdown' })
  }

  // ── Step 5b: Services offered (multi-select) ──
  const selectedServices: string[] = [] // stores Hebrew values
  const svcOptions = SERVICE_OPTIONS[lang]
  const buildSvcKb = () => {
    const kb = new InlineKeyboard()
    for (let i = 0; i < svcOptions.length; i++) {
      const sel = selectedServices.includes(svcOptions[i].value)
      kb.text(sel ? `✅ ${svcOptions[i].label}` : svcOptions[i].label, `pub_svc:${i}`)
      if (i % 2 === 1) kb.row()
    }
    kb.row().text(t('services_done', lang), 'pub_svc_done')
    return kb
  }

  await ctx.reply(t('ask_services', lang), { parse_mode: 'Markdown', reply_markup: buildSvcKb() })
  while (true) {
    const svcCtx = await conversation.waitForCallbackQuery(/^pub_svc/)
    await svcCtx.answerCallbackQuery()
    const cbData = svcCtx.match![0]
    if (cbData === 'pub_svc_done') break
    const idx = parseInt(cbData.replace('pub_svc:', ''), 10)
    const svc = svcOptions[idx]
    if (svc) {
      const pos = selectedServices.indexOf(svc.value)
      if (pos >= 0) selectedServices.splice(pos, 1)
      else selectedServices.push(svc.value)
    }
    try {
      await svcCtx.editMessageReplyMarkup({ reply_markup: buildSvcKb() })
    } catch { /* ignore edit errors */ }
  }

  // ── Step 5c: Physical params ──
  // Height
  const heightKb = new InlineKeyboard().text(t('skip', lang), 'pub_height_skip')
  await ctx.reply(t('ask_height', lang), { parse_mode: 'Markdown', reply_markup: heightKb })
  let height = ''
  const heightCtx = await conversation.wait()
  if (heightCtx.callbackQuery?.data === 'pub_height_skip') {
    await heightCtx.answerCallbackQuery()
  } else if (heightCtx.message?.text && heightCtx.message.text !== '/cancel') {
    const h = parseInt(heightCtx.message.text, 10)
    if (h >= 140 && h <= 210) height = `${h} cm`
  } else if (heightCtx.message?.text === '/cancel') {
    return await ctx.reply(t('cancelled', lang))
  }

  // Breast size
  const breastKb = new InlineKeyboard()
  for (const opt of BREAST_OPTIONS[lang]) {
    breastKb.text(opt.label, `pub_breast:${opt.value}`)
  }
  breastKb.row().text(t('skip', lang), 'pub_breast:skip')
  await ctx.reply(t('ask_breast', lang), { parse_mode: 'Markdown', reply_markup: breastKb })
  const breastCtx = await conversation.waitForCallbackQuery(/^pub_breast:/)
  await breastCtx.answerCallbackQuery()
  const breastSize = breastCtx.match![0].replace('pub_breast:', '')

  // Hair color
  const hairKb = new InlineKeyboard()
  for (const opt of HAIR_OPTIONS[lang]) {
    hairKb.text(opt.label, `pub_hair:${opt.value}`)
  }
  hairKb.row().text(t('skip', lang), 'pub_hair:skip')
  await ctx.reply(t('ask_hair', lang), { parse_mode: 'Markdown', reply_markup: hairKb })
  const hairCtx = await conversation.waitForCallbackQuery(/^pub_hair:/)
  await hairCtx.answerCallbackQuery()
  const hairColor = hairCtx.match![0].replace('pub_hair:', '')

  // ── Step 5d: Languages ──
  const selectedLangs: string[] = []
  const buildLangKb = () => {
    const kb = new InlineKeyboard()
    for (let i = 0; i < LANG_OPTIONS.length; i++) {
      const sel = selectedLangs.includes(LANG_OPTIONS[i].value)
      kb.text(sel ? `✅ ${LANG_OPTIONS[i].label}` : LANG_OPTIONS[i].label, `pub_lang:${i}`)
      if (i % 2 === 1) kb.row()
    }
    kb.row().text(t('services_done', lang), 'pub_lang_done')
    return kb
  }

  await ctx.reply(t('ask_languages', lang), { parse_mode: 'Markdown', reply_markup: buildLangKb() })
  while (true) {
    const langCtx = await conversation.waitForCallbackQuery(/^pub_lang/)
    await langCtx.answerCallbackQuery()
    const cbData = langCtx.match![0]
    if (cbData === 'pub_lang_done') break
    const idx = parseInt(cbData.replace('pub_lang:', ''), 10)
    const langVal = LANG_OPTIONS[idx]?.value
    if (langVal) {
      const pos = selectedLangs.indexOf(langVal)
      if (pos >= 0) selectedLangs.splice(pos, 1)
      else selectedLangs.push(langVal)
    }
    try {
      await langCtx.editMessageReplyMarkup({ reply_markup: buildLangKb() })
    } catch { /* ignore edit errors */ }
  }

  // ── Step 6: Photos ──
  await ctx.reply(t('ask_photos', lang), {
    parse_mode: 'Markdown',
    reply_markup: new InlineKeyboard().text(t('photos_done', lang), 'pub_photos_done'),
  })

  const photos: string[] = []
  while (photos.length < 10) {
    const photoCtx = await conversation.wait()

    if (photoCtx.callbackQuery?.data === 'pub_photos_done') {
      await photoCtx.answerCallbackQuery()
      if (photos.length === 0) {
        await ctx.reply(t('photos_min', lang))
        continue
      }
      break
    }
    if (photoCtx.message?.text === '/cancel') return await ctx.reply(t('cancelled', lang))
    if (photoCtx.message?.photo) {
      const fileId = photoCtx.message.photo[photoCtx.message.photo.length - 1].file_id
      photos.push(fileId)
      await ctx.reply(t('photos_received', lang, { n: photos.length }), {
        reply_markup: new InlineKeyboard().text(t('photos_done', lang), 'pub_photos_done'),
      })
      continue
    }
  }

  // ── Step 7: WhatsApp ──
  await ctx.reply(t('ask_whatsapp', lang), { parse_mode: 'Markdown' })
  let whatsapp = ''
  while (true) {
    const waMsg = await conversation.waitFor('message:text')
    if (waMsg.message.text === '/cancel') return await ctx.reply(t('cancelled', lang))
    whatsapp = waMsg.message.text.replace(/[\s\-\+\(\)]/g, '')
    if (/^\d{10,15}$/.test(whatsapp)) break
    await ctx.reply(t('whatsapp_invalid', lang), { parse_mode: 'Markdown' })
  }

  // ── Step 8: Description (optional — Grok generates if skipped) ──
  await ctx.reply(t('ask_desc', lang), {
    parse_mode: 'Markdown',
    reply_markup: new InlineKeyboard().text(t('desc_skip', lang), 'pub_skip_desc'),
  })
  let description = ''
  const descCtx = await conversation.wait()
  if (descCtx.callbackQuery?.data === 'pub_skip_desc') {
    await descCtx.answerCallbackQuery()
    // Generate with Grok if API key available
    await ctx.reply(t('generating_desc', lang))
    const serviceLabel = t(`service_${serviceType}`, lang)
    const generated = await generateDescription(lang, {
      nickname, age, city, serviceType: serviceLabel, priceMin, priceMax,
    })
    if (generated) description = generated
  } else if (descCtx.message?.text && descCtx.message.text !== '/cancel') {
    description = descCtx.message.text.trim()
  } else if (descCtx.message?.text === '/cancel') {
    return await ctx.reply(t('cancelled', lang))
  }

  // ── Build structured extra data ──
  const extraData: Record<string, any> = {
    _category: adCategory,
    services: selectedServices,
    physicalParams: {} as Record<string, string>,
    languages: selectedLangs,
    priceTable: [
      { type: serviceType === 'outcall' ? 'outcall' : 'incall', amount: priceMin, duration: '1h' },
      ...(priceMax > priceMin ? [{ type: serviceType === 'outcall' ? 'outcall' : 'incall', amount: priceMax, duration: '2h' }] : []),
    ],
  }
  if (height) extraData.physicalParams.height = height
  if (breastSize && breastSize !== 'skip') extraData.physicalParams.breast_size = breastSize
  if (hairColor && hairColor !== 'skip') extraData.physicalParams.hair_color = hairColor

  // Pack extra data into description with separator
  const fullDescription = description
    ? description + DATA_SEPARATOR + JSON.stringify(extraData)
    : DATA_SEPARATOR + JSON.stringify(extraData)

  // ── Step 9: Confirmation ──
  const serviceLabel = t(`service_${serviceType}`, lang)
  const paramParts: string[] = []
  if (height) paramParts.push(height)
  if (breastSize && breastSize !== 'skip') paramParts.push(breastSize)
  if (hairColor && hairColor !== 'skip') paramParts.push(hairColor)

  const catLabel = adCategory === 'sugar_baby' ? t('cat_sugar', lang) : t('cat_regular', lang)
  const summary = [
    t('summary_header', lang),
    `📂 ${catLabel}`,
    t('summary_name', lang, { v: nickname }),
    t('summary_age', lang, { v: age }),
    t('summary_city', lang, { v: city }),
    t('summary_service', lang, { v: serviceLabel }),
    t('summary_price', lang, { v: `${priceMin}–${priceMax}` }),
    selectedServices.length > 0 ? t('summary_services', lang, { v: selectedServices.map(v => svcOptions.find(o => o.value === v)?.label ?? v).join(', ') }) : '',
    paramParts.length > 0 ? t('summary_params', lang, { v: paramParts.join(' | ') }) : '',
    selectedLangs.length > 0 ? t('summary_langs', lang, { v: selectedLangs.join(', ') }) : '',
    t('summary_photos', lang, { v: photos.length }),
    t('summary_wa', lang, { v: whatsapp }),
    description ? t('summary_desc', lang, { v: description }) : '',
    t('confirm_q', lang),
  ].filter(Boolean).join('\n')

  const confirmKb = new InlineKeyboard()
    .text(t('btn_confirm', lang), 'pub_confirm')
    .text(t('btn_cancel', lang), 'pub_cancel')

  await ctx.reply(summary, { parse_mode: 'Markdown', reply_markup: confirmKb })

  const confirmCtx = await conversation.waitForCallbackQuery(/^pub_(confirm|cancel)$/)
  await confirmCtx.answerCallbackQuery()

  if (confirmCtx.match![0] === 'pub_cancel') {
    return await ctx.reply(t('cancelled_restart', lang))
  }

  // ── Step 10: Save to DB ──
  await ctx.reply(t('saving', lang))

  try {
    const submissionId = await saveSubmission({
      nickname,
      age,
      city,
      service_type: serviceType,
      price_min: priceMin,
      price_max: priceMax,
      photos,
      whatsapp,
      description: fullDescription,
      telegram_user_id: userId || 0,
      telegram_username: ctx.from?.username || '',
    })

    const shareText = encodeURIComponent(`💎 Tahles — ${SITE}`)

    await ctx.reply(t('success', lang), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .url(t('share_tg', lang), `https://t.me/share/url?url=${encodeURIComponent(SITE)}&text=${shareText}`)
        .row()
        .url(t('share_wa', lang), `https://wa.me/?text=${shareText}`),
    })

    // Notify admins with approve/reject buttons
    try {
      const { Bot: BotClass } = await import('grammy')
      const tempBot = new BotClass<BotContext>(process.env.BOT_TOKEN!)
      await notifyAdmins(tempBot, {
        id: submissionId,
        nickname,
        age,
        city,
        serviceType,
        priceMin,
        priceMax,
        whatsapp,
        description,
        photos,
        telegramId: userId,
        telegramUsername: ctx.from?.username,
      })
    } catch (e) {
      console.error('[publish] Admin notify failed:', e)
    }

  } catch (err) {
    console.error('[publish] Save failed:', err)
    await ctx.reply(t('error', lang))
  }
}

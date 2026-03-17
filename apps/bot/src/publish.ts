import type { Conversation, ConversationFlavor } from '@grammyjs/conversations'
import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { saveSubmission } from './db.js'

export type BotContext = ConversationFlavor<Context>
export type BotConversation = Conversation<BotContext>

const CITIES = [
  'תל אביב', 'חיפה', 'ירושלים', 'אילת', 'נתניה',
  'בת ים', 'באר שבע', 'אשדוד', 'ראשון לציון', 'הרצליה', 'חדרה',
]

const SERVICE_TYPES = [
  { key: 'incall', label: '🏠 אצלי (Incall)' },
  { key: 'outcall', label: '🚗 אצלך (Outcall)' },
  { key: 'both', label: '🔄 גם וגם (Both)' },
]

const SITE = 'https://tahles.top'

/**
 * Publish profile conversation — full wizard flow inside Telegram bot.
 * Steps: name → age → city → service type → price → photos → whatsapp → description → confirm → save
 */
export async function publishConversation(conversation: BotConversation, ctx: BotContext) {
  const userId = ctx.from?.id

  await ctx.reply(
    `📤 *פרסום מודעה ב-Tahles*\n\n` +
    `עכשיו נעבור על כמה שלבים קצרים כדי ליצור את הפרופיל שלך.\n` +
    `אפשר לבטל בכל שלב עם /cancel\n\n` +
    `בואי נתחיל! 👇`,
    { parse_mode: 'Markdown' }
  )

  // ── Step 1: Nickname ──
  await ctx.reply('1️⃣ *מה השם שלך?* (השם שיופיע במודעה)', { parse_mode: 'Markdown' })
  const nameMsg = await conversation.waitFor('message:text')
  const nickname = nameMsg.message.text.trim()
  if (nickname === '/cancel') return await ctx.reply('❌ בוטל')

  // ── Step 2: Age ──
  await ctx.reply('2️⃣ *בת כמה את?*', { parse_mode: 'Markdown' })
  let age = 0
  while (true) {
    const ageMsg = await conversation.waitFor('message:text')
    if (ageMsg.message.text === '/cancel') return await ctx.reply('❌ בוטל')
    age = parseInt(ageMsg.message.text, 10)
    if (age >= 18 && age <= 99) break
    await ctx.reply('⚠️ גיל חייב להיות בין 18 ל-99. נסי שוב:')
  }

  // ── Step 3: City ──
  const cityKb = new InlineKeyboard()
  for (let i = 0; i < CITIES.length; i++) {
    cityKb.text(CITIES[i], `pub_city:${CITIES[i]}`)
    if (i % 3 === 2) cityKb.row()
  }
  cityKb.row().text('🏙 עיר אחרת', 'pub_city:other')

  await ctx.reply('3️⃣ *באיזו עיר את?*', { parse_mode: 'Markdown', reply_markup: cityKb })
  const cityCallback = await conversation.waitForCallbackQuery(/^pub_city:/)
  await cityCallback.answerCallbackQuery()
  let city = cityCallback.match![0].replace('pub_city:', '')

  if (city === 'other') {
    await ctx.reply('הקלידי את שם העיר:')
    const cityText = await conversation.waitFor('message:text')
    if (cityText.message.text === '/cancel') return await ctx.reply('❌ בוטל')
    city = cityText.message.text.trim()
  }

  // ── Step 4: Service type ──
  const serviceKb = new InlineKeyboard()
  for (const s of SERVICE_TYPES) {
    serviceKb.text(s.label, `pub_service:${s.key}`).row()
  }
  await ctx.reply('4️⃣ *סוג שירות:*', { parse_mode: 'Markdown', reply_markup: serviceKb })
  const serviceCallback = await conversation.waitForCallbackQuery(/^pub_service:/)
  await serviceCallback.answerCallbackQuery()
  const serviceType = serviceCallback.match![0].replace('pub_service:', '') as 'incall' | 'outcall' | 'both'

  // ── Step 5: Price ──
  await ctx.reply(
    '5️⃣ *מחיר לשעה בשקלים*\n\nשלחי מחיר מינימום ומקסימום מופרדים ב-מקף\nלדוגמה: `500-1000`',
    { parse_mode: 'Markdown' }
  )
  let priceMin = 0
  let priceMax = 0
  while (true) {
    const priceMsg = await conversation.waitFor('message:text')
    if (priceMsg.message.text === '/cancel') return await ctx.reply('❌ בוטל')
    const parts = priceMsg.message.text.replace(/\s/g, '').split('-')
    priceMin = parseInt(parts[0], 10)
    priceMax = parseInt(parts[1] || parts[0], 10)
    if (priceMin > 0 && priceMax >= priceMin) break
    await ctx.reply('⚠️ פורמט לא נכון. שלחי כמו: `500-1000`', { parse_mode: 'Markdown' })
  }

  // ── Step 6: Photos ──
  await ctx.reply(
    '6️⃣ *שלחי תמונות* (1-10)\n\n' +
    'שלחי תמונה אחת או כמה, ואחרי שתסיימי לחצי על "סיימתי" 👇',
    { parse_mode: 'Markdown', reply_markup: new InlineKeyboard().text('✅ סיימתי לשלוח תמונות', 'pub_photos_done') }
  )

  const photos: string[] = []
  while (photos.length < 10) {
    const photoCtx = await conversation.wait()

    // Done button
    if (photoCtx.callbackQuery?.data === 'pub_photos_done') {
      await photoCtx.answerCallbackQuery()
      if (photos.length === 0) {
        await ctx.reply('⚠️ חייבת לשלוח לפחות תמונה אחת!')
        continue
      }
      break
    }

    // Cancel
    if (photoCtx.message?.text === '/cancel') return await ctx.reply('❌ בוטל')

    // Photo received
    if (photoCtx.message?.photo) {
      const fileId = photoCtx.message.photo[photoCtx.message.photo.length - 1].file_id
      photos.push(fileId)
      await ctx.reply(`📸 התקבלה תמונה ${photos.length}. שלחי עוד או לחצי "סיימתי"`, {
        reply_markup: new InlineKeyboard().text('✅ סיימתי לשלוח תמונות', 'pub_photos_done'),
      })
      continue
    }

    // Ignore other message types
  }

  // ── Step 7: WhatsApp ──
  await ctx.reply(
    '7️⃣ *מספר WhatsApp*\n\nשלחי את המספר עם קידומת מדינה\nלדוגמה: `972501234567`',
    { parse_mode: 'Markdown' }
  )
  let whatsapp = ''
  while (true) {
    const waMsg = await conversation.waitFor('message:text')
    if (waMsg.message.text === '/cancel') return await ctx.reply('❌ בוטל')
    whatsapp = waMsg.message.text.replace(/[\s\-\+\(\)]/g, '')
    if (/^\d{10,15}$/.test(whatsapp)) break
    await ctx.reply('⚠️ מספר לא תקין. שלחי ספרות בלבד, כמו: `972501234567`', { parse_mode: 'Markdown' })
  }

  // ── Step 8: Description (optional) ──
  const skipKb = new InlineKeyboard().text('⏭ דלגי', 'pub_skip_desc')
  await ctx.reply('8️⃣ *תיאור קצר* (אופציונלי)\n\nכתבי כמה מילים על עצמך, או לחצי "דלגי"', {
    parse_mode: 'Markdown',
    reply_markup: skipKb,
  })
  let description = ''
  const descCtx = await conversation.wait()
  if (descCtx.callbackQuery?.data === 'pub_skip_desc') {
    await descCtx.answerCallbackQuery()
  } else if (descCtx.message?.text && descCtx.message.text !== '/cancel') {
    description = descCtx.message.text.trim()
  } else if (descCtx.message?.text === '/cancel') {
    return await ctx.reply('❌ בוטל')
  }

  // ── Step 9: Confirmation ──
  const summary = [
    `📋 *סיכום המודעה שלך:*\n`,
    `👤 שם: *${nickname}*`,
    `🎂 גיל: *${age}*`,
    `📍 עיר: *${city}*`,
    `🏠 שירות: *${SERVICE_TYPES.find(s => s.key === serviceType)?.label}*`,
    `💰 מחיר: *${priceMin}–${priceMax}₪*`,
    `📸 תמונות: *${photos.length}*`,
    `📱 WhatsApp: *${whatsapp}*`,
    description ? `📝 תיאור: ${description}` : '',
    `\n✅ *הכל נכון?*`,
  ].filter(Boolean).join('\n')

  const confirmKb = new InlineKeyboard()
    .text('✅ אישור ופרסום', 'pub_confirm')
    .text('❌ ביטול', 'pub_cancel')

  await ctx.reply(summary, { parse_mode: 'Markdown', reply_markup: confirmKb })

  const confirmCtx = await conversation.waitForCallbackQuery(/^pub_(confirm|cancel)$/)
  await confirmCtx.answerCallbackQuery()

  if (confirmCtx.match![0] === 'pub_cancel') {
    return await ctx.reply('❌ בוטל. אפשר להתחיל מחדש עם /publish')
  }

  // ── Step 10: Save to DB ──
  await ctx.reply('⏳ שומרת...')

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
      description,
      telegram_user_id: userId || 0,
      telegram_username: ctx.from?.username || '',
    })

    const shareText = encodeURIComponent(`הפרופיל שלי ב-Tahles 💎\n${SITE}`)

    await ctx.reply(
      `🎉 *המודעה נשלחה בהצלחה!*\n\n` +
      `המודעה שלך ממתינה לאישור. נעדכן אותך ברגע שהיא תעלה לאוויר!\n\n` +
      `🔗 בינתיים, שתפי את Tahles עם הלקוחות שלך 👇`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .url('📤 שתפי בטלגרם', `https://t.me/share/url?url=${encodeURIComponent(SITE)}&text=${shareText}`)
          .row()
          .url('📱 שתפי בוואטסאפ', `https://wa.me/?text=${shareText}`)
      }
    )

    // Notify admin
    const adminId = process.env.ADMIN_TELEGRAM_ID
    if (adminId) {
      try {
        await ctx.api.sendMessage(
          parseInt(adminId),
          `🆕 *מודעה חדשה ממתינה לאישור*\n\n` +
          `👤 ${nickname}, ${age}\n📍 ${city}\n💰 ${priceMin}–${priceMax}₪\n📸 ${photos.length} photos\n` +
          `📱 WA: ${whatsapp}\n👤 TG: @${ctx.from?.username || 'no_username'}\n\n` +
          `ID: \`${submissionId}\``,
          { parse_mode: 'Markdown' }
        )
      } catch { /* admin notification failed, not critical */ }
    }

  } catch (err) {
    console.error('[publish] Save failed:', err)
    await ctx.reply('❌ שגיאה בשמירה. נסי שוב מאוחר יותר או פני ל @tahles_support')
  }
}

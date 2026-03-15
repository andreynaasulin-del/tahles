import { getGramClient } from './client.js'
import { Api } from 'telegram'
import 'dotenv/config'

// ── SEO Channel Templates ──
// Each template targets different search keywords in Hebrew/Russian/English
const SEO_CHANNELS = [
  // Hebrew city-based
  {
    title: 'נערות ליווי תל אביב - Tahles',
    about: '🔥 נערות ליווי בתל אביב | פרופילים מאומתים עם תמונות אמיתיות ✅ מספרי וואטסאפ אמיתיים | tahles.top',
    username: 'tahles_telaviv',
  },
  {
    title: 'נערות ליווי חיפה - Tahles',
    about: '🔥 נערות ליווי בחיפה | פרופילים מאומתים עם תמונות אמיתיות ✅ מספרי וואטסאפ אמיתיים | tahles.top',
    username: 'tahles_haifa',
  },
  {
    title: 'נערות ליווי ירושלים - Tahles',
    about: '🔥 נערות ליווי בירושלים | פרופילים מאומתים ✅ תמונות אמיתיות | מספרי וואטסאפ | tahles.top',
    username: 'tahles_jerusalem',
  },
  {
    title: 'נערות ליווי באר שבע - Tahles',
    about: '🔥 נערות ליווי בבאר שבע | פרופילים מאומתים ✅ תמונות אמיתיות | tahles.top',
    username: 'tahles_beersheva',
  },
  {
    title: 'נערות ליווי נתניה - Tahles',
    about: '🔥 נערות ליווי בנתניה | פרופילים מאומתים ✅ וואטסאפ אמיתי | tahles.top',
    username: 'tahles_netanya',
  },
  {
    title: 'נערות ליווי הרצליה - Tahles',
    about: '🔥 נערות ליווי בהרצליה | פרופילים מאומתים ✅ תמונות ווואטסאפ | tahles.top',
    username: 'tahles_herzliya',
  },
  {
    title: 'נערות ליווי ראשון לציון - Tahles',
    about: '🔥 נערות ליווי בראשון לציון | פרופילים מאומתים ✅ | tahles.top',
    username: 'tahles_rishon',
  },
  {
    title: 'נערות ליווי אשדוד - Tahles',
    about: '🔥 נערות ליווי באשדוד | פרופילים מאומתים ✅ תמונות אמיתיות | tahles.top',
    username: 'tahles_ashdod',
  },
  {
    title: 'נערות ליווי פתח תקווה - Tahles',
    about: '🔥 נערות ליווי בפתח תקווה | מאגר מאומת ✅ | tahles.top',
    username: 'tahles_petahtikva',
  },
  {
    title: 'נערות ליווי בת ים - Tahles',
    about: '🔥 נערות ליווי בבת ים | פרופילים מאומתים ✅ וואטסאפ אמיתי | tahles.top',
    username: 'tahles_batyam',
  },

  // Hebrew category-based
  {
    title: 'נערות ליווי ישראל - Tahles',
    about: '🇮🇱 המאגר הגדול ביותר של נערות ליווי בישראל | פרופילים מאומתים ✅ תמונות אמיתיות | tahles.top',
    username: 'tahles_israel',
  },
  {
    title: 'שירותי ליווי ישראל - Tahles',
    about: '🇮🇱 שירותי ליווי בכל רחבי ישראל | פרופילים מאומתים ✅ מספרי וואטסאפ | tahles.top',
    username: 'tahles_escort_il',
  },
  {
    title: 'ליווי VIP ישראל - Tahles',
    about: '👑 שירותי ליווי VIP בישראל | נערות ליווי יוקרתיות ✅ פרופילים מאומתים | tahles.top',
    username: 'tahles_vip',
  },
  {
    title: 'נערות ליווי 24/7 - Tahles',
    about: '🕐 נערות ליווי זמינות 24/7 בכל ישראל | פרופילים מאומתים ✅ | tahles.top',
    username: 'tahles_247',
  },

  // Russian-language channels
  {
    title: 'Эскорт Израиль - Tahles',
    about: '🇮🇱 Эскорт услуги в Израиле | Проверенные анкеты ✅ Реальные фото и WhatsApp | tahles.top',
    username: 'tahles_escort_ru',
  },
  {
    title: 'Эскорт Тель-Авив - Tahles',
    about: '🔥 Эскорт в Тель-Авиве | Проверенные анкеты ✅ Реальные фото | tahles.top',
    username: 'tahles_tlv_ru',
  },
  {
    title: 'Эскорт Хайфа - Tahles',
    about: '🔥 Эскорт услуги в Хайфе | Проверенные анкеты с фото ✅ | tahles.top',
    username: 'tahles_haifa_ru',
  },
  {
    title: 'Девушки Израиль - Tahles',
    about: '🇮🇱 Девушки по вызову в Израиле | Реальные фото и номера ✅ | tahles.top',
    username: 'tahles_girls_ru',
  },

  // English channels
  {
    title: 'Escort Israel - Tahles',
    about: '🇮🇱 Escort services in Israel | Verified profiles ✅ Real photos & WhatsApp | tahles.top',
    username: 'tahles_escort_en',
  },
  {
    title: 'Escort Tel Aviv - Tahles',
    about: '🔥 Escort in Tel Aviv | Verified profiles with real photos ✅ | tahles.top',
    username: 'tahles_tlv_en',
  },
]

// ── First post content for each channel ──
function getPostContent(channel: typeof SEO_CHANNELS[0]): string {
  // Detect language from title
  const isHebrew = /[\u0590-\u05FF]/.test(channel.title)
  const isRussian = /[а-яА-Я]/.test(channel.title)

  if (isHebrew) {
    return [
      `🔥 **Tahles** — המאגר הכי גדול של נערות ליווי בישראל`,
      ``,
      `✅ פרופילים מאומתים עם תמונות אמיתיות`,
      `✅ תמונות אמיתיות בלבד`,
      `✅ מספרי וואטסאפ אמיתיים 100%`,
      `✅ עדכון יומי`,
      ``,
      `👉 **tahles.top**`,
      ``,
      `🔍 חפשו לפי עיר, גיל, מחיר`,
      `📱 WhatsApp ישיר לכל נערה`,
    ].join('\n')
  }

  if (isRussian) {
    return [
      `🔥 **Tahles** — крупнейший каталог эскорт-услуг в Израиле`,
      ``,
      `✅ Проверенные анкеты с реальными фото`,
      `✅ Только реальные фото`,
      `✅ Настоящие номера WhatsApp`,
      `✅ Ежедневное обновление`,
      ``,
      `👉 **tahles.top**`,
      ``,
      `🔍 Поиск по городу, возрасту, цене`,
      `📱 Прямой WhatsApp к каждой девушке`,
    ].join('\n')
  }

  // English
  return [
    `🔥 **Tahles** — The largest escort directory in Israel`,
    ``,
    `✅ Verified profiles with real photos`,
    `✅ Real photos only`,
    `✅ 100% real WhatsApp numbers`,
    `✅ Daily updates`,
    ``,
    `👉 **tahles.top**`,
    ``,
    `🔍 Search by city, age, price`,
    `📱 Direct WhatsApp to every girl`,
  ].join('\n')
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  console.log('[seo-farm] 🚀 Starting Telegram SEO Farm...')
  console.log(`[seo-farm] 📋 ${SEO_CHANNELS.length} channels to create`)

  const client = await getGramClient()

  let created = 0
  let skipped = 0
  let failed = 0

  for (const ch of SEO_CHANNELS) {
    console.log(`\n[seo-farm] 📢 Creating: ${ch.title} (@${ch.username})`)

    try {
      // 1. Create the channel
      const result = await client.invoke(
        new Api.channels.CreateChannel({
          title: ch.title,
          about: ch.about,
          broadcast: true, // true = channel (not supergroup)
          megagroup: false,
        })
      )

      // Extract channel from result
      const updates = result as any
      const channel = updates.chats?.[0]
      if (!channel) {
        console.error(`[seo-farm] ❌ No channel in response for ${ch.title}`)
        failed++
        continue
      }

      const channelId = channel.id
      const accessHash = channel.accessHash
      console.log(`[seo-farm] ✅ Channel created: ${ch.title} (id: ${channelId})`)

      // 2. Try to set username
      try {
        await client.invoke(
          new Api.channels.UpdateUsername({
            channel: new Api.InputChannel({
              channelId: channelId,
              accessHash: accessHash,
            }),
            username: ch.username,
          })
        )
        console.log(`[seo-farm] ✅ Username set: @${ch.username}`)
      } catch (err: any) {
        const errMsg = err?.message || String(err)
        if (errMsg.includes('USERNAME_OCCUPIED')) {
          console.warn(`[seo-farm] ⚠️ Username @${ch.username} taken, skipping username`)
        } else {
          console.warn(`[seo-farm] ⚠️ Username error: ${errMsg}`)
        }
      }

      // 3. Send the first post with link
      const postText = getPostContent(ch)
      await client.sendMessage(
        new Api.InputChannel({
          channelId: channelId,
          accessHash: accessHash,
        }),
        {
          message: postText,
          parseMode: 'md',
        }
      )
      console.log(`[seo-farm] ✅ First post sent`)

      // 4. Pin the message
      try {
        const messages = await client.getMessages(
          new Api.InputChannel({
            channelId: channelId,
            accessHash: accessHash,
          }),
          { limit: 1 }
        )
        if (messages.length > 0) {
          await client.invoke(
            new Api.messages.UpdatePinnedMessage({
              peer: new Api.InputChannel({
                channelId: channelId,
                accessHash: accessHash,
              }),
              id: messages[0].id,
              silent: true,
            })
          )
          console.log(`[seo-farm] 📌 Post pinned`)
        }
      } catch (pinErr: any) {
        console.warn(`[seo-farm] ⚠️ Pin error: ${pinErr?.message}`)
      }

      created++

      // Rate limiting - wait between channel creations
      const delay = 30000 + Math.random() * 15000 // 30-45 seconds
      console.log(`[seo-farm] ⏳ Waiting ${Math.round(delay / 1000)}s before next...`)
      await sleep(delay)

    } catch (err: any) {
      const errMsg = err?.message || String(err)
      console.error(`[seo-farm] ❌ Failed: ${errMsg}`)
      failed++

      // If flood wait — stop
      if (errMsg.includes('FLOOD') || errMsg.includes('flood') || errMsg.includes('CHANNELS_TOO_MUCH')) {
        console.error('[seo-farm] 🛑 Rate limit hit, stopping.')
        break
      }

      await sleep(10000)
    }
  }

  await client.disconnect()
  console.log(`\n[seo-farm] 📊 Done: ${created} created, ${skipped} skipped, ${failed} failed`)
}

main().catch(console.error)

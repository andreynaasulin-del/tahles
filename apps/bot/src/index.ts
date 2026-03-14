import 'dotenv/config'
import cron from 'node-cron'
import { createBot } from './bot.js'
import { postToChannel } from './autopost.js'

const BOT_TOKEN = process.env.BOT_TOKEN
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not set in .env')
  process.exit(1)
}

const bot = createBot(BOT_TOKEN)

// ── Autopost cron: every 2 hours ──
cron.schedule('0 */2 * * *', async () => {
  console.log(`[cron] ⏰ Autopost triggered at ${new Date().toISOString()}`)
  await postToChannel(bot)
})

// ── Start bot ──
bot.start({
  onStart: (me) => {
    console.log(`\n🤖 Tahles Bot started as @${me.username}`)
    console.log(`📢 Autopost to ${process.env.CHANNEL_ID || '@tahles_ads'} every 2 hours`)
    console.log(`🔗 Site: https://tahles.top\n`)
  },
})

// Graceful shutdown
process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())

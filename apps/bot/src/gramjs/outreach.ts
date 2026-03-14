import { getGramClient } from './client.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PARSED_FILE = path.join(__dirname, '..', '..', 'data', 'parsed_users.json')
const SENT_FILE = path.join(__dirname, '..', '..', 'data', 'sent_users.json')

interface ParsedUser {
  id: number
  username: string | null
  firstName: string | null
}

function loadJSON(file: string): any[] {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return [] }
}

function saveJSON(file: string, data: any[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function randomDelay(): number {
  const min = parseInt(process.env.MESSAGE_DELAY_MIN || '30') * 1000
  const max = parseInt(process.env.MESSAGE_DELAY_MAX || '60') * 1000
  return Math.floor(Math.random() * (max - min) + min)
}

function getMessage(user: ParsedUser): string {
  const name = user.firstName || ''
  return [
    `היי${name ? ' ' + name : ''}! 👋`,
    ``,
    `מכיר/ה את *Tahles*?`,
    `המאגר הכי גדול של נערות ליווי בישראל 🇮🇱`,
    ``,
    `✅ 67+ פרופילים מאומתים`,
    `✅ מספרי וואטסאפ אמיתיים 100%`,
    `✅ תמונות אמיתיות בלבד`,
    ``,
    `👉 tahles.top`,
  ].join('\n')
}

async function main() {
  const dailyLimit = parseInt(process.env.DAILY_MESSAGE_LIMIT || '40')

  const parsed: ParsedUser[] = loadJSON(PARSED_FILE)
  const sent: number[] = loadJSON(SENT_FILE)
  const sentSet = new Set(sent)

  // Filter unsent users with username (can DM without phone)
  const targets = parsed.filter(u => !sentSet.has(u.id) && u.username)
  console.log(`[outreach] 📋 ${targets.length} unsent users (of ${parsed.length} total)`)

  if (targets.length === 0) {
    console.log('[outreach] No more users to message')
    return
  }

  const batch = targets.slice(0, dailyLimit)
  console.log(`[outreach] 🚀 Sending to ${batch.length} users today`)

  const client = await getGramClient()
  let successCount = 0
  let failCount = 0

  for (const user of batch) {
    try {
      const msg = getMessage(user)
      await client.sendMessage(user.username!, { message: msg, parseMode: 'md' })

      sent.push(user.id)
      saveJSON(SENT_FILE, sent)
      successCount++

      console.log(`[outreach] ✅ ${successCount}/${batch.length} — @${user.username}`)

      // Rate limit
      const delay = randomDelay()
      console.log(`[outreach] ⏳ Waiting ${Math.round(delay / 1000)}s...`)
      await sleep(delay)
    } catch (err: any) {
      failCount++
      const errMsg = err?.message || String(err)
      console.error(`[outreach] ❌ @${user.username}: ${errMsg}`)

      // If flood wait — stop for today
      if (errMsg.includes('FLOOD') || errMsg.includes('flood')) {
        console.error('[outreach] 🛑 Flood detected, stopping for today')
        break
      }

      // If peer not found — skip user, mark as sent to avoid retry
      if (errMsg.includes('PEER_ID_INVALID') || errMsg.includes('USERNAME_NOT_OCCUPIED')) {
        sent.push(user.id)
        saveJSON(SENT_FILE, sent)
      }

      await sleep(5000)
    }
  }

  await client.disconnect()
  console.log(`[outreach] 📊 Done: ${successCount} sent, ${failCount} failed`)
}

main().catch(console.error)

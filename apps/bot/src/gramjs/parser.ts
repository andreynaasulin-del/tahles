import { Api } from 'telegram'
import { getGramClient } from './client.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PARSED_FILE = path.join(__dirname, '..', '..', 'data', 'parsed_users.json')

interface ParsedUser {
  id: number
  username: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  parsedFrom: string
  parsedAt: string
}

function loadParsed(): ParsedUser[] {
  try {
    return JSON.parse(fs.readFileSync(PARSED_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function saveParsed(users: ParsedUser[]) {
  fs.mkdirSync(path.dirname(PARSED_FILE), { recursive: true })
  fs.writeFileSync(PARSED_FILE, JSON.stringify(users, null, 2))
  console.log(`[parser] 💾 Saved ${users.length} users to ${PARSED_FILE}`)
}

export async function parseChannel(channelUsername: string): Promise<ParsedUser[]> {
  const client = await getGramClient()
  console.log(`[parser] 🔍 Parsing channel: ${channelUsername}`)

  try {
    const entity = await client.getEntity(channelUsername)
    const participants = await client.getParticipants(entity, {
      limit: 500,
    })

    const users: ParsedUser[] = []
    for (const p of participants) {
      if (p.bot) continue // Skip bots
      users.push({
        id: Number(p.id),
        username: p.username || null,
        firstName: p.firstName || null,
        lastName: p.lastName || null,
        phone: p.phone || null,
        parsedFrom: channelUsername,
        parsedAt: new Date().toISOString(),
      })
    }

    console.log(`[parser] ✅ Found ${users.length} users in ${channelUsername}`)
    return users
  } catch (err) {
    console.error(`[parser] ❌ Failed to parse ${channelUsername}:`, err)
    return []
  } finally {
    await client.disconnect()
  }
}

/** Parse multiple channels and merge results */
async function main() {
  const channels = (process.env.TARGET_CHANNELS || '').split(',').filter(Boolean)
  if (channels.length === 0) {
    console.error('[parser] No TARGET_CHANNELS set in .env')
    process.exit(1)
  }

  const existing = loadParsed()
  const existingIds = new Set(existing.map(u => u.id))

  let newCount = 0
  for (const channel of channels) {
    const users = await parseChannel(channel.trim())
    for (const u of users) {
      if (!existingIds.has(u.id)) {
        existing.push(u)
        existingIds.add(u.id)
        newCount++
      }
    }
  }

  saveParsed(existing)
  console.log(`[parser] 🆕 ${newCount} new users added, total: ${existing.length}`)
}

main().catch(console.error)

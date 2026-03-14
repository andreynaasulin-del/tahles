import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SESSION_FILE = path.join(__dirname, '..', '..', 'data', 'session.txt')

export async function getGramClient(): Promise<TelegramClient> {
  const apiId = parseInt(process.env.API_ID || '0')
  const apiHash = process.env.API_HASH || ''

  // Load saved session
  let sessionString = ''
  try {
    sessionString = fs.readFileSync(SESSION_FILE, 'utf-8').trim()
  } catch {}

  const session = new StringSession(sessionString)
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  })

  await client.start({
    phoneNumber: async () => await input.text('📱 Enter phone number: '),
    password: async () => await input.text('🔑 Enter 2FA password: '),
    phoneCode: async () => await input.text('📩 Enter the code you received: '),
    onError: (err) => console.error('[gramjs] Auth error:', err),
  })

  // Save session for next time
  const newSession = client.session.save() as unknown as string
  fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true })
  fs.writeFileSync(SESSION_FILE, newSession)
  console.log('[gramjs] ✅ Authenticated and session saved')

  return client
}

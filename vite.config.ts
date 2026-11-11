import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

async function sendTelegramMessage(
  payload: { name: string; phone: string; message: string },
  auth: { token?: string; chatId?: string },
) {
  if (!auth.token || !auth.chatId) throw new Error('Telegram credentials are not configured')
  const text = ['📬 New Portfolio Message', '', `👤 Name: ${payload.name}`, `📱 Phone: ${payload.phone}`, '', '💬 Message:', payload.message].join('\n')
  const response = await fetch(`https://api.telegram.org/bot${auth.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: auth.chatId, text }),
  })
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { description?: string }
    throw new Error(error.description || 'Failed to send Telegram message')
  }
}

function contactApi(env: Record<string, string>): Plugin {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/contact') {
      next()
      return
    }
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      void (async () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as {
            name?: string
            phone?: string
            message?: string
          }
          if (!body.name?.trim() || !body.phone?.trim() || !body.message?.trim()) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Name, phone, and message are required' }))
            return
          }
          await sendTelegramMessage(
            { name: body.name.trim(), phone: body.phone.trim(), message: body.message.trim() },
            { token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID },
          )
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Failed to send message',
            }),
          )
        }
      })()
    })
  }
  return {
    name: 'contact-api',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), contactApi(env)],
  }
})

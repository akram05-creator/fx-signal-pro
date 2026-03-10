// Vercel serverless function — Telegram Bot proxy
// Evite CORS — browser ne peut pas appeler Telegram direct

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const TELEGRAM_TOKEN = process.env.TG_TOKEN;
  const CHAT_ID        = process.env.TG_CHAT_ID;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram env vars missing' });
  }

  try {
    const { text, parse_mode } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: parse_mode || 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await tgRes.json();
    if (!data.ok) return res.status(400).json({ error: data.description });
    return res.status(200).json({ ok: true, message_id: data.result?.message_id });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

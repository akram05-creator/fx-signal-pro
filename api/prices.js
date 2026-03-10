export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const symbols = 'EUR/USD,GBP/USD,XAU/USD,USD/JPY';
  const key = process.env.TD_KEY;

  try {
    const [priceRes, eodRes] = await Promise.all([
      fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${key}`),
      fetch(`https://api.twelvedata.com/eod?symbol=${encodeURIComponent(symbols)}&apikey=${key}`)
    ]);
    const prices = await priceRes.json();
    const eod    = await eodRes.json();
    res.status(200).json({ prices, eod });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

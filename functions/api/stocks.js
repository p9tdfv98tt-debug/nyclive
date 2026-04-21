const DEFAULT_SYMBOLS = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
const STOOQ_MAP = {
  '^GSPC': '^spx',
  '^DJI': '^dji',
  '^IXIC': '^ixic',
  '^RUT': '^rut',
  '^VIX': '^vix',
};
const TV_MAP = {
  '^GSPC': 'SP:SPX',
  '^DJI': 'TVC:DJI',
  '^IXIC': 'NASDAQ:IXIC',
  '^RUT': 'TVC:RUT',
  '^VIX': 'TVC:VIX',
};
const TV_MAP_REVERSE = Object.fromEntries(Object.entries(TV_MAP).map(([k, v]) => [v, k]));

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseCsvLine(line) {
  return line.split(',').map((x) => (x || '').trim());
}

async function fetchStooqQuote(yahooSymbol) {
  const stooqSymbol = STOOQ_MAP[yahooSymbol] || yahooSymbol.toLowerCase();
  const url = 'https://stooq.com/q/l/?s=' + encodeURIComponent(stooqSymbol) + '&f=sd2t2ohlcv&h&e=csv';
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; nyclive9-stocks-proxy/1.0)' },
    cf: { cacheTtl: 20, cacheEverything: false },
  });
  if (!res.ok) throw new Error('stooq_not_ok');
  const text = await res.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('stooq_bad_csv');
  const row = parseCsvLine(lines[1]);
  const open = toNum(row[3]);
  const close = toNum(row[6]);
  if (close === null) throw new Error('stooq_no_price');

  const change = open !== null ? (close - open) : 0;
  const changePct = open && open !== 0 ? (change / open) * 100 : 0;
  return {
    symbol: yahooSymbol,
    regularMarketPrice: close,
    regularMarketChange: change,
    regularMarketChangePercent: changePct,
  };
}

async function fetchTradingViewQuotes(symbols) {
  const tickers = symbols.map((s) => TV_MAP[s]).filter(Boolean);
  if (!tickers.length) return [];

  const body = JSON.stringify({
    symbols: { tickers: tickers, query: { types: [] } },
    columns: ['close', 'change', 'change_abs'],
  });

  const res = await fetch('https://scanner.tradingview.com/global/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; nyclive9-stocks-proxy/1.0)',
    },
    body: body,
    cf: { cacheTtl: 20, cacheEverything: false },
  });
  if (!res.ok) throw new Error('tv_not_ok');
  const data = await res.json();
  const rows = Array.isArray(data && data.data) ? data.data : [];

  const out = [];
  for (const row of rows) {
    const tvSym = row && row.s;
    const d = Array.isArray(row && row.d) ? row.d : [];
    const yahooSymbol = TV_MAP_REVERSE[tvSym];
    if (!yahooSymbol) continue;
    const close = toNum(d[0]);
    const changePct = toNum(d[1]);
    const changeAbs = toNum(d[2]);
    if (close === null) continue;
    out.push({
      symbol: yahooSymbol,
      regularMarketPrice: close,
      regularMarketChange: changeAbs !== null ? changeAbs : 0,
      regularMarketChangePercent: changePct !== null ? changePct : 0,
    });
  }
  return out;
}

export async function onRequestGet(context) {
  const reqUrl = new URL(context.request.url);
  const symbolsRaw = (reqUrl.searchParams.get('symbols') || DEFAULT_SYMBOLS.join(',')).trim();
  const symbols = symbolsRaw
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s);
  const list = symbols.length ? symbols : DEFAULT_SYMBOLS;

  try {
    const primary = await fetchTradingViewQuotes(list).catch(() => []);
    const bySymbol = new Map(primary.map((q) => [q.symbol, q]));

    const missing = list.filter((sym) => !bySymbol.has(sym));
    if (missing.length) {
      const fallback = await Promise.allSettled(missing.map((sym) => fetchStooqQuote(sym)));
      fallback
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value)
        .forEach((q) => bySymbol.set(q.symbol, q));
    }

    const result = list.map((sym) => bySymbol.get(sym)).filter((q) => !!q);

    if (!result.length) {
      return new Response(JSON.stringify({ error: 'no_quotes' }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    return new Response(JSON.stringify({ quoteResponse: { result } }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=20, s-maxage=20',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'proxy_failed' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}

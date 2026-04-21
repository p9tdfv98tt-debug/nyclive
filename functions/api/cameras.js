/**
 * Cloudflare Pages Function — /api/cameras
 * Proxies the public NYC DOT / NYCTMC webcam list.
 * Cached 5 min at the edge — the list rarely changes.
 */
export async function onRequestGet(context) {
  try {
    const res = await fetch('https://webcams.nyctmc.org/api/cameras', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'nyclive9-cameras-proxy/1.0',
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!res.ok) throw new Error('upstream_' + res.status);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'proxy_failed', message: String(err.message) }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      }
    );
  }
}

/**
 * Cloudflare Pages Function — /api/subway
 * Proxies GoodService.io's free MTA subway status API.
 * Cached 60s at the edge so rapid page loads don't hammer the upstream.
 */
export async function onRequestGet(context) {
  try {
    const res = await fetch('https://goodservice.io/api/routes', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'nyclive9-subway-proxy/1.0',
      },
      cf: { cacheTtl: 60, cacheEverything: false },
    });

    if (!res.ok) {
      throw new Error('upstream_status_' + res.status);
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'proxy_failed', message: String(err.message) }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

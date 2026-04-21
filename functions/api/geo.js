export async function onRequestGet(context) {
  const cf = context && context.request && context.request.cf ? context.request.cf : {};
  const country = String(cf.country || '').toUpperCase();
  const city = String(cf.city || '');
  const region = String(cf.region || '');

  return new Response(
    JSON.stringify({
      country: country || null,
      city: city || null,
      region: region || null,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
}

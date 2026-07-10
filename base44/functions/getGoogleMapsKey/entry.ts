

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ key: Deno.env.get("GOOGLE_MAPS_API_KEY") });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
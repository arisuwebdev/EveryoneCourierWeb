
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { return_url, mode } = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // If mode is 'dashboard', return a login link to the Stripe Express dashboard
    if (mode === 'dashboard' && user.stripe_account_id) {
      const loginLink = await stripe.accounts.createLoginLink(user.stripe_account_id);
      return Response.json({ url: loginLink.url });
    }

    // Create or retrieve a connected account
    let accountId = user.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        settings: {
          payouts: { schedule: { interval: 'daily' } },
        },
      });
      accountId = account.id;
      await base44.auth.updateMe({ stripe_account_id: accountId });
    }

    // Always generate a fresh onboarding/update link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: return_url,
      return_url: return_url,
      type: 'account_onboarding',
    });

    return Response.json({ url: accountLink.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
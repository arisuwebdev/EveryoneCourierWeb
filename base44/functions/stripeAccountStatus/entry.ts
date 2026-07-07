import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!user.stripe_account_id) {
      return Response.json({ connected: false });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const account = await stripe.accounts.retrieve(user.stripe_account_id);

    return Response.json({
      connected: true,
      account_id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        disabled_reason: account.requirements?.disabled_reason || null,
      },
      individual: {
        verification_status: account.individual?.verification?.status || null,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
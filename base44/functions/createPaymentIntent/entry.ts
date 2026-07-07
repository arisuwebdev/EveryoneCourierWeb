import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id, amount_cents, courier_stripe_account_id } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const platformFeeCents = Math.round(amount_cents * 0.10);
    const platformAccountId = Deno.env.get('STRIPE_PLATFORM_ACCOUNT_ID');

    // Always collect full payment upfront to the platform.
    // If a courier connected account is provided, set transfer_data for automatic split.
    const intentParams = {
      amount: amount_cents,
      currency: 'aud',
      metadata: { job_id, customer_id: user.id },
      automatic_payment_methods: { enabled: true },
    };

    if (courier_stripe_account_id) {
      // 10% platform fee stays in your account, 90% is transferred to courier
      intentParams.application_fee_amount = platformFeeCents;
      intentParams.transfer_data = { destination: courier_stripe_account_id };
    } else if (platformAccountId) {
      // No courier yet — full amount goes to platform account
      intentParams.transfer_data = { destination: platformAccountId };
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      split_payment: !!courier_stripe_account_id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
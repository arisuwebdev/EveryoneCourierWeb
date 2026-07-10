
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id, payment_intent_id, courier_stripe_account_id, courier_payout_cents } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Transfer 90% to the courier's connected account
    const transfer = await stripe.transfers.create({
      amount: courier_payout_cents,
      currency: 'aud',
      destination: courier_stripe_account_id,
      source_transaction: payment_intent_id,
      metadata: { job_id },
    });

    return Response.json({ transfer_id: transfer.id, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
# SKDOT V32 — Paystack reconciliation

This release fixes payment matching for orders whose Paystack transaction metadata is missing or incomplete and adds an authenticated **Reconcile Paystack payments** action in the admin page.

## What it does
- Verifies each outstanding order using its exact saved Paystack transaction reference on the server.
- Marks an order Paid only when Paystack returns `success`, the reference matches, the requested amount matches the order total, and the currency is NGN.
- Changes an unpaid order's fulfillment status to `Order confirmed` only after verification succeeds.
- Keeps already-paid orders and order details intact; it does not initiate payments or refunds.
- Applies the same reference-based matching to future payment callbacks and successful Paystack webhooks.

## Deployment and use
1. Deploy this complete ZIP to the existing Netlify site using the site's normal deploy method.
2. Keep the existing Netlify environment variables; do not add secrets to frontend files.
3. Open `/admin.html` and sign in.
4. Tap **Reconcile Paystack payments** once and wait for the summary.
5. Confirm both intended orders show `Payment: Paid`. If either remains unpaid, use the Paystack dashboard to verify its exact reference and amount before fulfilling it.

This release does not promise that the old order will be repaired until the new deployment is live and the reconciliation action is run successfully.

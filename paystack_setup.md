# SKDOT Paystack — Production Payment Setup

The SKDOT checkout uses a server-side Paystack integration. The browser never receives the Paystack secret key. The server recalculates the cart from the same three buyable products shown in the storefront, initializes the transaction, verifies the returned transaction and amount, and accepts a signed `charge.success` webhook. Orders are stored in Netlify Blobs for cross-device tracking.

## Required Netlify environment variables

Set these in the existing SKDOT Netlify project with Functions/runtime scope:

- `PAYSTACK_SECRET_KEY` — your **Paystack Live Secret Key** (`sk_live_...`) once the Paystack account is activated for live payments.
- `ADMIN_PIN` — exactly 5 digits for `admin.html`.
- `ADMIN_SESSION_SECRET` — a long random secret used to sign the admin session cookie.

Never put a Paystack secret key in HTML, browser JavaScript, Git, or chat. Paystack explicitly recommends keeping secret keys server-side.

## Paystack webhook

Set the webhook URL in the Paystack dashboard to:

`https://YOUR-LIVE-SKDOT-DOMAIN/.netlify/functions/paystack-webhook`

The endpoint validates the `x-paystack-signature` HMAC-SHA512 signature and checks the order reference, amount and NGN currency before marking an order paid.

## Production flow

1. Customer checks out.
2. SKDOT server validates the customer and recalculates the order total from the server catalogue.
3. SKDOT server initializes the Paystack transaction.
4. Customer completes payment on Paystack.
5. Paystack redirects to the SKDOT payment callback.
6. SKDOT server verifies the transaction before confirming the order.
7. Paystack `charge.success` webhook provides a second confirmation path.
8. The order is saved in Netlify Blobs and remains available for tracking.

This code package cannot itself activate a Paystack merchant account or supply the merchant's private live key. Live payment operation depends on the existing Paystack account being activated and the live secret being configured in the existing Netlify project.

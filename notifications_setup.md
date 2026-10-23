# SKDOT Production Notifications

V26 includes production customer-activity notifications.

## What is notified

The site records and can email notifications for meaningful customer attempts, including page visits, clicks, booking attempts, checkout attempts, cart/product activity, order tracking attempts, WhatsApp clicks, support/AI requests, support tickets, payment initialization/verification results, Paystack webhook success, and admin order updates.

The notification system deliberately does **not** send passwords, admin PINs, payment card details, CVV/CVC, API keys, or session secrets.

## Required Netlify environment variables

Set these on the production Netlify site:

- `BREVO_API_KEY` — Brevo API key, kept server-side only.
- `BREVO_SENDER_EMAIL` — a verified sender email in Brevo.
- `NOTIFICATION_EMAIL` — primary SKDOT email that should receive notifications.

Optional:

- `NOTIFICATION_EMAILS` — comma-separated list of notification recipients. If set, it takes priority over `NOTIFICATION_EMAIL`.
- `SUPPORT_EMAIL` — existing support recipient; used as a fallback if `NOTIFICATION_EMAIL` is not set.

Live AI support (optional but required for real AI answers):

- `OPENAI_API_KEY` — server-side OpenAI API key.
- `OPENAI_MODEL` — optional; defaults to `gpt-6-luna`.

Existing payment/admin variables remain required:

- `PAYSTACK_SECRET_KEY`
- `ADMIN_PIN` (exactly 5 digits)
- `ADMIN_SESSION_SECRET`

## Important

Email notifications require a valid Brevo account/API key and a verified sender. If those variables are missing, customer events are still stored in Netlify Blobs, but no email can be delivered.

Do not place any of these secrets in HTML, JavaScript, or the ZIP's public files.

# SKDOT Final Deployment Checklist

The visual design is intentionally unchanged from the approved V27 structure/colors.

## Netlify environment variables
Required:
- PAYSTACK_SECRET_KEY
- ADMIN_PIN (exactly 5 digits)
- ADMIN_SESSION_SECRET
- BREVO_API_KEY
- BREVO_SENDER_EMAIL
- NOTIFICATION_EMAIL

Recommended for live AI:
- OPENAI_API_KEY
- OPENAI_MODEL (optional; default: gpt-6-luna)

Optional:
- NOTIFICATION_EMAILS (comma-separated)
- SUPPORT_EMAIL

## Paystack
Configure the Paystack webhook to:
`https://skdot-unisex-salon-1.netlify.app/.netlify/functions/paystack-webhook`

## Shipping
Only enter genuine carrier-issued tracking/waybill numbers in Admin. The website does not manufacture tracking numbers.

## FedEx
Automatic FedEx shipment creation requires the approved FedEx account/API credentials. Until those are supplied, Admin supports legitimate manual entry of the carrier-issued tracking/AWB number.

## AI support
Without OPENAI_API_KEY, the site uses a safe task-aware fallback. With OPENAI_API_KEY, it uses the OpenAI Responses API and session conversation history.

## Notifications
Customer activity is stored and sent through Brevo when configured. The site deliberately excludes passwords, PINs, secrets, authorization tokens and payment-card security data from notifications.

## Sendbox status
The Sendbox webhook is intentionally disabled (503) until Sendbox supplies its webhook signature/authentication contract. Do not register it yet. Live shipping rates, booking, labels and tracking require approved Sendbox API credentials and tested server-side integration.

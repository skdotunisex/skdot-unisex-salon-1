# SKDOT — Sendbox Integration Status (V30)

Production website: `https://skdot-unisex-salon-1.netlify.app/`

Proposed webhook URL, **not yet ready to register**:
`https://skdot-unisex-salon-1.netlify.app/.netlify/functions/sendbox-webhook`

## Application details

- Name: `SKDOT UNISEX SALON E-COMMERCE`
- Description: `Official SKDOT UNISEX SALON AND FASHION STORES e-commerce integration for customer orders, shipping rates, delivery requests, shipment tracking and order updates.`
- Website: `https://skdot-unisex-salon-1.netlify.app/`
- Logo: optional
- Privacy Policy / Terms & Conditions: add the public policy URLs once verified.

## Do not submit the webhook yet

The current webhook endpoint intentionally returns `503 setup_required`. It must remain that way until Sendbox provides the official webhook signature/authentication rules and we implement and test verification. Do not register a webhook that accepts unverified events.

## API access request

Request STAGING and PRODUCTION API access from `tech@topship.africa` for Topship, or use Sendbox's own official developer support contact for Sendbox credentials. Do not reuse credentials between providers. Ask Sendbox for:

1. API documentation and staging/production credentials.
2. Quote/rate endpoint and required pickup/drop-off address formats.
3. Shipment booking/waybill endpoint and payment requirements.
4. Tracking endpoint and status mapping.
5. Webhook event list, signature headers, signing algorithm and retry rules.

Only after these details arrive should rates, booking, tracking and authenticated webhooks be wired into checkout. Never put provider secrets in public HTML or browser JavaScript.

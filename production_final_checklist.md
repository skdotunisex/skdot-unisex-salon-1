# SKDOT V26 Production Final Checklist

## Required server variables
- PAYSTACK_SECRET_KEY
- ADMIN_PIN
- ADMIN_SESSION_SECRET
- BREVO_API_KEY
- BREVO_SENDER_EMAIL
- NOTIFICATION_EMAIL (or NOTIFICATION_EMAILS)

## Included
- Existing SKDOT blue/white/black visual direction preserved
- Multi-page site
- Shop, product pages, cart and checkout
- Paystack server-side initialization, verification and webhook validation
- Secure 5-digit admin PIN and session
- Order storage and customer tracking
- Carrier/tracking workflow with official carrier URLs
- Booking and WhatsApp flow
- Customer support ticket storage
- Customer activity notification endpoint
- Payment/order/admin notifications

## Carrier reality
A carrier tracking number must be issued by the actual carrier. The website must never invent one. Automatic shipment creation/label generation requires the carrier account/API credentials and is not claimed until those credentials are configured.

## Notification reality
The website sends email notifications for configured customer attempts/events through Brevo. Delivery depends on valid Brevo credentials, a verified sender, and a reachable recipient mailbox.

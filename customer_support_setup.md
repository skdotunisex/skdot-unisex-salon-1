# SKDOT Customer Support — Production AI

The support assistant uses the OpenAI Responses API when configured and keeps a short conversation history in the visitor session so follow-up questions are understood. If AI is unavailable, a task-aware local fallback still explains ordering, booking, home service, payment and tracking correctly.

## Required for live AI
- `OPENAI_API_KEY` — OpenAI API key, server-side only.
- `OPENAI_MODEL` — optional model name. If omitted, the site uses `gpt-6-luna`; choose a model available to your API account if your account differs.

The website never exposes the API key to the browser.

## What the assistant handles
- How to place an order
- Existing-order tracking
- Booking and appointment requests
- Home service
- Products and published prices
- Paystack/payment questions
- Complaints and human escalation
- Website navigation and support

Do not ask customers for card PINs, CVV/CVC, full card numbers, passwords, admin PINs or API secrets.

## Notifications
Support-open, support-message, support-ticket and other customer activity events are sent through the site's notification pipeline. Configure Brevo as described in `NOTIFICATIONS_SETUP.md`.


## Persistent customer conversations and admin inbox
- `support-chat.mts` provides the authenticated admin inbox and phone-verified customer ticket conversations.
- Messages are stored in Netlify Blobs under `support-messages/<ticket-id>/`. Ticket status supports `open`, `in_progress`, `waiting_customer`, and `resolved`.
- Opening a conversation updates last-active timestamps and marks the other side's messages read. The customer page refreshes about every 12 seconds; the admin inbox refreshes every 20 seconds. These are near-real-time polling updates, not websocket presence.
- The admin inbox is protected by the existing `skdot_admin` session and `ADMIN_SESSION_SECRET`. Customers must provide their support ticket reference and the same phone number used to open the ticket.
- AI support remains guidance, not a guarantee that every issue can be automatically resolved. Refunds, payment disputes, and sensitive account issues require human review.

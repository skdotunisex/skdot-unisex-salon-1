# SKDOT Final Launch Handoff

## Deployment target

Create the new Netlify project/team requested by the owner and deploy this package as the production website.

The package is configured for Netlify Functions and publishes from the project root.

## Required server environment variables

Configure these in Netlify before accepting production payments:

- `PAYSTACK_SECRET_KEY`
- `ADMIN_PIN`
- `ADMIN_SESSION_SECRET`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `NOTIFICATION_EMAIL`

Recommended:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default used by the support function if omitted)
- `NOTIFICATION_EMAILS`
- `SUPPORT_EMAIL`

Do not put any of these values in frontend files.

## Shipping integrations

### Sendbox

The package includes:

`/.netlify/functions/sendbox-webhook`

After deployment, use the final site URL to create the Sendbox application and set the webhook URL to:

`https://YOUR-FINAL-DOMAIN/.netlify/functions/sendbox-webhook`

Actual Sendbox API credentials and current authentication details must come from Sendbox before live rate/booking calls are enabled.

### Topship

Topship production API access is pending from Topship technical support. Do not invent credentials or endpoint/authentication values.

## Paystack

The existing Paystack server functions remain in place. Configure the live secret in Netlify and verify the Paystack account is activated for live transactions before real customer payments.

## Final production test

1. Open the homepage on mobile.
2. Open Shop.
3. Add a real product to cart.
4. Open Checkout.
5. Enter customer and delivery details.
6. Confirm shipping information.
7. Initialize Paystack payment.
8. Complete a controlled real-money test only after the Paystack live account is ready.
9. Verify payment server-side.
10. Confirm the order appears in Admin.
11. Confirm customer-attempt notifications arrive.
12. Create/receive a genuine carrier tracking number before marking an order Shipped.
13. Verify Track Order displays the genuine carrier information.
14. Test WhatsApp, booking, home service and customer support.

This handoff intentionally does not claim that Topship or Sendbox production API access is active until the respective providers issue valid credentials.


## V30 audit update
The customer shop now renders one unified catalogue with 46 product listings. Only the three products with fixed, verified listing prices are enabled for checkout. The remaining items are price-on-request and route customers to WhatsApp until SKDOT confirms retail prices and stock. Sendbox remains disabled pending provider API and webhook authentication details.

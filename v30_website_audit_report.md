# SKDOT V30 Website Audit Report

## Confirmed issues found in the V29 package and corrected in V30

1. **Shop catalogue appeared incomplete:** the shop showed only three fixed-price items at the top and the other products in a separate section far below. The customer catalogue is now unified in one grid with category filters. Existing packaged product imagery is registered as 46 listings. Prices that have not been confirmed remain `Price on request`; they are not checkout-enabled.
2. **Price text overflow:** `Ask for price` was too long for the narrow price area on mobile product cards. Quote cards now display the compact `Get quote` label, with responsive wrapping and card layout fixes.
3. **Low-contrast support headings:** the support hero and support-promise headings inherited dark navy text on dark navy backgrounds. They now use a high-contrast ivory heading colour.
4. **Unverified storefront illustrations:** two illustrative storefront renders contained invented signage such as a fake street address, hours and website. They have been removed from the Contact and Salon Interior pages and from the media gallery. The Contact page now uses an owner-supplied salon photo instead.
5. **Incorrect opening hours:** the old page grouped Tuesday with Wednesday–Friday at 8:30 AM. Contact and FAQ now match the Google Business Profile: Monday–Tuesday 8:00 AM–9:00 PM; Wednesday–Friday 8:30 AM–9:00 PM; Saturday 9:00 AM–10:00 PM; Sunday 12:00 PM–10:00 PM.
6. **Stale business structured data:** the home page's structured-data URL pointed to the old Netlify site and omitted the address/hours. It now uses the current site URL, confirmed Ilale/Owo/Ondo address, phone, email, Instagram and opening hours.
7. **Sendbox webhook was not secure enough to register:** the previous receiver accepted unauthenticated POST requests. V30 fails closed with HTTP 503 until Sendbox provides its signature/authentication requirements and they are implemented and tested. Do not register this endpoint yet.
8. **Cache refresh:** stylesheet references now use `style.css?v=30` to ensure mobile browsers fetch the fixes.

## Validation performed

- JavaScript syntax checks pass for `commerce.js`, `user_catalog.js` and `support.js`.
- All 42 HTML pages were checked for local file references; zero missing references were found.
- All 46 catalogue item image paths exist.
- Home page JSON-LD parses as valid JSON.
- Netlify deployment still requires a manual upload of this V30 ZIP to `skdot-unisex-salon-1`.

## Remaining items that require account/provider configuration

- Paystack: set the production secret key in Netlify, configure its webhook, and run a real low-value payment test. Only three fixed-price products are currently allowed through checkout; do not invent prices for the other listings.
- Email notifications: configure Brevo API key, verified sender and recipient variables in Netlify, then test delivery.
- Sendbox: obtain official API credentials and documentation; rates, shipment creation, tracking and authenticated webhook are not yet live.
- Booking: the website prepares an appointment request and hands it to WhatsApp; it is not a confirmed calendar booking until SKDOT replies.
- Netlify toolbar visible in private screenshots is a platform overlay, not part of the site source. Make the project public after the production review so customers do not see private-project controls.

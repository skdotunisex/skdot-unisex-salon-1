# SKDOT UNISEX SALON — Commerce Upgrade

This package is built directly on the supplied original SKDOT website. The original visual system, service pages, policies, assets and navigation remain the foundation.

## Added customer flow
Home → Shop → Product → Cart → Checkout → Order number → Track Order

## Added management flow
admin.html shows orders stored in the current browser and allows status/tracking updates.

## Payment status
No live payment gateway is connected in this zero-cost build. Checkout records the order and lets the customer request payment instructions/link through WhatsApp. Do not treat the local order storage as a production database.

## Shipping
Delivery/pickup details and tracking fields are included. Sendbox webhook receiving is prepared in `/.netlify/functions/sendbox-webhook`; live carrier rate/booking calls remain gated on provider credentials and current API contracts.

## Media
The successfully supplied salon videos are included under `media/`. The pending video was not included.

## Deployment
Upload the complete folder contents to Netlify Drop. Keep all files and folders together.


V5 PRODUCT CATALOG ADDITIONS
- Added 10 newly uploaded SKDOT product/category images under assets/catalog-new/.
- Added them to Shop as browsable catalog cards using the existing SKDOT visual system.
- These new cards use WhatsApp for price/availability requests rather than inventing prices.
- Existing priced products and cart/checkout flow remain unchanged.


V6 NEW UPLOADS
- Added 3 new product/tool images to the Shop catalog.
- Added 3 new braid/cornrow images as clearly labeled style references.
- No prices were invented for newly uploaded items; WhatsApp price/availability requests are used.


V9 PREMIUM HOMEPAGE + SHOP UPDATE
- Redesigned the home page around a more realistic, welcoming SKDOT customer journey.
- Added clearer services, shop categories, salon experience, gallery, home service, booking and location sections.
- Replaced the mobile bottom bar with five bold, solid-icon destinations: Home, Services, Shop, WhatsApp and Book.
- Mobile navigation is injected consistently across pages by script.js.
- Added a small starter catalog of lower-priced salon/beauty items and updated the clipper to the current verified marketplace listing snapshot used during this build.
- Customer-facing shop contains no Temu branding or outbound Temu shopping links.
- Product-source prices can change; SKDOT should confirm stock, shipping and final retail price before accepting fulfillment.
- Added original SKDOT-ready product visuals for the T9-style trimmer and press-on nail starter items; these are original visuals, not copied marketplace photography.

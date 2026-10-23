SKDOT UNISEX SALON — CATEGORY IMAGE MASTER
============================================
The latest supplied category-board image was processed into 12 separate,
high-quality category assets:

Haircuts
Hairstyles (Braids & Weaves & Wigs)
Dreadlocks & Twists
Nails (Acrylic & Gel)
Manicure
Pedicure
Makeup
Lashes
Hair Coloring
Products
Tools & Equipment
Fashion

The board itself is NOT repeatedly placed across the website. Each category
gets its own dedicated screen and one clean crop from the supplied source.

No exact duplicate category assets remain. Local HTML and image references
were validated before packaging.

The existing SKDOT deep-navy / ivory-white / black / champagne-gold design
system is retained.


LATEST CUSTOMER-SUPPLIED IMAGE UPDATE
======================================
Added six new supplied visuals without upscaling:
- skdot-braids-cornrows-01.jpg -> Braids / Cornrows
- skdot-braids-styles-02.jpg -> Hairstyles / Protective styles
- skdot-lashes-guide-01.jpg -> Lashes
- skdot-lip-beauty-01.jpg -> Makeup / Lip beauty
- skdot-tooth-gems-01.jpg -> dedicated Tooth Gems screen
- skdot-nail-art-tools-01.jpg -> Nail Art Studio

The visuals are distributed across dedicated screens rather than stacked
into one page. Original dimensions are preserved; no artificial sharpening
or upscaling was applied.


V5 PRODUCT CATALOG ADDITIONS
- Added 10 newly uploaded SKDOT product/category images under assets/catalog-new/.
- Added them to Shop as browsable catalog cards using the existing SKDOT visual system.
- These new cards use WhatsApp for price/availability requests rather than inventing prices.
- Existing priced products and cart/checkout flow remain unchanged.


V6 NEW UPLOADS
- Added 3 new product/tool images to the Shop catalog.
- Added 3 new braid/cornrow images as clearly labeled style references.
- No prices were invented for newly uploaded items; WhatsApp price/availability requests are used.


V33 APPOINTMENT, CHAT AND NOTIFICATION UPDATE
- Adds saved appointment requests with generated request codes and server-side date/time validation.
- Appointment times are limited to 08:00–20:00 Nigeria time; midnight is rejected. Requests remain pending until admin approval.
- Adds admin appointment review, approval/decline/reschedule decisions, customer chat replies, and a website activity/notification panel.
- Adds request-chat.html so customers can check request status and message SKDOT using their request code and booking phone number.
- Adds the additional SKDOT-supplied product photos from assets/catalog-new to the unified shop catalogue. Unconfirmed products remain price-on-request and are not enabled for Paystack checkout.
- Existing Paystack checkout, payment verification/reconciliation, orders, user-uploaded product assets, salon media and existing styling are preserved.
- Deployment note: upload the entire ZIP to the EXISTING production site. Then test a booking and check the admin dashboard. Netlify environment variables must remain configured. The Netlify Blobs store is used for persistent appointment/chat/event records.

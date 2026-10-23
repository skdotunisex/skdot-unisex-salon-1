# SKDOT Admin & Store Management Upgrade

## Included in this package
- Secure admin-only product editor using the existing 5-digit admin login/session cookie.
- Persistent site-wide Netlify Blobs storage for product overrides, uploaded product images and gallery images.
- Add/edit/hide/show/delete product controls; product deletion removes the uploaded product image where applicable.
- Product image replacement cleans up the previous uploaded image.
- Admin gallery image upload/delete; uploaded gallery photos render in the public Gallery page.
- Public shop reads the same saved product overrides as product-detail pages, so the selected product's image/name/category/description stay paired.
- Existing 3 checkout-verified products retain their fixed checkout pricing. New catalogue products remain price-on-request until payment validation is explicitly updated.
- Support inbox adds assignment, private admin notes, customer/admin typing indicators, active timestamps, persistent replies, and sent/delivered/read receipts.
- Support-ticket creation now returns an error instead of falsely claiming success when storage fails.
- Corrected several obvious mislabelled packaged image/product assignments found during visual audit.

## Image upload rules
- JPG, PNG, WebP or AVIF; maximum 4 MB per image because Netlify synchronous function requests have a finite payload limit.
- Use product images that clearly depict the selected product. The manager previews each image before saving.
- Product and gallery uploads are saved to site-wide Netlify Blobs, so they persist across normal redeployments and are not stored only in a phone browser.

## Before production publication
1. Deploy the complete folder as one deploy, preserving all existing `netlify/functions` files.
2. Confirm `ADMIN_PIN` and `ADMIN_SESSION_SECRET` are set in Netlify with Functions/Runtime scope. Do not paste either secret into chat.
3. Test admin login, add a temporary product with a matching image, edit its description, hide/show it, then delete it. Confirm changes on a separate browser/device.
4. Upload and delete a temporary gallery photo.
5. Test a customer support ticket end-to-end: customer reply, admin reply, typing indicator, read receipt, assignment, private note and resolved/reopen flow.
6. Test existing appointment and order functions plus Paystack payment verification before calling the release production-ready.

## Important limits
- Existing static image files are part of the deploy; the admin manager can remove catalogue items from the storefront, but cannot physically delete files from a previously published deploy's static assets. Uploaded product/gallery images are stored in Blobs and can be deleted by the admin.
- No system can honestly promise zero errors. This package is prepared with syntax/reference checks; live behavior still requires a successful Netlify deploy and real account/provider tests.

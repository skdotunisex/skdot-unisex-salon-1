import { json, getStoreSafe, saveOrder } from "./_shared.mts";
import { requireAdmin } from "./_admin-shared.mts";
import { notifyAdmin } from "./_notifications.mts";

export default async request => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const secret = Netlify.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) return json({ error: "PAYSTACK_SECRET_KEY is not configured on the server." }, 500);

  const store = getStoreSafe();
  const { blobs } = await store.list({ prefix: "orders/" });
  const results = { checked: 0, newlyPaid: 0, alreadyPaid: 0, stillPending: 0, failed: 0, errors: [] };

  for (const blob of blobs) {
    const order = await store.get(blob.key, { type: "json", consistency: "strong" });
    if (!order || !order.paymentReference) continue;
    if (order.paymentStatus === "Paid") { results.alreadyPaid++; continue; }
    results.checked++;
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(order.paymentReference)}`, {
        headers: { Authorization: `Bearer ${secret}` }
      });
      const payload = await response.json().catch(() => ({}));
      const tx = payload?.data;
      if (!response.ok || !payload?.status || !tx || tx.reference !== order.paymentReference) {
        results.failed++;
        results.errors.push({ orderId: order.id, reason: payload?.message || "Paystack could not verify the saved reference." });
        continue;
      }
      const requestedAmount = Number(tx.requested_amount ?? tx.amount);
      const isPaid = tx.status === "success"
        && requestedAmount === Math.round(Number(order.total) * 100)
        && String(tx.currency || "NGN").toUpperCase() === "NGN";
      if (!isPaid) { results.stillPending++; continue; }
      order.paymentStatus = "Paid";
      if (order.status === "Awaiting payment") order.status = "Order confirmed";
      order.paidAt = order.paidAt || tx.paid_at || new Date().toISOString();
      order.paystackTransactionId = tx.id;
      await saveOrder(order);
      results.newlyPaid++;
      await notifyAdmin("payment_reconciled", {
        order_id: order.id,
        reference: order.paymentReference,
        transaction_id: tx.id,
        amount: order.total,
        customer_email: order.customer?.customer_email || ""
      }, request);
    } catch (error) {
      results.failed++;
      results.errors.push({ orderId: order.id, reason: "Verification request failed; retry reconciliation." });
    }
  }
  return json({ ok: true, results });
};

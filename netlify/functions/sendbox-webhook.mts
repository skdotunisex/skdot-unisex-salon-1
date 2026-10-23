import { json } from './_shared.mts';

/**
 * Sendbox webhook placeholder. This endpoint intentionally fails closed until
 * Sendbox supplies the production signature/authentication contract and that
 * contract is implemented and tested. Do not register this endpoint in Sendbox yet.
 */
export default async function handler(request: Request) {
  if (request.method === 'GET') {
    return json({
      ok: false,
      service: 'SKDOT Sendbox webhook',
      status: 'setup_required',
      message: 'Waiting for Sendbox webhook authentication/signature requirements.'
    }, 503);
  }
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }
  return json({
    ok: false,
    error: 'Sendbox webhook is not enabled yet. Configure signature verification from Sendbox documentation before registering this endpoint.'
  }, 503);
}

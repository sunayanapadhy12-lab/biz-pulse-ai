/**
 * PayPal Sandbox REST API Client
 * Secure server-side helper for OAuth2 authentication, order management,
 * capture verification, and webhook signature verification.
 */

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

interface TokenCache {
  token: string | null;
  expiresAt: number;
}

const tokenCache: TokenCache = {
  token: null,
  expiresAt: 0,
};

export function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing PayPal credentials: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be configured in .env'
    );
  }

  return { clientId, clientSecret, webhookId };
}

/**
 * Obtain an OAuth2 access token using client_credentials grant.
 * Caches the token in-memory until expiration.
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  const { clientId, clientSecret } = getPayPalCredentials();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal OAuth token failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache.token = data.access_token;
  tokenCache.expiresAt = now + data.expires_in * 1000;

  return tokenCache.token;
}

export interface CreateOrderParams {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  customerName?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

/**
 * Create a PayPal order strictly tied to an invoice.
 * Server specifies the amount and custom_id (invoiceId) to prevent frontend tampering.
 */
export async function createPayPalOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken();

  const formattedAmount = Number(params.amount).toFixed(2);
  const currencyCode = params.currency || 'USD';

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.invoiceId,
        custom_id: params.invoiceId,
        description: `Biz Pulse AI Invoice #${params.invoiceNumber}`,
        invoice_id: params.invoiceNumber,
        amount: {
          currency_code: currencyCode,
          value: formattedAmount,
        },
      },
    ],
    application_context: {
      brand_name: 'Biz Pulse AI (Pulse Cafe)',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`PayPal createOrder failed (${response.status}): ${errorDetails}`);
  }

  return (await response.json()) as PayPalOrderResponse;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  custom_id?: string;
  purchase_units?: Array<{
    reference_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        custom_id?: string;
        seller_receivable_breakdown?: {
          gross_amount: { currency_code: string; value: string };
          paypal_fee?: { currency_code: string; value: string };
          net_amount?: { currency_code: string; value: string };
        };
      }>;
    };
  }>;
}

/**
 * Capture an approved PayPal order.
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`PayPal captureOrder failed (${response.status}): ${errorDetails}`);
  }

  return (await response.json()) as PayPalCaptureResponse;
}

/**
 * Get details of a PayPal order to inspect intent, amounts, custom_id, and status.
 */
export async function getPayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`PayPal getOrder failed (${response.status}): ${errorDetails}`);
  }

  return await response.json();
}

export interface WebhookHeaders {
  'paypal-transmission-id'?: string;
  'paypal-transmission-time'?: string;
  'paypal-cert-url'?: string;
  'paypal-auth-algo'?: string;
  'paypal-transmission-sig'?: string;
  [key: string]: string | undefined;
}

/**
 * Verify cryptographic webhook signature with PayPal.
 */
export async function verifyWebhookSignature(
  headers: WebhookHeaders,
  webhookEvent: any
): Promise<boolean> {
  const { webhookId } = getPayPalCredentials();

  if (!webhookId) {
    console.warn('[PayPal Webhook] PAYPAL_WEBHOOK_ID not set; signature verification skipped in dev mode');
    return true;
  }

  const accessToken = await getAccessToken();

  const payload = {
    transmission_id: headers['paypal-transmission-id'] || '',
    transmission_time: headers['paypal-transmission-time'] || '',
    cert_url: headers['paypal-cert-url'] || '',
    auth_algo: headers['paypal-auth-algo'] || '',
    transmission_sig: headers['paypal-transmission-sig'] || '',
    webhook_id: webhookId,
    webhook_event: webhookEvent,
  };

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[PayPal Webhook] Verification request failed (${response.status}): ${errorText}`);
    return false;
  }

  const result = (await response.json()) as { verification_status: string };
  return result.verification_status === 'SUCCESS';
}


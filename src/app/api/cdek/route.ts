import { NextRequest, NextResponse } from 'next/server';

const CDEK_ACCOUNT = process.env.CDEK_ACCOUNT!;
const CDEK_SECURE_PASSWORD = process.env.CDEK_SECURE_PASSWORD!;
const CDEK_BASE_URL = process.env.CDEK_BASE_URL ?? 'https://api.edu.cdek.ru';

let cachedToken = '';
let tokenExpiry = 0;

async function getCdekToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CDEK_ACCOUNT);
  params.append('client_secret', CDEK_SECURE_PASSWORD);

  const response = await fetch(`${CDEK_BASE_URL}/v2/oauth/token?parameters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ошибка авторизации СДЭК: ${errText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

// Handles direct calls to /api/cdek?params (widget passes CDEK API query params directly)
async function proxyRequest(req: NextRequest) {
  try {
    const token = await getCdekToken();
    const url = new URL(req.url);

    // Forward all query params to /v2/deliverypoints by default
    const targetUrl = `${CDEK_BASE_URL}/v2/deliverypoints${url.search}`;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': req.headers.get('content-type') || 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = await req.text();
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text; }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('CDEK Root Proxy Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return proxyRequest(req); }
export async function POST(req: NextRequest) { return proxyRequest(req); }

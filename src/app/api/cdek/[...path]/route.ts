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

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const token = await getCdekToken();
    const { path } = await params;

    // Rebuild CDEK API path from catch-all segments, preserving query string
    const cdekPath = '/' + path.join('/');
    const reqUrl = new URL(req.url);
    const targetUrl = `${CDEK_BASE_URL}${cdekPath}${reqUrl.search}`;

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
    console.error('CDEK Proxy Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }

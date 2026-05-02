import { NextRequest, NextResponse } from 'next/server';

const CDEK_ACCOUNT = 'wqGwiQx0gg8mLtiEKsUinjVSICCjTTEP';
const CDEK_SECURE_PASSWORD = 'RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5';
const CDEK_BASE_URL = 'https://api.edu.cdek.ru'; // Тестовая среда

let cachedToken = '';
let tokenExpiry = 0;

// Функция получения токена СДЭК
async function getCdekToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CDEK_ACCOUNT);
  params.append('client_secret', CDEK_SECURE_PASSWORD);

  // Исправлен URL: убрано ошибочное ?parameters
  const response = await fetch(`${CDEK_BASE_URL}/v2/oauth/token`, {
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

// Проксирование запросов к API СДЭК
async function proxyRequest(req: NextRequest) {
  try {
    const token = await getCdekToken();
    const url = new URL(req.url);
    
    const action = url.searchParams.get('action');
    url.searchParams.delete('action');
    
    // Маршрутизация запросов виджета
    let targetPath = '/v2/deliverypoints'; 
    if (action === 'offices') {
      targetPath = '/v2/deliverypoints';
    } else if (action === 'calculate') {
      targetPath = '/v2/calculator/tariff';
    }

    const queryString = url.searchParams.toString();
    const targetUrl = `${CDEK_BASE_URL}${targetPath}${queryString ? `?${queryString}` : ''}`;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': req.headers.get('content-type') || 'application/json',
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = await req.text();
    }

    const response = await fetch(targetUrl, fetchOptions);
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = responseText;
    }
    
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('CDEK Proxy Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return proxyRequest(req); }
export async function POST(req: NextRequest) { return proxyRequest(req); }

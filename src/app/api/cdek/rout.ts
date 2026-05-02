import { NextRequest, NextResponse } from 'next/server';

const CDEK_ACCOUNT = 'wqGwiQx0gg8mLtiEKsUinjVSICCjTTEP';
const CDEK_SECURE_PASSWORD = 'RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5';
const CDEK_BASE_URL = 'https://api.edu.cdek.ru'; // Тестовая песочница

let cachedToken = '';
let tokenExpiry = 0;

// Получаем временный токен
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
  
  if (!response.ok) throw new Error('Ошибка авторизации СДЭК');
  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

// Универсальный обработчик запросов от виджета
async function handleRequest(req: NextRequest) {
  try {
    const token = await getCdekToken();
    const url = new URL(req.url);
    
    // Виджет 3.0 передает нужный метод API в параметре isdek_action
    let targetPath = url.searchParams.get('isdek_action');
    url.searchParams.delete('isdek_action'); // удаляем, чтобы не отправлять лишнее в сам СДЭК
    
    const queryString = url.searchParams.toString();
    const targetUrl = `${CDEK_BASE_URL}/${targetPath || ''}${queryString ? `?${queryString}` : ''}`;

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
    const contentType = response.headers.get("content-type");
    
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('CDEK API Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return handleRequest(req); }
export async function POST(req: NextRequest) { return handleRequest(req); }

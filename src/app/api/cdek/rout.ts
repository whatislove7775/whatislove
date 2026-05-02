import { NextRequest, NextResponse } from 'next/server';

// Тестовые доступы СДЭК из твоей документации
const CDEK_ACCOUNT = 'wqGwiQx0gg8mLtiEKsUinjVSICCjTTEP';
const CDEK_SECURE_PASSWORD = 'RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5';
const CDEK_BASE_URL = 'https://api.edu.cdek.ru'; // Тестовая среда

// Временный кэш для токена
let cachedToken = '';
let tokenExpiry = 0;

// Функция получения токена авторизации
async function getCdekToken() {
  // Если токен еще жив, используем его
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

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
    throw new Error('Не удалось получить токен СДЭК');
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Токен живет час, обновляем за 5 минут до смерти
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

// Универсальный обработчик (прокси) для любых запросов от виджета
async function handleRequest(req: NextRequest, pathArray: string[]) {
  try {
    const token = await getCdekToken();
    const path = pathArray.join('/'); // Собираем путь (например, v2/deliverypoints)
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    
    // Формируем финальный URL к СДЭКу
    const targetUrl = `${CDEK_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': req.headers.get('content-type') || 'application/json',
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = await req.text();
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    // Пытаемся распарсить JSON, если он есть
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('CDEK API Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера API' }, { status: 500 });
  }
}

// Экспортируем методы, которые виджет может использовать
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params.path);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params.path);
}

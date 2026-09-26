# «Тиша» — выбор ИИ-провайдера

Тиша работает через один из трёх провайдеров. Выбор — переменная `AI_PROVIDER` в `.env` на сервере.
Системный промпт, протокол безопасности (кризисные телефоны), скрытие email/телефонов перед отправкой,
согласие пользователя и дневной лимит (`AI_DAILY_LIMIT`, по умолчанию 40 сообщений) — одинаковые для всех.
Если провайдер не настроен, в приложении показывается «Тиша скоро появится».

| `AI_PROVIDER`        | Что это                                   | Цена                                       |
|----------------------|-------------------------------------------|--------------------------------------------|
| `anthropic` (по умолч.) | Claude (Anthropic)                     | платно, из России нужен зарубежный платёж  |
| `gigachat`           | GigaChat (Сбер)                           | Freemium для физлиц: 1 000 000 токенов в год бесплатно |
| `openai_compatible`  | OpenRouter, YandexGPT, Ollama и др.       | зависит от сервиса; у OpenRouter есть бесплатные модели |

Код: `apps/api/apps/chat/ai_providers.py`, настройки — `apps/api/apps/chat/conf.py`.

---

## Вариант 1. GigaChat (рекомендуется — бесплатно и работает с российских серверов)

### 1. Получить ключ

1. Зайдите на **developers.sber.ru** → «Войти» (по Сбер ID).
2. Откройте **Личное пространство** → «Создать проект» → **GigaChat API**.
3. Выберите тариф **Freemium** для физических лиц (скоуп `GIGACHAT_API_PERS`).
   Сейчас это 1 000 000 бесплатных токенов в год; все запросы идут в модели второго поколения
   (`GigaChat-2`, `GigaChat-2-Pro`, `GigaChat-2-Max`). Во Freemium ответы генерируются в один поток —
   если два человека пишут Тише одновременно, второй может получить «Тиша сейчас не может ответить»
   (сообщение не списывается с лимита).
4. В настройках проекта нажмите **«Получить ключ»** и скопируйте **Authorization key** (ключ авторизации).
   Он показывается один раз — сохраните его. Это base64 от `Client ID:Client Secret`.

> Для ИП/юрлиц — скоуп `GIGACHAT_API_B2B` (пакеты токенов) или `GIGACHAT_API_CORP` (оплата по факту).

### 2. Установить сертификат Минцифры

API GigaChat использует TLS-сертификаты российского удостоверяющего центра (НУЦ Минцифры),
которых нет в стандартных списках доверия. Без сертификата будет ошибка проверки TLS.
**Не отключайте проверку сертификатов** — просто добавьте корневой сертификат:

```bash
# на сервере, в папке проекта
mkdir -p deploy/certs
curl -fsSL https://gu-st.ru/content/Other/doc/russian_trusted_root_ca.cer \
  -o deploy/certs/russian_trusted_root_ca.cer
# сертификат уже в формате PEM; проверить:
openssl x509 -in deploy/certs/russian_trusted_root_ca.cer -noout -subject
# subject=C = RU, O = "The Ministry of Digital Development and Communications", CN = Russian Trusted Root CA
```

Если `curl` ругается на сертификат самого сайта или ссылка не открывается — скачайте «Корневой сертификат» на **gosuslugi.ru/crt** и положите его в
`deploy/certs/russian_trusted_root_ca.cer`. Если файл в формате DER (бинарный), переведите в PEM:
`openssl x509 -inform der -in файл.cer -out deploy/certs/russian_trusted_root_ca.cer`.

Папка `deploy/certs` подключена в контейнер `api` как `/app/certs` (только чтение, см. `docker-compose.yml`).
Системные сертификаты при этом продолжают работать — бандл только добавляется к ним.

### 3. Прописать переменные в `.env` на сервере

```env
AI_PROVIDER=gigachat
GIGACHAT_AUTH_KEY=ваш_Authorization_key
GIGACHAT_CA_BUNDLE=/app/certs/russian_trusted_root_ca.cer
# необязательно:
#GIGACHAT_SCOPE=GIGACHAT_API_PERS      # физлица (по умолчанию)
#GIGACHAT_MODEL=GigaChat-2             # GigaChat-2 (быстрая, по умолчанию) | GigaChat-2-Pro | GigaChat-2-Max
#AI_DAILY_LIMIT=40
```

Вместо `GIGACHAT_AUTH_KEY` можно задать пару `GIGACHAT_CLIENT_ID` + `GIGACHAT_CLIENT_SECRET`.

Адреса по умолчанию (менять не нужно):
- авторизация: `GIGACHAT_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
- API: `GIGACHAT_BASE_URL=https://api.giga.chat/v1`
  (старый адрес `https://gigachat.devices.sberbank.ru/api/v1` тоже можно указать здесь).

### 4. Применить

```bash
docker compose up -d api   # пересоздаст контейнер с новыми переменными
```

Проверка: в приложении клиента откройте «Тишу» и отправьте сообщение. В логах `api` при ошибке будет
только тип ошибки (например `chat.ai: provider error ProviderError`) — текст переписки не логируется.

Как это работает: сервер получает access token по OAuth (client credentials, заголовки `Authorization: Basic …`
и `RqUID`), кэширует его на ~30 минут и запрашивает `POST /chat/completions` со `stream: true` (SSE).
Если GigaChat заблокировал ответ фильтром (`finish_reason: blacklist`), пользователь видит мягкий
ответ-заглушку с номером 112 и предложением записаться к специалисту.

---

## Вариант 2. OpenAI-совместимый сервис (`openai_compatible`)

Подходит любой сервис с методом `/chat/completions` в формате OpenAI.

```env
AI_PROVIDER=openai_compatible
OPENAI_BASE_URL=...   # без /chat/completions на конце
OPENAI_API_KEY=...    # для Ollama можно не указывать
OPENAI_MODEL=...
#OPENAI_CA_BUNDLE=/app/certs/...   # если нужен свой корневой сертификат
```

Примеры:

- **OpenRouter** (есть бесплатные модели с суффиксом `:free`, лимиты небольшие; оплата — зарубежной картой/криптой):
  `OPENAI_BASE_URL=https://openrouter.ai/api/v1`, ключ на openrouter.ai/keys,
  `OPENAI_MODEL=` любая модель из каталога с пометкой free.
  Бесплатные модели могут использовать запросы для обучения — для психологического сервиса это
  нежелательно, прочитайте условия конкретной модели.
- **YandexGPT** (Yandex Cloud, платно, данные остаются в РФ):
  `OPENAI_BASE_URL=https://llm.api.cloud.yandex.net/v1`, API-ключ сервисного аккаунта с ролью
  `ai.languageModels.user`, `OPENAI_MODEL=gpt://<ID_каталога>/yandexgpt/latest`
  (или `yandexgpt-lite/latest` — дешевле).
- **Ollama на своём сервере** (бесплатно, данные никуда не уходят, но нужна мощная машина с GPU):
  `OPENAI_BASE_URL=http://<адрес>:11434/v1`, `OPENAI_MODEL=qwen2.5:14b` (или другая модель с хорошим русским).

Качество ответов и соблюдение протокола безопасности сильно зависят от модели — перед запуском
проверьте Тишу на нескольких сложных сценариях (тревога, бессонница, мысли о самоповреждении).

---

## Вариант 3. Anthropic Claude (`anthropic`, по умолчанию)

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
#AI_MODEL=claude-sonnet-5
#AI_EFFORT=medium
```

## Приватность (для всех провайдеров)

- В модель уходит только текст переписки с Тишей (последние 40 сообщений) — без псевдонима и id;
  email и телефоны заменяются на «[скрыто]» ещё на нашем сервере.
- Запросы к провайдеру идут только с сервера; ключи не попадают в браузер.
- Ни запросы, ни ответы не пишутся в логи.
- Пользователь даёт согласие на обработку сообщений ИИ перед первым сообщением и может его отозвать.

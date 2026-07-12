// Обёртка над fetch для админки: если сервер ответил 401 (сессия истекла или
// в localStorage завалялся старый токен от прошлой схемы авторизации), сама
// сбрасывает токен и перезагружает страницу на экран входа — вместо того,
// чтобы страница упала на попытке прочитать поля из {error: 'Unauthorized'}.
// Заголовки (x-admin-key, Content-Type) продолжает задавать вызывающий код —
// это важно для загрузки файлов через FormData, где Content-Type проставлять
// нельзя вручную.

export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    localStorage.removeItem('admin_key');
    window.location.reload();
    return new Promise(() => {}); // страница уже уходит на перезагрузку
  }
  return res;
}

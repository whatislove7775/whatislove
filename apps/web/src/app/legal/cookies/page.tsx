import { DraftDoc } from "@/components/legal/DraftDoc";
import { legalMetadata } from "@/components/legal/meta";

export const metadata = legalMetadata("cookies");

export default function CookiesPage() {
  return (
    <DraftDoc
      slug="cookies"
      summary={
        <p>
          <strong>Коротко.</strong> Сайт хранит в&nbsp;браузере только то, что&nbsp;нужно для&nbsp;работы: ключи входа и&nbsp;выбранную тему
          оформления.
        </p>
      }
      sections={[
        {
          id: "what",
          title: "Что\u00a0хранится в\u00a0браузере",
          body: (
            <ul>
              <li>Ключи входа, чтобы не&nbsp;вводить пароль каждый раз. Кнопка выхода удаляет их&nbsp;с&nbsp;устройства.</li>
              <li>Настройки интерфейса, например светлая или&nbsp;тёмная тема.</li>
            </ul>
          ),
          todo: "Полный перечень cookie и\u00a0записей хранилища с\u00a0назначением и\u00a0сроками.",
        },
        { id: "third", title: "Сторонние сервисы", todo: "Какие сторонние сервисы могут устанавливать cookie (например, при\u00a0оплате)." },
        { id: "manage", title: "Как\u00a0управлять cookie", body: <p>Cookie и&nbsp;данные сайта можно удалить в&nbsp;настройках браузера. После этого придётся войти заново.</p> },
        { id: "changes", title: "Изменения политики", todo: "" },
      ]}
    />
  );
}

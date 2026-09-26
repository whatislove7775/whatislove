"use client";

import { DoorOpen, EyeOff, Keyboard, ScanEye, Smartphone, BellOff } from "lucide-react";
import { Button, Card, CardHead, Segmented } from "@/ui";
import { usePrivacyPrefs } from "@/lib/privacy/usePrivacy";
import { EXIT_TARGETS, STEALTH_PRESETS, panicExit, type ExitTarget, type StealthPreset } from "@/lib/privacy/stealth";
import s from "./privacy.module.css";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={s.switch} onClick={() => onChange(!checked)} />;
}

/**
 * «Незаметный режим» + «Защита от скриншотов»: the settings cards used on the
 * client privacy tab and in the specialist profile. Everything applies at once.
 */
export function PrivacySettings() {
  const [prefs, update] = usePrivacyPrefs();
  const st = prefs.stealth;
  const preset = STEALTH_PRESETS[st.preset];
  const setStealth = (patch: Partial<typeof st>) => update((p) => ({ ...p, stealth: { ...p.stealth, ...patch } }));

  return (
    <>
      <Card as="section">
        <CardHead
          title="Незаметный режим"
          sub="Нейтральная вкладка и&nbsp;быстрый выход по&nbsp;двойному Esc"
          icon={<EyeOff size={20} />}
          action={<Switch checked={st.enabled} onChange={(v) => setStealth({ enabled: v })} label="Незаметный режим" />}
        />
        <details className={s.more}>
          <summary>Как&nbsp;это&nbsp;работает</summary>
        <ul className={s.how}>
          <li>
            <span className={s.howIcon}>
              <img src={preset.icon} alt="" width={18} height={18} />
            </span>
            <span>
              <strong>Нейтральная вкладка.</strong>{" "}
              <span>Вкладка браузера называется «{preset.title}» и&nbsp;получает обычный значок&nbsp;— по&nbsp;ней не&nbsp;понять, что&nbsp;это&nbsp;за&nbsp;сайт.</span>
            </span>
          </li>
          <li>
            <span className={s.howIcon}>
              <Keyboard size={17} />
            </span>
            <span>
              <strong>
                Быстрый выход: дважды <kbd className={s.kbd}>Esc</kbd>.
              </strong>{" "}
              <span>
                Страница мгновенно сменяется нейтральным сайтом ({EXIT_TARGETS[st.exit].label.toLowerCase()}). Работает в&nbsp;кабинете и&nbsp;во&nbsp;время
                звонка&nbsp;— звонок при&nbsp;этом завершится.
              </span>
            </span>
          </li>
          <li>
            <span className={s.howIcon}>
              <Smartphone size={17} />
            </span>
            <span>
              <strong>На&nbsp;телефоне&nbsp;— кнопка с&nbsp;перечёркнутым глазом</strong>{" "}
              <span>рядом с&nbsp;нижним меню, в&nbsp;открытой переписке и&nbsp;в&nbsp;звонке. Одно касание&nbsp;— и&nbsp;вы&nbsp;на&nbsp;другом сайте.</span>
            </span>
          </li>
          <li>
            <span className={s.howIcon}>
              <BellOff size={17} />
            </span>
            <span>
              <strong>Никаких уведомлений.</strong>{" "}
              <span>Мы&nbsp;не&nbsp;присылаем писем, СМС и&nbsp;пуш-уведомлений и&nbsp;не&nbsp;издаём звуков&nbsp;— на&nbsp;экране блокировки ничего не&nbsp;появится.</span>
            </span>
          </li>
        </ul>
          <p className={s.honestLine}>Адрес сайта останется в&nbsp;истории браузера&nbsp;— надёжнее открывать Aprosop в&nbsp;режиме инкогнито.</p>
        </details>

        {st.enabled && (
          <div style={{ marginTop: 16 }}>
            <div className={s.block}>
              <span className={s.blockTitle}>Как&nbsp;называется вкладка</span>
              <div className={s.presets} role="radiogroup" aria-label="Название и&nbsp;значок вкладки">
                {(Object.keys(STEALTH_PRESETS) as StealthPreset[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={st.preset === k}
                    className={s.preset}
                    onClick={() => setStealth({ preset: k })}
                  >
                    <img src={STEALTH_PRESETS[k].icon} alt="" />
                    {STEALTH_PRESETS[k].title}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.block}>
              <span className={s.blockTitle}>Куда уходить при&nbsp;быстром выходе</span>
              <Segmented<ExitTarget>
                ariaLabel="Нейтральный сайт"
                value={st.exit}
                onChange={(v) => setStealth({ exit: v })}
                options={(Object.keys(EXIT_TARGETS) as ExitTarget[]).map((k) => ({ value: k, label: EXIT_TARGETS[k].short ?? EXIT_TARGETS[k].label }))}
              />
            </div>
            <div className={s.rows} style={{ borderTop: "1px solid var(--c-line)", paddingTop: 14 }}>
              <div className={s.row}>
                <span className={s.rowText}>
                  <strong>При&nbsp;выходе&nbsp;— выйти из&nbsp;аккаунта</strong>
                  <span>Стираем вход и&nbsp;данные сайта в&nbsp;этом браузере.</span>
                </span>
                <Switch checked={st.wipe} onChange={(v) => setStealth({ wipe: v })} label="Выйти из&nbsp;аккаунта при&nbsp;быстром выходе" />
              </div>
              <div className={s.row}>
                <span className={s.rowText}>
                  <strong>Запомнить в&nbsp;аккаунте</strong>
                  <span>Режим включится и&nbsp;на&nbsp;других устройствах.</span>
                </span>
                <Switch checked={prefs.sync} onChange={(v) => update((p) => ({ ...p, sync: v }))} label="Запомнить настройку в&nbsp;аккаунте" />
              </div>
              <div className={s.row}>
                <span className={s.rowText}>
                  <strong>Проверить</strong>
                  <span>Откроется нейтральный сайт.</span>
                </span>
                <Button variant="secondary" size="sm" icon={<DoorOpen size={16} />} onClick={panicExit}>
                  Выйти сейчас
                </Button>
              </div>
            </div>
          </div>
        )}

      </Card>

      <Card as="section">
        <CardHead
          title="Защита от&nbsp;скриншотов"
          sub="Размытие и&nbsp;запрет копирования в&nbsp;переписках"
          icon={<ScanEye size={20} />}
          action={
            <Switch
              checked={prefs.screen_protect}
              onChange={(v) => update((p) => ({ ...p, screen_protect: v }))}
              label="Защита от&nbsp;скриншотов"
            />
          }
        />
        <details className={s.more}>
          <summary>Как&nbsp;это&nbsp;работает</summary>
        <ul className={s.how}>
          <li>
            <span className={s.howIcon}>
              <EyeOff size={17} />
            </span>
            <span>
              <strong>Размываем переписку,</strong> <span>когда окно или&nbsp;вкладка не&nbsp;активны: в&nbsp;списке приложений и&nbsp;при&nbsp;переключении окон её&nbsp;не&nbsp;видно.</span>
            </span>
          </li>
          <li>
            <span className={s.howIcon}>
              <ScanEye size={17} />
            </span>
            <span>
              <strong>Отключаем выделение, копирование и&nbsp;печать</strong>{" "}
              <span>сообщений и&nbsp;добавляем едва заметный водяной знак с&nbsp;вашим псевдонимом.</span>
            </span>
          </li>
        </ul>
          <p className={s.honestLine}>Системный скриншот или&nbsp;фото экрана браузер запретить не&nbsp;может. Для&nbsp;обеих сторон диалога&nbsp;— в&nbsp;меню «⋮».</p>
        </details>
      </Card>
    </>
  );
}

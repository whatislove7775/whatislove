"""
Поиск контактов в тексте: телефоны, @ники, ссылки на мессенджеры и соцсети, email.

До первого завершённого созвона клиент и специалист не могут обмениваться контактами
в чате (правило сервиса). Используется для сообщений, названий файлов и текстов
профиля специалиста. Та же логика продублирована на фронтенде
(apps/web/src/lib/chat/contacts.ts) для мгновенной подсказки — источник правды здесь.

Сам текст никогда не логируется — только количество найденных фрагментов.
"""
import re
from dataclasses import dataclass

KIND_LABELS = {
    "phone": "номер телефона",
    "handle": "ник",
    "link": "ссылку на мессенджер",
    "email": "почту",
}

# Телефоны кризисных линий из подсказок сервиса — не личные контакты
ALLOWED_NUMBERS = {"88002000122", "88003334434", "84950510000"}

_L = r"a-zа-яё"  # буквы для «границ слова» (работает одинаково с JS-версией)

_DIGIT_WORDS = {
    "ноль": "0", "нуль": "0", "один": "1", "одна": "1", "два": "2", "две": "2", "три": "3",
    "четыре": "4", "пять": "5", "шесть": "6", "семь": "7", "восемь": "8", "девять": "9",
}
_WORD = "|".join(sorted(_DIGIT_WORDS, key=len, reverse=True))
# Одна «цифра»: 0-9, цифра словом или буква О вместо нуля между цифрами
_UNIT = rf"(?:\d|(?<![{_L}])(?:{_WORD})(?![{_L}])|(?<=\d)[oо]+(?![{_L}]))"
_SEP = r"[\s\-‐‑–—.()\[\]/*_,]{0,3}"
_RUN = re.compile(rf"(?:(?:\+|(?<![{_L}])плюс(?![{_L}]))\s*)?{_UNIT}(?:{_SEP}{_UNIT})*", re.I)
_UNIT_RE = re.compile(_UNIT, re.I)

_EMAIL = re.compile(
    r"[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-zа-я]{2,}"
    r"|[\w.+-]{2,}\s*(?:\(at\)|\[at\]|\{at\}|\s(?:at|собака)\s)\s*[\w-]+\s*"
    r"(?:\.|\(dot\)|\[dot\]|\s(?:dot|точка)\s)\s*(?:ru|com|net|org|рф|me|io|su|by|kz|ua|info)(?![a-zа-я])",
    re.I,
)
_HANDLE = re.compile(r"(?<![\w@.])@[a-z][a-z0-9_.]{2,31}(?<!\.)", re.I)

_DOMAINS = (
    r"t\s*\.\s*me|telegram\.(?:me|org|dog)|wa\.me|(?:api|chat|web)\.whatsapp\.com|whatsapp\.com"
    r"|(?:m\.)?vk\.(?:com|me|cc)|vkontakte\.ru|ok\.ru|instagram\.com|instagr\.am|facebook\.com|fb\.(?:me|com)"
    r"|m\.me|discord\.(?:gg|com)|discordapp\.com|(?:invite\.)?viber\.com|signal\.(?:me|group)|snapchat\.com"
    r"|tiktok\.com|twitter\.com|x\.com|linkedin\.com|skype\.com|join\.skype\.com|icq\.im|max\.ru|threads\.net"
)
_LINK = re.compile(
    rf"(?<![\w.])(?:https?://)?(?:www\.)?(?:{_DOMAINS})(?:\s*/[^\s]*)?"
    r"|(?:tg|viber|whatsapp|skype|discord)://[^\s]+",
    re.I,
)

_MESSENGER = (
    r"telegram|телеграм\w*|телег[аеиу]|тг|tg|whats\s?app|ват?с\s?ап\w*|вотс?ап\w*|вацап\w*|viber|вайбер\w*"
    r"|discord|дискорд\w*|instagram|инстаграм\w*|инст[аеуы]|insta|vk|вк|вконтакте|signal|skype|скайп\w*"
    r"|facebook|фейсбук\w*|snapchat|max"
)
_INTENT = (
    r"пиши|напиши|напишите|пишите|написать|черкни|добавь|добавьте|добавляйся|добавляйтесь|стукни|стукните"
    r"|стучи|звони|позвони|позвоните|свяжемся|свяжитесь|связаться|связь|найди|найдите|ищи|ищите|мой|мою|моя"
    r"|мои|контакт\w*|ник|логин|аккаунт|переписываться|переписка|перейд\w*|перейти|давай|давайте|есть"
)
_B = rf"(?<![{_L}\d_])"
_E = rf"(?![{_L}\d_])"
_MENTION = re.compile(
    rf"{_B}(?:{_INTENT}){_E}(?:[^\w\n]+[\w-]+){{0,3}}?[^\w\n]+(?:{_MESSENGER}){_E}"
    rf"|{_B}(?:{_MESSENGER})\s*[:=]\s*[^\s]+"
    rf"|{_B}(?:{_MESSENGER})\s+[a-z][a-z0-9_.]{{3,}}",
    re.I,
)


@dataclass(frozen=True)
class Hit:
    kind: str
    start: int
    end: int

    def as_dict(self) -> dict:
        return {"kind": self.kind, "start": self.start, "end": self.end}


def _digits(token: str) -> str:
    t = token.lower()
    if t in _DIGIT_WORDS:
        return _DIGIT_WORDS[t]
    return t.replace("o", "0").replace("о", "0")


def _groups(text: str, start: int, end: int) -> list[tuple[str, int, int]]:
    """Группы цифр внутри найденного отрезка: подряд идущие символы-цифры склеиваются,
    цифра словом — всегда отдельная группа."""
    groups: list[tuple[str, int, int]] = []
    prev_end, prev_word = None, True
    for u in _UNIT_RE.finditer(text, start, end):
        tok = u.group(0)
        word = tok.lower() in _DIGIT_WORDS
        if groups and not word and not prev_word and prev_end == u.start():
            d, s0, _ = groups[-1]
            groups[-1] = (d + _digits(tok), s0, u.end())
        else:
            groups.append((_digits(tok), u.start(), u.end()))
        prev_end, prev_word = u.end(), word
    return groups


def _is_phone(digits: str, plus_start: bool, seps: str, single_group: bool) -> bool:
    n = len(digits)
    if plus_start:
        return 10 <= n <= 15
    if n == 11:
        return digits[0] in "78" and digits[1] in "3489"
    if n == 10:
        if digits[0] == "9":
            return True
        # городской номер без восьмёрки: 495 123-45-67, (812) 123 45 67
        return digits[0] in "348" and (single_group or bool(re.search(r"[-()]", seps)))
    return False


def _allowed_end(groups, i: int) -> int | None:
    digits = ""
    for j in range(i, len(groups)):
        digits += groups[j][0]
        if len(digits) > 11:
            return None
        if digits in ALLOWED_NUMBERS or (digits[:1] == "7" and "8" + digits[1:] in ALLOWED_NUMBERS):
            return j
    return None


def _phone_hits(text: str) -> list[Hit]:
    hits: list[Hit] = []
    for run in _RUN.finditer(text):
        raw = run.group(0).lower()
        plus = raw.startswith("+") or raw.startswith("плюс")
        groups = _groups(text, run.start(), run.end())
        i = 0
        while i < len(groups):
            allowed = _allowed_end(groups, i)
            if allowed is not None:
                i = allowed + 1
                continue
            digits, found = "", None
            for j in range(i, len(groups)):
                digits += groups[j][0]
                if len(digits) > 15:
                    break
                seps = text[groups[i][2]:groups[j][1]]
                if _is_phone(digits, i == 0 and plus, seps, i == j):
                    found = j
                    break
            if found is not None:
                start = run.start() if (i == 0 and plus) else groups[i][1]
                hits.append(Hit("phone", start, groups[found][2]))
                i = found + 1
            else:
                i += 1
    return hits


def find_contacts(text: str) -> list[Hit]:
    """Все найденные фрагменты, без пересечений, по порядку."""
    if not text:
        return []
    found: list[Hit] = []
    for kind, rx in (("email", _EMAIL), ("link", _LINK), ("handle", _HANDLE), ("link", _MENTION)):
        found += [Hit(kind, m.start(), m.end()) for m in rx.finditer(text)]
    found += _phone_hits(text)
    found.sort(key=lambda h: (h.start, -(h.end - h.start)))
    out: list[Hit] = []
    for h in found:
        if out and h.start < out[-1].end:
            continue
        out.append(h)
    return out


def has_contacts(text: str) -> bool:
    return bool(find_contacts(text))


def describe(hits: list[Hit]) -> str:
    kinds = []
    for h in hits:
        label = KIND_LABELS[h.kind]
        if label not in kinds:
            kinds.append(label)
    return ", ".join(kinds)

import DuckGame from '@/components/DuckGame';

export const metadata = {
  title: 'Мне повезёт — игра с гусём',
  description:
    'Мини-игра с гусём от дизайн-студии «wh4tislove» — прыгай через препятствия, набирай очки и попади в таблицу лидеров.',
  openGraph: {
    title: 'Мне повезёт — игра с гусём | WH4T!SLOV3',
    description:
      'Мини-игра с гусём от дизайн-студии «wh4tislove» — прыгай через препятствия, набирай очки и попади в таблицу лидеров.',
  },
};

export default function LuckyPage() {
  return <DuckGame />;
}

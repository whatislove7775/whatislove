import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard, PracticeCard } from "@/components/content/Cards";
import { serverContent } from "@/lib/content/server";
import { ScrollRow } from "@/ui";
import s from "./featured.module.css";
import l from "./landing.module.css";

/** «Полезное»: one row — three articles and a practices card of the same height (server-rendered for search engines). */
export async function FeaturedContent() {
  const [articles, practices] = await Promise.all([serverContent.articles({ limit: 3 }), serverContent.practices()]);
  if (!articles.length && !practices.length) return null;
  return (
    <section id="useful" className={`${l.wrap} ${l.section}`} aria-labelledby="useful-title">
      <div className={l.sectionHead}>
        <div>
          <h2 id="useful-title" className={l.sectionTitle}>
            Полезное
          </h2>
          <p className={l.sectionSub}>Статьи с&nbsp;источниками и&nbsp;короткие практики. Без&nbsp;регистрации.</p>
        </div>
        <Link href="/articles" className={l.more}>
          Все статьи
          <ArrowRight size={16} strokeWidth={2} aria-hidden />
        </Link>
      </div>
      <ScrollRow className={s.bleed} trackClassName={s.row} label="Статьи и&nbsp;практики">
        {articles.map((a) => (
          <div key={a.id} role="listitem" className={s.item}>
            <ArticleCard a={a} base="" />
          </div>
        ))}
        {practices.length > 0 && (
          <div role="listitem" className={`${s.item} ${s.practices}`}>
            <h3 className={s.subTitle}>Практики на&nbsp;3–10&nbsp;минут</h3>
            <ul>
              {practices.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <PracticeCard p={p} base="" />
                </li>
              ))}
            </ul>
            <Link href="/practices" className={s.moreSmall}>
              Все практики
              <ArrowRight size={14} strokeWidth={2} aria-hidden />
            </Link>
          </div>
        )}
      </ScrollRow>
    </section>
  );
}

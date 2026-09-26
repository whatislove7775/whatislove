import type { ArticleCard } from "@/lib/api/content";
import { TopicArt } from "@/components/illustrations/topics";
import art from "./art.module.css";
import c from "./content.module.css";
import s from "./author.module.css";

/** Article page banner: the author's own 16:9 cover (WebP variants), or the topic illustration on its pastel tone. */
export function ArticleBanner({ a, className }: { a: Pick<ArticleCard, "cover" | "cover_image" | "topic">; className: string }) {
  if (a.cover_image) {
    const img = a.cover_image;
    return (
      <div className={`${className} ${s.photoBanner}`} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          srcSet={`${img.sm} 480w, ${img.md} 800w, ${img.url} 1600w`}
          sizes="(max-width: 860px) 100vw, 760px"
          alt=""
          fetchPriority="high"
        />
      </div>
    );
  }
  return (
    <div className={`${className} ${c.tone}`} data-tone={a.cover} aria-hidden>
      <TopicArt topic={a.topic} className={art.bannerArt} />
    </div>
  );
}

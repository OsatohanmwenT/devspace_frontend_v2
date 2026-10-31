import { RichText } from "~/components/ui/rich-text";
import type { ArticleContent } from "~/types/lesson";

const HEADING = "m-0 mb-2 text-xl font-semibold text-neutral-800 dark:text-night-ink";
const BODY = "m-0 text-[15px] leading-[1.6] text-[#777] dark:text-[#b2b2b6]";

// The "learn" screen of a concept: its idea in short sections, then a diagram
// or worked example, then a hint of what comes next.
export function LessonArticle({ article, lessonTitle }: { article: ArticleContent; lessonTitle: string }) {
  return (
    <article className="h-full overflow-auto bg-[#fafaf8] dark:bg-[#1f1f1f]" aria-labelledby="lesson-article-title">
      <div className="mx-auto max-w-[72ch] px-7 pt-[clamp(24px,4vw,48px)] pb-10 max-tab:px-5 max-tab:pt-6 max-tab:pb-9">
        <p className="m-0 mb-3 text-xs font-semibold tracking-[0.12em] text-[#2563eb] uppercase dark:text-[#88bdf2]">{lessonTitle}</p>
        <h1 id="lesson-article-title" className="m-0 mb-3 text-[27px] leading-[1.16] font-semibold text-neutral-800 max-tab:text-[25px] dark:text-night-ink">
          {article.title}
        </h1>
        <p className="m-0 max-w-[72ch] text-base leading-[1.55] text-[#777] dark:text-[#b2b2b6]">{article.intro}</p>

        {article.sections.map((section) => (
          <section key={section.title} className="mt-[26px] max-w-[72ch] max-tab:mt-6">
            <h2 className={HEADING}>{section.title}</h2>
            <p className={BODY}>
              <RichText content={section.body} />
            </p>
          </section>
        ))}

        {article.diagram && (
          <section className="mt-[26px] max-w-[62ch] max-tab:mt-6">
            <h2 className={HEADING}>{article.diagram.title}</h2>
            <p className={`${BODY} text-[17px] max-tab:text-base`}>{article.diagram.body}</p>
            <div
              className="mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-[#e1e1e1] bg-[#f5f5f5] p-3.5 dark:border-night-line dark:bg-[#262626]"
              role="img"
              aria-label={article.diagram.label}
            >
              {article.diagram.nodes.map((node, index) => (
                <div key={node} className="flex items-center gap-2">
                  <span className="rounded-lg border border-[#e1e1e1] bg-white px-2.5 py-2 text-[13px] font-semibold text-neutral-800 dark:border-night-line dark:bg-night-card dark:text-night-ink">
                    {node}
                  </span>
                  {index < article.diagram!.nodes.length - 1 && (
                    <i className="text-[17px] text-[#6699ec] not-italic" aria-hidden="true">
                      →
                    </i>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {article.example && (
          <section className="mt-[26px] max-w-[62ch] max-tab:mt-6">
            <h2 className={HEADING}>{article.example.title}</h2>
            <p className={`${BODY} text-[17px] max-tab:text-base`}>{article.example.body}</p>
            <pre className="mt-3.5 overflow-auto rounded-xl border border-[#36363c] bg-night px-[18px] py-4 text-sm leading-[1.7] text-night-ink">
              <code>{article.example.code}</code>
            </pre>
          </section>
        )}

        {article.next && (
          <aside className="mt-7 grid max-w-[62ch] gap-1.5 rounded-[14px] border border-[#e1e1e1] bg-[#f5f5f5] px-[18px] py-4 dark:border-night-line dark:bg-[#262626]">
            <span className="block text-xs font-bold tracking-[0.08em] text-[#6699ec] uppercase">Up next</span>
            <strong className="text-xl text-neutral-800 dark:text-night-ink">{article.next.title}</strong>
            <p className="m-0 leading-[1.55] text-[#777] dark:text-[#b2b2b6]">{article.next.body}</p>
          </aside>
        )}
      </div>
    </article>
  );
}

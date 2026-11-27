import { Fragment, useState } from 'react';
import { Search, X } from 'lucide-react';
import clubRules, {
  type RuleArticle,
  type RuleChapter,
} from '~/components/Club/rulesData';
import {
  articleId,
  chapterId,
  chapterLabel,
  clauseMark,
  filterRules,
  linesOf,
  splitNotes,
} from '~/components/Club/rulesUtils';
import { BackButton, Chip, EmptyState, Input } from '~/components/ui';
import { cn } from '~/lib/utils';

const TITLE = '회칙';
const FULL_TITLE = '서울대학교 아마추어 천문회 회칙';
/** The last 개정 in `rulesData.ts`; update it with the data. */
const LAST_AMENDED = '2025년 8월 8일';

function scrollToId(id: string) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({
    block: 'start',
    behavior: reduce ? 'auto' : 'smooth',
  });
}

/** Marks every place `query` appears in `text`, ignoring case. */
function Marked({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;
  const lower = text.toLowerCase();
  const target = needle.toLowerCase();
  const parts: { text: string; hit: boolean }[] = [];
  let from = 0;
  for (
    let at = lower.indexOf(target);
    at !== -1;
    at = lower.indexOf(target, from)
  ) {
    if (at > from) parts.push({ text: text.slice(from, at), hit: false });
    parts.push({ text: text.slice(at, at + target.length), hit: true });
    from = at + target.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from), hit: false });
  return (
    <>
      {parts.map((part, index) =>
        part.hit ? (
          <mark
            key={index}
            className="rounded-sm bg-accent-soft px-0.5 text-fg"
          >
            {part.text}
          </mark>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

/** A text of the 회칙: its lines, with the 개정 notes in a quieter tone. */
function RuleText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {linesOf(text).map((line, index) => (
        <p
          key={index}
          // 호 (1. 2. …) under a 항 sit indented.
          className={cn(/^\d+\./.test(line) && 'pl-4')}
        >
          {splitNotes(line).map((part, partIndex) =>
            part.note ? (
              <span
                key={partIndex}
                className="text-caption whitespace-nowrap text-fg-muted"
              >
                {' '}
                <Marked text={part.text} query={query} />
              </span>
            ) : (
              <Marked key={partIndex} text={part.text} query={query} />
            ),
          )}
        </p>
      ))}
    </div>
  );
}

function Article({
  id,
  article,
  query,
}: {
  id: string;
  article: RuleArticle;
  query: string;
}) {
  return (
    <article
      id={id}
      className="flex scroll-mt-44 flex-col gap-2 md:scroll-mt-24"
    >
      <h3 className="text-heading">
        <Marked
          text={`제${article.article_no}조(${article.article_title})`}
          query={query}
        />
      </h3>
      {article.clauses?.map((clause) => (
        <div
          key={clause.clause_no}
          className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-1 text-body"
        >
          <span className="text-fg-muted" aria-hidden>
            {clauseMark(clause.clause_no)}
          </span>
          <span className="sr-only">제{clause.clause_no}항</span>
          <RuleText text={clause.text} query={query} />
        </div>
      ))}
      {article.article_text && (
        <RuleText
          text={article.article_text}
          query={query}
          className="text-body"
        />
      )}
    </article>
  );
}

function ChapterNav({
  chapters,
  className,
}: {
  chapters: RuleChapter[];
  className?: string;
}) {
  return (
    <nav aria-label="장 목록" className={className}>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0.5 md:overflow-visible md:px-0 md:pb-0">
        {chapters.map((chapter) => (
          <li key={chapterId(chapter)} className="shrink-0">
            {/* A chip row on mobile, a plain list on desktop. */}
            <Chip
              onClick={() => scrollToId(chapterId(chapter))}
              className="md:h-9 md:w-full md:justify-start md:rounded-md md:border-0 md:bg-transparent md:px-2 md:hover:bg-gray-50"
            >
              {chapterLabel(chapter)}
            </Chip>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** 회칙: every 장 and 조, with a search and a list of 장 to jump to. */
export default function ClubRules() {
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const shown = filterRules(clubRules, query);
  const found = shown.reduce((sum, { articles }) => sum + articles.length, 0);

  const search = (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500"
        aria-hidden
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="조문 찾기"
        aria-label="조문 찾기"
        className="pl-9"
      />
    </div>
  );

  const status = searching && (
    <div className="flex items-center justify-between gap-3" aria-live="polite">
      <p className="min-w-0 truncate text-label font-normal text-fg-muted">
        <span className="font-semibold text-fg">{query.trim()}</span>
        {found > 0 ? ` · ${found}개 조에서 찾았어요` : ' · 찾는 조문이 없어요'}
      </p>
      <button
        type="button"
        onClick={() => setQuery('')}
        className="-my-2 flex min-h-11 shrink-0 items-center gap-1 text-label text-fg-muted hover:text-fg"
      >
        <X className="size-4" aria-hidden />
        지우기
      </button>
    </div>
  );

  return (
    <div className="flex flex-col pb-10 md:mx-auto md:w-full md:max-w-page md:gap-6 md:px-6 md:py-6">
      <div className="sticky top-0 z-20 bg-surface md:hidden">
        <div className="flex h-[52px] items-center justify-between pt-safe-0 pr-3 pl-1">
          <BackButton />
          <h1 className="text-[15px] font-semibold">{TITLE}</h1>
          <div className="min-w-11" />
        </div>
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 pb-3">
          {search}
          {status || <ChapterNav chapters={clubRules} />}
        </div>
      </div>
      <div className="hidden flex-col gap-1 md:flex">
        <h1 className="text-display">{TITLE}</h1>
        <p className="text-label font-normal text-fg-muted">
          {LAST_AMENDED} 개정까지 반영했어요.
        </p>
      </div>

      <div className="md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:items-start md:gap-10">
        <aside className="sticky top-22 hidden flex-col gap-4 md:flex">
          {search}
          {status}
          {!searching && <ChapterNav chapters={clubRules} />}
        </aside>

        <div className="flex max-w-prose flex-col gap-10 bg-surface px-4 py-6 md:rounded-xl md:border md:border-border md:px-10 md:py-8">
          {!searching && (
            <div className="flex flex-col gap-1">
              <h2 className="text-title">{FULL_TITLE}</h2>
              <p className="text-label font-normal text-fg-muted md:hidden">
                {LAST_AMENDED} 개정까지 반영했어요.
              </p>
            </div>
          )}
          {shown.length === 0 ? (
            <EmptyState
              title="찾는 조문이 없어요"
              description="다른 낱말로 찾아 보세요."
            />
          ) : (
            shown.map(({ chapter, articles }) => (
              // Not <section>: the legacy SCSS still styles bare sections.
              <div
                role="region"
                key={chapterId(chapter)}
                id={chapterId(chapter)}
                aria-label={chapterLabel(chapter)}
                className="flex scroll-mt-44 flex-col gap-6 md:scroll-mt-24"
              >
                <h2 className="border-b border-border pb-2 text-title">
                  {chapterLabel(chapter)}
                </h2>
                {articles.map(({ article, index }) => (
                  <Article
                    key={articleId(chapter, index)}
                    id={articleId(chapter, index)}
                    article={article}
                    query={query}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import type { RuleArticle, RuleChapter } from './rulesData';

const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';

/** 항 numbers as the 회칙 prints them: ①, ②, … */
export const clauseMark = (clauseNo: number) =>
  CIRCLED[clauseNo - 1] ?? `${clauseNo}.`;

export const chapterLabel = (chapter: RuleChapter) =>
  chapter.chapter_no
    ? `제${chapter.chapter_no}장 ${chapter.chapter_title}`
    : chapter.chapter_title;

export const chapterId = (chapter: RuleChapter) =>
  `rule-chapter-${chapter.chapter_no ?? 'appendix'}`;

/** 부칙 numbers its articles again from 1, so they get their own ids. */
export const articleId = (chapter: RuleChapter, index: number) =>
  chapter.chapter_no
    ? `rule-article-${chapter.articles[index].article_no}`
    : `rule-appendix-${index + 1}`;

/**
 * Where `query` appears in a text, the way the search matches it: ignoring
 * case and spaces, so "임원 모임" also marks "임원모임". Null when empty.
 */
export function matchPattern(query: string) {
  const chars = Array.from(query.replace(/\s+/g, ''));
  if (!chars.length) return null;
  const escaped = chars.map((char) =>
    char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  return new RegExp(escaped.join('\\s*'), 'gi');
}

/**
 * The pieces of an article as the page draws them: its 제N조(title), then
 * every line of its 항 and text, with the 개정 notes apart. A match must
 * fall inside one piece, so every article found has a mark to show.
 */
const articlePieces = (article: RuleArticle) => [
  `제${article.article_no}조(${article.article_title})`,
  ...[
    ...(article.clauses ?? []).map((clause) => clause.text),
    article.article_text ?? '',
  ]
    .flatMap(linesOf)
    .flatMap((line) => splitNotes(line).map((part) => part.text)),
];

export const articleMatches = (article: RuleArticle, query: string) => {
  const pattern = matchPattern(query);
  return (
    !pattern ||
    articlePieces(article).some((piece) => {
      pattern.lastIndex = 0;
      return pattern.test(piece);
    })
  );
};

/**
 * The chapters, each keeping only the articles that match `query`, with
 * their places in the full chapter (for the ids). Chapters with no match
 * are left out.
 */
export function filterRules(chapters: RuleChapter[], query: string) {
  return chapters.flatMap((chapter) => {
    const articles = chapter.articles.flatMap((article, index) =>
      articleMatches(article, query) ? [{ article, index }] : [],
    );
    return articles.length ? [{ chapter, articles }] : [];
  });
}

/**
 * A line split into plain text and the amendment notes the 회칙 keeps
 * inline, such as `<개정 2017.11.25.>` or `[본조신설 2011.5.28.]`.
 */
export function splitNotes(line: string) {
  return line
    .split(/(<[^<>]*\d{4}\.[^<>]*>|\[[^[\]]*\d{4}\.[^[\]]*\])/)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      note: /^[<[].*\d{4}\..*[>\]]$/.test(part),
    }));
}

/** Lines of a text, trimmed: the data indents its continued lines. */
export const linesOf = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

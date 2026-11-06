const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Marks every case-insensitive match of `keyword` in `text`. */
export default function Highlight({
  text,
  keyword,
}: {
  text: string;
  keyword?: string;
}) {
  if (!keyword) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(keyword)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        // split() puts the captured matches at odd indexes.
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-[3px] bg-accent-soft px-0.5 text-fg shadow-[inset_0_-2px_0_var(--color-accent)]"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

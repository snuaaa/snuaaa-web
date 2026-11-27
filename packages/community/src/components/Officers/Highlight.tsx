import { matches } from './officerUtils';

/** Marks `text` when it matches the search; drawn on the night surface. */
export default function Highlight({
  text,
  query,
}: {
  text: string;
  query?: string;
}) {
  if (!query || !matches(text, query)) return <>{text}</>;
  return (
    <mark className="rounded-sm bg-accent px-0.5 font-semibold text-surface-brand">
      {text}
    </mark>
  );
}

/** Yellow dot on posts (or comments) from the last 24 hours. */
export function NewDot({ label = '새 글' }: { label?: string }) {
  return (
    <span
      className="block size-1.5 shrink-0 rounded-full bg-accent"
      aria-label={label}
      role="img"
    />
  );
}

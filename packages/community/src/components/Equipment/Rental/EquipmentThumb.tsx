import { Telescope } from 'lucide-react';
import { cn, resolveImageUrl } from '~/lib/utils';

/** The equipment's photo, or a telescope on gray when it has none. */
export default function EquipmentThumb({
  src,
  className,
}: {
  src?: string;
  className?: string;
}) {
  const url = resolveImageUrl(src);
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-gray-400',
        className,
      )}
    >
      {url ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      ) : (
        <Telescope className="size-1/3" aria-hidden />
      )}
    </span>
  );
}

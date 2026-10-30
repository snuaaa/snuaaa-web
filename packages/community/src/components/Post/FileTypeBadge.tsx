import { cn } from '~/lib/utils';

const FILE_TYPE_STYLES: Record<string, string> = {
  PDF: 'bg-danger-soft text-danger',
  HWP: 'bg-info-soft text-navy-700',
  DOC: 'bg-info-soft text-navy-700',
  XLS: 'bg-success-soft text-success',
  ZIP: 'bg-accent-soft text-star-800',
};

/** PDF / HWP / ZIP … label in front of an attached file's name. */
export default function FileTypeBadge({
  type,
  className,
}: {
  type?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-[4px] px-[5px] py-0.5 text-[10px] font-bold',
        (type && FILE_TYPE_STYLES[type]) ?? 'bg-gray-100 text-gray-700',
        className,
      )}
    >
      {type || 'FILE'}
    </span>
  );
}

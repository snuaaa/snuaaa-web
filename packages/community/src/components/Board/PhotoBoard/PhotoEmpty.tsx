import type { ReactNode } from 'react';
import { Image } from 'lucide-react';

type PhotoEmptyProps = {
  title: string;
  description?: string;
  /** A button under the message, e.g. 필터 초기화 or 앨범 만들기. */
  action?: ReactNode;
};

/** Empty and error message of the photo lists. */
export default function PhotoEmpty({
  title,
  description,
  action,
}: PhotoEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-[20px] bg-gray-100 text-primary">
        <Image className="size-7" strokeWidth={1.8} aria-hidden />
      </span>
      <p className="text-heading">{title}</p>
      {description && (
        <p className="text-sm leading-relaxed text-gray-700">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn, resolveImageUrl } from '~/lib/utils';

const SIZES = {
  56: 'size-14 text-[20px]',
  40: 'size-10 text-[15px]',
  28: 'size-7 text-[12px]',
  20: 'size-5 text-[10px]',
} as const;

// Full class names so Tailwind can find them. Grade 2 has no planet.
const GRADE_RINGS: Record<number, string> = {
  1: 'bg-grade-1',
  3: 'bg-grade-3',
  4: 'bg-grade-4',
  5: 'bg-grade-5',
  6: 'bg-grade-6',
  7: 'bg-grade-7',
  8: 'bg-grade-8',
  9: 'bg-grade-9',
};

type AvatarUser = {
  nickname: string;
  profile_url?: string | null;
  /** @deprecated legacy local path, used when profile_url is empty */
  profile_path?: string | null;
  grade?: number;
};

type AvatarProps = {
  user: AvatarUser;
  size?: keyof typeof SIZES;
  /** Draws the member-grade planet ring around the photo. */
  showGrade?: boolean;
  className?: string;
};

/** Shows profile_url, then profile_path, then the nickname's first letter. */
export function Avatar({
  user,
  size = 40,
  showGrade = false,
  className,
}: AvatarProps) {
  const src = resolveImageUrl(user.profile_url || user.profile_path);
  const ring =
    showGrade && user.grade !== undefined ? GRADE_RINGS[user.grade] : undefined;

  const avatar = (
    <AvatarPrimitive.Root
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-primary-soft align-middle',
        SIZES[size],
        ring && 'size-full border-2 border-white',
        !ring && className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={user.nickname}
          className="size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={src ? 300 : 0}
        className="flex size-full items-center justify-center font-bold text-navy-700"
        aria-label={user.nickname}
      >
        {user.nickname.trim().charAt(0)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );

  if (!ring) return avatar;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full',
        size >= 40 ? 'p-[3px]' : 'p-0.5',
        SIZES[size],
        ring,
        className,
      )}
    >
      {avatar}
    </span>
  );
}

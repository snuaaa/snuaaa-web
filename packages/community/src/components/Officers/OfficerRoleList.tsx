import { cn } from '~/lib/utils';
import type { OfficerRole } from '~/services/types';
import { matches } from './officerUtils';

type OfficerRoleListProps = {
  roles: OfficerRole[];
  /** Search text; matching roles and names are marked. */
  query?: string;
  /** On a dark surface (the current 기수 card). */
  onBrand?: boolean;
  className?: string;
};

/** Marks `text` when it matches the search. */
export function Highlight({
  text,
  query,
  onBrand,
}: {
  text: string;
  query?: string;
  onBrand?: boolean;
}) {
  if (!query || !matches(text, query)) return <>{text}</>;
  return (
    <mark
      className={cn(
        'rounded-sm px-0.5 font-semibold',
        onBrand ? 'bg-accent text-navy-900' : 'bg-primary-soft text-mint-800',
      )}
    >
      {text}
    </mark>
  );
}

/** 직책 on the left, names on the right, one row per role. */
export default function OfficerRoleList({
  roles,
  query,
  onBrand,
  className,
}: OfficerRoleListProps) {
  return (
    <dl className={cn('flex flex-col gap-2', className)}>
      {roles.map((role, index) => (
        <div key={`${role.role}-${index}`} className="flex gap-3">
          <dt
            className={cn(
              'w-24 shrink-0 text-label leading-6 font-normal',
              onBrand ? 'text-fg-on-brand-muted' : 'text-fg-muted',
            )}
          >
            <Highlight text={role.role} query={query} onBrand={onBrand} />
          </dt>
          <dd className="flex min-w-0 flex-1 flex-wrap gap-x-2.5 text-body leading-6">
            {role.names.map((name, nameIndex) => (
              <span key={`${name}-${nameIndex}`}>
                <Highlight text={name} query={query} onBrand={onBrand} />
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

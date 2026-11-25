import { Pencil } from 'lucide-react';
import { Button } from '~/components/ui';
import { cn } from '~/lib/utils';
import type { OfficerGeneration } from '~/services/types';
import OfficerRoleList from './OfficerRoleList';

type CurrentGenerationCardProps = {
  generation: OfficerGeneration;
  onEdit?: () => void;
  className?: string;
};

/** The newest 기수 on the navy surface, so its accent is star yellow. */
export default function CurrentGenerationCard({
  generation,
  onEdit,
  className,
}: CurrentGenerationCardProps) {
  const { president, roles } = generation;
  return (
    <div
      role="region"
      aria-label={`지금 임원진, ${generation.generation}대`}
      className={cn(
        'flex flex-col gap-5 rounded-xl bg-surface-brand p-5 text-fg-on-brand shadow-sm md:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-label text-fg-on-brand-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            지금 임원진
          </span>
          <span className="text-title tabular-nums">
            {generation.generation}대
          </span>
        </div>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-fg-on-brand hover:bg-white/10"
          >
            <Pencil aria-hidden />
            수정
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-label font-normal text-fg-on-brand-muted">
          회장
        </span>
        <span className="text-display">{president}</span>
      </div>
      {roles.length > 0 && (
        <OfficerRoleList
          roles={roles}
          onBrand
          className="border-t border-white/10 pt-4"
        />
      )}
    </div>
  );
}

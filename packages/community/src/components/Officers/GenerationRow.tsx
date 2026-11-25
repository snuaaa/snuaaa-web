import { ChevronDown, Pencil } from 'lucide-react';
import { Button } from '~/components/ui';
import { cn } from '~/lib/utils';
import type { OfficerGeneration } from '~/services/types';
import OfficerRoleList, { Highlight } from './OfficerRoleList';

type GenerationRowProps = {
  generation: OfficerGeneration;
  open: boolean;
  onToggle: () => void;
  query?: string;
  onEdit?: () => void;
};

/** "92대 · 회장 박시원", which opens to every role of that 기수. */
export default function GenerationRow({
  generation,
  open,
  onToggle,
  query,
  onEdit,
}: GenerationRowProps) {
  const { president, roles } = generation;
  const panelId = `generation-${generation.generation}`;
  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-13 w-full items-center gap-3 px-4 text-left transition-colors duration-(--duration-quick) ease-night hover:bg-gray-50 motion-reduce:transition-none md:px-5"
      >
        <span className="w-12 shrink-0 text-body font-semibold tabular-nums">
          {generation.generation}대
        </span>
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="text-label font-normal text-fg-muted">회장</span>
          <span className="truncate text-body">
            <Highlight text={president} query={query} />
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-500 transition-transform duration-(--duration-quick) ease-night motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={panelId}
          className="flex flex-col gap-3 px-4 pt-1 pb-4 animate-light-in motion-reduce:animate-none md:px-5 md:pl-[76px]"
        >
          {roles.length > 0 ? (
            <OfficerRoleList roles={roles} query={query} />
          ) : (
            <p className="text-label font-normal text-fg-muted">
              다른 임원 기록이 없어요.
            </p>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="self-start"
            >
              <Pencil aria-hidden />
              {generation.generation}대 수정
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

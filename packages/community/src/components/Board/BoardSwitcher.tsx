import { Link } from '@tanstack/react-router';
import { Check, ChevronRight, FileText, Image, List } from 'lucide-react';
import { Sheet, Tag } from '~/components/ui';
import { useNavSection } from '~/components/Layout/useNavSection';
import { useAuth } from '~/contexts/auth';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import { BOARD_GROUPS, canRead, canWrite } from './boardUtils';

type BoardSwitcherProps = {
  currentBoardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function BoardRow({
  board,
  current,
  readOnly,
  onSelect,
}: {
  board: Board;
  current: boolean;
  readOnly: boolean;
  onSelect: () => void;
}) {
  const Icon = board.board_type === 'D' ? FileText : List;
  return (
    <Link
      to="/board/$board_id"
      params={{ board_id: board.board_id }}
      onClick={onSelect}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'flex min-h-13 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors',
        current ? 'bg-navy-50' : 'hover:bg-gray-50',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md [&_svg]:size-[18px]',
          current ? 'bg-primary text-accent' : 'bg-gray-100 text-gray-700',
        )}
        aria-hidden
      >
        <Icon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className={cn('text-[15px]', current ? 'font-bold' : 'font-medium')}
          >
            {board.board_name}
          </span>
          {readOnly && <Tag>읽기 전용</Tag>}
        </span>
        {board.board_desc && (
          <span className="truncate text-caption text-fg-muted">
            {board.board_desc}
          </span>
        )}
      </span>
      {current && (
        <Check className="size-5 shrink-0 text-primary" strokeWidth={2.2} />
      )}
    </Link>
  );
}

/** Mobile sheet that opens from the board name in the board header. */
export default function BoardSwitcher({
  currentBoardId,
  open,
  onOpenChange,
}: BoardSwitcherProps) {
  const { boardsInfo } = useBoards();
  const { destinations } = useNavSection();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="게시판">
      <div className="flex flex-col gap-1 pb-2">
        {BOARD_GROUPS.map((group) => {
          const boards = boardsInfo.filter(
            (board) => board.menu === group.menu && canRead(board, grade),
          );
          if (boards.length === 0) return null;
          return (
            <div key={group.menu} className="flex flex-col pt-2.5">
              <div className="px-2 pb-1.5 text-caption font-semibold text-fg-muted">
                {group.name}
              </div>
              {boards.map((board) => (
                <BoardRow
                  key={board.board_id}
                  board={board}
                  current={board.board_id === currentBoardId}
                  readOnly={!canWrite(board, grade)}
                  onSelect={close}
                />
              ))}
            </div>
          );
        })}
        <Link
          to="/board/$board_id"
          params={{ board_id: destinations.photo }}
          onClick={close}
          className="mt-3 flex min-h-12 items-center gap-2.5 rounded-lg bg-accent-soft px-3 text-sm [&_svg]:size-[18px] [&_svg]:shrink-0"
        >
          <Image aria-hidden />
          <span className="flex-1">
            추억 만들기 · 별사진 · 사진전은 <b>사진</b> 탭에서
          </span>
          <ChevronRight className="size-4!" aria-hidden />
        </Link>
      </div>
    </Sheet>
  );
}

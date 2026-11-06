import { FC, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ImagePlus } from 'lucide-react';

import ExhibitionFormSheet from '~/components/Exhibition/ExhibitionFormSheet';
import { Button, Fab, Skeleton } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { useExhibitionsInBoard } from '~/hooks/queries/useExhibitionQueries';
import { resolveImageUrl } from '~/lib/utils';
import { Board, Exhibition } from '~/services/types';
import { convertDateWithDay } from '~/utils/convertDate';
import { canWrite } from './boardUtils';
import PhotoEmpty from './PhotoBoard/PhotoEmpty';
import PhotoTabLayout from './PhotoBoard/PhotoTabLayout';

/** Shows 전시 중 from the opening day through the closing day. */
function isOnDisplay({ exhibition }: Exhibition, now = new Date()) {
  const start = new Date(exhibition.date_start);
  const end = new Date(exhibition.date_end);
  end.setHours(23, 59, 59, 999);
  return start <= now && now <= end;
}

function Poster({ exhibition }: Exhibition) {
  return exhibition.poster_thumbnail_path ? (
    <img
      src={resolveImageUrl(exhibition.poster_thumbnail_path)}
      alt=""
      loading="lazy"
      className="size-full object-cover"
    />
  ) : null;
}

/** The newest 사진전, large on top. */
function FeaturedExhibition({ content }: { content: Exhibition }) {
  const { exhibition } = content;
  return (
    <Link
      to="/exhibition/$exhibition_id"
      params={{ exhibition_id: String(content.content_id) }}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-surface-brand text-fg-on-brand md:h-[400px] md:flex-row"
    >
      <span className="relative block h-[300px] shrink-0 bg-surface-brand-raised md:h-auto md:w-[300px]">
        <Poster {...content} />
        {isOnDisplay(content) && (
          <span className="absolute top-3.5 left-3.5 rounded-full bg-accent px-2.5 py-1 text-caption font-bold text-navy-900 md:hidden">
            전시 중
          </span>
        )}
      </span>
      <span className="flex flex-col gap-1.5 px-[18px] pt-4 pb-[18px] md:justify-center md:gap-3 md:p-10">
        {isOnDisplay(content) && (
          <span className="hidden self-start rounded-full bg-accent px-2.5 py-1 text-caption font-bold text-navy-900 md:inline">
            전시 중
          </span>
        )}
        <span className="text-label font-normal text-fg-on-brand-muted md:text-sm">
          제{exhibition.exhibition_no}회 천체사진전
        </span>
        <span className="text-title break-keep md:text-[32px] md:leading-[1.3] md:tracking-[-0.6px]">
          {exhibition.slogan}
        </span>
        <span className="flex flex-col gap-0.5 pt-1 text-label font-normal text-navy-200 md:gap-1 md:pt-0 md:text-sm">
          <span>
            {convertDateWithDay(exhibition.date_start)} ~{' '}
            {convertDateWithDay(exhibition.date_end)}
          </span>
          {exhibition.place && <span>{exhibition.place}</span>}
        </span>
        <span className="mt-2 hidden h-11 items-center self-start rounded-md bg-surface px-[18px] text-sm font-semibold text-primary transition-colors group-hover:bg-primary-soft md:flex">
          작품 보러가기
        </span>
      </span>
    </Link>
  );
}

function PastExhibition({ content }: { content: Exhibition }) {
  const { exhibition } = content;
  return (
    <li>
      <Link
        to="/exhibition/$exhibition_id"
        params={{ exhibition_id: String(content.content_id) }}
        className="group flex flex-col gap-2"
      >
        <span className="block aspect-[3/4] overflow-hidden rounded-[12px] bg-navy-800">
          <Poster {...content} />
        </span>
        <span className="flex flex-col gap-0.5 px-0.5">
          <span className="text-caption text-fg-muted">
            제{exhibition.exhibition_no}회 ·{' '}
            {new Date(exhibition.date_start).getFullYear()}
          </span>
          <span className="line-clamp-2 text-sm font-semibold leading-[1.4] break-keep group-hover:text-navy-700">
            {exhibition.slogan}
          </span>
        </span>
      </Link>
    </li>
  );
}

type ExhibitBoardProps = {
  boardInfo: Board;
};

/** 사진전: the newest exhibition as a large poster card, then the rest. */
const ExhibitBoard: FC<ExhibitBoardProps> = ({ boardInfo }) => {
  const [isCreating, setIsCreating] = useState(false);
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const writable = canWrite(boardInfo, grade);

  const {
    data: exhibitions,
    isLoading,
    isError,
    refetch,
  } = useExhibitionsInBoard(boardInfo.board_id);

  const list = (exhibitions ?? []).filter((content) => content.exhibition);
  const [latest, ...past] = list;

  return (
    <PhotoTabLayout
      board={boardInfo}
      action={
        writable && (
          <Button
            onClick={() => setIsCreating(true)}
            className="[&_svg]:text-accent"
          >
            <ImagePlus className="size-[18px]!" />
            사진전 만들기
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-5 px-4 pt-4 pb-6 md:gap-7 md:p-0">
        {isError ? (
          <PhotoEmpty
            title="사진전을 불러오지 못했어요"
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          />
        ) : isLoading ? (
          <>
            <Skeleton className="h-[420px] rounded-[20px] md:h-[400px]" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-[12px]" />
              ))}
            </div>
          </>
        ) : !latest ? (
          <PhotoEmpty title="아직 사진전이 없어요" />
        ) : (
          <>
            <FeaturedExhibition content={latest} />
            {past.length > 0 && (
              <div className="flex flex-col gap-2.5 md:gap-3.5">
                <h2 className="px-0.5 text-heading md:text-lg">지난 사진전</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
                  {past.map((content) => (
                    <PastExhibition
                      key={content.content_id}
                      content={content}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {writable && (
        <>
          <div className="h-18 md:hidden" aria-hidden />
          <Fab
            icon={<ImagePlus />}
            onClick={() => setIsCreating(true)}
            className="md:hidden"
          >
            사진전 만들기
          </Fab>
        </>
      )}
      <ExhibitionFormSheet
        open={isCreating}
        onOpenChange={setIsCreating}
        boardId={boardInfo.board_id}
        defaultNo={
          latest?.exhibition ? latest.exhibition.exhibition_no + 1 : undefined
        }
        onSaved={() => setIsCreating(false)}
      />
    </PhotoTabLayout>
  );
};

export default ExhibitBoard;

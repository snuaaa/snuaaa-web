import { FC, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ImagePlus, Images, Link2 } from 'lucide-react';

import { canWrite } from '~/components/Board/boardUtils';
import ExhibitPhotoUploader from '~/components/Exhibition/ExhibitPhotoUploader';
import { Button, Fab, Toast, useToast } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import {
  exhibitionKeys,
  useExhibition,
} from '~/hooks/queries/useExhibitionQueries';
import { resolveImageUrl } from '~/lib/utils';
import { ExhibitPhoto } from '~/services/types';
import { convertDateWithDay } from '~/utils/convertDate';

/** The works in exhibition order, each with its number and title. */
function WorkGrid({ works }: { works: ExhibitPhoto[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 md:gap-y-7 md:px-0">
      {works.map((work) => (
        <li key={work.content_id}>
          <Link
            to="."
            search={(prev) => ({ ...prev, exhibitPhoto: work.content_id })}
            className="group flex flex-col gap-2"
          >
            <span className="block aspect-[4/5] overflow-hidden rounded-[10px] bg-navy-800">
              <img
                src={resolveImageUrl(work.exhibitPhoto.thumbnail_path)}
                alt={work.title}
                loading="lazy"
                className="size-full object-cover transition-transform md:group-hover:scale-[1.03]"
              />
            </span>
            <span className="flex min-w-0 items-baseline gap-1.5 px-0.5">
              <span className="shrink-0 text-caption font-semibold text-fg-muted tabular-nums">
                {work.exhibitPhoto.order}
              </span>
              <span className="truncate text-sm font-semibold group-hover:text-navy-700">
                {work.title}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 사진전 상세: the exhibition's poster and details over its works. */
const ExhibitionPage: FC = () => {
  const { exhibition_id } = useParams({ from: '/exhibition/$exhibition_id' });
  const exhibitionId = Number(exhibition_id);
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();

  const { data } = useExhibition(exhibitionId);
  const [isCreating, setIsCreating] = useState(false);

  // The route loader fills the cache before this renders.
  const content = data?.exhibition.exhibitionInfo;
  if (!data || !content?.exhibition) return null;

  const { exhibition, board } = content;
  const works = data.exhibitPhotos.exhibitPhotosInfo;
  const writable = canWrite(board, grade);
  const posterSrc = resolveImageUrl(
    exhibition.poster_thumbnail_path || exhibition.poster_path,
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.show('링크를 복사했어요');
    } catch {
      toast.show('링크를 복사하지 못했어요');
    }
  };

  const openUpload = () => setIsCreating(true);

  const backLink = {
    to: '/board/$board_id',
    params: { board_id: board.board_id },
  } as const;

  return (
    <div className="flex flex-1 flex-col bg-surface text-fg md:bg-transparent">
      <header className="bg-surface-brand text-fg-on-brand md:border-t md:border-surface-brand-raised">
        <div className="flex items-center justify-between px-1 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
          <Link
            {...backLink}
            aria-label="뒤로"
            className="flex size-11 items-center justify-center"
          >
            <ChevronLeft className="size-[22px]" />
          </Link>
          <button
            type="button"
            aria-label="링크 복사"
            onClick={copyLink}
            className="flex size-11 items-center justify-center"
          >
            <Link2 className="size-5" />
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-3.5 px-5 pt-1 pb-6 md:px-6 md:pt-5 md:pb-9">
          <Link
            {...backLink}
            className="hidden h-8 items-center gap-1 self-start text-label font-normal text-fg-on-brand-muted hover:text-fg-on-brand md:flex"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {board.board_name}
          </Link>
          <div className="flex gap-4 md:items-end md:gap-8">
            {posterSrc && (
              <img
                src={posterSrc}
                alt={`제${exhibition.exhibition_no}회 천체사진전 포스터`}
                className="aspect-[3/4] w-24 shrink-0 self-start rounded-[10px] bg-surface-brand-raised object-cover md:w-[200px] md:rounded-[14px]"
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 md:gap-3">
              <span className="text-label font-normal text-fg-on-brand-muted md:text-sm">
                제{exhibition.exhibition_no}회 천체사진전
              </span>
              <h1 className="text-[22px] leading-[1.35] font-bold tracking-[-0.4px] break-keep md:text-[32px] md:leading-[1.3] md:tracking-[-0.6px]">
                {exhibition.slogan}
              </h1>
              <div className="flex flex-col gap-0.5 text-label font-normal text-navy-200 md:gap-1 md:text-sm">
                <span>
                  {convertDateWithDay(exhibition.date_start)} ~{' '}
                  {convertDateWithDay(exhibition.date_end)}
                </span>
                {exhibition.place && <span>{exhibition.place}</span>}
                <span>작품 {works.length}점</span>
              </div>
              {content.text && (
                <p className="mt-1 hidden max-w-[640px] text-sm leading-[1.65] whitespace-pre-line text-navy-200 md:block">
                  {content.text}
                </p>
              )}
            </div>
            {writable && (
              <Button
                variant="accent"
                onClick={openUpload}
                className="hidden shrink-0 md:inline-flex"
              >
                <ImagePlus className="size-[18px]!" />
                작품 올리기
              </Button>
            )}
          </div>
          {content.text && (
            <p className="text-sm leading-relaxed whitespace-pre-line text-navy-200 md:hidden">
              {content.text}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1080px] flex-1 pt-5 pb-8 md:px-6 md:py-8">
        {works.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-[20px] bg-accent-soft text-primary">
              <Images className="size-7" strokeWidth={1.8} aria-hidden />
            </span>
            <p className="text-heading">아직 걸린 작품이 없어요</p>
            {writable && (
              <div className="pt-2">
                <Button onClick={openUpload} className="[&_svg]:text-accent">
                  <ImagePlus className="size-[18px]!" />
                  작품 올리기
                </Button>
              </div>
            )}
          </div>
        ) : (
          <WorkGrid works={works} />
        )}
      </div>

      {writable && works.length > 0 && (
        <>
          <div className="h-18 md:hidden" aria-hidden />
          <Fab icon={<ImagePlus />} onClick={openUpload} className="md:hidden">
            작품 올리기
          </Fab>
        </>
      )}
      <Toast message={toast.message} />

      {isCreating && (
        <ExhibitPhotoUploader
          boardId={content.board_id}
          exhibitionId={exhibitionId}
          exhibitionNo={exhibition.exhibition_no}
          nextOrder={
            works.reduce(
              (max, work) => Math.max(max, work.exhibitPhoto.order ?? 0),
              0,
            ) + 1
          }
          onCreate={() => {
            queryClient.invalidateQueries({
              queryKey: exhibitionKeys.detail(exhibitionId),
            });
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </div>
  );
};

export default ExhibitionPage;

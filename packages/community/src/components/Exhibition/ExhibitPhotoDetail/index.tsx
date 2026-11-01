import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Ellipsis,
  GalleryHorizontalEnd,
  Link2,
  Pencil,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';

import SpinningLoader from '~/components/Common/SpinningLoader';
import LikeButton from '~/components/Photo/PhotoDetail/LikeButton';
import PhotoMeta from '~/components/Photo/PhotoDetail/PhotoMeta';
import PhotoStage from '~/components/Photo/PhotoDetail/PhotoStage';
import {
  Avatar,
  Button,
  ConfirmDialog,
  Sheet,
  SheetAction,
  Toast,
  useToast,
} from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { useLikeContent } from '~/hooks/queries/useContentQueries';
import {
  useDeleteExhibitPhoto,
  useExhibitPhoto,
} from '~/hooks/queries/useExhibitPhotoQueries';
import { exhibitionKeys } from '~/hooks/queries/useExhibitionQueries';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import { cn } from '~/lib/utils';
import { ExhibitPhoto } from '~/services/types';
import ExhibitPhotoEditForm from './ExhibitPhotoEditForm';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/** The photographer: a member links to their page, a name stays text. */
function PhotographerRow({
  photo,
  trailing,
}: {
  photo: ExhibitPhoto;
  trailing?: ReactNode;
}) {
  const { photographer, photographer_alt, order } = photo.exhibitPhoto;
  const name = photographer?.nickname ?? photographer_alt;
  const inner = (
    <>
      {name ? (
        <Avatar
          user={photographer ?? { nickname: name }}
          size={40}
          className="size-9"
        />
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold">
          {name || '작가 미상'}
        </span>
        <span className="text-caption text-fg-muted">
          작품 {order} · 조회 {photo.view_num}
        </span>
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-2.5">
      {photographer ? (
        <Link
          to="/userpage/$uuid"
          params={{ uuid: photographer.user_uuid }}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2.5">{inner}</div>
      )}
      {trailing}
    </div>
  );
}

type Props = {
  exhibitPhotoId: number;
  onClose: () => void;
  onMovePhoto: (exhibitPhotoId: number) => void;
};

/**
 * 사진전 작품 상세, opened over any page by the `?exhibitPhoto=` search
 * param. Laid out like 사진 상세: a full screen on mobile, the photo with a
 * side panel on desktop. Works move in exhibition order.
 */
export default function ExhibitPhotoDetailModal({
  exhibitPhotoId,
  onClose,
  onMovePhoto,
}: Props) {
  useBlockBackgroundScroll();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useViewportSize() === ViewportSize.Desktop;
  const {
    authInfo: {
      user: { user_id: myId },
    },
  } = useAuth();
  const toast = useToast();

  const { data, isLoading, isError, refetch } = useExhibitPhoto(exhibitPhotoId);
  const { mutateAsync: likeContent, isPending: liking } = useLikeContent();
  const { mutateAsync: deletePhoto, isPending: deleting } =
    useDeleteExhibitPhoto();

  const [liked, setLiked] = useState(false);
  const [likeNum, setLikeNum] = useState(0);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const photo = data?.exhibitPhotoInfo;

  useEffect(() => {
    if (!data) return;
    setLiked(data.likeInfo);
    setLikeNum(data.exhibitPhotoInfo.like_num);
  }, [data]);

  // Moving to another work leaves the edit form.
  useEffect(() => setEditing(false), [exhibitPhotoId]);

  // The server lists the exhibition's works in order.
  const works = data?.exhibitPhotosInfo ?? [];
  const index = works.findIndex((w) => w.content_id === exhibitPhotoId);
  const prevId = index > 0 ? works[index - 1].content_id : undefined;
  const nextId =
    index > -1 && index < works.length - 1
      ? works[index + 1].content_id
      : undefined;
  const goPrev = prevId ? () => onMovePhoto(prevId) : undefined;
  const goNext = nextId ? () => onMovePhoto(nextId) : undefined;

  const overlayOpen = editing || menuOpen || confirmOpen;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (overlayOpen || isTyping(e.target)) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && prevId) onMovePhoto(prevId);
      else if (e.key === 'ArrowRight' && nextId) onMovePhoto(nextId);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overlayOpen, onClose, onMovePhoto, prevId, nextId]);

  const exhibitionContent = photo?.parent;
  const exhibition = exhibitionContent?.exhibition;
  const isMine = photo?.user?.user_id === myId;
  const photographer = photo?.exhibitPhoto.photographer;

  const contextLabel = exhibition
    ? `제${exhibition.exhibition_no}회 천체사진전`
    : '사진전';

  const toggleLike = async () => {
    try {
      await likeContent(exhibitPhotoId);
      setLikeNum((n) => (liked ? n - 1 : n + 1));
      setLiked((v) => !v);
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.show('링크를 복사했어요');
    } catch {
      toast.show('링크를 복사하지 못했어요');
    }
  };

  const confirmDelete = async () => {
    if (!photo) return;
    setDeleteError(false);
    try {
      await deletePhoto(exhibitPhotoId);
      queryClient.invalidateQueries({ queryKey: exhibitionKeys.all });
      // Leaving for the exhibition also drops `?exhibitPhoto=`.
      if (exhibitionContent) {
        navigate({
          to: '/exhibition/$exhibition_id',
          params: { exhibition_id: String(exhibitionContent.content_id) },
          replace: true,
        });
      } else {
        navigate({
          to: '/board/$board_id',
          params: { board_id: photo.board_id },
          replace: true,
        });
      }
    } catch (err) {
      console.error(err);
      setDeleteError(true);
    }
  };

  const menuButton = (className: string) => (
    <button
      type="button"
      aria-label="더보기 메뉴"
      aria-haspopup="dialog"
      onClick={() => setMenuOpen(true)}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center',
        className,
      )}
    >
      <Ellipsis className="size-5" />
    </button>
  );

  const closeButton = (className: string) => (
    <button
      type="button"
      aria-label="닫기"
      onClick={onClose}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center',
        className,
      )}
    >
      <X className="size-[22px]" />
    </button>
  );

  const likeButton = (size: 'md' | 'sm') => (
    <LikeButton
      liked={liked}
      count={likeNum}
      onClick={toggleLike}
      disabled={liking}
      size={size}
    />
  );

  const editForm = photo && (
    <ExhibitPhotoEditForm
      photo={photo}
      onCancel={() => setEditing(false)}
      onSaved={() => setEditing(false)}
    />
  );

  const exhibitionLink = (className: string, children: ReactNode) =>
    exhibitionContent && (
      <Link
        to="/exhibition/$exhibition_id"
        params={{ exhibition_id: String(exhibitionContent.content_id) }}
        className={className}
      >
        {children}
      </Link>
    );

  let body: ReactNode;
  if (!photo) {
    body = (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-fg-on-brand">
        {isLoading ? (
          <SpinningLoader size={40} />
        ) : (
          isError && (
            <>
              <p className="text-heading">작품을 불러오지 못했어요</p>
              <p className="text-sm text-fg-on-brand-muted">
                삭제되었거나 볼 수 없는 작품일 수 있어요.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => refetch()}>
                  다시 시도
                </Button>
                <Button variant="accent" onClick={onClose}>
                  닫기
                </Button>
              </div>
            </>
          )
        )}
        {closeButton('absolute top-4 right-4 rounded-full bg-white/10')}
      </div>
    );
  } else if (isDesktop) {
    body = (
      <>
        {closeButton(
          'absolute top-4 right-4 rounded-full bg-white/10 text-white hover:bg-white/20',
        )}
        <div className="flex h-[min(780px,calc(100dvh-80px))] w-[min(1180px,calc(100vw-200px))] overflow-hidden rounded-lg shadow-lg">
          <PhotoStage
            src={photo.exhibitPhoto.file_path}
            alt={photo.title}
            onPrev={goPrev}
            onNext={goNext}
            label={exhibition ? exhibition.slogan : contextLabel}
            className="min-w-0 flex-1"
          />
          <aside className="flex w-[400px] shrink-0 flex-col bg-surface text-fg">
            {editing ? (
              editForm
            ) : (
              <>
                <div className="border-b border-gray-100 py-4 pr-3 pl-5">
                  <PhotographerRow
                    photo={photo}
                    trailing={menuButton(
                      'size-10 rounded-full text-gray-700 hover:bg-gray-100',
                    )}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-[18px] pb-5">
                  <h1 className="text-title break-keep">{photo.title}</h1>
                  {photo.text && (
                    <p className="text-sm leading-[1.7] whitespace-pre-line">
                      {photo.text}
                    </p>
                  )}
                  <PhotoMeta photo={photo.exhibitPhoto} variant="panel" />
                  {exhibitionLink(
                    'flex items-center gap-1 self-start text-label font-normal text-navy-700 hover:underline',
                    <>
                      <GalleryHorizontalEnd className="size-4" aria-hidden />
                      {contextLabel} 작품 모두 보기
                    </>,
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                  {likeButton('sm')}
                  <button
                    type="button"
                    aria-label="링크 복사"
                    onClick={copyLink}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-gray-700 hover:bg-gray-50"
                  >
                    <Link2 className="size-4" strokeWidth={1.8} />
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </>
    );
  } else if (editing) {
    body = editForm;
  } else {
    body = (
      <>
        <div className="bg-navy-950 text-fg-on-brand">
          <div className="flex items-center justify-between px-1 pt-safe-2 pb-2">
            {closeButton('')}
            <span className="min-w-0 truncate px-2 text-label font-normal text-fg-on-brand-muted">
              {contextLabel}
            </span>
            {menuButton('')}
          </div>
          <PhotoStage
            src={photo.exhibitPhoto.file_path}
            alt={photo.title}
            onPrev={goPrev}
            onNext={goNext}
            className="h-[min(460px,60dvh)]"
          />
        </div>
        <div className="flex flex-col gap-5 px-4 pt-5 pb-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-[22px] leading-[1.35] font-bold tracking-[-0.4px] break-keep">
              {photo.title}
            </h1>
            <PhotographerRow photo={photo} trailing={likeButton('md')} />
            {photo.text && (
              <p className="text-body leading-[1.7] whitespace-pre-line">
                {photo.text}
              </p>
            )}
          </div>
          <PhotoMeta photo={photo.exhibitPhoto} />
          {exhibitionLink(
            'flex items-center gap-3 rounded-[12px] border border-border p-3',
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-navy-800 text-navy-300">
                <GalleryHorizontalEnd className="size-5" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">
                  {exhibition?.slogan ?? contextLabel}
                </span>
                <span className="text-caption text-fg-muted">
                  {contextLabel} 작품 모두 보기
                </span>
              </span>
              <ChevronRight className="size-4 text-fg-muted" aria-hidden />
            </>,
          )}
        </div>
      </>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo?.title ?? '작품'}
      // Only a click on the dark backdrop itself closes it. Clicks in the
      // menu sheet and dialogs bubble here through the React tree too.
      onClick={(e) => isDesktop && e.target === e.currentTarget && onClose()}
      className={cn(
        'fixed inset-0 z-40 flex',
        isDesktop
          ? 'items-center justify-center bg-navy-950/92'
          : cn(
              'flex-col overflow-y-auto',
              photo ? 'bg-surface' : 'bg-navy-950',
            ),
      )}
    >
      {body}

      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="작품 메뉴"
        hideTitle
      >
        {isMine && (
          <SheetAction
            icon={<Pencil />}
            onClick={() => {
              setMenuOpen(false);
              setEditing(true);
            }}
          >
            정보 수정
          </SheetAction>
        )}
        <SheetAction
          icon={<Link2 />}
          onClick={() => {
            setMenuOpen(false);
            copyLink();
          }}
        >
          링크 복사
        </SheetAction>
        {photographer && (
          <SheetAction
            icon={<UserIcon />}
            onClick={() => {
              setMenuOpen(false);
              navigate({
                to: '/userpage/$uuid',
                params: { uuid: photographer.user_uuid },
              });
            }}
          >
            {photographer.nickname} 님 페이지 보기
          </SheetAction>
        )}
        {isMine && (
          <SheetAction
            icon={<Trash2 />}
            tone="danger"
            onClick={() => {
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
          >
            삭제
          </SheetAction>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setDeleteError(false);
        }}
        title="작품을 삭제할까요?"
        description={
          deleteError
            ? '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'
            : '삭제한 작품은 되돌릴 수 없어요.'
        }
        confirmLabel="삭제"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
      />
      <Toast message={toast.message} />
    </div>
  );
}

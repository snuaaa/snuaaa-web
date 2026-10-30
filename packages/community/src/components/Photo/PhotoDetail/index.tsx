import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ChevronRight,
  Ellipsis,
  Heart,
  Images,
  Link2,
  Pencil,
  Star,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';

import CommentSection from '~/components/Comment/CommentSection';
import { formatListDate } from '~/components/Board/boardUtils';
import SpinningLoader from '~/components/Common/SpinningLoader';
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
import { useUpdateAlbumThumbnail } from '~/hooks/queries/useAlbumQueries';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { useLikeContent } from '~/hooks/queries/useContentQueries';
import {
  useDeletePhoto,
  usePhotoDetail,
} from '~/hooks/queries/usePhotoQueries';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import { cn } from '~/lib/utils';
import { PhotoNavigationScope } from '~/services/PhotoService';
import { Photo } from '~/services/types';
import PhotoEditForm from './PhotoEditForm';
import PhotoMeta from './PhotoMeta';
import PhotoStage from './PhotoStage';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

function LikeButton({
  liked,
  count,
  onClick,
  disabled,
  size,
}: {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled: boolean;
  size: 'md' | 'sm';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={`추천 ${count}`}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-full border font-semibold transition-colors',
        size === 'md' ? 'h-10 px-3.5 text-sm' : 'h-9 px-3 text-label',
        liked
          ? 'border-danger bg-danger-soft'
          : 'border-gray-300 bg-surface hover:bg-gray-50',
      )}
    >
      <Heart
        className={cn(
          size === 'md' ? 'size-[18px]' : 'size-4',
          liked ? 'fill-danger text-danger' : 'text-gray-700',
        )}
        strokeWidth={1.8}
        aria-hidden
      />
      {count}
    </button>
  );
}

function TagLinks({ photo, size }: { photo: Photo; size: 'md' | 'sm' }) {
  if (!photo.tags?.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {photo.tags.map((tag) => (
        <li key={tag.tag_id}>
          <Link
            to="/board/$board_id"
            params={{ board_id: photo.board_id }}
            search={{ tags: [tag.tag_id] }}
            className={cn(
              'flex items-center rounded-full border border-gray-300 px-3 text-gray-700 hover:border-gray-400 hover:text-fg',
              size === 'md'
                ? 'h-8 text-label font-normal'
                : 'h-[30px] text-caption',
            )}
          >
            # {tag.tag_name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function AuthorRow({
  photo,
  trailing,
}: {
  photo: Photo;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Link
        to="/userpage/$uuid"
        params={{ uuid: photo.user.user_uuid }}
        className="flex min-w-0 flex-1 items-center gap-2.5"
      >
        <Avatar user={photo.user} size={40} className="size-9" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">
            {photo.user.nickname}
          </span>
          <span className="text-caption text-fg-muted">
            {formatListDate(photo.createdAt)} · 조회 {photo.view_num}
          </span>
        </span>
      </Link>
      {trailing}
    </div>
  );
}

type Props = {
  photoId: number;
  navigation?: PhotoNavigationScope;
  onClose: () => void;
  onMovePhoto: (photoId: number) => void;
};

/**
 * 사진 상세, opened over any page by the `?photo=` search param.
 * Mobile: a full screen with the photo on top and the details below.
 * Desktop: a dark overlay with the photo on the left and a side panel.
 */
export default function PhotoDetailModal({
  photoId,
  navigation,
  onClose,
  onMovePhoto,
}: Props) {
  useBlockBackgroundScroll();
  const navigate = useNavigate();
  const isDesktop = useViewportSize() === ViewportSize.Desktop;
  const { boardsInfo } = useBoards();
  const {
    authInfo: {
      user: { user_id: myId, grade },
    },
  } = useAuth();
  const toast = useToast();

  const { data, isLoading, isError, refetch } = usePhotoDetail(
    photoId,
    navigation,
  );
  const { mutateAsync: likeContent, isPending: liking } = useLikeContent();
  const { mutateAsync: deletePhoto, isPending: deleting } =
    useDeletePhoto(photoId);
  const { mutateAsync: updateThumbnail } = useUpdateAlbumThumbnail();

  const [liked, setLiked] = useState(false);
  const [likeNum, setLikeNum] = useState(0);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const photo = data?.photoInfo;

  useEffect(() => {
    if (!data) return;
    setLiked(data.likeInfo);
    setLikeNum(data.photoInfo.like_num);
  }, [data]);

  // Moving to another photo leaves the edit form.
  useEffect(() => setEditing(false), [photoId]);

  // The server's "next" photo is the newer one, shown on the left.
  const prevId = data?.nextPhoto?.content_id;
  const nextId = data?.prevPhoto?.content_id;
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

  const album = photo?.parent;
  const isMine = photo?.author_id === myId;
  const isAlbumOwner = !!album && album.author_id === myId;
  const canComment = grade < 10;

  const contextLabel = album
    ? album.title
    : navigation === 'user' && photo
      ? `${photo.user.nickname}님의 사진`
      : boardsInfo.find((b) => b.board_id === photo?.board_id)?.board_name;

  const toggleLike = async () => {
    try {
      await likeContent(photoId);
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

  const setAsCover = async () => {
    if (!album) return;
    try {
      await updateThumbnail({
        album_id: album.content_id,
        data: { tn_photo_id: photoId },
      });
      toast.show('대표 사진으로 정했어요');
    } catch (err) {
      console.error(err);
      toast.show('대표 사진으로 정하지 못했어요');
    }
  };

  const confirmDelete = async () => {
    if (!photo) return;
    setDeleteError(false);
    try {
      await deletePhoto();
      // Leaving for the list also drops `?photo=`, which closes the modal.
      if (album) {
        navigate({
          to: '/album/$album_id',
          params: { album_id: String(album.content_id) },
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
    <PhotoEditForm
      photo={photo}
      boardTags={data?.boardTagInfo ?? []}
      onCancel={() => setEditing(false)}
      onSaved={() => setEditing(false)}
    />
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
              <p className="text-heading">사진을 불러오지 못했어요</p>
              <p className="text-sm text-fg-on-brand-muted">
                삭제되었거나 볼 수 없는 사진일 수 있어요.
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
            src={photo.photo.img_url ?? photo.photo.file_path}
            alt={photo.title}
            onPrev={goPrev}
            onNext={goNext}
            label={contextLabel}
            className="min-w-0 flex-1"
          />
          <aside className="flex w-[400px] shrink-0 flex-col bg-surface text-fg">
            {editing ? (
              editForm
            ) : (
              <>
                <div className="border-b border-gray-100 py-4 pr-3 pl-5">
                  <AuthorRow
                    photo={photo}
                    trailing={menuButton(
                      'size-10 rounded-full text-gray-700 hover:bg-gray-100',
                    )}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                  <div className="flex flex-col gap-4 px-5 pt-[18px]">
                    <h1 className="text-title break-keep">{photo.title}</h1>
                    {photo.text && (
                      <p className="text-sm leading-[1.7] whitespace-pre-line">
                        {photo.text}
                      </p>
                    )}
                    <PhotoMeta photo={photo.photo} variant="panel" />
                    <TagLinks photo={photo} size="sm" />
                    {album && (
                      <Link
                        to="/album/$album_id"
                        params={{ album_id: String(album.content_id) }}
                        className="flex items-center gap-1 self-start text-label font-normal text-navy-700 hover:underline"
                      >
                        <Images className="size-4" aria-hidden />
                        {album.title} 앨범 보기
                      </Link>
                    )}
                  </div>
                  {canComment && (
                    <CommentSection
                      contentId={photoId}
                      contentAuthorId={photo.author_id}
                      initialCount={photo.comment_num}
                      variant="panel"
                      className="mt-4 border-t border-gray-100"
                    />
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
          <div className="flex items-center justify-between px-1 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
            {closeButton('')}
            <span className="min-w-0 truncate px-2 text-label font-normal text-fg-on-brand-muted">
              {contextLabel}
            </span>
            {menuButton('')}
          </div>
          <PhotoStage
            src={photo.photo.img_url ?? photo.photo.file_path}
            alt={photo.title}
            onPrev={goPrev}
            onNext={goNext}
            className="h-[min(460px,60dvh)]"
          />
        </div>
        <div className="flex flex-col gap-5 px-4 pt-5 pb-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-[22px] leading-[1.35] font-bold tracking-[-0.4px] break-keep">
              {photo.title}
            </h1>
            <AuthorRow photo={photo} trailing={likeButton('md')} />
            {photo.text && (
              <p className="text-body leading-[1.7] whitespace-pre-line">
                {photo.text}
              </p>
            )}
          </div>
          <PhotoMeta photo={photo.photo} />
          <TagLinks photo={photo} size="md" />
          {album && (
            <Link
              to="/album/$album_id"
              params={{ album_id: String(album.content_id) }}
              className="flex items-center gap-3 rounded-[12px] border border-border p-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-navy-800 text-navy-300">
                <Images className="size-5" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">
                  {album.title}
                </span>
                <span className="text-caption text-fg-muted">
                  앨범의 다른 사진 보기
                </span>
              </span>
              <ChevronRight className="size-4 text-fg-muted" aria-hidden />
            </Link>
          )}
        </div>
        {canComment && (
          <>
            <div className="h-2 shrink-0 bg-gray-50" aria-hidden />
            <CommentSection
              contentId={photoId}
              contentAuthorId={photo.author_id}
              initialCount={photo.comment_num}
              variant="panel"
            />
          </>
        )}
      </>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo?.title ?? '사진'}
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
        title="사진 메뉴"
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
        {isAlbumOwner && (
          <SheetAction
            icon={<Star />}
            onClick={() => {
              setMenuOpen(false);
              setAsCover();
            }}
          >
            앨범 대표 사진으로
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
        {isMine ? (
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
        ) : (
          photo && (
            <SheetAction
              icon={<UserIcon />}
              onClick={() => {
                setMenuOpen(false);
                navigate({
                  to: '/userpage/$uuid',
                  params: { uuid: photo.user.user_uuid },
                });
              }}
            >
              {photo.user.nickname} 님 페이지 보기
            </SheetAction>
          )
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setDeleteError(false);
        }}
        title="사진을 삭제할까요?"
        description={
          deleteError
            ? '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'
            : '삭제한 사진은 되돌릴 수 없어요.'
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

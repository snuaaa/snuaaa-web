import { FC, useState } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Ellipsis,
  Image as ImageIcon,
  Link2,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react';

import { formatListDate } from '~/components/Board/boardUtils';
import AlbumFormSheet from '~/components/Album/AlbumFormSheet';
import PhotoUploader from '~/components/Photo/PhotoUploader';
import {
  Button,
  ConfirmDialog,
  Fab,
  Sheet,
  SheetAction,
  Toast,
  useToast,
} from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import {
  albumKeys,
  useAlbum,
  useDeleteAlbum,
} from '~/hooks/queries/useAlbumQueries';
import { cn, resolveImageUrl } from '~/lib/utils';
import { Album, Photo } from '~/services/types';

const headerTagClassName =
  'rounded-sm px-2 py-[3px] text-micro md:text-caption md:font-semibold';

function PhotoSquares({
  photos,
  coverId,
}: {
  photos: Photo[];
  coverId?: number;
}) {
  return (
    <ul className="grid grid-cols-3 gap-0.5 pt-0.5 sm:grid-cols-4 md:grid-cols-6 md:gap-2 md:pt-0">
      {photos.map((photo) => (
        <li key={photo.content_id}>
          <Link
            to="."
            search={(prev) => ({ ...prev, photo: photo.content_id })}
            className="group relative block aspect-square overflow-hidden bg-navy-800 md:rounded-[10px]"
          >
            <img
              src={resolveImageUrl(
                photo.photo.thumbnail_url ?? photo.photo.thumbnail_path,
              )}
              alt={photo.title || '사진'}
              loading="lazy"
              className="size-full object-cover transition-transform md:group-hover:scale-[1.03]"
            />
            {photo.content_id === coverId && (
              <span className="absolute top-1.5 left-1.5 rounded-[4px] bg-accent px-1.5 py-0.5 text-[10px] font-bold text-navy-900 md:top-2 md:left-2 md:text-micro">
                대표
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

type AlbumHeaderProps = {
  album: Album;
  categoryName?: string;
  photoCount: number;
  isOwner: boolean;
  canUpload: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: () => void;
};

/** Navy band with the album's details; owner actions on desktop. */
function AlbumHeader({
  album,
  categoryName,
  photoCount,
  isOwner,
  canUpload,
  onMenu,
  onEdit,
  onDelete,
  onUpload,
}: AlbumHeaderProps) {
  const backLink = {
    to: '/board/$board_id',
    params: { board_id: album.board_id },
  } as const;

  return (
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
          aria-label="앨범 메뉴"
          aria-haspopup="dialog"
          onClick={onMenu}
          className="flex size-11 items-center justify-center"
        >
          <Ellipsis className="size-5" />
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-2 px-5 pt-1 pb-[18px] md:gap-3.5 md:px-6 md:pt-5 md:pb-8">
        <Link
          {...backLink}
          className="hidden h-8 items-center gap-1 self-start text-label font-normal text-fg-on-brand-muted hover:text-fg-on-brand md:flex"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {album.board.board_name}
        </Link>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 md:gap-2.5">
            <div className="flex gap-1.5">
              {categoryName && (
                <span
                  className={cn(
                    headerTagClassName,
                    'bg-navy-200 text-navy-900',
                  )}
                >
                  {categoryName}
                </span>
              )}
              <span
                className={cn(
                  headerTagClassName,
                  'bg-surface-brand-raised text-fg-on-brand',
                )}
              >
                {album.album.is_private ? '개인 앨범' : '그룹 앨범'}
              </span>
            </div>
            <h1 className="text-[22px] leading-[1.35] font-bold tracking-[-0.4px] break-keep md:text-[28px] md:tracking-[-0.5px]">
              {album.title}
            </h1>
            <p className="text-label font-normal text-fg-on-brand-muted md:text-sm">
              {album.user.nickname} · {formatListDate(album.createdAt)} · 사진{' '}
              {photoCount}장
            </p>
            {album.text && (
              <p className="max-w-[680px] text-sm leading-relaxed whitespace-pre-line text-navy-200 md:leading-[1.65]">
                {album.text}
              </p>
            )}
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  onClick={onEdit}
                  className="border border-navy-700 text-fg-on-brand hover:bg-surface-brand-raised"
                >
                  앨범 수정
                </Button>
                <Button
                  variant="ghost"
                  onClick={onDelete}
                  className="border border-navy-700 text-danger-soft hover:bg-surface-brand-raised"
                >
                  삭제
                </Button>
              </>
            )}
            {canUpload && (
              <Button variant="accent" onClick={onUpload}>
                <Upload className="size-[18px]!" />
                사진 올리기
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/** 앨범 상세: the album's details over a square grid of its photos. */
const AlbumPage: FC = () => {
  const { album_id: albumId } = useParams({ from: '/album/$album_id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    authInfo: {
      user: { user_id: myId },
    },
  } = useAuth();

  const { data } = useAlbum(Number(albumId));
  const { mutateAsync: deleteAlbum, isPending: deleting } = useDeleteAlbum();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // The route loader fills the cache before this renders.
  if (!data) return null;

  const { albumInfo: album, categoryInfo, tagInfo } = data.albumData;
  const photos = data.photos;
  const isOwner = album.user.user_id === myId;
  const canUpload = !album.album.is_private || isOwner;
  const categoryName = categoryInfo?.find(
    (cate) => cate.category_id === album.category_id,
  )?.category_name;
  const coverId = album.album.tn_photo_id ?? undefined;

  const invalidateAlbum = () =>
    queryClient.invalidateQueries({
      queryKey: albumKeys.detail(Number(albumId)),
    });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.show('링크를 복사했어요');
    } catch {
      toast.show('링크를 복사하지 못했어요');
    }
  };

  const confirmDelete = async () => {
    setDeleteError(false);
    try {
      await deleteAlbum(Number(albumId));
      navigate({
        to: '/board/$board_id',
        params: { board_id: album.board_id },
        replace: true,
      });
    } catch (err) {
      console.error(err);
      setDeleteError(true);
    }
  };

  const uploadButton = (
    <Button
      onClick={() => setIsUploading(true)}
      className="[&_svg]:text-accent"
    >
      <Upload className="size-[18px]!" />
      사진 올리기
    </Button>
  );

  return (
    <div className="flex flex-1 flex-col bg-surface text-fg md:bg-transparent">
      <AlbumHeader
        album={album}
        categoryName={categoryName}
        photoCount={photos.length}
        isOwner={isOwner}
        canUpload={canUpload}
        onMenu={() => setMenuOpen(true)}
        onEdit={() => setIsEditing(true)}
        onDelete={() => setConfirmOpen(true)}
        onUpload={() => setIsUploading(true)}
      />

      <div className="mx-auto w-full max-w-[1080px] flex-1 md:px-6 md:py-6">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-[20px] bg-accent-soft text-primary">
              <ImageIcon className="size-7" strokeWidth={1.8} aria-hidden />
            </span>
            <p className="text-heading">
              {isOwner ? '앨범이 만들어졌어요' : '아직 사진이 없어요'}
            </p>
            {canUpload && (
              <>
                <p className="text-sm leading-relaxed text-gray-700">
                  첫 사진을 올려 앨범을 채워 보세요.
                </p>
                <div className="pt-2">{uploadButton}</div>
              </>
            )}
          </div>
        ) : (
          <PhotoSquares photos={photos} coverId={coverId} />
        )}
      </div>

      {canUpload && photos.length > 0 && (
        <>
          <div className="h-18 md:hidden" aria-hidden />
          <Fab
            icon={<Upload />}
            onClick={() => setIsUploading(true)}
            className="md:hidden"
          >
            사진 올리기
          </Fab>
        </>
      )}

      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="앨범 메뉴"
        hideTitle
      >
        {isOwner && (
          <SheetAction
            icon={<Pencil />}
            onClick={() => {
              setMenuOpen(false);
              setIsEditing(true);
            }}
          >
            앨범 정보 수정
          </SheetAction>
        )}
        {canUpload && (
          <SheetAction
            icon={<Upload />}
            onClick={() => {
              setMenuOpen(false);
              setIsUploading(true);
            }}
          >
            사진 올리기
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
        {isOwner && (
          <SheetAction
            icon={<Trash2 />}
            tone="danger"
            onClick={() => {
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
          >
            앨범 삭제
          </SheetAction>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setDeleteError(false);
        }}
        title="앨범을 삭제할까요?"
        description={
          deleteError
            ? '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'
            : '삭제한 앨범은 되돌릴 수 없어요.'
        }
        confirmLabel="삭제"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
      />
      <Toast message={toast.message} />

      {isUploading && (
        <PhotoUploader
          albumId={album.content_id}
          boardId={album.board_id}
          targetName={album.title}
          tags={tagInfo}
          onCreatePhoto={() => {
            invalidateAlbum();
            setIsUploading(false);
          }}
          onCancel={() => setIsUploading(false)}
        />
      )}
      <AlbumFormSheet
        open={isEditing}
        onOpenChange={setIsEditing}
        categories={categoryInfo}
        album={album}
        onSaved={() => {
          setIsEditing(false);
          invalidateAlbum();
        }}
      />
    </div>
  );
};

export default AlbumPage;

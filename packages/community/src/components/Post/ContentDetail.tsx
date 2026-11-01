import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ChevronLeft,
  Download,
  Ellipsis,
  Heart,
  Link2,
  Pencil,
  Trash2,
  User as UserIcon,
} from 'lucide-react';

import CommentSection from '~/components/Comment/CommentSection';
import {
  Avatar,
  BackButton,
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
import { cn } from '~/lib/utils';
import { Content } from '~/services/types';
import DownloadFile from './DownloadFile';
import FileTypeBadge from './FileTypeBadge';

const pad = (n: number) => String(n).padStart(2, '0');

/** 2026.9.25 14:32 */
function formatPostDate(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type ContentDetailProps = {
  post: Content;
  /** What the page calls the content: 글 or 문서. */
  noun: '글' | '문서';
  isLiked: boolean;
  /** Shown above the title, e.g. the 회기 and 분류 of a document. */
  badges?: ReactNode;
  children: ReactNode;
  /** Attachments that didn't upload when the content was just written. */
  failedAttachments?: number;
  onEdit: () => void;
  onBack: () => void;
  onDelete: () => Promise<unknown>;
  deleting: boolean;
};

/**
 * 글 상세 and 문서 상세: the content, its attachments and comments. Mobile
 * is a full-width page with the actions in a menu sheet; desktop puts both
 * in cards in an 800px column.
 */
export default function ContentDetail({
  post,
  noun,
  isLiked: initialLiked,
  badges,
  children,
  failedAttachments = 0,
  onEdit,
  onBack,
  onDelete,
  deleting,
}: ContentDetailProps) {
  const navigate = useNavigate();
  const isDesktop = useViewportSize() === ViewportSize.Desktop;
  const {
    authInfo: {
      user: { user_id: myId, grade },
    },
  } = useAuth();
  const isMine = post.author_id === myId;
  const canComment = grade < 10;

  const [liked, setLiked] = useState(initialLiked);
  const [likeNum, setLikeNum] = useState(post.like_num);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const toast = useToast();

  const { mutateAsync: likeContent, isPending: liking } = useLikeContent();

  const toggleLike = async () => {
    try {
      await likeContent(post.content_id);
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
    setDeleteError(false);
    try {
      await onDelete();
      navigate({
        to: '/board/$board_id',
        params: { board_id: post.board.board_id },
        replace: true,
      });
    } catch (err) {
      console.error(err);
      setDeleteError(true);
    }
  };

  const files = post.attachedFiles ?? [];
  const edited = post.updatedAt !== post.createdAt;

  return (
    <div className="flex flex-1 flex-col bg-surface text-fg md:bg-transparent">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-surface px-1 pt-safe-2 pb-2 md:hidden">
        <BackButton onClick={onBack} />
        <Link
          to="/board/$board_id"
          params={{ board_id: post.board.board_id }}
          className="truncate text-[15px] font-semibold"
        >
          {post.board.board_name}
        </Link>
        <button
          type="button"
          aria-label="더보기 메뉴"
          onClick={() => setMenuOpen(true)}
          className="flex size-11 items-center justify-center"
        >
          <Ellipsis className="size-5" />
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col md:gap-4 md:px-6 md:py-7">
        <Link
          to="/board/$board_id"
          params={{ board_id: post.board.board_id }}
          className="hidden h-8 items-center gap-1 self-start text-sm text-gray-700 hover:text-fg md:flex"
        >
          <ChevronLeft className="size-4" />
          {post.board.board_name}
        </Link>

        {failedAttachments > 0 && (
          <p
            role="alert"
            className="mx-4 mt-3 rounded-lg bg-danger-soft px-3.5 py-3 text-label font-normal text-danger md:mx-0 md:mt-0"
          >
            {noun === '글' ? '글은' : '문서는'} 올렸지만 첨부파일{' '}
            {failedAttachments}개를 올리지 못했어요. 수정에서 다시 첨부해
            주세요.
          </p>
        )}

        <article className="flex flex-col gap-4 px-4 pt-5 md:gap-5 md:rounded-lg md:bg-surface md:px-11 md:py-9 md:shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:pb-5">
            {badges}
            <h1 className="text-[22px] leading-[1.4] font-bold tracking-[-0.4px] break-keep md:text-[28px] md:leading-[1.35] md:tracking-[-0.6px]">
              {post.title}
            </h1>
            <div className="flex items-center gap-2.5">
              <Link
                to="/userpage/$uuid"
                params={{ uuid: post.user.user_uuid }}
                className="flex min-w-0 flex-1 items-center gap-2.5"
              >
                <Avatar user={post.user} size={40} className="size-9" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">
                    {post.user.nickname}
                  </span>
                  <span className="text-caption text-fg-muted">
                    {formatPostDate(post.createdAt)}
                    {edited && ' · 수정됨'} · 조회 {post.view_num}
                  </span>
                </span>
              </Link>
              {isDesktop && isMine && (
                <>
                  <Button variant="ghost" size="sm" onClick={onEdit}>
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger-soft"
                    onClick={() => setConfirmOpen(true)}
                  >
                    삭제
                  </Button>
                </>
              )}
            </div>
          </div>

          {children}

          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-label text-fg-muted">
                첨부파일 {files.length}
              </h2>
              <ul className="grid gap-2 md:grid-cols-2">
                {files.map((file) => (
                  <li key={file.file_id}>
                    <DownloadFile
                      content_id={file.parent_id}
                      file_id={file.file_id}
                    >
                      <span className="flex h-13 items-center gap-2.5 rounded-lg border border-border px-3.5 hover:bg-gray-50">
                        <FileTypeBadge
                          type={file.file_type}
                          className="px-1.5 py-[3px]"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {file.original_name}
                        </span>
                        <Download
                          className="size-[18px] shrink-0 text-gray-700"
                          aria-hidden
                        />
                      </span>
                    </DownloadFile>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-2.5 pt-2 pb-6 md:pb-0">
            <button
              type="button"
              onClick={toggleLike}
              disabled={liking}
              aria-pressed={liked}
              className={cn(
                'flex h-12 items-center gap-2 rounded-full border px-[22px] text-[15px] font-semibold transition-colors',
                liked
                  ? 'border-danger bg-danger-soft'
                  : 'border-gray-300 bg-surface hover:bg-gray-50',
              )}
            >
              <Heart
                className={cn(
                  'size-5',
                  liked ? 'fill-danger text-danger' : 'text-gray-700',
                )}
                strokeWidth={1.8}
                aria-hidden
              />
              추천 {likeNum}
            </button>
            {isDesktop ? (
              <Button
                variant="secondary"
                className="h-12 rounded-full border-border px-[18px] text-gray-700"
                onClick={copyLink}
              >
                링크 복사
              </Button>
            ) : (
              <button
                type="button"
                aria-label="링크 복사"
                onClick={copyLink}
                className="flex size-12 items-center justify-center rounded-full border border-border text-gray-700"
              >
                <Link2 className="size-5" strokeWidth={1.8} />
              </button>
            )}
          </div>
        </article>

        {canComment && (
          <>
            <div className="h-2 bg-gray-50 md:hidden" aria-hidden />
            <CommentSection
              contentId={post.content_id}
              contentAuthorId={post.author_id}
              initialCount={post.comment_num}
              className="md:rounded-lg md:bg-surface md:shadow-sm"
            />
          </>
        )}
      </div>

      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={`${noun} 메뉴`}
        hideTitle
      >
        {isMine && (
          <SheetAction
            icon={<Pencil />}
            onClick={() => {
              setMenuOpen(false);
              onEdit();
            }}
          >
            수정
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
          <SheetAction
            icon={<UserIcon />}
            onClick={() => {
              setMenuOpen(false);
              navigate({
                to: '/userpage/$uuid',
                params: { uuid: post.user.user_uuid },
              });
            }}
          >
            {post.user.nickname} 님 페이지 보기
          </SheetAction>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setDeleteError(false);
        }}
        title={`${noun}${noun === '글' ? '을' : '를'} 삭제할까요?`}
        description={
          deleteError
            ? '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'
            : `삭제한 ${noun}${noun === '글' ? '은' : '는'} 되돌릴 수 없어요.`
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

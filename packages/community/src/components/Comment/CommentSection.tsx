import { FormEvent, forwardRef, useRef, useState } from 'react';
import { ArrowUp, Ellipsis, Heart, Pencil, Trash2, X } from 'lucide-react';
import {
  Avatar,
  Button,
  ConfirmDialog,
  Sheet,
  SheetAction,
} from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useLikeComment,
  useUpdateComment,
} from '~/hooks/queries/useCommentQueries';
import { cn } from '~/lib/utils';
import { Comment } from '~/services/types';
import { convertDynamicTime } from '~/utils/convertDate';

type ReplyTarget = { commentId: number; nickname: string };

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  replyTo?: ReplyTarget | null;
  onCancelReply?: () => void;
  /** `bar`: the mobile bar stuck to the bottom. `box`: desktop text box. */
  variant: 'bar' | 'box';
  /** The bar sits on the screen's bottom edge instead of above the tab bar. */
  overTabBar?: boolean;
  autoFocus?: boolean;
};

const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      submitting,
      replyTo,
      onCancelReply,
      variant,
      overTabBar,
      autoFocus,
    },
    ref,
  ) => {
    const canSubmit = value.trim().length > 0 && !submitting;
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (canSubmit) onSubmit();
    };
    const label = replyTo ? '답글 입력' : '댓글 입력';
    const placeholder = replyTo ? '답글 달기' : '댓글을 남겨 주세요';

    if (variant === 'bar') {
      return (
        <form
          onSubmit={handleSubmit}
          className={cn(
            'sticky z-20 flex flex-col gap-1.5 border-t border-border bg-surface px-3 pt-2',
            overTabBar ? 'bottom-0 pb-safe-3' : 'bottom-tab-bar pb-3',
          )}
        >
          {replyTo && (
            <div className="flex h-7 items-center justify-between px-1 text-caption text-navy-700">
              <span>
                <b>{replyTo.nickname}</b>님에게 답글 작성 중
              </span>
              <button
                type="button"
                aria-label="답글 취소"
                onClick={onCancelReply}
                className="flex size-7 items-center justify-center text-fg-muted"
              >
                <X className="size-3.5" strokeWidth={2.4} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={ref}
              aria-label={label}
              placeholder={placeholder}
              rows={1}
              value={value}
              autoFocus={autoFocus}
              onChange={(e) => onChange(e.target.value)}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] bg-surface-sunken px-3.5 py-2.5 text-base leading-normal text-fg outline-none [field-sizing:content] placeholder:text-gray-400"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="등록"
              disabled={!canSubmit}
              loading={submitting}
              className="rounded-full"
            >
              <ArrowUp />
            </Button>
          </div>
        </form>
      );
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-lg border border-gray-300 p-3 focus-within:border-navy-700"
      >
        {replyTo && (
          <div className="flex items-center justify-between text-caption text-navy-700">
            <span>
              <b>{replyTo.nickname}</b>님에게 답글 작성 중
            </span>
          </div>
        )}
        <textarea
          ref={ref}
          aria-label={label}
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-15 resize-none text-body text-fg outline-none placeholder:text-gray-400"
        />
        <div className="flex justify-end gap-2">
          {onCancelReply && (
            <Button variant="secondary" size="sm" onClick={onCancelReply}>
              취소
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
            loading={submitting}
          >
            등록
          </Button>
        </div>
      </form>
    );
  },
);
Composer.displayName = 'Composer';

type CommentItemProps = {
  comment: Comment;
  isReply?: boolean;
  isContentAuthor: boolean;
  isMine: boolean;
  liked: boolean;
  isDesktop: boolean;
  editing: boolean;
  onLike: () => void;
  onReply?: () => void;
  onOpenMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (text: string) => Promise<void>;
};

function CommentItem({
  comment,
  isReply = false,
  isContentAuthor,
  isMine,
  liked,
  isDesktop,
  editing,
  onLike,
  onReply,
  onOpenMenu,
  onEdit,
  onDelete,
  onCancelEdit,
  onSaveEdit,
}: CommentItemProps) {
  const [draft, setDraft] = useState(comment.text);
  const [saving, setSaving] = useState(false);

  // Reset the draft only when editing starts, so a refetch while editing
  // doesn't overwrite what is being typed.
  const [wasEditing, setWasEditing] = useState(editing);
  if (editing !== wasEditing) {
    setWasEditing(editing);
    if (editing) setDraft(comment.text);
  }

  const save = async () => {
    setSaving(true);
    try {
      await onSaveEdit(draft.trim());
    } finally {
      setSaving(false);
    }
  };

  const actionClassName =
    'flex h-7 items-center gap-1 text-caption text-fg-muted hover:text-fg';

  return (
    <div
      className={cn(
        'flex gap-2.5',
        isReply ? 'rounded-lg bg-gray-50 p-3' : 'py-3 md:gap-3 md:py-4',
      )}
    >
      <Avatar
        user={comment.user}
        size={28}
        className={cn(!isReply && 'size-8')}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5 text-label">
          <b className="font-bold">{comment.user.nickname}</b>
          {isContentAuthor && (
            <span className="rounded-[4px] bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-navy-700">
              글쓴이
            </span>
          )}
          {editing ? (
            <span className="text-caption text-navy-700">수정 중</span>
          ) : (
            <span className="text-caption text-fg-muted">
              {convertDynamicTime(comment.createdAt)}
            </span>
          )}
        </div>
        {editing ? (
          <div className="flex flex-col gap-2 pt-1">
            <textarea
              aria-label="댓글 수정"
              rows={3}
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              className="w-full resize-none rounded-md border border-primary px-3 py-2.5 text-base leading-normal text-fg outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onCancelEdit}>
                취소
              </Button>
              <Button
                size="sm"
                onClick={save}
                loading={saving}
                disabled={!draft.trim()}
              >
                저장
              </Button>
            </div>
          </div>
        ) : (
          <p
            className={cn(
              'break-words whitespace-pre-line',
              isReply ? 'text-sm leading-relaxed' : 'text-body',
            )}
          >
            {comment.text}
          </p>
        )}
        {!editing && (
          <div className="flex items-center gap-3.5 pt-0.5">
            <button
              type="button"
              onClick={onLike}
              aria-pressed={liked}
              aria-label={`추천 ${comment.likeUsers.length}`}
              className={cn(actionClassName, liked && 'text-danger')}
            >
              <Heart
                className={cn('size-3.5', liked && 'fill-danger')}
                aria-hidden
              />
              {comment.likeUsers.length}
            </button>
            {onReply && (
              <button
                type="button"
                onClick={onReply}
                className={actionClassName}
              >
                답글
              </button>
            )}
            {isMine && isDesktop && (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  className={actionClassName}
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className={cn(actionClassName, 'hover:text-danger')}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {isMine && !isDesktop && !editing && (
        <button
          type="button"
          aria-label="댓글 메뉴"
          onClick={onOpenMenu}
          className="-mr-1.5 flex size-8 shrink-0 items-center justify-center text-gray-400"
        >
          <Ellipsis className="size-4" />
        </button>
      )}
    </div>
  );
}

type CommentSectionProps = {
  contentId: number;
  /** The post author, who gets the 글쓴이 badge. */
  contentAuthorId?: number;
  /** Comment count from the post, shown until the list loads. */
  initialCount?: number;
  /**
   * `page`: under a post. `panel`: inside the photo modal, with less side
   * padding and the mobile bar on the screen's bottom edge.
   */
  variant?: 'page' | 'panel';
  className?: string;
};

/**
 * Comments and replies under a post. Mobile writes in a bar stuck above the
 * tab bar; desktop writes in a box above the list, and replies inline.
 */
export default function CommentSection({
  contentId,
  contentAuthorId,
  initialCount = 0,
  variant = 'page',
  className,
}: CommentSectionProps) {
  const isPanel = variant === 'panel';
  const isDesktop = useViewportSize() === ViewportSize.Desktop;
  const {
    authInfo: {
      user: { user_id: myId },
    },
  } = useAuth();

  const { data: comments, isLoading } = useComments(contentId);
  const { mutateAsync: createComment, isPending: creating } =
    useCreateComment();
  const { mutateAsync: updateComment } = useUpdateComment();
  const { mutateAsync: deleteComment, isPending: deleting } =
    useDeleteComment();
  const { mutate: likeComment } = useLikeComment();

  // Separate drafts, so starting a reply keeps the comment in progress.
  const [text, setText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [menuFor, setMenuFor] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const count =
    comments?.reduce((sum, c) => sum + 1 + c.children.length, 0) ??
    initialCount;

  const startReply = (comment: Comment) => {
    setReplyTo({
      commentId: comment.comment_id,
      nickname: comment.user.nickname,
    });
    setReplyText('');
    setError(null);
    if (!isDesktop) composerRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyText('');
  };

  const submit = async () => {
    setError(null);
    const draft = replyTo ? replyText : text;
    try {
      await createComment({
        parentId: contentId,
        data: {
          parent_comment_id: replyTo?.commentId ?? 0,
          text: draft.trim(),
        },
      });
      if (replyTo) setReplyText('');
      else setText('');
      setReplyTo(null);
    } catch (err) {
      console.error(err);
      setError('댓글을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const saveEdit = async (comment: Comment, nextText: string) => {
    setError(null);
    try {
      await updateComment({
        commentId: comment.comment_id,
        data: { text: nextText },
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError('댓글을 수정하지 못했어요.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteComment(deleteTarget.comment_id);
    } catch (err) {
      console.error(err);
      setError('댓글을 삭제하지 못했어요.');
    }
    setDeleteTarget(null);
  };

  const itemProps = (comment: Comment) => ({
    comment,
    isContentAuthor: comment.author_id === contentAuthorId,
    isMine: comment.author_id === myId,
    liked: comment.likeUsers.some((user) => user.user_id === myId),
    isDesktop,
    editing: editingId === comment.comment_id,
    onLike: () => likeComment(comment.comment_id),
    onOpenMenu: () => setMenuFor(comment),
    onEdit: () => setEditingId(comment.comment_id),
    onDelete: () => setDeleteTarget(comment),
    onCancelEdit: () => setEditingId(null),
    onSaveEdit: (next: string) => saveEdit(comment, next),
  });

  const composerProps = {
    // While replying, the only composer shown is the reply one.
    value: replyTo ? replyText : text,
    onChange: replyTo ? setReplyText : setText,
    onSubmit: submit,
    submitting: creating,
  };

  return (
    // Not a <section>: legacy SCSS styles bare section elements globally.
    <div
      role="region"
      aria-labelledby="comments-title"
      className={cn('flex flex-col', className)}
    >
      <div
        className={cn(
          'flex flex-col gap-1 px-4 pt-[18px] md:gap-2',
          isPanel ? 'md:px-5 md:pt-4' : 'md:px-11 md:pt-7',
        )}
      >
        <h2
          id="comments-title"
          className={cn(
            'pb-2 text-base font-bold',
            isPanel ? 'md:text-sm' : 'md:text-lg',
          )}
        >
          댓글 <span className="text-navy-700">{count}</span>
        </h2>
        {isDesktop && !replyTo && <Composer {...composerProps} variant="box" />}
        {error && (
          <p role="alert" className="text-label font-normal text-danger">
            {error}
          </p>
        )}
        {isLoading ? null : !comments || comments.length === 0 ? (
          <p className="py-10 text-center text-label font-normal text-fg-muted">
            첫 댓글을 남겨 보세요.
          </p>
        ) : (
          <ul>
            {comments.map((comment) => (
              <li
                key={comment.comment_id}
                className="flex flex-col border-b border-gray-100 last:border-b-0"
              >
                <CommentItem
                  {...itemProps(comment)}
                  onReply={() => startReply(comment)}
                />
                {comment.children.length > 0 && (
                  <ul className="ml-[38px] flex flex-col gap-2 pb-2.5 md:ml-12 md:pb-3">
                    {comment.children.map((reply) => (
                      <li key={reply.comment_id}>
                        <CommentItem {...itemProps(reply)} isReply />
                      </li>
                    ))}
                  </ul>
                )}
                {isDesktop && replyTo?.commentId === comment.comment_id && (
                  <div className="ml-12 pb-4">
                    <Composer
                      {...composerProps}
                      variant="box"
                      replyTo={replyTo}
                      onCancelReply={cancelReply}
                      autoFocus
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="h-6 md:h-7" aria-hidden />

      {!isDesktop && (
        <Composer
          ref={composerRef}
          {...composerProps}
          variant="bar"
          overTabBar={isPanel}
          replyTo={replyTo}
          onCancelReply={cancelReply}
        />
      )}

      <Sheet
        open={!!menuFor}
        onOpenChange={(open) => !open && setMenuFor(null)}
        title="댓글 메뉴"
        hideTitle
      >
        <SheetAction
          icon={<Pencil />}
          onClick={() => {
            if (menuFor) setEditingId(menuFor.comment_id);
            setMenuFor(null);
          }}
        >
          수정
        </SheetAction>
        <SheetAction
          icon={<Trash2 />}
          tone="danger"
          onClick={() => {
            setDeleteTarget(menuFor);
            setMenuFor(null);
          }}
        >
          삭제
        </SheetAction>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 되돌릴 수 없어요."
        confirmLabel="삭제"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

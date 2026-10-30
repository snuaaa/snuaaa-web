import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { postKeys, useUpdatePost } from '~/hooks/queries/usePostQueries';
import {
  useCreateFile,
  useDeleteFile,
} from '~/hooks/queries/useContentQueries';
import { Content } from '~/services/types';
import PostComposer, { type UploadProgress } from './PostComposer';

type Props = {
  postInfo: Content;
  onCancel: () => void;
  onUpdate: () => void;
};

/** 글 수정: the 글쓰기 form filled with the post, without a draft. */
export default function EditPost({ postInfo, onCancel, onUpdate }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(postInfo.title);
  const [text, setText] = useState(postInfo.text);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Deletions already done, so a retry after a failure skips them.
  const deletedIds = useRef(new Set<number>());

  const { mutateAsync: updatePost } = useUpdatePost();
  const { mutateAsync: createFile } = useCreateFile();
  const { mutateAsync: deleteFile } = useDeleteFile();

  const existingFiles = (postInfo.attachedFiles ?? []).filter(
    (file) => !removedIds.includes(file.file_id),
  );
  const dirty = touched || removedIds.length > 0 || files.length > 0;

  const submit = async () => {
    const postId = postInfo.content_id;
    setError(null);
    setSubmitting(true);
    try {
      await updatePost({
        post_id: postId,
        data: { title: title.trim(), text },
      });
      // Drop each upload from the form once it succeeds, so a retry after
      // a failure doesn't attach it twice.
      // TODO(planned API change): send pre-uploaded file ids with the post
      // request instead (see PostBoard/Create.tsx).
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length, percent: 0 });
        const formData = new FormData();
        formData.append('attachedFile', file);
        await createFile({
          content_id: postId,
          formData,
          onUploadProgress: (e) => {
            if (e.total) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setProgress({ current: i + 1, total: files.length, percent });
            }
          },
        });
        setFiles((prev) => prev.filter((f) => f !== file));
      }
      for (const fileId of removedIds) {
        if (deletedIds.current.has(fileId)) continue;
        await deleteFile(fileId);
        deletedIds.current.add(fileId);
      }
      onUpdate();
    } catch (err) {
      console.error(err);
      setError('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      // Files change after the post itself, so refetch once they are done.
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      setProgress(null);
      setSubmitting(false);
    }
  };

  return (
    <PostComposer
      heading="글 수정"
      boardName={postInfo.board.board_name}
      title={title}
      onTitleChange={(value) => {
        setTitle(value);
        setTouched(true);
      }}
      text={text}
      onTextChange={(value) => {
        setText(value);
        setTouched(true);
      }}
      existingFiles={existingFiles}
      onRemoveExisting={(fileId) => setRemovedIds((ids) => [...ids, fileId])}
      newFiles={files}
      onNewFilesChange={setFiles}
      submitLabel="저장"
      submitting={submitting}
      progress={progress}
      error={error}
      onSubmit={submit}
      leaveConfirm={
        dirty
          ? {
              title: '수정을 그만둘까요?',
              description: '고친 내용은 저장되지 않아요.',
              cancelLabel: '계속 고치기',
            }
          : null
      }
      onLeave={onCancel}
    />
  );
}

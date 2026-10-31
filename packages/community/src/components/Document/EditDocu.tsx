import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import ComposerLayout, {
  type UploadProgress,
} from '~/components/Post/ComposerLayout';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import {
  useCreateFile,
  useDeleteFile,
} from '~/hooks/queries/useContentQueries';
import { docuKeys, useUpdateDocument } from '~/hooks/queries/useDocuQueries';
import { DocumentDetail } from '~/services/DocuService';
import DocuFields from './DocuFields';

type EditDocuProps = {
  doc: DocumentDetail;
  onCancel: () => void;
  onUpdate: () => void;
};

/**
 * 문서 수정: the 문서 등록 form filled with the document. The 회기 is
 * fixed because the API only updates the 분류, 제목 and 설명.
 */
export default function EditDocu({ doc, onCancel, onUpdate }: EditDocuProps) {
  const queryClient = useQueryClient();
  const { boardsInfo } = useBoards();
  const categories =
    boardsInfo.find((b) => b.board_id === doc.board_id)?.categories ?? [];

  const [categoryId, setCategoryId] = useState(doc.category_id);
  const [title, setTitle] = useState(doc.title);
  const [text, setText] = useState(doc.text);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Deletions already done, so a retry after a failure skips them.
  const deletedIds = useRef(new Set<number>());

  const { mutateAsync: updateDocument } = useUpdateDocument();
  const { mutateAsync: createFile } = useCreateFile();
  const { mutateAsync: deleteFile } = useDeleteFile();

  const existingFiles = (doc.attachedFiles ?? []).filter(
    (file) => !removedIds.includes(file.file_id),
  );
  const missing = {
    title: !title.trim(),
    files: existingFiles.length + files.length === 0,
  };
  const valid = !missing.title && !missing.files;
  const dirty =
    categoryId !== doc.category_id ||
    title !== doc.title ||
    text !== doc.text ||
    removedIds.length > 0 ||
    files.length > 0;

  const submit = async () => {
    setTouched(true);
    if (!valid || submitting) return;
    const docId = doc.content_id;
    setError(null);
    setSubmitting(true);
    try {
      await updateDocument({
        doc_id: docId,
        data: { title: title.trim(), text, category_id: categoryId },
      });
      // Upload before deleting, so the document never ends up without a
      // file. Each upload leaves the form once it succeeds, so a retry
      // after a failure doesn't attach it twice.
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length, percent: 0 });
        const formData = new FormData();
        formData.append('attachedFile', file);
        await createFile({
          content_id: docId,
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
      // Files change after the document itself, so refetch once they are done.
      queryClient.invalidateQueries({ queryKey: docuKeys.all });
      setProgress(null);
      setSubmitting(false);
    }
  };

  return (
    <ComposerLayout
      heading="문서 수정"
      boardName={doc.board.board_name}
      progress={progress}
      error={error}
      submitLabel="저장"
      canSubmit={!submitting && (!touched || valid)}
      submitting={submitting}
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
    >
      <DocuFields
        generation={doc.document.generation}
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        title={title}
        onTitleChange={setTitle}
        text={text}
        onTextChange={setText}
        existingFiles={existingFiles}
        onRemoveExisting={(fileId) => setRemovedIds((ids) => [...ids, fileId])}
        newFiles={files}
        onNewFilesChange={setFiles}
        disabled={submitting}
        errors={
          touched
            ? {
                title: missing.title ? '제목을 입력해 주세요.' : undefined,
                files: missing.files
                  ? '파일을 하나 이상 첨부해 주세요.'
                  : undefined,
              }
            : {}
        }
      />
    </ComposerLayout>
  );
}

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import DocuFields from '~/components/Document/DocuFields';
import ComposerLayout, {
  type UploadProgress,
} from '~/components/Post/ComposerLayout';
import { useCreateFile } from '~/hooks/queries/useContentQueries';
import { docuKeys, useCreateDocument } from '~/hooks/queries/useDocuQueries';
import { Board } from '~/services/types';
import { currentGeneration } from './boardUtils';

type CreateDocuProps = {
  board: Board;
  /** `failedFiles`: attachments that didn't upload, to tell the author. */
  onCreate: (failedFiles: number) => void;
  onClose: () => void;
};

/**
 * 문서 등록: 회기, 분류, 제목, 설명 and at least one file. Uses the same
 * frame as 글쓰기, with a plain description instead of the editor.
 */
export default function CreateDocu({
  board,
  onCreate,
  onClose,
}: CreateDocuProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createDocument } = useCreateDocument();
  const { mutateAsync: createFile } = useCreateFile();

  const [generation, setGeneration] = useState(currentGeneration());
  const [categoryId, setCategoryId] = useState<string>();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missing = {
    category: !categoryId,
    title: !title.trim(),
    files: files.length === 0,
  };
  const valid = !missing.category && !missing.title && !missing.files;

  const submit = async () => {
    setTouched(true);
    if (!valid || !categoryId || submitting) return;
    setError(null);
    setSubmitting(true);
    let contentId: number;
    try {
      const res = await createDocument({
        board_id: board.board_id,
        data: {
          title: title.trim(),
          text,
          generation,
          category_id: categoryId,
        },
      });
      contentId = res.data.content_id;
    } catch (err) {
      console.error(err);
      setError('문서를 등록하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
      return;
    }
    // The document exists now, so a failed file doesn't stop us: the
    // board tells the author, who can attach it again by editing.
    let failedFiles = 0;
    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length, percent: 0 });
      const formData = new FormData();
      formData.append('attachedFile', files[i]);
      try {
        await createFile({
          content_id: contentId,
          formData,
          onUploadProgress: (e) => {
            if (e.total) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setProgress({ current: i + 1, total: files.length, percent });
            }
          },
        });
      } catch (err) {
        console.error(err);
        failedFiles += 1;
      }
    }
    // The list was refetched when the document was made, before its files.
    queryClient.invalidateQueries({ queryKey: docuKeys.list() });
    onCreate(failedFiles);
  };

  return (
    <ComposerLayout
      heading="문서 등록"
      boardName={board.board_name}
      progress={progress}
      error={error}
      submitLabel="등록"
      canSubmit={!submitting && (!touched || valid)}
      submitting={submitting}
      onSubmit={submit}
      leaveConfirm={
        title || text || categoryId || files.length > 0
          ? {
              title: '등록을 그만둘까요?',
              description: '적은 내용과 고른 파일이 사라져요.',
              cancelLabel: '계속 쓰기',
            }
          : null
      }
      onLeave={onClose}
    >
      <DocuFields
        generation={generation}
        onGenerationChange={setGeneration}
        categories={board.categories}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        title={title}
        onTitleChange={setTitle}
        text={text}
        onTextChange={setText}
        newFiles={files}
        onNewFilesChange={setFiles}
        disabled={submitting}
        errors={
          touched
            ? {
                category: missing.category ? '분류를 골라 주세요.' : undefined,
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

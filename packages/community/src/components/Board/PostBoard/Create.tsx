import { useState } from 'react';

import PostComposer, {
  type UploadProgress,
} from '~/components/Post/PostComposer';
import { Button } from '~/components/ui';
import { useCreatePost } from '~/hooks/queries/usePostQueries';
import { useCreateFile } from '~/hooks/queries/useContentQueries';
import { Board } from '~/services/types';

const BASE_STORAGE_KEY = 'CREATE_POST_DRAFT';

type Draft = { title: string; text: string; savedAt?: number };

const pad = (n: number) => String(n).padStart(2, '0');
const formatTime = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Storage can be missing or full (private mode); the draft is a convenience.
function loadDraft(key: string): Draft | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const draft = JSON.parse(saved) as Draft;
    return draft.title || draft.text ? draft : null;
  } catch {
    return null;
  }
}

function saveDraft(key: string, draft: Draft | null) {
  try {
    if (draft) localStorage.setItem(key, JSON.stringify(draft));
    else localStorage.removeItem(key);
  } catch {
    // Ignore: writing still works, only the draft is lost.
  }
}

type Props = {
  board: Board;
  onCreate: (contentId: number) => void;
  onClose: () => void;
};

/** 글쓰기, with a draft that is saved as you type. */
export default function CreatePost({ board, onCreate, onClose }: Props) {
  const storageKey = `${BASE_STORAGE_KEY}_${board.board_id}`;

  const [initialDraft] = useState(() => loadDraft(storageKey));
  const [title, setTitle] = useState(initialDraft?.title ?? '');
  const [text, setText] = useState(initialDraft?.text ?? '');
  const [savedAt, setSavedAt] = useState(initialDraft?.savedAt ?? null);
  const [showBanner, setShowBanner] = useState(initialDraft !== null);
  const [editorKey, setEditorKey] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: createFile } = useCreateFile();

  const persist = (next: { title: string; text: string }) => {
    if (next.title || next.text) {
      const now = Date.now();
      saveDraft(storageKey, { ...next, savedAt: now });
      setSavedAt(now);
    } else {
      saveDraft(storageKey, null);
      setSavedAt(null);
    }
  };

  const changeTitle = (value: string) => {
    setTitle(value);
    persist({ title: value, text });
  };

  const changeText = (value: string) => {
    setText(value);
    persist({ title, text: value });
  };

  const startOver = () => {
    setTitle('');
    setText('');
    persist({ title: '', text: '' });
    setEditorKey((k) => k + 1);
    setShowBanner(false);
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    let contentId: number;
    try {
      const res = await createPost({
        board_id: board.board_id,
        data: { title: title.trim(), text },
      });
      contentId = res.data.content_id;
    } catch (err) {
      console.error(err);
      setError('글을 올리지 못했어요. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
      return;
    }
    saveDraft(storageKey, null);
    // The post exists now, so a failed attachment doesn't stop us: the
    // author sees what is missing on the post and can add it by editing.
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
      }
    }
    onCreate(contentId);
  };

  const savedDate = initialDraft?.savedAt
    ? new Date(initialDraft.savedAt)
    : null;

  return (
    <PostComposer
      heading="글쓰기"
      boardName={board.board_name}
      status={
        savedAt ? `임시저장됨 ${formatTime(new Date(savedAt))}` : undefined
      }
      banner={
        showBanner && (
          <div className="mx-4 mt-3 flex flex-col gap-2.5 rounded-lg bg-accent-soft px-3.5 py-3 md:mx-0 md:mt-0 md:flex-row md:items-center md:gap-3 md:px-4">
            <p className="flex-1 text-sm leading-normal">
              <b>작성 중이던 글이 있어요.</b>{' '}
              <span className="block text-label font-normal text-gray-700 md:inline">
                {savedDate
                  ? `${savedDate.getMonth() + 1}.${savedDate.getDate()} ${formatTime(savedDate)}에 임시저장된 글을 불러왔어요.`
                  : '임시저장된 글을 불러왔어요.'}
              </span>
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowBanner(false)}>
                이어서 쓰기
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="border-star-600 bg-transparent"
                onClick={startOver}
              >
                새로 쓰기
              </Button>
            </div>
          </div>
        )
      }
      title={title}
      onTitleChange={changeTitle}
      text={text}
      onTextChange={changeText}
      editorKey={editorKey}
      newFiles={files}
      onNewFilesChange={setFiles}
      submitLabel="등록"
      submitting={submitting}
      progress={progress}
      error={error}
      onSubmit={submit}
      leaveConfirm={
        title || text
          ? {
              title: '작성을 그만둘까요?',
              description:
                '쓰던 내용은 임시저장돼 있어서 다음에 글쓰기를 열면 이어서 쓸 수 있어요.',
              cancelLabel: '계속 쓰기',
            }
          : null
      }
      onLeave={onClose}
    />
  );
}

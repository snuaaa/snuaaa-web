import { type ReactNode } from 'react';
import {
  Link,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router';
import { ChevronDown, Download, FilePlus } from 'lucide-react';

import Skeleton from '~/components/Common/Skeleton';
import DownloadFile from '~/components/Post/DownloadFile';
import FileTypeBadge from '~/components/Post/FileTypeBadge';
import { Button, Fab, Pagination, Tag, Toast, useToast } from '~/components/ui';
import CreateDocu from './CreateDocu';
import BoardLayout from './BoardLayout';
import { canWrite, currentGeneration } from './boardUtils';

import { Board, File } from '~/services/types';
import { DocumentListItem } from '~/services/DocuService';
import { useDocuments } from '~/hooks/queries/useDocuQueries';
import { useAuth } from '~/contexts/auth';
import { cn } from '~/lib/utils';

const DOCROWNUM = 10;

const chipClassName =
  'flex h-[34px] shrink-0 items-center rounded-full border px-3.5 text-label transition-colors';
const chipStateClassName = (selected: boolean) =>
  selected
    ? 'border-primary bg-primary text-white'
    : 'border-border bg-surface font-medium text-gray-700 hover:border-gray-300';

function FileChip({ file }: { file: File }) {
  return (
    <DownloadFile content_id={file.parent_id} file_id={file.file_id}>
      <span className="flex h-9 max-w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-caption hover:bg-gray-50">
        <FileTypeBadge type={file.file_type} />
        <span className="max-w-[170px] truncate">{file.original_name}</span>
        <Download className="size-3.5 shrink-0 text-fg-muted" aria-hidden />
      </span>
    </DownloadFile>
  );
}

function DocumentCard({ doc }: { doc: DocumentListItem }) {
  const { content } = doc;
  return (
    <li className="flex flex-col gap-2.5 rounded-lg bg-surface px-4 py-3.5 shadow-sm md:px-5 md:py-4">
      <Link
        to="/document/$doc_id"
        params={{ doc_id: String(doc.content_id) }}
        className="flex flex-col gap-1.5 hover:text-navy-700"
      >
        <span className="flex gap-1.5">
          <Tag
            className="rounded-sm bg-navy-700 px-2 py-1 text-white"
            variant={null}
          >
            {doc.generation}대
          </Tag>
          {content.category && <Tag>{content.category.category_name}</Tag>}
        </span>
        <span className="text-body font-semibold leading-[1.45]">
          {content.title}
        </span>
      </Link>
      {content.attachedFiles && content.attachedFiles.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {content.attachedFiles.map((file) => (
            <li key={file.file_id} className="max-w-full">
              <FileChip file={file} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ListMessage({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-16 text-center">
      <p className="text-heading">{title}</p>
      {children}
    </div>
  );
}

type DocuBoardProps = {
  boardInfo: Board;
};

function DocuBoard({ boardInfo }: DocuBoardProps) {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const writable = canWrite(boardInfo, grade);

  const router = useRouter();
  const toast = useToast();

  const { category, generation, status } = searchParams;
  const isCreating = status === 'create';
  const openCreate = () =>
    navigate({ search: (prev) => ({ ...prev, status: 'create' }) });
  const page = Number(searchParams.page ?? 1);

  const { data, isLoading, isError, refetch } = useDocuments({
    page,
    category,
    generation: generation ? Number(generation) : undefined,
  });

  const docCount = data?.docCount ?? 0;
  const documents = data?.docInfo ?? [];
  const isFiltered = !!category || !!generation;

  const setFilter = (next: { category?: string; generation?: string }) => {
    navigate({
      search: (prev) => ({ ...prev, ...next, page: 1 }),
    });
  };

  const goToPage = (idx: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: idx }),
    });
  };

  const generations = Array.from(
    { length: currentGeneration() },
    (_, i) => currentGeneration() - i,
  );

  if (isCreating) {
    return (
      <CreateDocu
        board={boardInfo}
        onClose={() => router.history.back()}
        onCreate={(failedFiles) => {
          router.history.back();
          toast.show(
            failedFiles > 0
              ? `문서를 등록했지만 파일 ${failedFiles}개를 올리지 못했어요. 문서 수정에서 다시 첨부해 주세요.`
              : '문서를 등록했어요',
          );
        }}
      />
    );
  }

  const createAction = writable ? (
    <Button onClick={openCreate} className="[&_svg]:text-accent">
      <FilePlus className="size-[18px]!" />
      문서 등록
    </Button>
  ) : null;

  return (
    <BoardLayout board={boardInfo} action={createAction}>
      <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-surface px-4 py-3 [scrollbar-width:none] md:rounded-lg md:border-b-0 md:px-5 md:shadow-sm">
        {/* A native select keeps the long list of 회기 easy to scroll. */}
        <label
          className={cn(
            chipClassName,
            'relative gap-1 pr-2.5 pl-3 font-semibold',
            generation
              ? 'border-primary bg-primary text-white'
              : 'border-primary bg-surface text-primary',
          )}
        >
          {generation ? `${generation}대` : '전체 회기'}
          <ChevronDown className="size-3.5" strokeWidth={2.4} aria-hidden />
          <select
            aria-label="회기"
            value={generation ?? ''}
            onChange={(e) =>
              setFilter({ generation: e.target.value || undefined })
            }
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value="">전체 회기</option>
            {generations.map((gen) => (
              <option key={gen} value={gen}>
                {gen}대
              </option>
            ))}
          </select>
        </label>
        <div className="my-1 w-px shrink-0 bg-border" aria-hidden />
        <div role="group" aria-label="카테고리" className="flex gap-2">
          <button
            type="button"
            aria-pressed={!category}
            onClick={() => setFilter({ category: undefined })}
            className={cn(chipClassName, chipStateClassName(!category))}
          >
            전체
          </button>
          {boardInfo.categories.map((cate) => {
            const selected = category === cate.category_id;
            return (
              <button
                key={cate.category_id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter({ category: cate.category_id })}
                className={cn(chipClassName, chipStateClassName(selected))}
              >
                {cate.category_name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 md:px-0 md:pt-0">
        {isError ? (
          <ListMessage title="문서를 불러오지 못했어요">
            <div className="pt-3">
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                다시 시도
              </Button>
            </div>
          </ListMessage>
        ) : isLoading || !data ? (
          <ul className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }, (_, i) => (
              <li
                key={i}
                className="flex flex-col gap-3 rounded-lg bg-surface px-4 py-4 shadow-sm"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-40" />
              </li>
            ))}
          </ul>
        ) : documents.length === 0 ? (
          <ListMessage
            title={
              isFiltered ? '조건에 맞는 문서가 없어요' : '아직 문서가 없어요'
            }
          >
            {isFiltered && (
              <div className="pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setFilter({ category: undefined, generation: undefined })
                  }
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </ListMessage>
        ) : (
          <ul className="flex flex-col gap-2.5 md:gap-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.content_id} doc={doc} />
            ))}
          </ul>
        )}
        <Pagination
          page={page}
          totalPages={Math.ceil(docCount / DOCROWNUM)}
          onPageChange={goToPage}
          className="py-4"
        />
      </div>

      {writable && <div className="h-18 md:hidden" aria-hidden />}
      {writable && (
        <Fab icon={<FilePlus />} onClick={openCreate} className="md:hidden">
          문서 등록
        </Fab>
      )}
      <Toast message={toast.message} />
    </BoardLayout>
  );
}

export default DocuBoard;

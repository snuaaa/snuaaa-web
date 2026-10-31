import { useState } from 'react';
import {
  Link,
  useCanGoBack,
  useNavigate,
  useParams,
  useRouter,
} from '@tanstack/react-router';

import Loading from '~/components/Common/Loading';
import DocuDetail from '~/components/Document/DocuDetail';
import EditDocu from '~/components/Document/EditDocu';
import { Button } from '~/components/ui';
import { useDocument } from '~/hooks/queries/useDocuQueries';

function DocumentPage() {
  const { doc_id: docId } = useParams({ from: '/document/$doc_id' });
  // Tied to the document, so moving to another one (e.g. back) leaves edit mode.
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const isEditing = editingDocId === docId;
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  const { data, isError } = useDocument(Number(docId));
  const { docuInfo, likeInfo } = data ?? {};

  // A document that is deleted or on a board this member can't read.
  if (isError || (data && !docuInfo)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-24 text-center">
        <p className="text-heading">문서를 찾을 수 없어요</p>
        <p className="text-label font-normal text-fg-muted">
          삭제되었거나 볼 수 없는 문서예요.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-4">
          <Link to="/">홈으로</Link>
        </Button>
      </div>
    );
  }

  if (!docuInfo) {
    return <Loading />;
  }

  if (isEditing) {
    return (
      <EditDocu
        doc={docuInfo}
        onCancel={() => setEditingDocId(null)}
        onUpdate={() => setEditingDocId(null)}
      />
    );
  }

  return (
    <DocuDetail
      // Remount when moving between documents so like state starts fresh.
      key={docuInfo.content_id}
      doc={docuInfo}
      isLiked={likeInfo ?? false}
      onEdit={() => setEditingDocId(docId)}
      onBack={() => {
        if (canGoBack) {
          router.history.back();
        } else {
          navigate({
            to: '/board/$board_id',
            params: { board_id: docuInfo.board.board_id },
          });
        }
      }}
    />
  );
}

export default DocumentPage;

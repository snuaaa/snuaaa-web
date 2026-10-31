import { Tag } from '~/components/ui';
import ContentDetail from '~/components/Post/ContentDetail';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { useDeleteDocument } from '~/hooks/queries/useDocuQueries';
import { DocumentDetail } from '~/services/DocuService';

type DocuDetailProps = {
  doc: DocumentDetail;
  isLiked: boolean;
  onEdit: () => void;
  onBack: () => void;
};

/** 문서 상세: 회기 and 분류 above the title, a plain-text 설명. */
export default function DocuDetail({ doc, ...props }: DocuDetailProps) {
  const { mutateAsync: deleteDocument, isPending: deleting } =
    useDeleteDocument();
  const { boardsInfo } = useBoards();
  const category = boardsInfo
    .find((b) => b.board_id === doc.board_id)
    ?.categories.find((c) => c.category_id === doc.category_id);

  return (
    <ContentDetail
      {...props}
      post={doc}
      noun="문서"
      onDelete={() => deleteDocument(doc.content_id)}
      deleting={deleting}
      badges={
        <span className="flex gap-1.5">
          <Tag
            className="rounded-sm bg-navy-700 px-2 py-1 text-white"
            variant={null}
          >
            {doc.document.generation}대
          </Tag>
          {category && <Tag>{category.category_name}</Tag>}
        </span>
      }
    >
      {doc.text && (
        <p className="text-base leading-[1.75] break-keep whitespace-pre-wrap md:leading-[1.8]">
          {doc.text}
        </p>
      )}
    </ContentDetail>
  );
}

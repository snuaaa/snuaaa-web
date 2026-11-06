import Editor from '~/components/Common/Editor';
import { useDeletePost } from '~/hooks/queries/usePostQueries';
import { Content } from '~/services/types';
import ContentDetail from './ContentDetail';

type PostDetailProps = {
  post: Content;
  isLiked: boolean;
  /** Attachments that didn't upload when the post was just written. */
  failedAttachments?: number;
  onEdit: () => void;
  onBack: () => void;
};

/** 글 상세: the post body is CKEditor output. */
export default function PostDetail({ post, ...props }: PostDetailProps) {
  const { mutateAsync: deletePost, isPending: deleting } = useDeletePost();

  return (
    <ContentDetail
      {...props}
      post={post}
      noun="글"
      onDelete={() => deletePost(post.content_id)}
      deleting={deleting}
    >
      {/* CKEditor output, shown with the read-only editor. */}
      <div className="text-base [&_.ck-content]:min-h-0! [&_.ck-content]:border-0! [&_.ck-content]:p-0! [&_.ck-content]:text-base [&_.ck-content]:leading-[1.75] [&_.ck-content]:shadow-none! md:[&_.ck-content]:leading-[1.8] [&_.ck-content_p]:leading-[inherit] [&_.ck-content>*+*]:mt-3.5 [&_.ck-editor__top]:hidden [&_.ck.ck-editor__main>.ck-editor__editable]:bg-transparent [&_figure.image_img]:rounded-md">
        <Editor text={post.text} setText={() => undefined} readOnly />
      </div>
    </ContentDetail>
  );
}

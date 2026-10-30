import ContentTypeEnum from '~/common/ContentTypeEnum';
import { Content } from '~/services/types';

type CommentLink = {
  to: string;
  params?: Record<string, string>;
  search?: (prev: Record<string, unknown>) => Record<string, unknown>;
};

/** Where a comment's content opens: its page, or the photo modals. */
export function commentLink(content: Content): CommentLink {
  switch (content.type) {
    case ContentTypeEnum.POST:
      return {
        to: '/post/$post_id',
        params: { post_id: String(content.content_id) },
      };
    case ContentTypeEnum.PHOTO:
      return {
        to: '.',
        search: (prev) => ({ ...prev, photo: content.content_id }),
      };
    case ContentTypeEnum.EXHIBITI_PHOTO:
      return {
        to: '.',
        search: (prev) => ({ ...prev, exhibitPhoto: content.content_id }),
      };
    case ContentTypeEnum.DOCUMENT:
      return {
        to: '/document/$doc_id',
        params: { doc_id: String(content.content_id) },
      };
    case ContentTypeEnum.ALBUM:
      return {
        to: '/album/$album_id',
        params: { album_id: String(content.content_id) },
      };
    default:
      return { to: '/' };
  }
}

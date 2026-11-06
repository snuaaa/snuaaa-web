import { Tag } from '~/services/types';

/** 별사진 tags come in two groups, by `tag_type`. */
const TAG_GROUPS = [
  { type: 'M', name: '대상' },
  { type: 'T', name: '촬영 방식' },
] as const;

export const groupTags = (tags: Tag[]) =>
  TAG_GROUPS.map((group) => ({
    ...group,
    tags: tags.filter((tag) => tag.tag_type === group.type),
  })).filter((group) => group.tags.length > 0);

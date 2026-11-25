import { and, asc, eq, inArray } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { contentTag, tag } from '../db/schema';

const tagJson = {
  tag_id: tag.tag_id,
  board_id: tag.board_id,
  tag_name: tag.tag_name,
  tag_type: tag.tag_type,
};

/** The board's tags, sorted by type, then id. */
export async function listOnBoard(
  boardId: string,
  executor: Executor = database,
) {
  return executor
    .select(tagJson)
    .from(tag)
    .where(eq(tag.board_id, boardId))
    .orderBy(asc(tag.tag_type), asc(tag.tag_id));
}

export type ContentTag = Awaited<ReturnType<typeof listByContents>>[number];

/**
 * The tags on the contents, sorted by type, then id, each with the
 * `contentTag` row that puts it there (the shape Sequelize answered). With
 * `onlyTagIds`, just those tags.
 */
export async function listByContents(
  contentIds: number[],
  onlyTagIds?: string[],
  executor: Executor = database,
) {
  if (contentIds.length === 0) {
    return [];
  }
  return executor
    .select({
      ...tagJson,
      contentTag: {
        content_id: contentTag.content_id,
        tag_id: contentTag.tag_id,
      },
    })
    .from(contentTag)
    .innerJoin(tag, eq(tag.tag_id, contentTag.tag_id))
    .where(
      and(
        inArray(contentTag.content_id, contentIds),
        onlyTagIds ? inArray(contentTag.tag_id, onlyTagIds) : undefined,
      ),
    )
    .orderBy(asc(tag.tag_type), asc(tag.tag_id));
}

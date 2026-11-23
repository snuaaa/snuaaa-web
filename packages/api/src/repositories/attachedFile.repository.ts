import { and, asc, inArray, isNull, sql } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { attachedFile } from '../db/schema';

/**
 * The (not deleted) files attached to the contents, oldest first. Like the
 * Sequelize model's getter, `file_path` is the S3 `file_url` when there is
 * one, so the web can keep reading `file_path`.
 */
export async function listByContents(
  contentIds: number[],
  executor: Executor = database,
) {
  if (contentIds.length === 0) {
    return [];
  }
  return executor
    .select({
      file_id: attachedFile.file_id,
      parent_id: attachedFile.parent_id,
      original_name: attachedFile.original_name,
      file_path: sql<
        string | null
      >`coalesce(nullif(${attachedFile.file_url}, ''), ${attachedFile.file_path})`,
      file_url: attachedFile.file_url,
      file_type: attachedFile.file_type,
      download_count: attachedFile.download_count,
      createdAt: attachedFile.created_at,
      updatedAt: attachedFile.updated_at,
      deletedAt: attachedFile.deleted_at,
    })
    .from(attachedFile)
    .where(
      and(
        inArray(attachedFile.parent_id, contentIds),
        isNull(attachedFile.deleted_at),
      ),
    )
    .orderBy(asc(attachedFile.file_id));
}

export type AttachedFileJson = Awaited<
  ReturnType<typeof listByContents>
>[number];

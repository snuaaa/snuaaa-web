import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
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

/** Attaches a file to the content. */
export async function insert(
  values: {
    parent_id: number;
    original_name: string;
    file_url: string;
    file_type: string;
  },
  executor: Executor = database,
) {
  const now = new Date();
  await executor.insert(attachedFile).values({
    ...values,
    // The deprecated column holds the same URL, as it has for S3 files.
    file_path: values.file_url,
    created_at: now,
    updated_at: now,
  });
}

/**
 * The (not deleted) file attached to the content, or null. `location` is
 * the S3 URL, or the old local path of a file that has none.
 */
export async function findInContent(
  fileId: number,
  contentId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({
      original_name: attachedFile.original_name,
      location: sql<
        string | null
      >`coalesce(nullif(${attachedFile.file_url}, ''), ${attachedFile.file_path})`,
    })
    .from(attachedFile)
    .where(
      and(
        eq(attachedFile.file_id, fileId),
        eq(attachedFile.parent_id, contentId),
        isNull(attachedFile.deleted_at),
      ),
    );
  return row ?? null;
}

/** The content the (not deleted) file is attached to, or null. */
export async function findParentId(
  fileId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ parent_id: attachedFile.parent_id })
    .from(attachedFile)
    .where(
      and(eq(attachedFile.file_id, fileId), isNull(attachedFile.deleted_at)),
    );
  return row?.parent_id ?? null;
}

/** Counts a download, without touching `updated_at`. */
export async function addDownload(
  fileId: number,
  executor: Executor = database,
) {
  await executor
    .update(attachedFile)
    .set({
      download_count: sql`coalesce(${attachedFile.download_count}, 0) + 1`,
    })
    .where(eq(attachedFile.file_id, fileId));
}

/** Soft-deletes the file. Returns how many rows changed (0 or 1). */
export async function softDelete(
  fileId: number,
  executor: Executor = database,
) {
  const rows = await executor
    .update(attachedFile)
    .set({ deleted_at: new Date() })
    .where(
      and(eq(attachedFile.file_id, fileId), isNull(attachedFile.deleted_at)),
    )
    .returning({ file_id: attachedFile.file_id });
  return rows.length;
}

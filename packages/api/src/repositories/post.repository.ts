import { database, type Executor } from '../db/client';
import { post } from '../db/schema';

/** Adds the `tb_post` detail row of a content. */
export async function insert(contentId: number, executor: Executor = database) {
  await executor.insert(post).values({ content_id: contentId });
}

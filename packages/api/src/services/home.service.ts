import * as photos from '../repositories/photo.repository';
import * as posts from '../repositories/post.repository';
import { calcRiseSet } from '../utils/riseset';
import { listNewestAlbums } from './album.service';
import { canReadBoard } from './board.service';
import type { Actor } from './types';

/** The boards the home page shows. */
const NOTICE_BOARD_ID = 'brd01';
const MEMORY_BOARD_ID = 'brd31';
const ASTROPHOTO_BOARD_ID = 'brd32';

const RECENT_POST_COUNT = 7;
const POSTS_PER_PAGE = 10;
const MEMORY_ALBUM_COUNT = 4;
const ASTROPHOTO_COUNT = 9;

/**
 * The notice box: the notice board's most recently updated post, or null
 * when it has none or the actor may not read the board.
 */
export async function retrieveSoundBox(actor: Actor) {
  if (!(await canReadBoard(actor, NOTICE_BOARD_ID))) {
    return null;
  }
  return posts.findLatestUpdatedOnBoard(NOTICE_BOARD_ID);
}

/** The most recently updated posts and documents the actor may read. */
export async function listRecentPosts(actor: Actor) {
  return posts.listRecentlyUpdatedWithDocuments(actor.grade, RECENT_POST_COUNT);
}

/**
 * A page (from 1) of the posts the actor may read, most recently updated
 * first, and how many there are in all.
 */
export async function listAllPosts(actor: Actor, page: number) {
  const [postCount, postInfo] = await Promise.all([
    posts.countRecentlyUpdated(actor.grade),
    posts.listRecentlyUpdated(actor.grade, {
      limit: POSTS_PER_PAGE,
      offset: POSTS_PER_PAGE * (page - 1),
    }),
  ]);
  return { postCount, postInfo };
}

/** The memory board's newest albums. */
export async function listRecentMemories(actor: Actor) {
  return listNewestAlbums(actor, MEMORY_BOARD_ID, MEMORY_ALBUM_COUNT);
}

/**
 * The astrophoto board's newest photos, or none when the actor may not
 * read the board.
 */
export async function listRecentAstrophotos(actor: Actor) {
  if (!(await canReadBoard(actor, ASTROPHOTO_BOARD_ID))) {
    return [];
  }
  return photos.listNewestOnBoard(ASTROPHOTO_BOARD_ID, ASTROPHOTO_COUNT);
}

/** Tonight's sun and moon rise and set times in Seoul. */
export function retrieveRiseSet() {
  return calcRiseSet();
}

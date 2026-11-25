import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { insert } from './sql';

/*
 * Factories insert rows with SQL, not through the app's models or
 * controllers. A change in the code under test then can't break the setup of
 * an unrelated test, and the factories survive the ORM change (#158).
 */

let sequence = 0;
const next = () => ++sequence;

export const DEFAULT_PASSWORD = 'password1234';

export type User = {
  user_id: number;
  user_uuid: string;
  id: string;
  nickname: string;
  grade: number;
  level: number;
};

type UserOverrides = Partial<
  Pick<User, 'id' | 'nickname' | 'grade' | 'level'>
> & {
  /** Plain text; stored hashed, like signup. */
  password?: string;
};

export async function createUser(overrides: UserOverrides = {}) {
  const n = next();
  const { password = DEFAULT_PASSWORD, ...rest } = overrides;
  return insert<User>('tb_user', {
    user_uuid: randomUUID(),
    id: `user${n}`,
    password: bcrypt.hashSync(password, 4),
    username: `User ${n}`,
    nickname: `nick${n}`,
    email: `user${n}@example.com`,
    mobile: '010-0000-0000',
    grade: 9,
    level: 0,
    created_at: new Date(),
    updated_at: new Date(),
    ...rest,
  });
}

export type Board = {
  board_id: string;
  lv_read: number;
  lv_write: number;
  lv_edit: number;
};

type BoardOverrides = Partial<
  Board & {
    board_name: string;
    board_type: string;
    board_desc: string;
    menu: number;
    order: number;
  }
>;

export async function createBoard(overrides: BoardOverrides = {}) {
  const n = next();
  return insert<Board>('tb_board', {
    board_id: `brd${n}`,
    board_name: `Board ${n}`,
    board_type: 'N',
    menu: 1,
    order: n,
    lv_read: 10,
    lv_write: 10,
    lv_edit: 10,
    ...overrides,
  });
}

export async function createCategory(board: Board) {
  const n = next();
  return insert<{ category_id: string }>('tb_category', {
    category_id: `cat${n}`,
    board_id: board.board_id,
    category_name: `Category ${n}`,
  });
}

/**
 * Creates a `tb_content` row, without a detail row (e.g. a parent album the
 * test only needs to exist). `createPost` adds the `tb_post` row too.
 */
export async function createContent(
  author: User,
  board: Board,
  overrides: {
    type?: string;
    title?: string;
    text?: string;
    parent_id?: number;
    comment_num?: number;
    like_num?: number;
    category_id?: string;
    view_num?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
  } = {},
) {
  const n = next();
  const content = await insert<{ content_id: number }>('tb_content', {
    content_uuid: randomUUID(),
    author_id: author.user_id,
    board_id: board.board_id,
    type: 'PO',
    title: `Content ${n}`,
    text: `Text ${n}`,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  });
  return content.content_id;
}

/** Creates a post: a `tb_content` row of type PO and its `tb_post` row. */
export async function createPost(
  author: User,
  board: Board,
  overrides: Omit<Parameters<typeof createContent>[2], 'type'> = {},
) {
  const contentId = await createContent(author, board, {
    ...overrides,
    type: 'PO',
  });
  await insert('tb_post', { content_id: contentId });
  return contentId;
}

/** Creates a document: a `tb_content` row of type DO and its `tb_document` row. */
export async function createDocument(
  author: User,
  board: Board,
  overrides: Omit<Parameters<typeof createContent>[2], 'type'> & {
    generation?: number;
  } = {},
) {
  const { generation = 40, ...contentOverrides } = overrides;
  const contentId = await createContent(author, board, {
    ...contentOverrides,
    type: 'DO',
  });
  await insert('tb_document', { content_id: contentId, generation });
  return contentId;
}

/** Creates an album: a `tb_content` row of type AL and its `tb_album` row. */
export async function createAlbum(
  author: User,
  board: Board,
  overrides: Omit<Parameters<typeof createContent>[2], 'type'> & {
    is_private?: boolean | null;
    tn_photo_id?: number | null;
  } = {},
) {
  const {
    is_private = false,
    tn_photo_id = null,
    ...contentOverrides
  } = overrides;
  const contentId = await createContent(author, board, {
    ...contentOverrides,
    type: 'AL',
  });
  await insert('tb_album', { content_id: contentId, is_private, tn_photo_id });
  return contentId;
}

/**
 * Creates a photo: a `tb_content` row of type PH (in the album, when
 * `parent_id` is given) and its `tb_photo` row.
 */
export async function createPhoto(
  author: User,
  board: Board,
  overrides: Omit<Parameters<typeof createContent>[2], 'type'> & {
    photo?: Record<string, unknown>;
  } = {},
) {
  const n = next();
  const { photo = {}, ...contentOverrides } = overrides;
  const contentId = await createContent(author, board, {
    ...contentOverrides,
    type: 'PH',
  });
  await insert('tb_photo', {
    content_id: contentId,
    img_url: `https://bucket.example.com/photo${n}.jpg`,
    thumbnail_url: `https://bucket.example.com/photo${n}_thumb.jpg`,
    ...photo,
  });
  return contentId;
}

/**
 * Creates an exhibition: a `tb_content` row of type EH and its
 * `tb_exhibition` row, with S3 poster URLs.
 */
export async function createExhibition(
  author: User,
  board: Board,
  overrides: Omit<Parameters<typeof createContent>[2], 'type'> & {
    exhibition?: Record<string, unknown>;
  } = {},
) {
  const n = next();
  const { exhibition = {}, ...contentOverrides } = overrides;
  const contentId = await createContent(author, board, {
    ...contentOverrides,
    type: 'EH',
  });
  const posterUrl = `https://bucket.example.com/poster${n}.jpg`;
  const posterThumbnailUrl = `https://bucket.example.com/poster${n}_thumb.jpg`;
  await insert('tb_exhibition', {
    content_id: contentId,
    exhibition_no: n,
    slogan: `Slogan ${n}`,
    date_start: new Date('2024-03-01T00:00:00.000Z'),
    date_end: new Date('2024-03-08T00:00:00.000Z'),
    place: `Place ${n}`,
    poster_path: posterUrl,
    poster_thumbnail_path: posterThumbnailUrl,
    poster_url: posterUrl,
    poster_thumbnail_url: posterThumbnailUrl,
    ...exhibition,
  });
  return contentId;
}

/**
 * Creates an exhibit photo: a `tb_content` row of type EP (in the
 * exhibition `parent_id`) and its `tb_exhibit_photo` row.
 */
export async function createExhibitPhoto(
  author: User,
  board: Board,
  overrides: Omit<Parameters<typeof createContent>[2], 'type'> & {
    exhibitPhoto?: Record<string, unknown>;
  } = {},
) {
  const n = next();
  const { exhibitPhoto = {}, ...contentOverrides } = overrides;
  const contentId = await createContent(author, board, {
    ...contentOverrides,
    type: 'EP',
  });
  const imgUrl = `https://bucket.example.com/exhibit${n}.jpg`;
  const thumbnailUrl = `https://bucket.example.com/exhibit${n}_thumb.jpg`;
  await insert('tb_exhibit_photo', {
    content_id: contentId,
    order: n,
    file_path: imgUrl,
    thumbnail_path: thumbnailUrl,
    img_url: imgUrl,
    thumbnail_url: thumbnailUrl,
    ...exhibitPhoto,
  });
  return contentId;
}

/** Creates a tag on the board, which photos on it can carry. */
export async function createTag(board: Board) {
  const n = next();
  return insert<{ tag_id: string }>('tb_tag', {
    tag_id: `tag${n}`,
    board_id: board.board_id,
    tag_name: `Tag ${n}`,
    tag_type: 'M',
  });
}

/** Puts the tags on the content. */
export async function tagContent(contentId: number, tagIds: string[]) {
  for (const tag_id of tagIds) {
    await insert('tb_content_tag', { content_id: contentId, tag_id });
  }
}

/**
 * Creates a comment on the content. Like the API, it does not touch the
 * content's `comment_num`; pass `comment_num` to `createContent` for that.
 */
export async function createComment(
  author: User,
  contentId: number,
  overrides: {
    text?: string;
    parent_comment_id?: number;
    created_at?: Date;
    deleted_at?: Date;
  } = {},
) {
  const n = next();
  const { created_at = new Date(), ...rest } = overrides;
  const comment = await insert<{ comment_id: number }>('tb_comment', {
    comment_uuid: randomUUID(),
    parent_id: contentId,
    author_id: author.user_id,
    text: `Comment ${n}`,
    created_at,
    updated_at: created_at,
    ...rest,
  });
  return comment.comment_id;
}

/** Records that the user likes the content, without touching `like_num`. */
/**
 * Attaches a file to the content. `file_url` is the S3 URL; `file_path` is
 * the deprecated local path that only old files have.
 */
export async function createAttachedFile(
  contentId: number,
  overrides: {
    original_name?: string;
    file_path?: string | null;
    file_url?: string | null;
    file_type?: string;
    download_count?: number;
    created_at?: Date;
    deleted_at?: Date;
  } = {},
) {
  const n = next();
  const { created_at = new Date(), ...rest } = overrides;
  const file = await insert<{ file_id: number }>('tb_file', {
    parent_id: contentId,
    original_name: `file${n}.pdf`,
    file_path: null,
    file_url: `https://bucket.example.com/file${n}.pdf`,
    file_type: 'application/pdf',
    download_count: 0,
    created_at,
    updated_at: created_at,
    ...rest,
  });
  return file.file_id;
}

export async function createContentLike(user: User, contentId: number) {
  await insert('tb_content_like', {
    content_id: contentId,
    user_id: user.user_id,
  });
}

/** Records that the user likes the comment. */
export async function createCommentLike(user: User, commentId: number) {
  await insert('tb_comment_like', {
    comment_id: commentId,
    user_id: user.user_id,
  });
}

export type EquipmentCategory = { id: number; name: string };

/** An equipment category, as the admin page creates it. */
export async function createEquipmentCategory(
  overrides: { name?: string; deleted_at?: Date } = {},
) {
  const n = next();
  const now = new Date();
  return insert<EquipmentCategory>('tb_equipment_category', {
    name: `Category ${n}`,
    created_at: now,
    updated_at: now,
    ...overrides,
  });
}

export type Equipment = {
  id: number;
  category_id: number | null;
  name: string;
  nickname: string | null;
  description: string | null;
  location: string | null;
  maker: string | null;
  status: string | null;
  rent_status: string | null;
  img_path: string | null;
};

/** A rentable equipment in the category, unless overridden. */
export async function createEquipment(
  category: EquipmentCategory | null,
  overrides: Partial<Omit<Equipment, 'id'>> & {
    created_at?: Date;
    deleted_at?: Date;
  } = {},
) {
  const n = next();
  const now = new Date();
  return insert<Equipment>('tb_equipment', {
    category_id: category?.id ?? null,
    name: `Telescope ${n}`,
    nickname: `scope${n}`,
    description: 'A telescope',
    location: 'Club room',
    maker: 'Maker',
    status: 'OK',
    rent_status: 'RENTABLE',
    img_path: `https://bucket.example.com/equipment${n}.jpg`,
    created_at: now,
    updated_at: now,
    ...overrides,
  });
}

/** A rent of the equipment by the user, not returned unless overridden. */
export async function createRent(
  user: User,
  equipment: Equipment,
  overrides: {
    start_date?: Date;
    end_date?: Date | null;
    returned?: boolean;
  } = {},
) {
  const start_date = overrides.start_date ?? new Date();
  const rent = await insert<{ id: number }>('tb_rent', {
    user_id: user.user_id,
    equipment_id: equipment.id,
    start_date,
    end_date: new Date(start_date.getTime() + 2 * 24 * 60 * 60 * 1000),
    returned: false,
    ...overrides,
  });
  return rent.id;
}

/** Records the return of the rent, by default on time with no penalty. */
export async function createRentReturn(
  rentId: number,
  overrides: {
    photo_path?: string | null;
    return_date?: Date;
    penalty_status?: string;
  } = {},
) {
  await insert('tb_rent_return', {
    rent_id: rentId,
    photo_path: 'https://bucket.example.com/return.jpg',
    return_date: new Date(),
    penalty_status: 'NOPENALTY',
    ...overrides,
  });
}

/**
 * An `Authorization` header value for the user, as the web sends it.
 * The token is signed here instead of with the app's helper, because its
 * payload and secret are part of the contract.
 */
export function bearer(
  user: Pick<User, 'user_id' | 'grade' | 'level'>,
  { autoLogin = false } = {},
) {
  const token = jwt.sign(
    { _id: user.user_id, grade: user.grade, level: user.level, autoLogin },
    process.env.JWT_SECRET,
    { expiresIn: autoLogin ? '14d' : '1d' },
  );
  return `Bearer ${token}`;
}

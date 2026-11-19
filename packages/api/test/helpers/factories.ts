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
    deleted_at?: Date;
  } = {},
) {
  const n = next();
  const comment = await insert<{ comment_id: number }>('tb_comment', {
    comment_uuid: randomUUID(),
    parent_id: contentId,
    author_id: author.user_id,
    text: `Comment ${n}`,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  });
  return comment.comment_id;
}

/** Records that the user likes the content, without touching `like_num`. */
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

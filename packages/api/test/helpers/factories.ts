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

/** Creates a post: a `tb_content` row of type PO and its `tb_post` row. */
export async function createPost(
  author: User,
  board: Board,
  overrides: { title?: string; text?: string } = {},
) {
  const n = next();
  const content = await insert<{ content_id: number }>('tb_content', {
    content_uuid: randomUUID(),
    author_id: author.user_id,
    board_id: board.board_id,
    type: 'PO',
    title: `Post ${n}`,
    text: `Text ${n}`,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  });
  await insert('tb_post', { content_id: content.content_id });
  return content.content_id;
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

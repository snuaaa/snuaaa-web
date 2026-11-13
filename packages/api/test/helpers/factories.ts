import bcrypt from 'bcryptjs';
import uuid4 from 'uuid4';
import UserModel from '../../src/models/User';
import BoardModel from '../../src/models/Board';
import { createToken } from '../../src/utils/token';

let sequence = 0;
const next = () => ++sequence;

export const DEFAULT_PASSWORD = 'password1234';

type UserOverrides = {
  id?: string;
  password?: string;
  nickname?: string;
  grade?: number;
  level?: number;
};

/** Creates a user. `password` is plain text and stored hashed, like signup. */
export async function createUser(overrides: UserOverrides = {}) {
  const n = next();
  const { password = DEFAULT_PASSWORD, ...rest } = overrides;
  return UserModel.create({
    user_uuid: uuid4(),
    id: `user${n}`,
    password: bcrypt.hashSync(password, 4),
    username: `User ${n}`,
    nickname: `nick${n}`,
    email: `user${n}@example.com`,
    mobile: '010-0000-0000',
    grade: 9,
    level: 0,
    ...rest,
  });
}

type BoardOverrides = {
  board_id?: string;
  board_name?: string;
  board_type?: string;
  menu?: number;
  order?: number;
  lv_read?: number;
  lv_write?: number;
  lv_edit?: number;
};

export async function createBoard(overrides: BoardOverrides = {}) {
  const n = next();
  return BoardModel.create({
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

/** An `Authorization` header value for the user, as the web sends it. */
export async function bearer(user: UserModel, { autoLogin = false } = {}) {
  const token = await createToken({
    _id: user.get('user_id') as number,
    grade: user.get('grade') as number,
    level: user.get('level') as number,
    autoLogin,
  });
  return `Bearer ${token}`;
}

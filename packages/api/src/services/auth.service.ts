import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { withTransaction } from '../db/transaction';
import { AuthenticationError, BadRequestError, ConflictError } from '../errors';
import * as users from '../repositories/user.repository';
import { resizeImageBuffer } from '../utils/resize';
import { createToken, type JWTPayload } from '../utils/token';
import { uploadImageToS3 } from '../utils/upload';
import {
  MEMBER_GRADE,
  NEW_MEMBER_GRADE,
  NICKNAME_MAX_LENGTH,
  generationOf,
} from './user.service';

const GUEST_IDENTITY: JWTPayload = {
  _id: -1,
  grade: 10,
  level: 0,
  autoLogin: false,
};

const LOGIN_FAILED_MESSAGE = 'Login Info is not valid.';

/** A login is recorded at most once in this long. */
const LOGIN_RECORD_INTERVAL = 60 * 60 * 1000;

const HASH_ROUNDS = 8;
const LOGIN_ID = /^[a-zA-Z0-9]+$/;
const LOGIN_ID_MAX_LENGTH = 16;
const PASSWORD_MIN_LENGTH = 4;
const PROFILE_SHORT_SIDE = 300;

/** A guest's session: a token anyone may have, for the public pages. */
export async function guestSession() {
  return {
    userInfo: {
      user_id: GUEST_IDENTITY._id,
      grade: GUEST_IDENTITY.grade,
      level: GUEST_IDENTITY.level,
      profile_path: null,
      nickname: 'guest',
    },
    autoLogin: GUEST_IDENTITY.autoLogin,
    token: await createToken(GUEST_IDENTITY),
  };
}

/** Records the login unless the last one was less than an hour ago. */
async function recordLogin(userId: number, lastLoginAt: Date | null) {
  const now = new Date();
  if (
    lastLoginAt &&
    now.getTime() - lastLoginAt.getTime() <= LOGIN_RECORD_INTERVAL
  ) {
    return;
  }
  await withTransaction((transaction) =>
    users.recordLogin(userId, now, transaction),
  );
}

function tokenFor(
  member: { user_id: number; grade: number | null; level: number | null },
  autoLogin: boolean,
) {
  return createToken({
    _id: member.user_id,
    // A missing grade signs as a new member's, never as no grade, which
    // would pass every `grade <= n` check.
    grade: member.grade ?? NEW_MEMBER_GRADE,
    level: member.level ?? 0,
    autoLogin,
  });
}

/**
 * Logs the member in with their login id and password. A wrong id and a
 * wrong password get the same 401, so the answer doesn't tell which. The
 * answered `login_at` is the previous login.
 */
export async function logIn(
  loginId: unknown,
  password: unknown,
  autoLogin: boolean,
) {
  if (!loginId || typeof loginId !== 'string' || typeof password !== 'string') {
    throw new AuthenticationError(LOGIN_FAILED_MESSAGE);
  }
  const member = await users.findForLogin(loginId);
  if (!member?.password || !bcrypt.compareSync(password, member.password)) {
    throw new AuthenticationError(LOGIN_FAILED_MESSAGE);
  }
  await recordLogin(member.user_id, member.login_at);
  const { password: _password, ...userInfo } = member;
  return {
    userInfo,
    autoLogin,
    token: await tokenFor(member, autoLogin),
  };
}

/**
 * Renews the session of a valid token: the member's info, and a new token
 * with the grade and level now in the database. A guest gets a new guest
 * token. Throws 401 when the member left.
 */
export async function checkSession(actor: JWTPayload) {
  if (actor._id === GUEST_IDENTITY._id) {
    return guestSession();
  }
  const member = await users.findOwnInfo(actor._id);
  if (!member) {
    throw new AuthenticationError('Token is not valid.');
  }
  await recordLogin(member.user_id, member.login_at);
  return {
    userInfo: member,
    autoLogin: actor.autoLogin,
    token: await tokenFor(member, actor.autoLogin),
  };
}

/** Throws 409 when a member has the login id. Left members' ids are free. */
export async function assertLoginIdFree(loginId: unknown) {
  if (!loginId || typeof loginId !== 'string') {
    throw new BadRequestError('id can not be null');
  }
  if (await users.isLoginIdTaken(loginId)) {
    throw new ConflictError('id is duplicated');
  }
}

/** The signup form, with the web's field names. */
export type SignUpInput = {
  id?: string;
  password?: string;
  passwordCf?: string;
  username?: string;
  aaaNum?: string;
  schoolNum?: string;
  major?: string;
  email?: string;
  mobile?: string;
  introduction?: string;
};

/**
 * Creates a member, with the profile photo when one is attached. A valid
 * club number gives the nickname its generation and grade 8; any other
 * club number is dropped and the member starts at grade 9.
 */
export async function signUp(input: SignUpInput, profile?: Buffer) {
  if (
    !input.id ||
    !LOGIN_ID.test(input.id) ||
    input.id.length > LOGIN_ID_MAX_LENGTH
  ) {
    throw new BadRequestError('BAD USERNAME');
  }
  if (!input.password || input.password.length < PASSWORD_MIN_LENGTH) {
    throw new BadRequestError('BAD PASSWORD');
  }
  if (input.password !== input.passwordCf) {
    throw new BadRequestError('BAD PASSWORD CONFIRM');
  }
  await assertLoginIdFree(input.id);

  const generation = generationOf(input.aaaNum);
  const nickname =
    input.username === undefined
      ? undefined
      : (generation ?? '') + input.username;
  if (nickname && nickname.length > NICKNAME_MAX_LENGTH) {
    throw new BadRequestError('username is too long');
  }

  let profileUrl: string | undefined;
  if (profile) {
    let resized: Buffer;
    try {
      resized = await resizeImageBuffer(profile, {
        shortSideSize: PROFILE_SHORT_SIDE,
      });
    } catch {
      throw new BadRequestError('Image is not valid');
    }
    profileUrl = await uploadImageToS3(resized, 'profile');
  }

  await users.create({
    user_uuid: randomUUID(),
    id: input.id,
    password: bcrypt.hashSync(input.password, HASH_ROUNDS),
    username: input.username,
    nickname,
    aaa_no: generation ? input.aaaNum : null,
    col_no: input.schoolNum,
    major: input.major,
    email: input.email,
    mobile: input.mobile,
    introduction: input.introduction,
    profile_path: profileUrl,
    profile_url: profileUrl,
    grade: generation ? MEMBER_GRADE : NEW_MEMBER_GRADE,
    level: 0,
  });
}

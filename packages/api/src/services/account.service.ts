import bcrypt from 'bcryptjs';
import cryptoRandomString from 'crypto-random-string';
import { withTransaction } from '../db/transaction';
import { BadRequestError, NotFoundError } from '../errors';
import * as users from '../repositories/user.repository';
import { sendMail } from '../utils/mail';
import type { Actor } from './types';

const HASH_ROUNDS = 10;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;
const TEMPORARY_PASSWORD_LENGTH = 10;

export type PasswordChange = {
  password?: unknown;
  newPassword?: unknown;
  newPasswordCf?: unknown;
};

/**
 * Changes the actor's password after checking the current one. A refusal
 * carries the legacy `code` the web reads to mark the field (1011–1014).
 * Throws 404 when the actor left.
 */
export async function changeMyPassword(actor: Actor, change: PasswordChange) {
  const current = await users.findPasswordHash(actor._id);
  if (!current) {
    throw new NotFoundError('id is not correct');
  }
  if (
    typeof change.password !== 'string' ||
    !current.password ||
    !bcrypt.compareSync(change.password, current.password)
  ) {
    throw new BadRequestError('Current password is incorrect', { code: 1011 });
  }
  const { newPassword } = change;
  if (typeof newPassword !== 'string' || !newPassword) {
    throw new BadRequestError('New password is required', { code: 1012 });
  }
  if (newPassword !== change.newPasswordCf) {
    throw new BadRequestError('New password confirmation does not match', {
      code: 1013,
    });
  }
  if (
    newPassword.length < PASSWORD_MIN_LENGTH ||
    newPassword.length > PASSWORD_MAX_LENGTH
  ) {
    throw new BadRequestError('New password must be 8-20 characters', {
      code: 1014,
    });
  }
  await users.updatePassword(
    actor._id,
    bcrypt.hashSync(newPassword, HASH_ROUNDS),
  );
}

/** Marks the actor as left the club. Leaving twice keeps the first date. */
export async function leave(actor: Actor) {
  await users.softDelete(actor._id);
}

/** Mails every login id of the members with the name and email. */
export async function remindLoginIds(name: unknown, email: unknown) {
  if (typeof email !== 'string' || !email) {
    throw new BadRequestError('email can not be null');
  }
  if (typeof name !== 'string' || !name) {
    throw new BadRequestError('name can not be null');
  }
  const ids = await users.listLoginIdsByNameAndEmail(name, email);
  if (ids.length === 0) {
    throw new NotFoundError();
  }
  await sendMail({
    to: email,
    subject: '[SNUAAA] 회원님의 ID를 알려드립니다.',
    text: `회원님의 ID는 ${ids.join(', ')}입니다.`,
  });
}

/**
 * Sets a temporary password for the member with the login id, name and
 * email, and mails it to them. The mail goes out inside the transaction, so
 * when it fails the old password stays.
 */
export async function resetPassword(
  loginId: unknown,
  name: unknown,
  email: unknown,
) {
  if (typeof loginId !== 'string' || !loginId) {
    throw new BadRequestError('id can not be null');
  }
  await withTransaction(async (transaction) => {
    const member = await users.findByLoginIdForUpdate(loginId, transaction);
    if (!member) {
      throw new NotFoundError('id is not correct');
    }
    if (!member.email || member.email !== email || member.username !== name) {
      throw new NotFoundError();
    }
    const temporary = cryptoRandomString({
      length: TEMPORARY_PASSWORD_LENGTH,
    });
    await users.updatePassword(
      member.user_id,
      bcrypt.hashSync(temporary, HASH_ROUNDS),
      transaction,
    );
    await sendMail({
      to: member.email,
      subject: '[SNUAAA] 회원님의 임시 비밀번호를 알려드립니다.',
      text: `임시비밀번호는 ${temporary}입니다.\n
                로그인 하신 후 원하시는 비밀번호로 변경해주세요.`,
    });
  });
}

import { withTransaction } from '../db/transaction';
import EquipmentRentEnum from '../enums/equipmentRentEnum';
import PenaltyStatusEnum from '../enums/penaltyStatusEnum';
import {
  AuthorizationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors';
import * as equipments from '../repositories/equipment.repository';
import * as rents from '../repositories/rent.repository';
import { parseId } from '../repositories/utils';
import { assertEquipmentAdmin } from './equipment.service';
import type { Actor } from './types';

/** Members at or above this grade (a lower number) may rent equipment. */
export const EQUIPMENT_RENT_GRADE = 7;

/** A rent lasts two days. */
const RENT_DAYS = 2;
const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

/** The records and an equipment's rents come ten a page. */
const RENTS_PER_PAGE = 10;

/** Throws 403 unless the actor may rent equipment. */
export function assertCanRent(actor: Actor) {
  if (actor.grade > EQUIPMENT_RENT_GRADE) {
    throw new AuthorizationError('PERMISSION DENIED');
  }
}

/**
 * Rents one equipment to the actor for two days, together with marking it
 * rented, or not at all. Its row is locked first, so two requests can't both
 * rent it. Throws for an unknown, rented or unrentable equipment.
 */
async function rentOne(actor: Actor, equipmentId: unknown) {
  const id = parseId(equipmentId);
  if (id === null) {
    throw new NotFoundError('Equipment not found');
  }
  await withTransaction(async (transaction) => {
    const rentStatus = await equipments.lockRentStatus(id, transaction);
    if (rentStatus === null) {
      throw new NotFoundError('Equipment not found');
    }
    if (
      rentStatus === EquipmentRentEnum.RENTED ||
      rentStatus === EquipmentRentEnum.UNRENTABLE
    ) {
      throw new ConflictError('Equipment not rentable');
    }
    const start = new Date();
    await rents.insert(
      {
        user_id: actor._id,
        equipment_id: id,
        start_date: start,
        end_date: new Date(start.getTime() + RENT_DAYS * DAY_MILLISECONDS),
      },
      transaction,
    );
    await equipments.setRentStatus(
      id,
      EquipmentRentEnum.RENTED,
      {},
      transaction,
    );
  });
}

/**
 * Rents each of the equipment to the actor, one after another. One that
 * can't be rented (unknown, taken, unrentable, or locked by a request that
 * doesn't finish in time) fails alone. An id listed twice is rented once.
 */
export async function rentEquipments(actor: Actor, equipmentIds: unknown[]) {
  assertCanRent(actor);
  const successEquipmentIds: unknown[] = [];
  for (const equipmentId of equipmentIds) {
    try {
      await rentOne(actor, equipmentId);
      successEquipmentIds.push(equipmentId);
    } catch {
      // Reported in failedEquipmentIds.
    }
  }
  return {
    successEquipmentIds,
    failedEquipmentIds: equipmentIds.filter(
      (id) => !successEquipmentIds.includes(id),
    ),
  };
}

/**
 * Returns the actor's rent with the photo they took: the rent is marked
 * returned, the return recorded (needing a penalty payment when it is past
 * the end date), and the equipment made rentable again unless an admin made
 * it unrentable meanwhile, together or not at all.
 */
export async function returnEquipment(
  actor: Actor,
  rentId: string,
  photoPath: string | null | undefined,
) {
  assertCanRent(actor);
  const id = parseId(rentId);
  if (id === null) {
    throw new NotFoundError('Rent not found');
  }
  await withTransaction(async (transaction) => {
    const target = await rents.lock(id, transaction);
    if (!target) {
      throw new NotFoundError('Rent not found');
    }
    if (target.user_id !== actor._id) {
      throw new AuthorizationError('User mismatch: not the renter');
    }
    if (target.returned) {
      throw new ConflictError('Already returned');
    }
    const now = new Date();
    await rents.markReturned(
      id,
      {
        photo_path: photoPath,
        return_date: now,
        penalty_status:
          target.end_date !== null && target.end_date < now
            ? PenaltyStatusEnum.NEED_PAYMENT
            : PenaltyStatusEnum.NO_PENALTY,
      },
      transaction,
    );
    await equipments.setRentStatus(
      target.equipment_id,
      EquipmentRentEnum.RENTABLE,
      { from: EquipmentRentEnum.RENTED },
      transaction,
    );
  });
  return { result: 'success', id };
}

/** The actor's rents that aren't returned yet. */
export function listMyRents(actor: Actor) {
  return rents.listOpenOfUser(actor._id);
}

/** The page, from 1; anything else is the first page. */
function pageOf(page: unknown) {
  const number = Number(page);
  const index = Number.isInteger(number) && number > 0 ? number : 1;
  return { limit: RENTS_PER_PAGE, offset: RENTS_PER_PAGE * (index - 1) };
}

/** A page of the equipment's rents, newest first (admins only). */
export function listRentsOfEquipment(
  actor: Actor,
  equipmentId: string,
  page: unknown,
) {
  assertEquipmentAdmin(actor);
  const id = parseId(equipmentId);
  if (id === null) {
    throw new NotFoundError('EQUIPMENT NOT FOUND');
  }
  return rents.listOfEquipment(id, pageOf(page));
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const SEOUL_OFFSET = '+09:00';

/**
 * A query date as the start or the (excluded) end of a range. A date
 * without a time (the web's date inputs) is a whole day in Seoul, so an end
 * date includes all of it; an end with a time includes that moment. Throws
 * 400, naming the field, for a date that can't be read.
 */
function boundOf(key: string, value: string | undefined, isEnd: boolean) {
  if (!value) {
    return undefined;
  }
  const dateOnly = DATE_ONLY.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00${SEOUL_OFFSET}` : value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(`INVALID DATE FORMAT: ${key}`);
  }
  if (!isEnd) {
    return date;
  }
  return new Date(date.getTime() + (dateOnly ? DAY_MILLISECONDS : 1));
}

export type RentRecordQuery = {
  page?: unknown;
  penalty_status?: string;
  date_from_start?: string;
  date_to_start?: string;
  date_from_return?: string;
  date_to_return?: string;
};

/** A page of the returned rents, newest first (admins only). */
export function listRentRecords(actor: Actor, query: RentRecordQuery) {
  assertEquipmentAdmin(actor);
  return rents.listRecords(
    {
      penaltyStatus: query.penalty_status,
      start: {
        from: boundOf('date_from_start', query.date_from_start, false),
        until: boundOf('date_to_start', query.date_to_start, true),
      },
      returned: {
        from: boundOf('date_from_return', query.date_from_return, false),
        until: boundOf('date_to_return', query.date_to_return, true),
      },
    },
    pageOf(query.page),
  );
}

const PAYMENT_STATUSES: string[] = [
  PenaltyStatusEnum.NEED_PAYMENT,
  PenaltyStatusEnum.RECEIVED_PAYMENT,
];

/**
 * Moves a late return's penalty between needing and having received the
 * payment (admins only), and returns the return.
 */
export async function updatePenaltyStatus(
  actor: Actor,
  rentId: string,
  penaltyStatus: unknown,
) {
  assertEquipmentAdmin(actor);
  const id = parseId(rentId);
  if (id === null) {
    throw new BadRequestError('INVALID RENT ID');
  }
  if (
    typeof penaltyStatus !== 'string' ||
    !PAYMENT_STATUSES.includes(penaltyStatus)
  ) {
    throw new BadRequestError('INVALID PENALTY STATUS');
  }
  return withTransaction(async (transaction) => {
    const target = await rents.lockReturn(id, transaction);
    if (!target) {
      throw new NotFoundError('RentReturn record not found');
    }
    if (!PAYMENT_STATUSES.includes(target.penalty_status ?? '')) {
      throw new BadRequestError(
        'Transition only allowed between NEEDPAYMENT and RECEIVEDPAYMENT',
      );
    }
    if (target.penalty_status === penaltyStatus) {
      throw new ConflictError('Already in the requested status');
    }
    return rents.setPenaltyStatus(id, penaltyStatus, transaction);
  });
}

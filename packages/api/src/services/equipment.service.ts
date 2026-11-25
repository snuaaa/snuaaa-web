import type { Executor } from '../db/client';
import { withTransaction } from '../db/transaction';
import EquipmentRentEnum from '../enums/equipmentRentEnum';
import EquipmentStatusEnum from '../enums/equipmentStatusEnum';
import { AuthorizationError, ConflictError, NotFoundError } from '../errors';
import * as categories from '../repositories/equipmentCategory.repository';
import * as equipments from '../repositories/equipment.repository';
import * as rents from '../repositories/rent.repository';
import { parseId } from '../repositories/utils';
import type { Actor } from './types';

/** Members at or above this grade (a lower number) manage the equipment. */
export const EQUIPMENT_ADMIN_GRADE = 6;

/** Throws 403 unless the actor manages the equipment. */
export function assertEquipmentAdmin(actor: Actor) {
  if (actor.grade > EQUIPMENT_ADMIN_GRADE) {
    throw new AuthorizationError('PERMISSION DENIED');
  }
}

const equipmentNotFound = () => new NotFoundError('EQUIPMENT NOT FOUND');
const categoryNotFound = () =>
  new NotFoundError('EQUIPMENT CATEGORY NOT FOUND');

/**
 * The matching equipment, by category, then id, and how many there are.
 * Each one that is rented out carries its latest open rent: the renter
 * (`renter`, only the nickname unless `fullRenter`), `start_date` and
 * `end_date`, which the others leave out.
 */
export async function listEquipment(
  filter: equipments.EquipmentFilter = {},
  { fullRenter = false } = {},
) {
  const rows = await equipments.list(filter);
  const open = await rents.listOpen(rows.map((row) => row.id));
  const openByEquipment = new Map(
    open.map((rent) => [rent.equipment_id, rent]),
  );
  const equipInfo = rows.map((row) => {
    const rent = openByEquipment.get(row.id);
    if (!rent) {
      return row;
    }
    const renter =
      rent.user && !fullRenter ? { nickname: rent.user.nickname } : rent.user;
    return {
      ...row,
      renter: renter ?? undefined,
      start_date: rent.start_date,
      end_date: rent.end_date ?? undefined,
    };
  });
  return { equipCount: equipInfo.length, equipInfo };
}

/**
 * Equipment that isn't OK can't be rented, and OK equipment is rented
 * while it has an open rent.
 */
async function rentStatusFor(
  status: string | null | undefined,
  equipmentId: number | null,
  executor?: Executor,
) {
  if (status !== EquipmentStatusEnum.OK) {
    return EquipmentRentEnum.UNRENTABLE;
  }
  if (
    equipmentId !== null &&
    (await rents.hasOpenRent(equipmentId, executor))
  ) {
    return EquipmentRentEnum.RENTED;
  }
  return EquipmentRentEnum.RENTABLE;
}

/** Adds an equipment (admins only) and returns it. */
export async function createEquipment(
  actor: Actor,
  fields: equipments.EquipmentFields,
) {
  assertEquipmentAdmin(actor);
  return equipments.insert({
    ...fields,
    rent_status: await rentStatusFor(fields.status, null),
  });
}

/**
 * Changes the given fields of the (not deleted) equipment (admins only,
 * 404 otherwise). A given status also sets the rent status; without one it
 * stays. Answers how many rows changed, as Sequelize did.
 */
export async function updateEquipment(
  actor: Actor,
  equipmentId: number,
  fields: equipments.EquipmentFields,
) {
  assertEquipmentAdmin(actor);
  await withTransaction(async (transaction) => {
    if (
      (await equipments.findId(equipmentId, { lock: true }, transaction)) ===
      null
    ) {
      throw equipmentNotFound();
    }
    const rentStatus =
      fields.status === undefined
        ? undefined
        : await rentStatusFor(fields.status, equipmentId, transaction);
    await equipments.update(
      equipmentId,
      { ...fields, rent_status: rentStatus },
      transaction,
    );
  });
  return [1];
}

/** Soft-deletes the equipment (admins only, 404 when there is none). */
export async function deleteEquipment(actor: Actor, equipmentId: string) {
  assertEquipmentAdmin(actor);
  const id = parseId(equipmentId);
  if (id === null || (await equipments.softDelete(id)) === 0) {
    throw equipmentNotFound();
  }
}

/** The (not deleted) categories. */
export function listCategories() {
  return categories.list();
}

/** Adds a category (admins only) and returns it. */
export function createCategory(actor: Actor, name: string) {
  assertEquipmentAdmin(actor);
  return categories.insert(name);
}

/** Renames the category (admins only, 404 when there is none). */
export async function renameCategory(
  actor: Actor,
  categoryId: number,
  name: string,
) {
  assertEquipmentAdmin(actor);
  if ((await categories.rename(categoryId, name)) === 0) {
    throw categoryNotFound();
  }
  return [1];
}

/**
 * Soft-deletes the category (admins only, 404 when there is none), which
 * must hold no equipment (409).
 */
export async function deleteCategory(actor: Actor, categoryId: string) {
  assertEquipmentAdmin(actor);
  const id = parseId(categoryId);
  if (id === null) {
    throw categoryNotFound();
  }
  await withTransaction(async (transaction) => {
    if (!(await categories.exists(id, { lock: true }, transaction))) {
      throw categoryNotFound();
    }
    if ((await equipments.countInCategory(id, transaction)) > 0) {
      throw new ConflictError('EQUIPMENT EXISTS IN CATEGORY');
    }
    await categories.softDelete(id, transaction);
  });
  return id;
}

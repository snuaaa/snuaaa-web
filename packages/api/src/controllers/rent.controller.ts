import { Op, WhereOptions } from 'sequelize';
import EquipmentRentEnum from '../enums/equipmentRentEnum';
import { EquipmentModel, RentReturnModel, UserModel } from '../models';
import RentModel from '../models/Rent';
import PenaltyStatusEnum from '../enums/penaltyStatusEnum';
import {
  calculateLateDays,
  calculateOutstandingLateFee,
} from '../utils/lateFee';

interface PlainRentReturn {
  return_date?: Date | string;
  penalty_status: PenaltyStatusEnum;
  [key: string]: unknown;
}

interface PlainRentRecord {
  end_date?: Date | string;
  rentReturn?: PlainRentReturn;
  user?: { user_id: number; nickname: string };
  [key: string]: unknown;
}

export async function rentEquipment(equipmentId: number, userId: number) {
  const equipment = await EquipmentModel.findOne({
    where: { id: equipmentId },
  });
  if (!equipment) {
    throw new Error('Equipment not found');
  }
  if (
    [EquipmentRentEnum.RENTED, EquipmentRentEnum.UNRENTABLE].includes(
      equipment.get('rent_status') as EquipmentRentEnum,
    )
  ) {
    throw new Error('Equipment not rentable');
  }
  await RentModel.create({
    equipment_id: equipmentId,
    user_id: userId,
    start_date: new Date(),
    // set end_date to 2 days later
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  });
  // change equipment status to rented
  await EquipmentModel.update(
    { rent_status: EquipmentRentEnum.RENTED },
    {
      where: { id: equipmentId },
    },
  );
  return equipmentId;
}

export async function returnEquipment(
  userId: number,
  rentId: number,
  photo_path: string,
) {
  const rent = await RentModel.findOne({
    where: {
      id: rentId,
    },
  });
  if (!rent) {
    throw new Error('Rent not found');
  }
  if (rent.get('user_id') !== userId) {
    throw new Error('User mismatch: not the renter');
  }
  if (rent.get('returned')) {
    throw new Error('Already returned');
  }
  rent.update({ returned: true });
  const penalty_status =
    rent.get('end_date') < new Date()
      ? PenaltyStatusEnum.NEED_PAYMENT
      : PenaltyStatusEnum.NO_PENALTY;
  await RentReturnModel.create({
    rent_id: rentId,
    photo_path: photo_path,
    return_date: new Date(),
    penalty_status: penalty_status,
  });
  await EquipmentModel.update(
    { rent_status: EquipmentRentEnum.RENTABLE },
    {
      where: {
        id: rent.get('equipment_id'),
        rent_status: EquipmentRentEnum.RENTED,
      },
    },
  );
  return {
    result: 'success',
    id: rentId,
  };
}

export async function retrieveRentedEquipmentListByUserId(userId: number) {
  return RentModel.findAll({
    include: [
      {
        model: EquipmentModel,
        required: true, // ignore deleted equipment
      },
    ],
    where: {
      user_id: userId,
      returned: false,
    },
    attributes: ['id', 'start_date', 'end_date'],
  });
}

export async function retrieveRentListByEquipmentId(
  equipmentId: number,
  rowNum: number,
  offset: number,
) {
  return RentModel.findAndCountAll({
    include: [
      {
        model: RentReturnModel,
        required: false,
      },
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_id',
          'user_uuid',
          'nickname',
          'introduction',
          'grade',
          'level',
          'email',
          'profile_path',
          'deleted_at',
        ],
        paranoid: false,
      },
    ],
    where: {
      equipment_id: equipmentId,
    },
    order: [['start_date', 'DESC']],
    attributes: ['id', 'start_date', 'end_date'],
    limit: rowNum,
    offset: offset,
  });
}

export async function retrieveAllRentRecords(
  filters: {
    penaltyStatus?: string;
    userId?: number;
    dateFromDeadline?: string;
    dateFromStart?: string;
    dateToStart?: string;
    dateFromReturn?: string;
    dateToReturn?: string;
  },
  rowNum: number,
  offset: number,
) {
  const rentWhere: WhereOptions = { returned: true };

  // 선택한 연체자와 반납 기한 기준 집계 시작일을 대여 기록에 적용한다.
  if (filters.userId) {
    rentWhere.user_id = filters.userId;
  }

  if (filters.dateFromDeadline) {
    rentWhere.end_date = {
      [Op.gte]: new Date(filters.dateFromDeadline),
    };
  }

  if (filters.dateFromStart) {
    rentWhere.start_date = {
      ...(rentWhere.get('start_date') || {}),
      [Op.gte]: new Date(filters.dateFromStart),
    };
  }
  if (filters.dateToStart) {
    rentWhere.start_date = {
      ...(rentWhere.get('start_date') || {}),
      [Op.lte]: new Date(filters.dateToStart),
    };
  }

  const rentReturnWhere: WhereOptions = {};
  if (filters.penaltyStatus) {
    rentReturnWhere.penalty_status = filters.penaltyStatus;
  }
  if (filters.dateFromReturn) {
    rentReturnWhere.return_date = {
      ...(rentReturnWhere.get('return_date') || {}),
      [Op.gte]: new Date(filters.dateFromReturn),
    };
  }
  if (filters.dateToReturn) {
    rentReturnWhere.return_date = {
      ...(rentReturnWhere.get('return_date') || {}),
      [Op.lte]: new Date(filters.dateToReturn),
    };
  }

  const hasRentReturnFilter = Object.keys(rentReturnWhere).length > 0;

  const result = await RentModel.findAndCountAll({
    include: [
      {
        model: RentReturnModel,
        required: hasRentReturnFilter,
        where: hasRentReturnFilter ? rentReturnWhere : undefined,
      },
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_id',
          'user_uuid',
          'nickname',
          'introduction',
          'grade',
          'level',
          'email',
          'profile_path',
          'deleted_at',
        ],
        paranoid: false,
      },
      {
        model: EquipmentModel,
        required: true,
        attributes: ['id', 'name', 'nickname'],
        paranoid: false,
      },
    ],
    where: rentWhere,
    // 실제 반납 시각이 최근인 기록부터 보여준다.
    order: [
      [{ model: RentReturnModel, as: 'rentReturn' }, 'return_date', 'DESC'],
      ['start_date', 'DESC'],
    ],
    attributes: ['id', 'start_date', 'end_date'],
    limit: rowNum,
    offset: offset,
  });

  return {
    count: result.count,
    rows: result.rows.map((row) => {
      const record = row.get({ plain: true }) as PlainRentRecord;
      const rentReturn = record.rentReturn;
      if (!rentReturn?.return_date || !record.end_date) return record;

      // 각 장비는 독립된 대여 건이므로 행마다 연체일과 미납액을 계산한다.
      const lateDays = calculateLateDays(
        record.end_date,
        rentReturn.return_date,
      );
      return {
        ...record,
        rentReturn: {
          ...rentReturn,
          late_days: lateDays,
          late_fee: calculateOutstandingLateFee(
            lateDays,
            rentReturn.penalty_status,
          ),
        },
      };
    }),
  };
}

export async function retrievePenaltyUsers() {
  // 정상 반납자는 제외하고 연체 이력이 있는 사용자만 선택 목록에 제공한다.
  const records = await RentModel.findAll({
    include: [
      {
        model: RentReturnModel,
        required: true,
        where: {
          penalty_status: {
            [Op.in]: [
              PenaltyStatusEnum.NEED_PAYMENT,
              PenaltyStatusEnum.RECEIVED_PAYMENT,
            ],
          },
        },
        attributes: [],
      },
      {
        model: UserModel,
        required: true,
        attributes: ['user_id', 'nickname'],
        paranoid: false,
      },
    ],
    where: { returned: true },
    attributes: ['user_id'],
    order: [[{ model: UserModel, as: 'user' }, 'nickname', 'ASC']],
  });

  const users = new Map<number, { user_id: number; nickname: string }>();
  // 한 사용자의 연체 기록이 여러 건이어도 선택 목록에는 한 번만 노출한다.
  records.forEach((row) => {
    const record = row.get({ plain: true }) as PlainRentRecord;
    if (record.user) users.set(record.user.user_id, record.user);
  });
  return Array.from(users.values());
}

export async function updatePenaltyStatus(
  rentId: number,
  penaltyStatus: PenaltyStatusEnum,
) {
  const rentReturn = await RentReturnModel.findOne({
    where: { rent_id: rentId },
  });
  if (!rentReturn) {
    throw new Error('RentReturn record not found');
  }
  const current = rentReturn.get('penalty_status') as PenaltyStatusEnum;
  const allowed = [
    PenaltyStatusEnum.NEED_PAYMENT,
    PenaltyStatusEnum.RECEIVED_PAYMENT,
  ];
  if (!allowed.includes(current) || !allowed.includes(penaltyStatus)) {
    throw new Error(
      'Transition only allowed between NEEDPAYMENT and RECEIVEDPAYMENT',
    );
  }
  if (current === penaltyStatus) {
    throw new Error('Already in the requested status');
  }
  await rentReturn.update({ penalty_status: penaltyStatus });
  return rentReturn;
}

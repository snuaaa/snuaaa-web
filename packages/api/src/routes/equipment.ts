import express from 'express';
import {
  rentEquipment,
  retrieveAllRentRecords,
  retrieveRentedEquipmentListByUserId,
  retrieveRentListByEquipmentId,
  returnEquipment,
  updatePenaltyStatus,
} from '../controllers/rent.controller';
import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';
import PenaltyStatusEnum from '../enums/penaltyStatusEnum';
import { AuthorizationError, BadRequestError } from '../errors';

const router = express.Router();
const EQUIP_RENT_GRADE = 7;
const EQUIP_ADMIN_GRADE = 6;

router.post(
  '/rent',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_RENT_GRADE) {
      return next(new AuthorizationError('PERMISSION DENIED'));
    }
    const { equipmentIds } = req.body;
    if (!Array.isArray(equipmentIds)) {
      return next(new BadRequestError('equipmentIds must be an array'));
    }
    const results = await Promise.allSettled(
      equipmentIds.map((equipmentId: number) =>
        rentEquipment(equipmentId, decodedToken._id),
      ),
    );
    const successEquipmentIds = results
      .filter(
        (result): result is PromiseFulfilledResult<number> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);
    res.json({
      successEquipmentIds,
      failedEquipmentIds: equipmentIds.filter(
        (id: number) => !successEquipmentIds.includes(id),
      ),
    });
  },
);

router.post(
  '/rent/:rentId/return',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_RENT_GRADE) {
      return next(new AuthorizationError('PERMISSION DENIED'));
    }
    const { rentId } = req.params;
    const { photo_path } = req.body;
    try {
      const result = await returnEquipment(
        decodedToken._id,
        parseInt(rentId),
        photo_path,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/rent/me',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;
    try {
      const equipmentList = await retrieveRentedEquipmentListByUserId(
        decodedToken._id,
      );
      res.json(equipmentList);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/rent/records',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return next(new AuthorizationError('PERMISSION DENIED'));
    }
    const ROWNUM = 10;
    let offset = 0;
    const { query } = req;
    if (Number(query.page) > 0) {
      offset = ROWNUM * (Number(query.page) - 1);
    }
    const dateFields: { key: string; value: string | undefined }[] = [
      {
        key: 'date_from_start',
        value: query.date_from_start as string | undefined,
      },
      {
        key: 'date_to_start',
        value: query.date_to_start as string | undefined,
      },
      {
        key: 'date_from_return',
        value: query.date_from_return as string | undefined,
      },
      {
        key: 'date_to_return',
        value: query.date_to_return as string | undefined,
      },
    ];
    for (const { key, value } of dateFields) {
      if (value !== undefined) {
        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) {
          return next(new BadRequestError(`INVALID DATE FORMAT: ${key}`));
        }
      }
    }
    const filters = {
      penaltyStatus: query.penalty_status as string | undefined,
      dateFromStart: query.date_from_start as string | undefined,
      dateToStart: query.date_to_start as string | undefined,
      dateFromReturn: query.date_from_return as string | undefined,
      dateToReturn: query.date_to_return as string | undefined,
    };
    try {
      const result = await retrieveAllRentRecords(filters, ROWNUM, offset);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/rent/:rentId/penalty',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return next(new AuthorizationError('PERMISSION DENIED'));
    }
    const { rentId } = req.params;
    const { penalty_status } = req.body;
    const parsedRentId = parseInt(rentId, 10);
    if (isNaN(parsedRentId)) {
      return next(new BadRequestError('INVALID RENT ID'));
    }
    const allowedStatuses = [
      PenaltyStatusEnum.NEED_PAYMENT,
      PenaltyStatusEnum.RECEIVED_PAYMENT,
    ];
    if (!penalty_status || !allowedStatuses.includes(penalty_status)) {
      return next(new BadRequestError('INVALID PENALTY STATUS'));
    }
    try {
      const result = await updatePenaltyStatus(parsedRentId, penalty_status);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id/rents',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return next(new AuthorizationError('PERMISSION DENIED'));
    }
    const { id } = req.params;
    const ROWNUM = 10;
    let offset = 0;
    const { query } = req;
    if (Number(query.page) > 0) {
      offset = ROWNUM * (Number(query.page) - 1);
    }
    try {
      const rentList = await retrieveRentListByEquipmentId(
        parseInt(id),
        ROWNUM,
        offset,
      );
      res.json(rentList);
    } catch (err) {
      next(err);
    }
  },
);

export default router;

import express from 'express';
import {
  createEquipment,
  createEquipmentCategory,
  deleteEquipmentCategory,
  retrieveEquipmentsByCategory,
  retrieveEquipmentById,
  retrieveEquipmentCategoryList,
  retrieveEquipmentList,
  searchEquipmentList,
  updateEquipment,
  updateEquipmentCategory,
} from '../controllers/equipment.controller';
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

const router = express.Router();
const EQUIP_RENT_GRADE = 7;
const EQUIP_ADMIN_GRADE = 6;

interface EquipmentRow {
  get: (opts: { plain: boolean }) => Record<string, unknown>;
}

function mapEquipmentRows(rows: EquipmentRow[]) {
  return rows.map((row) => {
    const { rents, ..._row } = row.get({ plain: true });
    const rentArray = rents as Array<Record<string, unknown>> | undefined;
    return {
      ..._row,
      renter: rentArray?.[0]?.user ?? undefined,
      start_date: rentArray?.[0]?.start_date ?? undefined,
      end_date: rentArray?.[0]?.end_date ?? undefined,
    };
  });
}

router.get('/', verifyTokenMiddleware, async (req, res) => {
  try {
    const { rows, count } = await retrieveEquipmentList();
    res.json({ equipCount: count, equipInfo: mapEquipmentRows(rows) });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: 'RETRIEVE EQUIPMENT FAIL', code: 1 });
  }
});

router.get('/category', verifyTokenMiddleware, async (req, res) => {
  const categoryList = await retrieveEquipmentCategoryList();
  res.json(categoryList);
});

router.get('/search', verifyTokenMiddleware, async (req, res) => {
  const { category_id, status, keyword } = req.query;
  try {
    const { rows, count } = await searchEquipmentList(
      category_id,
      status,
      keyword,
    );
    res.json({ equipCount: count, equipInfo: mapEquipmentRows(rows) });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: 'SEARCH EQUIPMENT FAIL', code: 1 });
  }
});

router.post(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const {
      category_id,
      name,
      nickname,
      description,
      location,
      maker,
      status,
      img_path,
    } = req.body;
    try {
      const equipment = await createEquipment({
        category_id,
        name,
        nickname,
        description,
        location,
        maker,
        status,
        img_path,
      });
      res.json(equipment);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, error: 'CREATE EQUIPMENT FAIL', code: 1 });
    }
  },
);

router.patch(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const {
      id,
      category_id,
      name,
      nickname,
      description,
      location,
      maker,
      status,
      img_path,
    } = req.body;
    try {
      const equipment = await retrieveEquipmentById(id);
      if (!equipment) {
        return res
          .status(404)
          .json({ success: false, error: 'EQUIPMENT NOT FOUND' });
      }
      const updatedEquipment = await updateEquipment(id, {
        category_id,
        name,
        nickname,
        description,
        location,
        maker,
        status,
        img_path,
      });
      return res.json(updatedEquipment);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, error: 'UPDATE EQUIPMENT FAIL', code: 1 });
    }
  },
);

router.delete(
  '/:id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const { id } = req.params;
    try {
      const equipment = await retrieveEquipmentById(Number(id));
      if (!equipment) {
        return res
          .status(404)
          .json({ success: false, error: 'EQUIPMENT NOT FOUND' });
      }
      await equipment.destroy();
      res.json({ success: true, id });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, error: 'DELETE EQUIPMENT FAIL', code: 1 });
    }
  },
);

// TODO: check if the user has permission
router.post(
  '/category',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const { name } = req.body;
    const category = await createEquipmentCategory({ name });
    res.json(category);
  },
);

router.patch(
  '/category',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const { id, name } = req.body;
    const category = await updateEquipmentCategory(id, { name });
    res.json(category);
  },
);

router.delete(
  '/category/:categoryId',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const { categoryId } = req.params;
    const equipment = await retrieveEquipmentsByCategory(Number(categoryId));
    if (equipment.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: 'EQUIPMENT EXISTS IN CATEGORY' });
    }
    try {
      await deleteEquipmentCategory(Number(categoryId));
      res.json({ success: true, id: Number(categoryId) });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'DELETE EQUIPMENT CATEGORY FAIL',
        code: 1,
      });
    }
  },
);

router.post(
  '/rent',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_RENT_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const { equipmentIds } = req.body;
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
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_RENT_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
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
      console.error(err);
      res
        .status(500)
        .json({ success: false, error: 'RETURN EQUIPMENT FAIL', code: 1 });
    }
  },
);

router.get(
  '/rent/me',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    const equipmentList = await retrieveRentedEquipmentListByUserId(
      decodedToken._id,
    );
    res.json(equipmentList);
  },
);

router.get(
  '/rent/records',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
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
          return res.status(400).json({
            success: false,
            error: `INVALID DATE FORMAT: ${key}`,
            code: 1,
          });
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
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'RETRIEVE ALL RENT RECORDS FAIL',
        code: 1,
      });
    }
  },
);

router.patch(
  '/rent/:rentId/penalty',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
    }
    const { rentId } = req.params;
    const { penalty_status } = req.body;
    const parsedRentId = parseInt(rentId, 10);
    if (isNaN(parsedRentId)) {
      return res
        .status(400)
        .json({ success: false, error: 'INVALID RENT ID', code: 1 });
    }
    const allowedStatuses = [
      PenaltyStatusEnum.NEED_PAYMENT,
      PenaltyStatusEnum.RECEIVED_PAYMENT,
    ];
    if (!penalty_status || !allowedStatuses.includes(penalty_status)) {
      return res
        .status(400)
        .json({ success: false, error: 'INVALID PENALTY STATUS', code: 1 });
    }
    try {
      const result = await updatePenaltyStatus(parsedRentId, penalty_status);
      res.json(result);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : 'UPDATE PENALTY STATUS FAIL';
      res.status(400).json({ success: false, error: message, code: 1 });
    }
  },
);

router.get(
  '/:id/rents',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    if (decodedToken.grade > EQUIP_ADMIN_GRADE) {
      return res
        .status(403)
        .json({ success: false, error: 'PERMISSION DENIED', code: 1 });
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
      console.error(err);
      res
        .status(500)
        .json({ success: false, error: 'RETRIEVE RENT LIST FAIL', code: 1 });
    }
  },
);

export default router;

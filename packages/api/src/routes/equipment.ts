import express from 'express';
import { createEquipment, createEquipmentCategory, deleteEquipmentCategory, retrieveEquipmentsByCategory, retrieveEquipmentById, retrieveEquipmentCategoryList, retrieveEquipmentList, searchEquipmentList, updateEquipment, updateEquipmentCategory } from '../controllers/equipment.controller';
import { rentEquipment, retrieveRentedEquipmentListByUserId, retrieveRentListByEquipmentId, returnEquipment } from '../controllers/rent.controller';
import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';

const router = express.Router();

const EQUIP_RENT_GRADE = 7;
const EQUIP_ADMIN_GRADE = 6;

router.get('/', verifyTokenMiddleware, async (req, res) => {
  const ROWNUM = 10;
  let offset = 0;
  const query = (req as any).query;
  if (query.page > 0) {
    offset = ROWNUM * (query.page - 1);
  }
  retrieveEquipmentList(ROWNUM, offset).then(({ rows, count }) => {
    res.json({
      equipCount: count,
      equipInfo: rows.map((row: any) => {
        const { rents, ..._row } = row.get({ plain: true });
        // rents must have length <= 1
        return {
          ..._row,
          renter: rents?.[0]?.user ?? undefined,
          start_date: rents?.[0]?.start_date ?? undefined,
          end_date: rents?.[0]?.end_date ?? undefined,
        }
      })
    })
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'RETRIEVE EQUIPMENT FAIL',
      code: 1
    })
  });
})

router.get('/category', verifyTokenMiddleware, async (req, res) => {
  const categoryList = await retrieveEquipmentCategoryList();
  res.json(categoryList);
});

router.get('/search', verifyTokenMiddleware, async (req, res) => {
  const ROWNUM = 10;
  let offset = 0;
  const query = (req as any).query;
  if (query.page > 0) {
    offset = ROWNUM * (query.page - 1);
  }
  const { category_id, status, keyword } = req.query;
  searchEquipmentList(category_id, status, keyword, ROWNUM, offset).then(({ rows, count }) => {
    res.json({
      equipCount: count,
      equipInfo: rows.map((row: any) => {
        const { rents, ..._row } = row.get({ plain: true });
        return {
          ..._row,
          renter: rents?.[0]?.user ?? undefined,
          start_date: rents?.[0]?.start_date ?? undefined,
          end_date: rents?.[0]?.end_date ?? undefined,
        }
      })
    })
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'SEARCH EQUIPMENT FAIL',
      code: 1
    })
  });
})

router.post('/', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_ADMIN_GRADE) {
    res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
    return;
  }
  
  const { category_id, name, nickname, description, location, maker, status, img_path } = req.body;
  try{
    const equipment = await createEquipment({ category_id, name, nickname, description, location, maker, status, img_path });
    res.json(equipment);
  }
  catch(err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'CREATE EQUIPMENT FAIL',
      code: 1
    })
  }
})

router.patch('/', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_ADMIN_GRADE) {
    res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
    return;
  }
 
  const { id, category_id, name, nickname, description, location, maker, status, img_path } = req.body;
  try {
    const equipment = await retrieveEquipmentById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'EQUIPMENT NOT FOUND',
      })
    }
    const updatedEquipment =  await updateEquipment(id, { category_id, name, nickname, description, location, maker, status, img_path });
    return res.json(updatedEquipment)
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'UPDATE EQUIPMENT FAIL',
      code: 1
    })
  }
})

router.delete('/:id', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_ADMIN_GRADE) {
    return res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
  }
  
  const { id } = req.params;
  try {
    const equipment = await retrieveEquipmentById(Number(id));
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'EQUIPMENT NOT FOUND',
      })
    }

    await equipment.destroy();
    res.json({
      success: true,
      id: id
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'DELETE EQUIPMENT FAIL',
      code: 1
    })
  }
})

// TODO: check if the user has permission
router.post('/category', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_ADMIN_GRADE) {
    res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
    return;
  }
 
  const { name } = req.body;
  const category = await createEquipmentCategory({ name });
  res.json(category);
});

router.patch('/category', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_ADMIN_GRADE) {
    res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
    return;
  }
 
  const { id, name } = req.body;
  updateEquipmentCategory(id, { name }).then((category) => {
    res.json(category)
  });
});

router.delete('/category/:categoryId', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_ADMIN_GRADE) {
    return res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
  }
 
  const { categoryId } = req.params;

  const equipment = await retrieveEquipmentsByCategory(Number(categoryId));

  if (equipment.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'EQUIPMENT EXISTS IN CATEGORY',
    })
  }

  try {
    await deleteEquipmentCategory(Number(categoryId));
    res.json({
      success: true,
      id: Number(categoryId)
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'DELETE EQUIPMENT CATEGORY FAIL',
      code: 1
    })
  }
})


router.post('/rent', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_RENT_GRADE) {
    res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
    return;
  }
 
  const { equipmentIds } = req.body;

  Promise.allSettled(equipmentIds.map((equipmentId: number) =>  rentEquipment(equipmentId, decodedToken._id))).then((results) => {
    const successEquipmentIds = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled').map((result) => result.value)
    res.json({ successEquipmentIds, failedEquipmentIds: equipmentIds.filter((id) => !successEquipmentIds.includes(id)) });
  })
})

router.post('/rent/:rentId/return', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_RENT_GRADE) {
    res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
    return;
  }
 
  const { rentId } = req.params;
  const { photo_path } = req.body;
  returnEquipment(decodedToken._id, parseInt(rentId), photo_path)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        success: false,
        error: 'RETURN EQUIPMENT FAIL',
        code: 1
      })
    });
})

  
router.get('/rent/me', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  const equipmentList = await retrieveRentedEquipmentListByUserId(decodedToken._id);
  res.json(equipmentList);
})

router.get('/:id/rents', verifyTokenMiddleware, async (req, res) => {
  const { decodedToken } = req as AuthenticatedRequest;

  if(decodedToken.grade > EQUIP_ADMIN_GRADE) {
    res.status(403).json({
      success: false,
      error: 'PERMISSION DENIED',
      code: 1
    })
    return;
  }
 
  const { id } = req.params;
  const ROWNUM = 10;
  let offset = 0;
  const query = (req as any).query;
  if (query.page > 0) {
    offset = ROWNUM * (query.page - 1);
  }
  retrieveRentListByEquipmentId(parseInt(id), ROWNUM, offset).then((rentList) => {
    res.json(rentList);
  }).catch((err) => {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'RETRIEVE RENT LIST FAIL',
      code: 1
    })
  });
});

export default router;

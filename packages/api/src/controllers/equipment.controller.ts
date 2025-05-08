import { CreationAttributes, Op, Sequelize } from "sequelize";
import { EquipmentModel, EquipmentCategoryModel, RentModel, RentReturnModel, UserModel } from "../models/index";
import EquipmentStatusEnum from "../enums/equipmentStatusEnum";
import EquipmentRentEnum from "../enums/equipmentRentEnum";

export async function retrieveEquipmentById(equipmentId: number) {
  return EquipmentModel.findOne({
    where: {
      id: equipmentId
    }
  })
}

export async function retrieveEquipmentsByCategory(categoryId: number) {
  return EquipmentModel.findAll({
    where: {
      category_id: categoryId
    }
  })
}


export async function retrieveEquipmentList(rowNum, offset) {
  return EquipmentModel.findAndCountAll({
    include: [{
      model: RentModel,
      attributes: ['user_id', 'start_date', 'end_date'],
      required: false,
      include: [{
        model: RentReturnModel,
        attributes: [],
        required: false, // LEFT OUTER JOIN
      },
      {
        model: UserModel,
        attributes: ['nickname'],
        paranoid: false,
      }],
      where: {
        returned: false,
      },
      separate: true,
      limit: 1,
    }],
    order: [
      ['category_id', 'ASC'],
      ['id', 'ASC']
    ],
    //limit: rowNum,
    //offset: offset
  });
}

export async function searchEquipmentList(category_id, status, keyword, rowNum, offset) {
  let equipmentCondition:any = {};
  category_id && (equipmentCondition.category_id = category_id);
  status && (equipmentCondition.status = status);
  keyword && keyword != '' && (equipmentCondition.name = {
    [Op.like]: `%${keyword}%`
  });

  return EquipmentModel.findAndCountAll({
    include: [{
      model: RentModel,
      attributes: ['user_id', 'start_date', 'end_date'],
      required: false,
      include: [{
        model: RentReturnModel,
        attributes: [],
        required: false, // LEFT OUTER JOIN
      },
      {
        model: UserModel,
        attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
        paranoid: false,
      }],
      where: {
        returned: false,
      },
      separate: true,
      limit: 1,
    }],
    where: equipmentCondition,
    //limit: rowNum,
    //offset: offset
  })
}

export async function retrieveEquipmentCategoryList() {
  return EquipmentCategoryModel.findAll({
    attributes: ['id', 'name']
  })
}

export async function createEquipment(data: CreationAttributes<EquipmentModel>) {
  if(data.status !== EquipmentStatusEnum.OK) data.rent_status = EquipmentRentEnum.UNRENTABLE;
  return EquipmentModel.create(data)
}

export async function updateEquipment(equipmentId: number, data: CreationAttributes<EquipmentModel>) {
  // if status is not OK, rent_status must be UNRENTABLE
  if(data.status !== EquipmentStatusEnum.OK) data.rent_status = EquipmentRentEnum.UNRENTABLE;
  // if status is OK and there is no rent record, rent_status must be RENTABLE
  if (data.status === EquipmentStatusEnum.OK){
    if(await RentModel.findOne({
      where: {
        equipment_id: equipmentId,
        returned: false,
      },
    }) === null)
      data.rent_status = EquipmentRentEnum.RENTABLE;
    else data.rent_status = EquipmentRentEnum.RENTED;
  }

  return EquipmentModel.update(data, {
    where: {
      id: equipmentId
    }
  })
}

export async function deleteEquipment(id: number) {
  return EquipmentModel.destroy({
    where: {
      id: id
    }
  })
}

export async function createEquipmentCategory(data: CreationAttributes<EquipmentCategoryModel>) {
  return EquipmentCategoryModel.create(data)
}

export async function updateEquipmentCategory(categoryId: number, data: CreationAttributes<EquipmentCategoryModel>) {
  return EquipmentCategoryModel.update(data, {
    where: {
      id: categoryId
    }
  })
}

export async function deleteEquipmentCategory(categoryId: number) {
  return EquipmentCategoryModel.destroy({
    where: {
      id: categoryId
    }
  })
}
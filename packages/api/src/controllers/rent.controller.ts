import { Op } from "sequelize";
import EquipmentRentEnum from "../enums/equipmentRentEnum";
import { EquipmentModel, RentReturnModel, UserModel } from "../models";
import RentModel from "../models/Rent";
import PenaltyStatusEnum from "../enums/penaltyStatusEnum";

export async function rentEquipment(equipmentId: number, userId: number) {
  const equipment = (await EquipmentModel.findOne({where: {id: equipmentId}}));
  if(!equipment){
    throw new Error("Equipment not found")
  }
  if([EquipmentRentEnum.RENTED, EquipmentRentEnum.UNRENTABLE].includes((equipment as any).rent_status)) {
    throw new Error("Equipment not rentable")
  }
  await RentModel.create({
    equipment_id: equipmentId,
    user_id: userId, 
    start_date: new Date(),
    // set end_date to 2 days later
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  })
  // change equipment status to rented
  await EquipmentModel.update({rent_status: EquipmentRentEnum.RENTED}, {
    where: {id: equipmentId}
  })
  return equipmentId;
}

export async function returnEquipment(userId: number, rentId: number, photo_path: string) {
  const rent = await RentModel.findOne({
    where: {
      id: rentId
    }
  })
  if(!rent) {
    throw new Error("Rent not found")
  }
  if((rent as any).user_id !== userId) {
    throw new Error("User mismatch: not the renter")
  }
  if((rent as any).returned) {
    throw new Error("Already returned")
  }
  rent.update({returned: true})
  const penalty_status = (rent as any).end_date < new Date() ? 
    PenaltyStatusEnum.NEED_PAYMENT : PenaltyStatusEnum.NO_PENALTY;
  await RentReturnModel.create({
    rent_id: rentId,
    photo_path: photo_path,
    return_date: new Date(),
    penalty_status: penalty_status,
  })
  await EquipmentModel.update({rent_status: EquipmentRentEnum.RENTABLE}, {
    where: {id: (rent as any).equipment_id, rent_status: EquipmentRentEnum.RENTED}
  })
  return {
    result: "success",
    id: rentId
  }
} 

export async function retrieveRentedEquipmentListByUserId(userId: number) {
  return RentModel.findAll({
    include: [{
      model: EquipmentModel,
      required: true, // ignore deleted equipment
    }
    ],
    where: {
      user_id: userId,
      returned: false,
    },
    attributes: ['id', 'start_date', 'end_date'],
  })
}

export async function retrieveRentListByEquipmentId(equipmentId: number, rowNum: number, offset: number) {
  return RentModel.findAndCountAll({
    include: [{
      model: RentReturnModel,
      required: false,
    }, 
    {
      model: UserModel,
      required: true,
      attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'grade', 'level', 'email', 'profile_path', 'deleted_at'],
      paranoid: false,
    }],
    where: {
      equipment_id: equipmentId,
    },
    order: [['start_date', 'DESC']],
    attributes: ['id', 'start_date', 'end_date'],
    limit: rowNum,
    offset: offset,
  })
}
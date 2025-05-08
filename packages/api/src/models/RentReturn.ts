import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';
import PenaltyStatusEnum from '../enums/penaltyStatusEnum';

export default class RentReturnModel extends Model {

}


RentReturnModel.init({
  rent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  photo_path: {
    type: DataTypes.STRING(256),
  },
  return_date: {
    type: DataTypes.DATE,
  },
  penalty_status: {
    type: DataTypes.STRING(16),
  }
}, {
    sequelize,
    modelName: 'rentReturn',
    tableName: 'tb_rent_return',
    timestamps: false,
    underscored: true
});

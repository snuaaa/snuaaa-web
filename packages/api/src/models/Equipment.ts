import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';
import EquipmentRentEnum from '../enums/equipmentRentEnum';

export default class EquipmentModel extends Model {

}


EquipmentModel.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
  },
  name: {
    type: DataTypes.STRING(256),
  },
  nickname: {
    type: DataTypes.STRING(256),
  },
  description: {
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.STRING(64),
  },
  maker: {
    type: DataTypes.STRING(64),
  },
  status: {
    type: DataTypes.STRING(16),
  },
  rent_status: {
    type: DataTypes.STRING(16),
    defaultValue: EquipmentRentEnum.RENTABLE
  },
  img_path: {
    type: DataTypes.STRING(256)
  },
}, {
    sequelize,
    modelName: 'equipment',
    tableName: 'tb_equipment',
    timestamps: true,
    paranoid: true,
    underscored: true
});



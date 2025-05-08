import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class EquipmentCategoryModel extends Model {

}


EquipmentCategoryModel.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(256),
  },
}, {
    sequelize,
    modelName: 'equipmentCategory',
    tableName: 'tb_equipment_category',
    timestamps: true,
    paranoid: true,
    underscored: true
});

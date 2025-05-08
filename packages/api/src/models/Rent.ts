import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class RentModel extends Model {

}


RentModel.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
  },
  returned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
    sequelize,
    modelName: 'rent',
    tableName: 'tb_rent',
    timestamps: false,
    underscored: true
});

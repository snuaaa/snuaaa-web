import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class BoardModel extends Model {
  declare board_id: string;
  declare board_name: string;
  declare board_type: string;
  declare board_desc: string;
  declare menu: number;
  declare order: number;
  declare lv_read: number;
  declare lv_write: number;
  declare lv_edit: number;
}

BoardModel.init(
  {
    board_id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      primaryKey: true,
    },
    board_name: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    board_type: {
      type: DataTypes.STRING(16),
    },
    board_desc: {
      type: DataTypes.TEXT,
    },
    menu: {
      type: DataTypes.INTEGER,
    },
    order: {
      type: DataTypes.INTEGER,
    },
    lv_read: {
      type: DataTypes.INTEGER,
    },
    lv_write: {
      type: DataTypes.INTEGER,
    },
    lv_edit: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: 'board',
    tableName: 'tb_board',
    timestamps: false,
    underscored: true,
  },
);

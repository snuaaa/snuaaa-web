import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class DocumentModel extends Model {}

DocumentModel.init(
  {
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    generation: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: 'document',
    tableName: 'tb_document',
    timestamps: false,
    underscored: true,
  },
);

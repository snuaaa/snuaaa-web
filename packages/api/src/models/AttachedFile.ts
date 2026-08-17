import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class AttachedFileModel extends Model {}

AttachedFileModel.init(
  {
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(256),
    },
    /**
     * @deprecated Use file_url instead
     */
    file_path: {
      type: DataTypes.STRING(256),
      get() {
        const s3Url = this.getDataValue('file_url');
        return s3Url || this.getDataValue('file_path');
      },
    },
    file_url: {
      type: DataTypes.STRING(256),
    },
    file_type: {
      type: DataTypes.STRING(16),
    },
    download_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'attachedFile',
    tableName: 'tb_file',
    paranoid: true,
    underscored: true,
  },
);

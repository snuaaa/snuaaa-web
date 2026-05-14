import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class PhotoModel extends Model {
  declare content_id: number;
  declare img_url: string;
  declare thumbnail_url: string;
  declare location: string;
  declare camera: string;
  declare lens: string;
  declare exposure_time: string;
  declare focal_length: string;
  declare f_stop: string;
  declare iso: string;
  declare date: Date;
}

PhotoModel.init(
  {
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    // album_id: {
    //     type: DataTypes.INTEGER,
    // },
    /**
     * @deprecated Use img_url instead
     */
    file_path: {
      type: DataTypes.STRING(256),
    },
    /**
     * @deprecated Use thumbnail_url instead
     */
    thumbnail_path: {
      type: DataTypes.STRING(256),
    },
    img_url: {
      type: DataTypes.STRING(256),
    },
    thumbnail_url: {
      type: DataTypes.STRING(256),
    },
    location: {
      type: DataTypes.STRING(256),
    },
    camera: {
      type: DataTypes.STRING(256),
    },
    lens: {
      type: DataTypes.STRING(256),
    },
    exposure_time: {
      type: DataTypes.STRING(256),
    },
    focal_length: {
      type: DataTypes.STRING(32),
    },
    f_stop: {
      type: DataTypes.STRING(8),
    },
    iso: {
      type: DataTypes.STRING(8),
    },
    date: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'photo',
    tableName: 'tb_photo',
    timestamps: false,
    underscored: true,
  },
);

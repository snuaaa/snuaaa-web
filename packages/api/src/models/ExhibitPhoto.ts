import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class ExhibitPhotoModel extends Model {}

ExhibitPhotoModel.init(
  {
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    // exhibition_id: {
    //     type: DataTypes.INTEGER,
    // },
    order: {
      type: DataTypes.INTEGER,
    },
    photographer_id: {
      type: DataTypes.INTEGER,
    },
    photographer_alt: {
      type: DataTypes.STRING(32),
    },
    /**
     * @deprecated Use img_url instead
     */
    file_path: {
      type: DataTypes.STRING(256),
      get() {
        const s3Url = this.getDataValue('img_url');
        return s3Url || this.getDataValue('file_path');
      },
    },
    /**
     * @deprecated Use thumbnail_url instead
     */
    thumbnail_path: {
      type: DataTypes.STRING(256),
      get() {
        const s3Url = this.getDataValue('thumbnail_url');
        return s3Url || this.getDataValue('thumbnail_path');
      },
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
    modelName: 'exhibitPhoto',
    tableName: 'tb_exhibit_photo',
    timestamps: false,
    underscored: true,
  },
);

// ExhibitPhotoModel.belongsTo(UserModel, {
//     as: 'photographer',
//     foreignKey: 'photographer_id',
//     targetKey: 'user_id'
// })

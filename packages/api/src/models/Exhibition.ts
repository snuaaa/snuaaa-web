import { Model, DataTypes } from 'sequelize';
import { ContentModel } from '.';
import { sequelize } from './sequelize';

export default class ExhibitionModel extends Model {}

ExhibitionModel.init(
  {
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    exhibition_no: {
      type: DataTypes.INTEGER,
    },
    slogan: {
      type: DataTypes.STRING(64),
    },
    date_start: {
      type: DataTypes.DATE,
    },
    date_end: {
      type: DataTypes.DATE,
    },
    place: {
      type: DataTypes.STRING(64),
    },
    /**
     * @deprecated Use poster_url instead
     */
    poster_path: {
      type: DataTypes.STRING(256),
      get() {
        const s3Url = this.getDataValue('poster_url');
        return s3Url || this.getDataValue('poster_path');
      },
    },
    /**
     * @deprecated Use poster_thumbnail_url instead
     */
    poster_thumbnail_path: {
      type: DataTypes.STRING(256),
      get() {
        const s3Url = this.getDataValue('poster_thumbnail_url');
        return s3Url || this.getDataValue('poster_thumbnail_path');
      },
    },
    poster_url: {
      type: DataTypes.STRING(256),
    },
    poster_thumbnail_url: {
      type: DataTypes.STRING(256),
    },
  },
  {
    sequelize,
    modelName: 'exhibition',
    tableName: 'tb_exhibition',
    timestamps: false,
    underscored: true,
  },
);

ExhibitionModel.belongsTo(ContentModel, {
  foreignKey: 'content_id',
  targetKey: 'content_id',
});

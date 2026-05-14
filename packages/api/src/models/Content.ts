import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class ContentModel extends Model {
  declare content_id: number;
  declare content_uuid: string;
  declare author_id: number;
  declare board_id: string;
  declare category_id: string;
  declare type: string;
  declare parent_id: number;
  declare title: string;
  declare text: string;
  declare view_num: number;
  declare comment_num: number;
  declare like_num: number;
}

ContentModel.init(
  {
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    content_uuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    board_id: {
      type: DataTypes.STRING(16),
    },
    category_id: {
      type: DataTypes.STRING(16),
    },
    type: {
      type: DataTypes.STRING(16),
    },
    parent_id: {
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING(64),
    },
    text: {
      type: DataTypes.TEXT,
    },
    view_num: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    comment_num: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like_num: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'content',
    tableName: 'tb_content',
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
);

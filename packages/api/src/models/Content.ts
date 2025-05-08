import { Model, DataTypes } from 'sequelize';
import { AlbumModel, AttachedFileModel, BoardModel, CategoryModel, ContentTagModel, DocumentModel, ExhibitionModel, ExhibitPhotoModel, PhotoModel, PostModel, TagModel, UserModel } from '.';
import { sequelize } from './sequelize';

export default class ContentModel extends Model {

}


ContentModel.init({
    content_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    content_uuid: {
        type: DataTypes.UUID,
        allowNull: true
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false
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
        type: DataTypes.INTEGER
    },
    title: {
        type: DataTypes.STRING(64),
    },
    text: {
        type: DataTypes.TEXT,
    },
    view_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comment_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    like_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'content',
    tableName: 'tb_content',
    timestamps: true,
    paranoid: true,
    underscored: true
});

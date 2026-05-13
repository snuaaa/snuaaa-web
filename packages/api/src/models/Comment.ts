import { Model, DataTypes } from 'sequelize';
import { ContentModel, UserModel } from '.';
import { sequelize } from './sequelize';

export default class CommentModel extends Model {

}

CommentModel.init({
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    comment_uuid: {
        type: DataTypes.UUID,
        allowNull: true
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    parent_comment_id: {
        type: DataTypes.INTEGER,
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
    },
    like_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'comment',
    tableName: 'tb_comment',
    timestamps: true,
    paranoid: true,
    underscored: true
});

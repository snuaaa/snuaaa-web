import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class CommentLikeModel extends Model {

}

CommentLikeModel.init({
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    }
}, {
    sequelize,
    modelName: 'commentLike',
    tableName: 'tb_comment_like',
    timestamps: false,
    underscored: true
});

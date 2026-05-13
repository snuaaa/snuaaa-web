import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class ContentLikeModel extends Model {

}

ContentLikeModel.init({
    content_id: {
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
    modelName: 'contentLike',
    tableName: 'tb_content_like',
    timestamps: false,
    underscored: true
});

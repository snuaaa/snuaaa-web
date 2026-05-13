import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize';

export default class ContentTagModel extends Model {

}

ContentTagModel.init({
    content_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    tag_id: {
        type: DataTypes.STRING(16),
        allowNull: false,
        primaryKey: true,
    }
}, {
    sequelize,
    modelName: 'contentTag',
    tableName: 'tb_content_tag',
    timestamps: false,
    underscored: true
});

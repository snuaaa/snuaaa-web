import { Model, DataTypes } from 'sequelize';
import { BoardModel, ContentModel, ContentTagModel } from '.';
import { sequelize } from './sequelize';


export default class TagModel extends Model {

}

TagModel.init({
    tag_id: {
        type: DataTypes.STRING(16),
        allowNull: false,
        primaryKey: true
    },
    board_id: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    tag_name: {
        type: DataTypes.STRING(32)
    },
    tag_type: {
        type: DataTypes.STRING(8)
    }
}, {
    sequelize,
    modelName: 'tag',
    tableName: 'tb_tag',
    timestamps: false,
    underscored: true
});

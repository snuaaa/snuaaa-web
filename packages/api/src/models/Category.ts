import { Model, DataTypes } from 'sequelize';
import { BoardModel } from '.';
import { sequelize } from './sequelize';

export default class CategoryModel extends Model {

}

CategoryModel.init({
    category_id: {
        type: DataTypes.STRING(16),
        allowNull: false,
        primaryKey: true
    },
    board_id: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    category_name: {
        type: DataTypes.STRING(32)
    },
    category_color: {
        type: DataTypes.STRING(8)
    }
}, {
    sequelize,
    modelName: 'category',
    tableName: 'tb_category',
    timestamps: false,
    underscored: true
});

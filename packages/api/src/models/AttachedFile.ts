import { Model, DataTypes } from 'sequelize';
import { ContentModel } from '.';
import { sequelize } from './sequelize';

export default class AttachedFileModel extends Model {
}

AttachedFileModel.init({
    file_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    original_name: {
        type: DataTypes.STRING(256)
    },
    file_path: {
        type: DataTypes.STRING(256)
    },
    file_type: {
        type: DataTypes.STRING(16)
    },
    download_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'attachedFile',
    tableName: 'tb_file',
    paranoid: true,
    underscored: true
});

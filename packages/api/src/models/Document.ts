import { Model, DataTypes } from 'sequelize';
import { ContentModel } from '.';
import { sequelize } from './sequelize';

export default class DocumentModel extends Model {

}

DocumentModel.init({
    content_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    generation: {
        type: DataTypes.INTEGER,
    },
    file_path: {
        type: DataTypes.ARRAY(DataTypes.STRING(256)),
    },
}, {
    sequelize,
    modelName: 'document',
    tableName: 'tb_document',
    timestamps: false,
    underscored: true
});

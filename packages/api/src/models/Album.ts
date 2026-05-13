import { Model, DataTypes } from 'sequelize';
import { ContentModel } from '.';
import { sequelize } from './sequelize';

export default class AlbumModel extends Model {

}

AlbumModel.init({
    content_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    is_private: {
        type: DataTypes.BOOLEAN
    },
    tn_photo_id: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize,
    modelName: 'album',
    tableName: 'tb_album',
    timestamps: false,
    underscored: true
});


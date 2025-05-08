import { Model, DataTypes } from 'sequelize';
import { CommentModel, ContentModel, StatsLoginModel } from '.';
import { sequelize } from './sequelize';


export default class UserModel extends Model {

}

UserModel.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    user_uuid: {
        type: DataTypes.UUID,
        allowNull: true
    },
    id: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(64),
    },
    username: {
        type: DataTypes.STRING(16),
    },
    aaa_no: {
        type: DataTypes.STRING(16),
    },
    nickname: {
        type: DataTypes.STRING(16),
    },
    col_no: {
        type: DataTypes.STRING(8),
    },
    major: {
        type: DataTypes.STRING(32),
    },
    email: {
        type: DataTypes.STRING(64),
    },
    mobile: {
        type: DataTypes.STRING(16),
    },
    introduction: {
        type: DataTypes.TEXT,
    },
    profile_path: {
        type: DataTypes.STRING(256),
    },
    grade: {
        type: DataTypes.INTEGER,
    },
    level: {
        type: DataTypes.INTEGER,
    },
    login_at: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'user',
    tableName: 'tb_user',
    timestamps: true,
    paranoid: true,
    underscored: true
});

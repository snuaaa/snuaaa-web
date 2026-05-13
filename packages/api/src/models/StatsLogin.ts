import { Model, DataTypes } from 'sequelize';
import { UserModel } from '.';
import { sequelize } from './sequelize';


export default class StatsLoginModel extends Model {

}

StatsLoginModel.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    login_at: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true
    }
}, {
    sequelize,
    modelName: 'statsLogin',
    tableName: 'tb_stats_login',
    timestamps: false,
    underscored: true
});

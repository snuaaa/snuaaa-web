import { Sequelize } from 'sequelize';
require('dotenv').config();

const sequelize = (function () {

    const seq = new Sequelize(
        process.env.POSTGRESQL_DATABASE,
        process.env.POSTGRESQL_USERNAME,
        process.env.POSTGRESQL_PASSWORD,
        {
            host: process.env.DB_HOST ?? 'localhost',
            dialect: 'postgres',
            logging: false
        })


    seq.authenticate()
        .then(() => {
            console.log("Connected to PostgreSQL server")
            seq.sync()
        })
        .catch((e) => {
            console.log("Failed to connect to PostgreSQL server >> ", e)
        })

    return seq

})()

export { sequelize }

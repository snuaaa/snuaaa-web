import {
    UserModel,
} from '../models';
const uuid4 = require('uuid4');
import { Op } from 'sequelize';

export function createUser(userData) {

    return new Promise<void>((resolve, reject) => {

        UserModel.create({
            user_uuid: uuid4(),
            id: userData.id,
            password: userData.password,
            username: userData.username,
            nickname: userData.nickname,
            aaa_no: userData.aaa_no,
            col_no: userData.col_no,
            major: userData.major,
            email: userData.email,
            mobile: userData.mobile,
            introduction: userData.introduction,
            profile_path: userData.profile_path,
            grade: userData.grade,
            level: userData.level
        })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
    })
}

export function retrieveUser(user_id) {
    return new Promise((resolve, reject) => {
        if (!user_id) {
            reject('user_id can not be null');
        }

        UserModel.findOne({
            attributes: ['user_id', 'id', 'username', 'nickname', 'aaa_no',
                'col_no', 'major', 'email', 'mobile', 'introduction', 'grade', 'level', 'profile_path', 'login_at'],
            where: { user_id: user_id }
        })
            .then((user) => {
                if (!user) {
                    reject('id is not correct');
                }
                else {
                    resolve(user);
                }
            })
            .catch((err) => {
                reject(err);
            });
    })
}

export function retrieveUserPw(user_id) {
    return new Promise((resolve, reject) => {
        if (!user_id) {
            reject('user_id can not be null');
        }

        UserModel.findOne({
            attributes: ['password'],
            where: { user_id: user_id }
        })
            .then((user) => {
                if (!user) {
                    reject('id is not correct');
                }
                else {
                    resolve(user);
                }
            })
            .catch((err) => {
                reject(err);
            });
    })
}


export function retrieveUserByUserUuid(user_uuid) {
    return new Promise((resolve, reject) => {
        if (!user_uuid) {
            reject('user_uuid can not be null');
        }

        UserModel.findOne({
            attributes: ['user_id', 'id', 'username', 'nickname', 'aaa_no',
                'col_no', 'major', 'email', 'mobile', 'introduction', 'grade', 'level', 'profile_path'],
            where: { user_uuid: user_uuid }
        })
            .then((user) => {
                if (!user) {
                    reject('id is not correct');
                }
                else {
                    resolve(user);
                }
            })
            .catch((err) => {
                reject(err);
            });
    })
}

export function retrieveUsers(sort, order, rowNum, offset) {
    return new Promise((resolve, reject) => {

        let condition: any = {
            order: [
                [sort ? sort : 'user_id', order === 'ASC' ? 'ASC' : 'DESC']
            ],
            limit: rowNum,
            offset: offset
        }

        UserModel.findAndCountAll({
            attributes: [
                'user_uuid',
                'id',
                'username',
                'nickname',
                'aaa_no',
                'grade',
                'level',
                'login_at',
                'created_at'
            ],
            ...condition
        })
            .then((users) => {
                resolve(users);
            })
            .catch((err) => {
                reject(err);
            });
    })
}


export async function retrieveUsersByEmailAndName(email, username) {
    if (!email) {
        throw Error('email can not be null');
    }

    try {
        const users = await UserModel.findAll({
            attributes: ['id'],
            where: { email: email, username: username }
        });
        return users;
    } catch (err) {
        throw err;
    }    
}

export function retrieveUsersByName(username) {
    return new Promise((resolve, reject) => {
        UserModel.findAll({
            attributes: ['user_uuid', 'username', 'nickname', 'profile_path'],
            where: { username: { [Op.like]: `%${username}%` } },
            limit: 5
        })
            .then((users) => {
                resolve(users);
            })
            .catch((err) => {
                reject(err);
            });
    })
}

export function retrieveUserById(id) {
    return new Promise((resolve, reject) => {
        if (!id) {
            reject('id can not be null');
        }

        UserModel.findOne({
            attributes: ['user_id', 'user_uuid', 'id', 'password',
                'username', 'nickname', 'grade', 'level', 'email', 'profile_path', 'login_at'],
            where: { id: id }
        })
            .then((user) => {
                if (!user) {
                    reject('id is not correct');
                }
                else {
                    resolve(user);
                }
            })
            .catch((err) => {
                reject(err);
            });
    })
}


export function updateUser(user_id, data) {
    return new Promise<void>((resolve, reject) => {

        if (!user_id) {
            reject('user_id can not be null');
        }

        UserModel.update({
            username: data.username,
            nickname: data.nickname,
            aaa_no: data.aaa_no,
            col_no: data.col_no,
            major: data.major,
            email: data.email,
            mobile: data.mobile,
            introduction: data.introduction,
            grade: data.grade,
            level: data.level,
            profile_path: data.profile_path,
        }, {
            where: { user_id: user_id }
        })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err);
            })
    })
}


export function updateUserPw(user_id, password) {
    return new Promise<void>((resolve, reject) => {

        if (!user_id) {
            reject('user_id can not be null');
        }
        else if (!password) {
            reject('password can not be null');
        }
        else {
            UserModel.update({
                password: password
            }, {
                where: { user_id: user_id }
            })
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}


export function deleteUser(user_id) {
    return new Promise<void>((resolve, reject) => {
        if (!user_id) {
            reject('id can not be null')
        }

        UserModel.destroy(
            {
                where: {
                    user_id: user_id
                }
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            })
    })
}

export function updateLoginDate(user_id) {
    return new Promise<void>((resolve, reject) => {
        if (!user_id) {
            reject('id can not be null');
        }

        UserModel.update({
            login_at: new Date()
        }, {
            where: {
                user_id: user_id
            },
            silent: true
        }
        )
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
    })
}

export function checkDupId(id) {
    return new Promise<void>((resolve, reject) => {
        if (!id) {
            reject('id can not be null');
        }

        UserModel.findOne({
            where: { id: id }
        })
            .then((user) => {
                if (user) {
                    reject();
                }
                else {
                    resolve();
                }
            })
            .catch((err) => {
                reject(err);
            });
    })
}

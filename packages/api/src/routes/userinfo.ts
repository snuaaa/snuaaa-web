import express from 'express';
import multer from 'multer'
import bcrypt from 'bcryptjs';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { retrievePostsByUser, retrievePostsByUserUuid } from '../controllers/post.controller';
import { retrievePhotosByUser, retrievePhotosByUserUuid } from '../controllers/photo.controller';
import { retrieveCommentsByUser, retrieveCommentsByUserUuid } from '../controllers/comment.controller';
import { retrieveUser, updateUser, deleteUser, retrieveUserPw, updateUserPw, 
    retrieveUsers, retrieveUserById, retrieveUsersByEmailAndName, retrieveUserByUserUuid, retrieveUsersByName } from '../controllers/user.controller';

import { resize } from '../lib/resize';
import { sendMail } from '../lib/mail';

require('dotenv').config();

const router = express.Router();

const storage = multer.diskStorage({
    destination: './upload/profile',
    filename(req, file, cb) {
        let timestamp = (new Date).valueOf()
        cb(null, timestamp + "_" + file.originalname);
        // cb(new Error("Failed to make file name"), `${(new Date()).valueOf()}-${file.originalname}`);
    },
});

const upload = multer({ storage })


const cryptoRandomString = require('crypto-random-string');


router.get('/', verifyTokenMiddleware, (req, res) => {

    const decodedToken = (req as any).decodedToken;
    retrieveUser(decodedToken._id)
        .then((userInfo) => {
            return res.json({
                success: true,
                userInfo: userInfo
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
    // .catch(err => res.status(403).json({
    //     success: false,
    //     message: err.message
    // }));
})

router.patch('/', verifyTokenMiddleware, upload.single('profileImg'), (req, res) => {

    const decodedToken = (req as any).decodedToken;
    let user_id = decodedToken._id;

    retrieveUser(user_id)
        .then((userInfo: any) => {
            let data = req.body;
            if ((req as any).file) {
                data.profile_path = '/profile/' + (req as any).file.filename;;
                resize((req as any).file.path);
            }
            else {
                data.profile_path = userInfo.profile_path;
            }

            let nickname = '';

            if (req.body.aaa_no) {
                if ((/^[0-9]{2}[Aa]{3}-[0-9]{1,3}$/).test(req.body.aaa_no)) {
                    // 00AAA-000
                    nickname = req.body.aaa_no.substr(0, 2) + req.body.username;
                }
                else if ((/^[Aa]{3}[0-9]{2}-[0-9]{1,3}$/).test(req.body.aaa_no)) {
                    // AAA00-000
                    nickname = req.body.aaa_no.substr(3, 2) + req.body.username;
                }
                else {
                    nickname = data.username;
                    data.aaa_no = null;
                }
            }
            else {
                nickname = data.username;
                data.aaa_no = null;
            }

            let grade;

            if (userInfo.grade < 9) {
                grade = userInfo.grade;
            }
            else if (data.aaa_no) {
                grade = 8;
            }
            else {
                grade = 9;
            }

            let userData = {
                username: data.username,
                nickname: nickname,
                aaa_no: data.aaa_no,
                col_no: data.col_no,
                major: data.major,
                email: data.email,
                mobile: data.mobile,
                introduction: data.introduction,
                grade: grade,
                profile_path: data.profile_path
            }

            return updateUser(user_id, userData)
        })
        .then(() => {
            return res.json({ success: true })
        })
        .catch((err) => {
            console.error(err)
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})

router.patch('/password', verifyTokenMiddleware, (req, res, next) => {
    const decodedToken = (req as any).decodedToken;
    let user_id = decodedToken._id;
    let data = req.body;

    retrieveUserPw(user_id)
        .then((userInfo: any) => {
            return new Promise<void>((resolve, reject) => {
                if (!bcrypt.compareSync(data.password, userInfo.password)) {
                    const err = {
                        status: 403,
                        code: 1011
                    }
                    reject(err);
                }
                else if (!data.newPassword) {
                    const err = {
                        status: 403,
                        code: 1012
                    }
                    reject(err);
                }
                else if (data.newPassword !== data.newPasswordCf) {
                    const err = {
                        status: 403,
                        code: 1013
                    }
                    reject(err);
                }
                else if (data.newPassword.length < 8 || data.newPassword.length > 20) {
                    const err = {
                        status: 403,
                        code: 1014
                    }
                    reject(err);
                }
                else {
                    updateUserPw(user_id, bcrypt.hashSync(data.newPassword, 10))
                        .then(() => resolve())
                        .catch((err) => reject(err))
                }
            })
        })
        .then(() => {
            res.json({
                success: true
            })
        })
        .catch((err) => {
            console.error(err);
            if (err.status) {
                next(err);
            }
            else {
                const errCode = {
                    status: 500,
                    code: 1010
                }
                next(errCode);
            }
        })
})

router.delete('/', verifyTokenMiddleware, (req, res) => {

    const decodedToken = (req as any).decodedToken;
    try {
        deleteUser(decodedToken._id)
        .then(() => {
            return res.json({ success: true })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });

    }
    catch (err) {
        console.error(err)
        res.status(500).json({
            error: 'internal server error',
            code: 0
        });

    }
})


router.get('/all', verifyTokenMiddleware, (req, res) => {

    let offset = 0;
    const ROWNUM = 20;
    // const user_id = req.decodedToken._id;
    const decodedToken = (req as any).decodedToken;
    if(decodedToken.grade > 6) {
        return res.status(403).json({
            success: false
        })
    }
    else {
        try {
            retrieveUsers(req.query.sort, req.query.order,
                req.query.limit ? req.query.limit : ROWNUM,
                req.query.offset ? req.query.offset : 0)
                .then(({count, rows}) => {
                    return res.json({
                        success: true,
                        userInfo: rows,
                        count: count
                    })
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({
                        error: 'internal server error',
                        code: 0
                    });
                });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        }
    }
})


router.get('/posts', verifyTokenMiddleware, (req, res) => {

    const decodedToken = (req as any).decodedToken;
    const user_id = decodedToken._id;
    retrievePostsByUser(user_id)
        .then((info) => {
            return res.json({
                success: true,
                postList: info
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})

router.get('/photos', verifyTokenMiddleware, (req, res) => {

    const decodedToken = (req as any).decodedToken;
    const user_id = decodedToken._id;
    retrievePhotosByUser(user_id)
        .then((info) => {
            return res.json({
                success: true,
                photoList: info,
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})


router.get('/comments', verifyTokenMiddleware, (req, res) => {

    const decodedToken = (req as any).decodedToken;
    const user_id = decodedToken._id;

    retrieveCommentsByUser(user_id)
        .then((info) => {
            return res.json({
                success: true,
                commentList: info
            })
        })
        // .catch((err)=> console.error(err));
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})


router.get('/:user_uuid', verifyTokenMiddleware, (req, res) => {

    const user_uuid = req.params.user_uuid;
    retrieveUserByUserUuid(user_uuid)
        .then((userInfo) => {
            return res.json({
                success: true,
                userInfo: userInfo
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})

router.get('/:user_uuid/posts', verifyTokenMiddleware, (req, res) => {

    const user_uuid = req.params.user_uuid;
    retrievePostsByUserUuid(user_uuid)
        .then((info) => {
            return res.json({
                success: true,
                postList: info
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})

router.get('/:user_uuid/photos', verifyTokenMiddleware, (req, res) => {

    const user_uuid = req.params.user_uuid;
    retrievePhotosByUserUuid(user_uuid)
        .then((info) => {
            return res.json({
                success: true,
                photoList: info,
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})


router.get('/:user_uuid/comments', verifyTokenMiddleware, (req, res) => {

    const user_uuid = req.params.user_uuid;
    retrieveCommentsByUserUuid(user_uuid)
        .then((info) => {
            return res.json({
                success: true,
                commentList: info
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        });
})


router.get('/search/mini', verifyTokenMiddleware, (req, res) => {

    if(req.query.name) {
        retrieveUsersByName(req.query.name)
        .then((users) => {
            res.json({
                success: true,
                userList: users
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        })
    }
    else {
        res.status(402).json({
            error: 'name is required',
            code: 0
        });
    }
    
})


router.post('/find/id', (req, res) => {

    let data = req.body;
    retrieveUsersByEmailAndName(data.email, data.name)
    .then((users) => {
        if(users && users.length > 0) {            
            let text = '회원님의 ID는 ';
            users.map((user, i) => {
                const id = user.getDataValue('id');
                if(i === 0) {
                    text += id;
                }
                else {
                    text += `, ${id}`;
                }
            })
            text += '입니다.'

            const mailOptions = {
                to: data.email,
                subject: '[SNUAAA] 회원님의 ID를 알려드립니다.',
                text: text
            };

            sendMail(mailOptions)
                .then(() => {
                    res.json({
                        success: true
                    })
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send();
                })
        } else {
            res.status(404).json({
                code: 0
            });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({
            error: 'internal server error',
            code: 0
        });
    });
})


router.post('/find/pw', (req, res) => {

    const data = req.body;
    retrieveUserById(data.id)
    .then((user: any) => {
        if(user && user.email === data.email && user.username === data.name) {
            const resetPw = cryptoRandomString({length: 10});
            updateUserPw(user.user_id, bcrypt.hashSync(resetPw, 10))
            .then(() => {
                const text = `임시비밀번호는 ${resetPw}입니다.\n
                로그인 하신 후 원하시는 비밀번호로 변경해주세요.`;
                const mailOptions = {
                    to: data.email,
                    subject: '[SNUAAA] 회원님의 임시 비밀번호를 알려드립니다.',
                    text: text
                };

                sendMail(mailOptions)
                    .then(() => {
                        res.json({
                            success: true
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500);
                    })
            })
            .catch((err) => {
                console.error(err);
                res.status(500);
            })    
        } else {
            res.status(404).json({
                code: 0
            });
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({
            code: 0
        });
    })


})


export default router;

import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../lib/token';
const jwt = require('jsonwebtoken');

export type AuthenticatedRequest = Request & { decodedToken: JWTPayload };

export function verifyTokenMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        return res.status(403).json({
            success: false,
            message: 'Authorization does not exist.'
        });
    }

    const auth = req.headers.authorization.split(" ");

    if (auth[0] !== 'Bearer') {
        return res.status(403).json({
            success: false,
            message: 'Token Type Error.'
        });
    }

    const token = auth[1]
    
    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'Token does not exist.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).json({
                success: false,
                CODE: 102
            });
        };
        req.decodedToken = decoded;
        next();
    });
};

// TODO: Implement verification using cookies
export function authMiddleware(req, res, next) {
    // 토큰 취득
    const token = req.cookies.token

    // 토큰 미존재: 로그인하지 않은 사용자
    if (!token) {
        return res.status(403).json({
            success: false,
            CODE: 101
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).json({
                success: false,
                CODE: 102
            });
        }
        req.decodedToken = decoded;
        next();
    })
};


/* const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    // read the token from header or url 
    const token = req.headers['x-access-token'] || req.query.token

    // token does not exist
    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'not logged in'
        })
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(403).json({
            success: false,
            message: error.message
        })
    }

    // process the promise
    p.then((decoded)=>{
        req.decoded = decoded
        next()
    }).catch(onError)
}

module.exports = authMiddleware */





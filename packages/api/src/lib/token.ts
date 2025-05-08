const jwt = require('jsonwebtoken');

export type JWTPayload = {
    _id: number;
    grade: number;
    level: number;
    autoLogin: boolean;
}
// JWT 토큰 생성
export function createToken(payload: JWTPayload) {

    let expiresIn;
    if (payload.autoLogin) {
        expiresIn = '14d';
    }
    else {
        expiresIn = '1d';
    }

    const jwtOption = { expiresIn };

    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.JWT_SECRET, jwtOption, (error, token) => {
            if (error) reject(error);
            resolve(token);
        });
    });
};

// JWT 토큰 검증
// export function verifyTokenUseReq = req => {

//   const auth = req.headers.authorization.split(" ");
//   let token;

//   if(auth[0] === 'Bearer') {
//       token = auth[1]
//   }
//   else {
//     return res.status(403).json({
//       success: false,
//       message: 'Token Type Error.'
//     });
//   }

//   if (!token) {
//       return res.status(403).json({
//           success: false,
//           message: 'Token does not exist.'
//       });
//   }

//   return new Promise((resolve, reject) => {
//     jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
//       if (error) reject(error);
//       resolve(decoded);
//     });
//   });
// };


// router.get('/', (req, res) => {

//     // read the token from header or url 
//     const token = req.headers['x-access-token'] || req.query.token

//     // token does not exist
//     if(!token) {
//         return res.status(403).json({
//             success: false,
//             message: 'not logged in'
//         })
//     }

//     // create a promise that decodes the token
//     const p = new Promise(
//         (resolve, reject) => {
//             jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
//                 if(err) reject(err)
//                 resolve(decoded)
//             })
//         }
//     )

//     // if token is valid, it will respond with its info
//     const respond = (token) => {
//         res.json({
//             success: true,
//             info: token
//         })
//     }

//     // if it has failed to verify, it will return an error message
//     const onError = (error) => {
//         res.status(403).json({
//             success: false,
//             message: error.message
//         })
//     }

//     // process the promise
//     p.then(respond).catch(onError)

// })
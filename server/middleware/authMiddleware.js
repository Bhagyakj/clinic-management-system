import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey123';

export default function authMiddleware(req,res,next){
    const header = req.headers.authorization;
    const token=header?.split(' ')[1];
    if (!token) return res.status(401).json({message: "No token provided"});

    try{
        req.user=jwt.verify(token,JWT_SECRET);
        next();
    } catch {
        res.status(401).json({message:"Invalid token"});
    }
}
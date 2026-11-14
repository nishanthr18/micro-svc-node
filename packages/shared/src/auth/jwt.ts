import jwt from 'jsonwebtoken';
import { JwtPayload } from './types';

const extractJwtSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT Secret is missing")
    };

    return secret;
};

export const signToken = (payload: JwtPayload) => {
    const expiresIn = process.env.JWT_EXPIRES_IN;

    return jwt.sign(payload, extractJwtSecret(), {
        expiresIn: expiresIn as jwt.SignOptions['expiresIn']
    })
};

export const verifyToken = (token: string): JwtPayload => {
    const decodeToken = jwt.verify(token, extractJwtSecret());
    if (
        typeof decodeToken !== "object" || decodeToken == null ||
        (decodeToken.role !== "USER" && decodeToken.role !== "ADMIN")
    ) {
        throw new Error('Invalid payload')
    };

    return {
        userId: decodeToken.userId,
        role: decodeToken.role
    }
}
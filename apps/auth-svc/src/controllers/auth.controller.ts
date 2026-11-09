import { Request, Response, NextFunction } from 'express'
import { loginUserService, registerService } from '../services/auth.service';
import { successResponse } from 'shared';


export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        const user = await registerService(payload);
        return successResponse(res, user, 200)
    } catch (e) {
        next(e)
    }
};

export const loginUserController = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    try {
        const token = await loginUserService(req.body);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        return successResponse(res, token);

    } catch (e) {
        console.log({ e });
        next(e);
    }
}
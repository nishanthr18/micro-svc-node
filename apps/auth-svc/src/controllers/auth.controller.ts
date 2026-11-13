import { Request, Response, NextFunction } from 'express'
import { getMeService, loginUserService, registerService } from '../services/auth.service';
import { AppError, successResponse } from 'shared';


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
    try {
        const token = await loginUserService(req.body);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });

        return successResponse(res, { token });

    } catch (e) {
        console.log({ e });
        next(e);
    }
};

export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.token;

    if (!token) {
      throw new AppError(
        401,
        "Authentication token missing or invalid",
        true
      );
    }

    const user = await getMeService(token);
    console.log({user})

    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};


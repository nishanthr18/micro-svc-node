import { AppError } from "shared";
import { User } from "../types/auth.types";
import { createUser, findByEmail, getUser } from "../repositories/user.repo";
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const registerService = async (
    payload: User
) => {

    if (!payload) {
        throw new AppError(
            400,
            "Invalid payload",
            true
        );
    };

    const userExists: boolean = await findByEmail(payload.email);

    if (userExists) {
        throw new AppError(409, 'user already exists!')
    }

    const passwordHash = await bcrypt.hash(payload.password_hash, 5);
    payload.password_hash = passwordHash;

    const result = await createUser(payload);

    if (!result) {
        throw new AppError(
            500,
            "Failed to create user",
            true
        );
    }

    return result;
};

export const loginUserService = async (payload: { email: string, password: string }) => {
    if (!payload) {
        console.log({payload})
        throw new AppError(400, 'Invalid credentials');
    };

    const user = await getUser(payload.email);
    console.log({user})
    if (!user) {
        throw new AppError(404, 'User not found!');
    };

    const validPassword = await bcrypt.compare(payload.password, user.password_hash);
    if (!validPassword) {
        throw new AppError(400, 'Invalid credentials')
    };

    const { id, name, email, created_at } = user;
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret || !jwtExpiresIn) {
        throw new AppError(500, "JWT configuration is missing in environment variables", true);
    }
    const token = jwt.sign(
        { id, name, email }, 
        jwtSecret, 
        { expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    )
    
    return token;
};

export const getMeService = async (token: string) => {
  try {
    const jwtSecret = process.env.JWT_SECRET!;

    const user = await jwt.verify(
      token,
      jwtSecret
    ) as JwtPayload;

    return user;
  } catch (error) {
    console.log({error})
    throw new AppError(
      401,
      "Invalid or expired token",
      true
    );
  }
};
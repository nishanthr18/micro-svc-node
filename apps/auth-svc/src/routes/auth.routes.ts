import express from 'express'
import { createUserController, loginUserController } from '../controllers/auth.controller';
import { asyncHandler } from 'shared';

const router = express.Router();

router.post("/register",asyncHandler(createUserController));
router.post('/login', asyncHandler(loginUserController))

export const authRoutes = router;
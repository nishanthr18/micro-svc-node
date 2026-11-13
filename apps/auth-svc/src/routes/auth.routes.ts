import express from 'express'
import { createUserController, getMeController, loginUserController } from '../controllers/auth.controller';
import { asyncHandler } from 'shared';

const router = express.Router();

router.post("/register",asyncHandler(createUserController));
router.post('/login', asyncHandler(loginUserController));
router.get('/me', getMeController);

export const authRoutes = router;
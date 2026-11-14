import {config} from 'dotenv';
import {resolve} from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { MINUTE } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { AppError, errorHandler, httpLogger, logger, successResponse } from 'shared';
import { createProxyMiddleware } from 'http-proxy-middleware';


config({path: resolve(process.cwd(), ".env")});
config({path: resolve(process.cwd(), "../../.env")});

const PORT = process.env.API_GATEWAY_PORT || 3000;

const AUTH_SVC_URL = process.env.AUTH_SVC_URL || 'http://localhost:3001';

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(cors())
app.use(rateLimit({
    windowMs: 15 * MINUTE,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use(httpLogger);
app.use('/health', (_req, res) => {
    successResponse(res, {service: "API-GATEWAY"})
});
app.use('/auth', createProxyMiddleware({
    target: AUTH_SVC_URL,
    changeOrigin: true,
    pathRewrite: path => {
        console.log("/auth${path}",  `/auth${path}`);
        return  `/auth${path}`
    }
}))
app.use(express.json());
app.use((_req, _res, next) => next(new AppError(404, 'Route not found')));
app.use(errorHandler);

app.listen(PORT, () => logger.info('API Gateway running on PORT '+PORT));
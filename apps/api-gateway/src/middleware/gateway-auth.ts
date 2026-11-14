import type { Request, Response, NextFunction } from 'express'
import { getAllowedRoles, isPublicRoute } from '../rbac';
import { AppError, UserRole, verifyToken } from 'shared';

const IDENTITY_HEADERS = ['x-user-id', 'x-user-role', 'x-gateway-secret'] as const;

const removeIdentityHeaders = (req: Request) => {
    for (let header of IDENTITY_HEADERS) {
        delete req.headers[header]
    }
};

const attachGatewaySecret = (req: Request) => {
    req.headers['x-gateway-secret'] = process.env.GATEWAY_SECRET;

}

const requestPath = (req: Request) => {
  const combined = `${req.baseUrl}${req.path}`;

  return combined.length > 1 && combined.endsWith('/')
    ? combined.slice(0, -1)
    : combined || '/';
};

const attachUserHeaders = (req: Request, userId: string, role: UserRole) => {
    req.headers['x-user-id'] = userId;
    req.headers['x-user-role'] = role;
}

// Run on every /auth request; Before proxy forwards it to auth service.
export const gatewayAuth = (req: Request, _response: Response, next: NextFunction) => {

    try {
        removeIdentityHeaders(req);
        attachGatewaySecret(req);
        const path = requestPath(req);

        // if this is a public path -> bypass
        if (isPublicRoute(req.method, path)) {
            return next();
        }

        const authHeader = req.header('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError(401, 'Missing Beaerer token')
        };

        const token = authHeader.slice("Bearer ".length).trim();
        const payload = verifyToken(token);

        const allowedRoles = getAllowedRoles(req.method, path);

        if (!allowedRoles) {
            throw new AppError(404, "Route not alllowed")
        };

        if (!allowedRoles.includes(payload.role)) {
            throw new AppError(403, "Forbidden")
        };

        attachUserHeaders(req, payload.userId, payload.role);
        next()
    } catch (e) {
        if (e instanceof AppError) {
            next(e)
        }
    }

    return next(new AppError(401, "Invalid / expired token"))
}
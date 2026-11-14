import type { UserRole } from 'shared';

export type RbacRule = {
    method: string,
    path: string,
    role: UserRole[]
}

export const publicRoutes = [
    {
        method: 'POST', path: '/auth/login'
    },
    {
        method: 'POST', path: '/auth/register'
    }
] as const;

export const rbacRules: RbacRule[] = [
    {
        method: 'GET', path: '/auth/me', role: ["USER", "ADMIN"]
    }
]

const matchPattern = (pattern: string, actual: string): boolean => {
    if (pattern == actual) return true;

    const patternParts = pattern.split('/');
    const actualParts = actual.split('/');

    if (patternParts.length !== actualParts.length) {
        return false;
    }

    return patternParts.every((part, index) => part.startsWith(":") || part === actualParts[index]);
}

export const isPublicRoute = (method: string, path: string): boolean => {
    return publicRoutes.some(route => route.method === method && matchPattern(route.path, path))
};

export const getAllowedRoles = (method: string, path: string): UserRole[] | null => {
    const rule = rbacRules.find(route => route.method === method && matchPattern(route.path, path));

    return rule?.role ?? null;
}
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET nao configurado');
  }

  return secret;
}

export function authenticate(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Token de acesso não informado' });
    return;
  }

  const token = authorization.replace('Bearer ', '').trim();

  try {
    request.user = jwt.verify(token, getJwtSecret()) as AuthUser;
    next();
  } catch {
    response.status(401).json({ error: 'Token de acesso inválido' });
  }
}

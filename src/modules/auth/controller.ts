import type { Request, Response } from 'express';
import * as authService from './service.js';
import { ok } from '../../utils/helpers.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(ok(result, 'Logged in'));
}

export async function me(req: Request, res: Response) {
  if (!req.admin) throw new AppError('Unauthorized', 401);
  const admin = await authService.getAdminById(req.admin.sub);
  res.json(ok(admin));
}

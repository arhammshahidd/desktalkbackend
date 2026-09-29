import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok } from '../../utils/helpers.js';
import * as dashboardService from './service.js';

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getStats();
  res.json(ok(data));
});

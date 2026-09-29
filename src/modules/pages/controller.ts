import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as pageService from './service.js';

export const getByKey = asyncHandler(async (req: Request, res: Response) => {
  const data = await pageService.getByKey(routeParam(req.params.key));
  res.json(ok(data));
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const data = await pageService.listAll();
  res.json(ok(data));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await pageService.upsert(routeParam(req.params.key), req.body);
  res.json(ok(data, 'Page updated'));
});

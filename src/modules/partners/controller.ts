import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as partnerService from './service.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const data = await partnerService.list();
  res.json(ok(data));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await partnerService.create(req.body);
  res.status(201).json(ok(data, 'Partner created'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await partnerService.update(routeParam(req.params.id), req.body);
  res.json(ok(data, 'Partner updated'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await partnerService.remove(routeParam(req.params.id));
  res.json(ok(data, 'Partner deleted'));
});

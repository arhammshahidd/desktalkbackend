import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as teamService from './service.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const data = await teamService.list();
  res.json(ok(data));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await teamService.create(req.body);
  res.status(201).json(ok(data, 'Team member created'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await teamService.update(routeParam(req.params.id), req.body);
  res.json(ok(data, 'Team member updated'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await teamService.remove(routeParam(req.params.id));
  res.json(ok(data, 'Team member deleted'));
});

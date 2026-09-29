import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as blogService from './service.js';

export const listPublished = asyncHandler(async (_req: Request, res: Response) => {
  const data = await blogService.listPublished();
  res.json(ok(data));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const data = await blogService.getBySlug(routeParam(req.params.slug));
  res.json(ok(data));
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const data = await blogService.listAll();
  res.json(ok(data));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await blogService.create(req.body);
  res.status(201).json(ok(data, 'Blog created'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await blogService.update(routeParam(req.params.id), req.body);
  res.json(ok(data, 'Blog updated'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await blogService.remove(routeParam(req.params.id));
  res.json(ok(data, 'Blog deleted'));
});

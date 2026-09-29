import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as categoryService from './service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const type = typeof req.query.type === 'string' ? req.query.type : undefined;
  const data = await categoryService.list(type);
  res.json(ok(data));
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const data = await categoryService.listAll();
  res.json(ok(data));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await categoryService.create(req.body);
  res.status(201).json(ok(data, 'Category created'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await categoryService.update(routeParam(req.params.id), req.body);
  res.json(ok(data, 'Category updated'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await categoryService.remove(routeParam(req.params.id));
  res.json(ok(data, 'Category deleted'));
});

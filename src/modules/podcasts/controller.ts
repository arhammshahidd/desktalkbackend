import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as podcastService from './service.js';

export const listPublished = asyncHandler(async (_req: Request, res: Response) => {
  const data = await podcastService.listPublished();
  res.json(ok(data));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const data = await podcastService.getBySlug(routeParam(req.params.slug));
  res.json(ok(data));
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const data = await podcastService.listAll();
  res.json(ok(data));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await podcastService.create(req.body);
  res.status(201).json(ok(data, 'Podcast created'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await podcastService.update(routeParam(req.params.id), req.body);
  res.json(ok(data, 'Podcast updated'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await podcastService.remove(routeParam(req.params.id));
  res.json(ok(data, 'Podcast deleted'));
});

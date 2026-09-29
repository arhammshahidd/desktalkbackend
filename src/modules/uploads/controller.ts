import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as uploadService from './service.js';

export const presign = asyncHandler(async (req: Request, res: Response) => {
  const data = await uploadService.presign(req.body);
  res.json(ok(data, 'Presigned URL created'));
});

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const data = await uploadService.confirm(req.body);
  res.status(201).json(ok(data, 'Upload confirmed'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await uploadService.remove(routeParam(req.params.id));
  res.json(ok(data, 'Media deleted'));
});

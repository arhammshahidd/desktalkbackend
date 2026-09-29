import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { ok, routeParam } from '../../utils/helpers.js';
import * as submissionService from './service.js';
import type { SubmissionKind } from './service.js';

export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const data = await submissionService.createContact(req.body);
  res.status(201).json(ok(data, 'Contact submitted'));
});

export const createGuest = asyncHandler(async (req: Request, res: Response) => {
  const data = await submissionService.createGuest(req.body);
  res.status(201).json(ok(data, 'Guest application submitted'));
});

export const createHost = asyncHandler(async (req: Request, res: Response) => {
  const data = await submissionService.createHost(req.body);
  res.status(201).json(ok(data, 'Host application submitted'));
});

export const createNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const data = await submissionService.createNewsletter(req.body);
  res.status(201).json(ok(data, 'Subscribed'));
});

export const listContact = asyncHandler(async (_req: Request, res: Response) => {
  const data = await submissionService.listContact();
  res.json(ok(data));
});

export const listGuest = asyncHandler(async (_req: Request, res: Response) => {
  const data = await submissionService.listGuest();
  res.json(ok(data));
});

export const listHost = asyncHandler(async (_req: Request, res: Response) => {
  const data = await submissionService.listHost();
  res.json(ok(data));
});

export const listNewsletter = asyncHandler(async (_req: Request, res: Response) => {
  const data = await submissionService.listNewsletter();
  res.json(ok(data));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const kind = routeParam(req.params.kind) as SubmissionKind;
  const data = await submissionService.remove(kind, routeParam(req.params.id));
  res.json(ok(data, 'Submission deleted'));
});

import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { ok } from '../../utils/helpers.js';
import { contactSchema, guestSchema, hostSchema, newsletterSchema } from '../shared/schemas.js';

const router = Router();

router.post(
  '/contact',
  validateBody(contactSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('contact_submissions')
      .insert(req.body)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Message sent'));
  }),
);

router.post(
  '/guest',
  validateBody(guestSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('guest_applications')
      .insert(req.body)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Guest application submitted'));
  }),
);

router.post(
  '/host',
  validateBody(hostSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('host_applications')
      .insert(req.body)
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Host application submitted'));
  }),
);

router.post(
  '/newsletter',
  validateBody(newsletterSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await getSupabase()
      .from('newsletter_subscribers')
      .upsert({ email: req.body.email.toLowerCase() }, { onConflict: 'email' })
      .select('*')
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(ok(data, 'Subscribed'));
  }),
);

function listRoute(table: string, path: string) {
  router.get(
    path,
    requireAuth,
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabase()
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new AppError(error.message, 500);
      res.json(ok(data));
    }),
  );

  router.delete(
    `${path}/:id`,
    requireAuth,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabase().from(table).delete().eq('id', req.params.id);
      if (error) throw new AppError(error.message, 500);
      res.json(ok(null, 'Deleted'));
    }),
  );
}

listRoute('contact_submissions', '/contact');
listRoute('guest_applications', '/guest');
listRoute('host_applications', '/host');
listRoute('newsletter_subscribers', '/newsletter');

export default router;

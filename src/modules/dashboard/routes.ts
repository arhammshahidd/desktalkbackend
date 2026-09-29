import { Router } from 'express';
import { getSupabase } from '../../config/supabase.js';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { ok } from '../../utils/helpers.js';

const router = Router();

router.get(
  '/stats',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const supabase = getSupabase();
    const tables = [
      ['podcasts', 'podcasts'],
      ['blogs', 'blogs'],
      ['contact_submissions', 'contacts'],
      ['guest_applications', 'guests'],
      ['host_applications', 'hosts'],
      ['newsletter_subscribers', 'newsletter'],
      ['team_members', 'team'],
    ] as const;

    const counts: Record<string, number> = {};
    for (const [table, key] of tables) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) throw new AppError(error.message, 500);
      counts[key] = count || 0;
    }

    res.json(ok(counts));
  }),
);

export default router;

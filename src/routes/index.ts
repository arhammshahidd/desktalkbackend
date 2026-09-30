import { Router } from 'express';
import authRoutes from '../modules/auth/routes.js';
import podcastRoutes from '../modules/podcasts/routes.js';
import blogRoutes from '../modules/blogs/routes.js';
import categoryRoutes from '../modules/categories/routes.js';
import teamRoutes from '../modules/team/routes.js';
import partnerRoutes from '../modules/partners/routes.js';
import pageRoutes from '../modules/pages/routes.js';
import submissionRoutes from '../modules/submissions/routes.js';
import uploadRoutes from '../modules/uploads/routes.js';
import mediaRoutes from '../modules/media/routes.js';
import dashboardRoutes from '../modules/dashboard/routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/blogs', blogRoutes);
router.use('/categories', categoryRoutes);
router.use('/team', teamRoutes);
router.use('/partners', partnerRoutes);
router.use('/pages', pageRoutes);
router.use('/submissions', submissionRoutes);
router.use('/uploads', uploadRoutes);
router.use('/media', mediaRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;

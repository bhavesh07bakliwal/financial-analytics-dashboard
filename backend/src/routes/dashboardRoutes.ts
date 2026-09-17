import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { dashboardQuerySchema } from '../validators/transactionValidators';
import { getSummary, getTrends, getCategories, getStatus } from '../controllers/dashboardController';

const router = Router();

router.use(requireAuth);
router.use(validate(dashboardQuerySchema, 'query'));

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/categories', getCategories);
router.get('/status', getStatus);

export default router;

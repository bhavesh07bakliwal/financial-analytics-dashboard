import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { exportRequestSchema } from '../validators/exportValidators';
import { exportTransactions, previewExport } from '../controllers/exportController';

const router = Router();

router.use(requireAuth);
router.post('/export', validate(exportRequestSchema, 'body'), exportTransactions);
router.post('/export/preview', validate(exportRequestSchema, 'body'), previewExport);

export default router;

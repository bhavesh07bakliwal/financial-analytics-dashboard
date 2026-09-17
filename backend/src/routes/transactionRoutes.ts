import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { transactionQuerySchema, idParamSchema } from '../validators/transactionValidators';
import { listTransactions, getTransactionById } from '../controllers/transactionController';

const router = Router();

router.use(requireAuth);
router.get('/', validate(transactionQuerySchema, 'query'), listTransactions);
router.get('/:id', validate(idParamSchema, 'params'), getTransactionById);

export default router;

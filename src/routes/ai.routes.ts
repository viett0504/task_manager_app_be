import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const aiController = new AIController();

router.use(authenticate);

router.post('/suggest-assignee', aiController.suggestAssignee);
router.post('/breakdown-task', aiController.breakdownTask);
router.post('/evaluate-complexity', aiController.evaluateComplexity);
router.get('/suggestions', aiController.getSuggestions);
router.post('/suggestions/:id/accept', aiController.acceptSuggestion);
router.post('/suggestions/:id/dismiss', aiController.dismissSuggestion);

export default router;

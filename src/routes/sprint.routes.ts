import { Router } from 'express';
import { SprintController } from '../controllers/sprint.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const sprintController = new SprintController();

router.use(authenticate);

router.get('/', sprintController.getSprints);
router.post('/', sprintController.createSprint);
router.get('/:id', sprintController.getSprintById);
router.put('/:id', sprintController.updateSprint);
router.delete('/:id', sprintController.deleteSprint);
router.post('/:id/milestones', sprintController.addMilestone);
router.get('/:id/burndown', sprintController.getBurndownData);

export default router;

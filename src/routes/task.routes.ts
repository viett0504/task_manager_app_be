import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const taskController = new TaskController();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/status', taskController.updateTaskStatus);

export default router;

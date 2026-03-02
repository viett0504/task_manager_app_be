import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const teamController = new TeamController();

router.use(authenticate);

router.get('/', teamController.getTeams);
router.post('/', teamController.createTeam);
router.get('/:id', teamController.getTeamById);
router.get('/:id/members', teamController.getTeamMembers);
router.get('/:id/available-users', teamController.getAvailableUsers);
router.post('/:id/members', teamController.addTeamMember);
router.delete('/:id/members/:userId', teamController.removeTeamMember);
router.get('/:id/activity-logs', teamController.getActivityLogs);
router.get('/:id/kpi', teamController.getTeamKPI);

export default router;

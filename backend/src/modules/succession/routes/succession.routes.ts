import { Router } from 'express';
import { bearerAuth } from '../../../middlewares/bearerAuth';
import { RoleController } from '../controllers/role.controller';
import { CandidateController } from '../controllers/candidate.controller';
import { IDPController } from '../controllers/idp.controller';
import { AnalyticsController } from '../controllers/analytics.controller';
import { PromotionController } from '../controllers/promotion.controller';

const router = Router();

const roleController = new RoleController();
const candidateController = new CandidateController();
const idpController = new IDPController();
const analyticsController = new AnalyticsController();
const promotionController = new PromotionController();

// ============================================
// CRITICAL ROLE ROUTES
// ============================================

router.post('/roles', bearerAuth, roleController.createCriticalRole);
router.get('/roles', bearerAuth, roleController.getCriticalRoles);
router.get('/roles/:id', bearerAuth, roleController.getCriticalRoleById);
router.put('/roles/:id', bearerAuth, roleController.updateCriticalRole);
router.delete('/roles/:id', bearerAuth, roleController.deleteCriticalRole);

// Get competencies for role mapping
router.get('/competencies', bearerAuth, roleController.getCompetenciesForMapping);

// ============================================
// TALENT POOL & CANDIDATE ROUTES
// ============================================

// Talent pool management
router.post('/roles/:roleId/talent-pool', bearerAuth, candidateController.addToTalentPool);
router.get('/roles/:roleId/candidates', bearerAuth, candidateController.getRankedCandidates);
router.post('/roles/:roleId/recalculate', bearerAuth, candidateController.recalculateRoleScores);
router.delete('/talent-pool/:id', bearerAuth, candidateController.removeFromTalentPool);

// Candidate evaluation
router.post('/candidates/:employeeId/evaluate', bearerAuth, candidateController.ratePotential);
router.get('/candidates/:employeeId/score', bearerAuth, candidateController.getCandidateScore);
router.get('/candidates/:employeeId/potential-history', bearerAuth, candidateController.getPotentialRatingHistory);

// ============================================
// IDP ROUTES
// ============================================

router.post('/idp/:employeeId', bearerAuth, idpController.createIDP);
router.get('/idp/:employeeId', bearerAuth, idpController.getEmployeeIDPs);
router.get('/idp/detail/:idpId', bearerAuth, idpController.getIDPById);
router.patch('/idp/:idpId/status', bearerAuth, idpController.updateIDPStatus);
router.post('/idp/:idpId/goals', bearerAuth, idpController.addGoal);
router.patch('/idp/goals/:goalId/progress', bearerAuth, idpController.updateGoalProgress);
router.delete('/idp/goals/:goalId', bearerAuth, idpController.deleteGoal);
router.post('/idp/:employeeId/sync', bearerAuth, idpController.syncGoalProgress);

// ============================================
// ANALYTICS ROUTES
// ============================================

router.get('/analytics/dashboard', bearerAuth, analyticsController.getDashboardSummary);
router.get('/analytics/9box', bearerAuth, analyticsController.get9BoxData);
router.get('/analytics/readiness', bearerAuth, analyticsController.getReadinessReport);
router.get('/analytics/risk', bearerAuth, analyticsController.getRiskAnalysis);

// ============================================
// PROMOTION ROUTES
// ============================================

router.get('/promotions/pipeline', bearerAuth, promotionController.getPromotionPipeline);
router.get('/promotions/newly-eligible', bearerAuth, promotionController.getNewlyEligibleCandidates);
router.get('/promotions/report/:roleId', bearerAuth, promotionController.getPromotionReport);
router.post('/promotions/notify', bearerAuth, promotionController.sendPromotionAlert);

export default router;


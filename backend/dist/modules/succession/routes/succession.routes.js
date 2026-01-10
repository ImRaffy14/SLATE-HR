"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bearerAuth_1 = require("../../../middlewares/bearerAuth");
const role_controller_1 = require("../controllers/role.controller");
const candidate_controller_1 = require("../controllers/candidate.controller");
const idp_controller_1 = require("../controllers/idp.controller");
const analytics_controller_1 = require("../controllers/analytics.controller");
const promotion_controller_1 = require("../controllers/promotion.controller");
const router = (0, express_1.Router)();
const roleController = new role_controller_1.RoleController();
const candidateController = new candidate_controller_1.CandidateController();
const idpController = new idp_controller_1.IDPController();
const analyticsController = new analytics_controller_1.AnalyticsController();
const promotionController = new promotion_controller_1.PromotionController();
// ============================================
// CRITICAL ROLE ROUTES
// ============================================
router.post('/roles', bearerAuth_1.bearerAuth, roleController.createCriticalRole);
router.get('/roles', bearerAuth_1.bearerAuth, roleController.getCriticalRoles);
router.get('/roles/:id', bearerAuth_1.bearerAuth, roleController.getCriticalRoleById);
router.put('/roles/:id', bearerAuth_1.bearerAuth, roleController.updateCriticalRole);
router.delete('/roles/:id', bearerAuth_1.bearerAuth, roleController.deleteCriticalRole);
// Get competencies for role mapping
router.get('/competencies', bearerAuth_1.bearerAuth, roleController.getCompetenciesForMapping);
// ============================================
// TALENT POOL & CANDIDATE ROUTES
// ============================================
// Talent pool management
router.post('/roles/:roleId/talent-pool', bearerAuth_1.bearerAuth, candidateController.addToTalentPool);
router.get('/roles/:roleId/candidates', bearerAuth_1.bearerAuth, candidateController.getRankedCandidates);
router.post('/roles/:roleId/recalculate', bearerAuth_1.bearerAuth, candidateController.recalculateRoleScores);
router.delete('/talent-pool/:id', bearerAuth_1.bearerAuth, candidateController.removeFromTalentPool);
// Candidate evaluation
router.post('/candidates/:employeeId/evaluate', bearerAuth_1.bearerAuth, candidateController.ratePotential);
router.get('/candidates/:employeeId/score', bearerAuth_1.bearerAuth, candidateController.getCandidateScore);
router.get('/candidates/:employeeId/potential-history', bearerAuth_1.bearerAuth, candidateController.getPotentialRatingHistory);
// ============================================
// IDP ROUTES
// ============================================
router.post('/idp/:employeeId', bearerAuth_1.bearerAuth, idpController.createIDP);
router.get('/idp/:employeeId', bearerAuth_1.bearerAuth, idpController.getEmployeeIDPs);
router.get('/idp/detail/:idpId', bearerAuth_1.bearerAuth, idpController.getIDPById);
router.patch('/idp/:idpId/status', bearerAuth_1.bearerAuth, idpController.updateIDPStatus);
router.post('/idp/:idpId/goals', bearerAuth_1.bearerAuth, idpController.addGoal);
router.patch('/idp/goals/:goalId/progress', bearerAuth_1.bearerAuth, idpController.updateGoalProgress);
router.delete('/idp/goals/:goalId', bearerAuth_1.bearerAuth, idpController.deleteGoal);
router.post('/idp/:employeeId/sync', bearerAuth_1.bearerAuth, idpController.syncGoalProgress);
// ============================================
// ANALYTICS ROUTES
// ============================================
router.get('/analytics/dashboard', bearerAuth_1.bearerAuth, analyticsController.getDashboardSummary);
router.get('/analytics/9box', bearerAuth_1.bearerAuth, analyticsController.get9BoxData);
router.get('/analytics/readiness', bearerAuth_1.bearerAuth, analyticsController.getReadinessReport);
router.get('/analytics/risk', bearerAuth_1.bearerAuth, analyticsController.getRiskAnalysis);
// ============================================
// PROMOTION ROUTES
// ============================================
router.get('/promotions/pipeline', bearerAuth_1.bearerAuth, promotionController.getPromotionPipeline);
router.get('/promotions/newly-eligible', bearerAuth_1.bearerAuth, promotionController.getNewlyEligibleCandidates);
router.get('/promotions/report/:roleId', bearerAuth_1.bearerAuth, promotionController.getPromotionReport);
router.post('/promotions/notify', bearerAuth_1.bearerAuth, promotionController.sendPromotionAlert);
exports.default = router;

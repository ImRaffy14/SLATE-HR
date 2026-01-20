"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDPController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const idp_service_1 = require("../services/idp.service");
class IDPController {
    constructor() {
        this.idpService = new idp_service_1.IDPService();
        /**
         * POST /succession/idp/:employeeId
         * Create IDP for an employee
         */
        this.createIDP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const { targetRoleId, autoGenerateGoals } = req.body;
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }
            if (!targetRoleId) {
                return res.status(400).json({ status: 'error', message: 'Target role ID is required' });
            }
            const idp = await this.idpService.createIDP({
                employeeId,
                targetRoleId,
                autoGenerateGoals,
            }, userId);
            res.status(201).json({
                status: 'success',
                message: 'IDP created successfully',
                idp
            });
        });
        /**
         * GET /succession/idp/:employeeId
         * Get employee's IDPs
         */
        this.getEmployeeIDPs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const filters = {
                status: req.query.status,
                targetRoleId: req.query.targetRoleId,
            };
            const idps = await this.idpService.getEmployeeIDPs(employeeId, filters);
            res.status(200).json({
                status: 'success',
                idps
            });
        });
        /**
         * GET /succession/idp/detail/:idpId
         * Get IDP by ID
         */
        this.getIDPById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const idp = await this.idpService.getIDPById(req.params.idpId);
            res.status(200).json({
                status: 'success',
                idp
            });
        });
        /**
         * PATCH /succession/idp/:idpId/status
         * Update IDP status
         */
        this.updateIDPStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ status: 'error', message: 'Status is required' });
            }
            const idp = await this.idpService.updateIDPStatus(req.params.idpId, status);
            res.status(200).json({
                status: 'success',
                message: 'IDP status updated',
                idp
            });
        });
        /**
         * POST /succession/idp/:idpId/goals
         * Add goal to IDP
         */
        this.addGoal = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { idpId } = req.params;
            if (!req.body.title || !req.body.goalType) {
                return res.status(400).json({ status: 'error', message: 'Title and goal type are required' });
            }
            const goal = await this.idpService.addGoal(idpId, req.body);
            res.status(201).json({
                status: 'success',
                message: 'Goal added',
                goal
            });
        });
        /**
         * PATCH /succession/idp/goals/:goalId/progress
         * Update goal progress
         */
        this.updateGoalProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { goalId } = req.params;
            const { progress, completed } = req.body;
            if (progress === undefined) {
                return res.status(400).json({ status: 'error', message: 'Progress is required' });
            }
            const goal = await this.idpService.updateGoalProgress(goalId, progress, completed);
            res.status(200).json({
                status: 'success',
                message: 'Goal progress updated',
                goal
            });
        });
        /**
         * DELETE /succession/idp/goals/:goalId
         * Delete goal
         */
        this.deleteGoal = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.idpService.deleteGoal(req.params.goalId);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * POST /succession/idp/:employeeId/sync
         * Sync IDP goal progress with learning
         */
        this.syncGoalProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.idpService.syncGoalProgressFromLearning(req.params.employeeId);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
    }
}
exports.IDPController = IDPController;

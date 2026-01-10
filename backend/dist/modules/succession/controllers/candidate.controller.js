"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const candidate_service_1 = require("../services/candidate.service");
class CandidateController {
    constructor() {
        this.candidateService = new candidate_service_1.CandidateService();
        /**
         * POST /succession/roles/:roleId/talent-pool
         * Add employee to talent pool
         */
        this.addToTalentPool = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { roleId } = req.params;
            const { employeeId, notes } = req.body;
            if (!employeeId) {
                return res.status(400).json({ status: 'error', message: 'Employee ID is required' });
            }
            const talentPool = await this.candidateService.addToTalentPool(roleId, employeeId, notes);
            res.status(201).json({
                status: 'success',
                message: 'Employee added to talent pool',
                talentPool
            });
        });
        /**
         * GET /succession/roles/:roleId/candidates
         * Get ranked candidates for a role
         */
        this.getRankedCandidates = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { roleId } = req.params;
            const result = await this.candidateService.getRankedCandidates(roleId);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * DELETE /succession/talent-pool/:id
         * Remove from talent pool
         */
        this.removeFromTalentPool = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.candidateService.removeFromTalentPool(req.params.id);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * POST /succession/candidates/:employeeId/evaluate
         * Rate employee's potential
         */
        this.ratePotential = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const { rating, comments } = req.body;
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ status: 'error', message: 'Rating must be between 1 and 5' });
            }
            const potentialRating = await this.candidateService.ratePotential(employeeId, rating, comments, userId);
            res.status(201).json({
                status: 'success',
                message: 'Potential rating added',
                potentialRating
            });
        });
        /**
         * GET /succession/candidates/:employeeId/score
         * Get candidate score and details
         */
        this.getCandidateScore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.candidateService.getCandidateScore(req.params.employeeId);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * POST /succession/roles/:roleId/recalculate
         * Recalculate scores for all candidates in a role
         */
        this.recalculateRoleScores = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.candidateService.recalculateRoleScores(req.params.roleId);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * GET /succession/candidates/:employeeId/potential-history
         * Get potential rating history
         */
        this.getPotentialRatingHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const ratings = await this.candidateService.getPotentialRatingHistory(req.params.employeeId);
            res.status(200).json({
                status: 'success',
                ratings
            });
        });
    }
}
exports.CandidateController = CandidateController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const promotion_service_1 = require("../services/promotion.service");
class PromotionController {
    constructor() {
        this.promotionService = new promotion_service_1.PromotionService();
        /**
         * GET /succession/promotions/pipeline
         * Get promotion pipeline
         */
        this.getPromotionPipeline = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                roleId: req.query.roleId,
                department: req.query.department,
                minScore: req.query.minScore ? parseFloat(req.query.minScore) : undefined,
            };
            const result = await this.promotionService.getPromotionPipeline(filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * POST /succession/promotions/notify
         * Send promotion alert
         */
        this.sendPromotionAlert = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId, roleId, message } = req.body;
            if (!employeeId || !roleId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Employee ID and Role ID are required'
                });
            }
            const result = await this.promotionService.sendPromotionAlert({
                employeeId,
                roleId,
                message,
            });
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * GET /succession/promotions/newly-eligible
         * Get newly eligible candidates
         */
        this.getNewlyEligibleCandidates = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const sinceDate = req.query.since
                ? new Date(req.query.since)
                : undefined;
            const candidates = await this.promotionService.getNewlyEligibleCandidates(sinceDate);
            res.status(200).json({
                status: 'success',
                candidates
            });
        });
        /**
         * GET /succession/promotions/report/:roleId
         * Get promotion report for a role
         */
        this.getPromotionReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.promotionService.getPromotionReport(req.params.roleId);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
    }
}
exports.PromotionController = PromotionController;

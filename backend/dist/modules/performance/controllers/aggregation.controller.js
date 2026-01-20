"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregationController = exports.AggregationController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const aggregation_service_1 = require("../services/aggregation.service");
const aggregationService = new aggregation_service_1.AggregationService();
class AggregationController {
    constructor() {
        /**
         * Sync all employee performance snapshots
         * POST /performance/sync
         */
        this.syncSnapshots = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await aggregationService.syncAllSnapshots();
            res.status(200).json({
                message: 'Performance snapshots synced successfully',
                synced: result.synced,
                failed: result.failed
            });
        });
        /**
         * Get employee performance history
         * GET /performance/employee/:employeeId/history
         */
        this.getEmployeeHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const limit = parseInt(req.query.limit) || 12;
            const history = await aggregationService.getEmployeeHistory(employeeId, limit);
            res.status(200).json({
                employeeId,
                history
            });
        });
        /**
         * Get employee metrics
         * GET /performance/employee/:employeeId/metrics
         */
        this.getEmployeeMetrics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const metrics = await aggregationService.getEmployeeMetrics(employeeId);
            res.status(200).json(metrics);
        });
        /**
         * Create snapshot for single employee
         * POST /performance/employee/:employeeId/snapshot
         */
        this.createEmployeeSnapshot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId } = req.params;
            const { period } = req.body;
            const snapshot = await aggregationService.createSnapshot(employeeId, period);
            res.status(201).json({
                message: 'Snapshot created successfully',
                snapshot
            });
        });
        /**
         * Get all employees with latest metrics
         * GET /performance/employees
         */
        this.getAllEmployeesWithMetrics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employees = await aggregationService.getAllEmployeesWithMetrics();
            res.status(200).json({
                count: employees.length,
                employees
            });
        });
    }
}
exports.AggregationController = AggregationController;
exports.aggregationController = new AggregationController();

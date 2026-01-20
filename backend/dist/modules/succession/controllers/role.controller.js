"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const asyncHandler_1 = require("../../../utils/asyncHandler");
const role_service_1 = require("../services/role.service");
class RoleController {
    constructor() {
        this.roleService = new role_service_1.RoleService();
        /**
         * POST /succession/roles
         * Create a critical role
         */
        this.createCriticalRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }
            const role = await this.roleService.createCriticalRole(req.body, userId);
            res.status(201).json({
                status: 'success',
                message: 'Critical role created successfully',
                role
            });
        });
        /**
         * GET /succession/roles
         * Get all critical roles
         */
        this.getCriticalRoles = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                isCritical: req.query.isCritical === 'true' ? true : req.query.isCritical === 'false' ? false : undefined,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            };
            const result = await this.roleService.getCriticalRoles(filters);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * GET /succession/roles/:id
         * Get critical role by ID
         */
        this.getCriticalRoleById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const role = await this.roleService.getCriticalRoleById(req.params.id);
            res.status(200).json({
                status: 'success',
                role
            });
        });
        /**
         * PUT /succession/roles/:id
         * Update critical role
         */
        this.updateCriticalRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const role = await this.roleService.updateCriticalRole(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Critical role updated successfully',
                role
            });
        });
        /**
         * DELETE /succession/roles/:id
         * Delete critical role
         */
        this.deleteCriticalRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.roleService.deleteCriticalRole(req.params.id);
            res.status(200).json({
                status: 'success',
                ...result
            });
        });
        /**
         * GET /succession/competencies
         * Get competencies for role mapping
         */
        this.getCompetenciesForMapping = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const competencies = await this.roleService.getCompetenciesForMapping();
            res.status(200).json({
                status: 'success',
                competencies
            });
        });
    }
}
exports.RoleController = RoleController;

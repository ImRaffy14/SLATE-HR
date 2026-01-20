"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const scoring_utils_1 = require("../utils/scoring.utils");
class AnalyticsService {
    /**
     * Get 9-Box Grid data
     * Returns employees positioned on Performance (X) vs Potential (Y) grid
     */
    async get9BoxData(filters) {
        // Get all employees with performance and potential ratings
        const where = { status: 'ACTIVE' };
        if (filters?.department) {
            where.department = filters.department;
        }
        const employees = await prisma_1.default.employee.findMany({
            where,
            include: {
                performance: {
                    orderBy: { reviewDate: 'desc' },
                    take: 1
                },
                potentialRatings: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                talentPools: filters?.roleId ? {
                    where: { roleId: filters.roleId }
                } : true
            }
        });
        // Filter to only include employees in talent pool if roleId specified
        const filteredEmployees = filters?.roleId
            ? employees.filter(e => e.talentPools.length > 0)
            : employees;
        // Initialize 9-box grid
        const grid = {};
        // Define grid cells
        const cells = [
            { x: 1, y: 1, label: 'Underperformer' },
            { x: 1, y: 2, label: 'Inconsistent Player' },
            { x: 1, y: 3, label: 'Rough Diamond' },
            { x: 2, y: 1, label: 'Effective' },
            { x: 2, y: 2, label: 'Core Player' },
            { x: 2, y: 3, label: 'High Potential' },
            { x: 3, y: 1, label: 'Trusted Professional' },
            { x: 3, y: 2, label: 'High Performer' },
            { x: 3, y: 3, label: 'Star' },
        ];
        for (const cell of cells) {
            grid[`${cell.x}-${cell.y}`] = {
                label: cell.label,
                employees: [],
                count: 0
            };
        }
        // Place employees on grid
        for (const emp of filteredEmployees) {
            const performanceScore = emp.performance[0]?.score || 0;
            const potentialRating = emp.potentialRatings[0]?.rating || 0;
            // Skip employees without both scores
            if (!performanceScore || !potentialRating)
                continue;
            const position = (0, scoring_utils_1.get9BoxPosition)(performanceScore, potentialRating);
            const key = `${position.x}-${position.y}`;
            if (grid[key]) {
                grid[key].employees.push({
                    id: emp.id,
                    name: emp.name,
                    department: emp.department,
                    position: emp.position,
                    performance: performanceScore,
                    potential: potentialRating,
                });
                grid[key].count++;
            }
        }
        return {
            grid,
            totalEmployees: filteredEmployees.length,
            employeesWithScores: Object.values(grid).reduce((sum, cell) => sum + cell.count, 0),
        };
    }
    /**
     * Get readiness report across all critical roles
     */
    async getReadinessReport(filters) {
        const where = {};
        if (filters?.roleId) {
            where.roleId = filters.roleId;
        }
        const talentPools = await prisma_1.default.talentPool.findMany({
            where,
            include: {
                role: {
                    include: {
                        jobRole: true
                    }
                },
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        position: true,
                    }
                }
            }
        });
        // Filter by department if specified
        const filtered = filters?.department
            ? talentPools.filter(tp => tp.employee.department === filters.department)
            : talentPools;
        // Group by readiness status
        const byStatus = {
            READY_NOW: filtered.filter(tp => tp.readinessStatus === 'READY_NOW'),
            READY_6_MONTHS: filtered.filter(tp => tp.readinessStatus === 'READY_6_MONTHS'),
            READY_1_YEAR: filtered.filter(tp => tp.readinessStatus === 'READY_1_YEAR'),
            NOT_READY: filtered.filter(tp => tp.readinessStatus === 'NOT_READY'),
        };
        // Group by role
        const byRole = {};
        for (const tp of filtered) {
            const roleId = tp.roleId;
            if (!byRole[roleId]) {
                byRole[roleId] = {
                    roleId,
                    roleName: tp.role.jobRole.name,
                    totalCandidates: 0,
                    readyNow: 0,
                    readySoon: 0,
                    readyLater: 0,
                    notReady: 0,
                    candidates: [],
                };
            }
            byRole[roleId].totalCandidates++;
            byRole[roleId].candidates.push(tp);
            switch (tp.readinessStatus) {
                case 'READY_NOW':
                    byRole[roleId].readyNow++;
                    break;
                case 'READY_6_MONTHS':
                    byRole[roleId].readySoon++;
                    break;
                case 'READY_1_YEAR':
                    byRole[roleId].readyLater++;
                    break;
                case 'NOT_READY':
                    byRole[roleId].notReady++;
                    break;
            }
        }
        return {
            summary: {
                total: filtered.length,
                readyNow: byStatus.READY_NOW.length,
                readySoon: byStatus.READY_6_MONTHS.length,
                readyLater: byStatus.READY_1_YEAR.length,
                notReady: byStatus.NOT_READY.length,
            },
            byStatus: {
                READY_NOW: byStatus.READY_NOW.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                })),
                READY_6_MONTHS: byStatus.READY_6_MONTHS.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                })),
                READY_1_YEAR: byStatus.READY_1_YEAR.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                })),
                NOT_READY: byStatus.NOT_READY.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                })),
            },
            byRole: Object.values(byRole),
        };
    }
    /**
     * Get risk analysis for talent pool
     */
    async getRiskAnalysis(filters) {
        const where = {};
        if (filters?.roleId) {
            where.roleId = filters.roleId;
        }
        if (filters?.riskLevel) {
            where.riskLevel = filters.riskLevel;
        }
        const talentPools = await prisma_1.default.talentPool.findMany({
            where,
            include: {
                role: {
                    include: {
                        jobRole: true
                    }
                },
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        position: true,
                        dateHired: true,
                    }
                }
            },
            orderBy: [
                { riskLevel: 'desc' },
                { overallScore: 'desc' }
            ]
        });
        // Group by risk level
        const byRiskLevel = {
            CRITICAL: talentPools.filter(tp => tp.riskLevel === 'CRITICAL'),
            HIGH: talentPools.filter(tp => tp.riskLevel === 'HIGH'),
            MEDIUM: talentPools.filter(tp => tp.riskLevel === 'MEDIUM'),
            LOW: talentPools.filter(tp => tp.riskLevel === 'LOW'),
        };
        // Identify high performers at risk
        const highPerformersAtRisk = talentPools.filter(tp => tp.overallScore && tp.overallScore >= 70 &&
            (tp.riskLevel === 'HIGH' || tp.riskLevel === 'CRITICAL'));
        return {
            summary: {
                total: talentPools.length,
                critical: byRiskLevel.CRITICAL.length,
                high: byRiskLevel.HIGH.length,
                medium: byRiskLevel.MEDIUM.length,
                low: byRiskLevel.LOW.length,
                highPerformersAtRisk: highPerformersAtRisk.length,
            },
            byRiskLevel: {
                CRITICAL: byRiskLevel.CRITICAL.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    department: tp.employee.department,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                    riskFactors: tp.riskFactors,
                })),
                HIGH: byRiskLevel.HIGH.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    department: tp.employee.department,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                    riskFactors: tp.riskFactors,
                })),
                MEDIUM: byRiskLevel.MEDIUM.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    department: tp.employee.department,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                    riskFactors: tp.riskFactors,
                })),
                LOW: byRiskLevel.LOW.map(tp => ({
                    id: tp.id,
                    employeeId: tp.employeeId,
                    employeeName: tp.employee.name,
                    department: tp.employee.department,
                    roleName: tp.role.jobRole.name,
                    overallScore: tp.overallScore,
                    riskFactors: tp.riskFactors,
                })),
            },
            highPerformersAtRisk: highPerformersAtRisk.map(tp => ({
                id: tp.id,
                employeeId: tp.employeeId,
                employeeName: tp.employee.name,
                department: tp.employee.department,
                roleName: tp.role.jobRole.name,
                overallScore: tp.overallScore,
                riskLevel: tp.riskLevel,
                riskFactors: tp.riskFactors,
            })),
        };
    }
    /**
     * Get succession dashboard summary
     */
    async getDashboardSummary() {
        const [criticalRolesCount, talentPoolCount, idpsCount, readyNowCount, highRiskCount,] = await Promise.all([
            prisma_1.default.criticalRole.count({ where: { isCritical: true } }),
            prisma_1.default.talentPool.count(),
            prisma_1.default.individualDevelopmentPlan.count({ where: { status: 'ACTIVE' } }),
            prisma_1.default.talentPool.count({ where: { readinessStatus: 'READY_NOW' } }),
            prisma_1.default.talentPool.count({ where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } } }),
        ]);
        // Get top candidates across all roles
        const topCandidates = await prisma_1.default.talentPool.findMany({
            where: {
                readinessStatus: 'READY_NOW',
                overallScore: { gte: 80 }
            },
            include: {
                role: {
                    include: {
                        jobRole: true
                    }
                },
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                    }
                }
            },
            orderBy: { overallScore: 'desc' },
            take: 10
        });
        // Get roles with no ready successors
        const rolesAtRisk = await prisma_1.default.criticalRole.findMany({
            where: {
                isCritical: true,
                talentPool: {
                    none: {
                        readinessStatus: 'READY_NOW'
                    }
                }
            },
            include: {
                jobRole: true,
                talentPool: true
            }
        });
        return {
            overview: {
                criticalRoles: criticalRolesCount,
                talentPoolSize: talentPoolCount,
                activeIDPs: idpsCount,
                readySuccessors: readyNowCount,
                highRiskCandidates: highRiskCount,
            },
            topCandidates: topCandidates.map(tc => ({
                id: tc.id,
                employeeId: tc.employeeId,
                employeeName: tc.employee.name,
                department: tc.employee.department,
                roleName: tc.role.jobRole.name,
                overallScore: tc.overallScore,
                readinessStatus: tc.readinessStatus,
            })),
            rolesAtRisk: rolesAtRisk.map(r => ({
                id: r.id,
                roleName: r.jobRole.name,
                candidateCount: r.talentPool.length,
                hasNoCandidates: r.talentPool.length === 0,
            })),
        };
    }
}
exports.AnalyticsService = AnalyticsService;

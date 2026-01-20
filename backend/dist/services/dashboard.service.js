"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class DashboardService {
    async getAdminDashboard() {
        const [kpis, employeesByDepartment, trainingProgress, competencyDistribution, learningTrends, successionReadiness, recentActivity] = await Promise.all([
            this.getKPIs(),
            this.getEmployeesByDepartment(),
            this.getTrainingProgress(),
            this.getCompetencyDistribution(),
            this.getLearningTrends(),
            this.getSuccessionReadiness(),
            this.getRecentActivity()
        ]);
        return {
            kpis,
            charts: {
                employeesByDepartment,
                trainingProgress,
                competencyDistribution,
                learningTrends,
                successionReadiness
            },
            recentActivity
        };
    }
    async getKPIs() {
        const [totalEmployees, publishedCourses, activeTrainings, totalCompetencies, successionPool, learningHoursData] = await Promise.all([
            // Total active employees
            prisma_1.default.employee.count({
                where: { status: 'ACTIVE' }
            }),
            // Published courses
            prisma_1.default.course.count({
                where: { status: 'PUBLISHED' }
            }),
            // Active trainings (OPEN or ONGOING)
            prisma_1.default.training.count({
                where: {
                    status: { in: ['OPEN', 'ONGOING'] }
                }
            }),
            // Total competencies
            prisma_1.default.competency.count(),
            // Succession pool (talent pool count)
            prisma_1.default.talentPool.count(),
            // Learning hours from enrollments
            this.calculateTotalLearningHours()
        ]);
        return {
            totalEmployees,
            publishedCourses,
            activeTrainings,
            totalCompetencies,
            successionPool,
            totalLearningHours: learningHoursData
        };
    }
    async calculateTotalLearningHours() {
        const completedEnrollments = await prisma_1.default.enrollment.findMany({
            where: { status: 'COMPLETED' },
            include: {
                course: {
                    select: { estimatedHours: true }
                }
            }
        });
        return completedEnrollments.reduce((total, enrollment) => {
            return total + (enrollment.course?.estimatedHours || 0);
        }, 0);
    }
    async getEmployeesByDepartment() {
        const employees = await prisma_1.default.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { department: true }
        });
        const departmentCounts = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Unassigned';
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
        return Object.entries(departmentCounts)
            .map(([name, employees]) => ({ name, employees }))
            .sort((a, b) => b.employees - a.employees)
            .slice(0, 10); // Top 10 departments
    }
    async getTrainingProgress() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const trainings = await prisma_1.default.training.findMany({
            where: {
                startDate: { gte: sixMonthsAgo }
            },
            select: {
                status: true,
                startDate: true,
                endDate: true
            }
        });
        const monthlyData = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = months[date.getMonth()];
            monthlyData[monthKey] = { completed: 0, scheduled: 0 };
        }
        trainings.forEach(training => {
            const monthKey = months[new Date(training.startDate).getMonth()];
            if (monthlyData[monthKey]) {
                if (training.status === 'COMPLETED') {
                    monthlyData[monthKey].completed += 1;
                }
                else {
                    monthlyData[monthKey].scheduled += 1;
                }
            }
        });
        return Object.entries(monthlyData).map(([month, data]) => ({
            month,
            completed: data.completed,
            scheduled: data.scheduled
        }));
    }
    async getCompetencyDistribution() {
        const competencyLevels = await prisma_1.default.employeeCompetency.findMany({
            select: {
                managerRating: true,
                finalScore: true,
                competency: {
                    select: { weight: true }
                }
            }
        });
        const levelCounts = {
            'EXPERT': 0,
            'PROFICIENT': 0,
            'DEVELOPING': 0,
            'BEGINNER': 0
        };
        competencyLevels.forEach(ec => {
            // Calculate numeric level (1-5) from managerRating or finalScore
            let numericLevel = 1; // Default to 1 (BEGINNER)
            if (ec.managerRating !== null && ec.managerRating !== undefined) {
                numericLevel = ec.managerRating;
            }
            else if (ec.finalScore !== null && ec.finalScore !== undefined && ec.competency) {
                // Normalize finalScore back to 1-5 scale
                const normalizedScore = ec.finalScore / (ec.competency.weight / 100);
                numericLevel = Math.max(1, Math.min(5, Math.round(normalizedScore)));
            }
            // Map numeric level (1-5) to proficiency level
            let level;
            if (numericLevel >= 5) {
                level = 'EXPERT';
            }
            else if (numericLevel >= 4) {
                level = 'PROFICIENT';
            }
            else if (numericLevel >= 3) {
                level = 'DEVELOPING';
            }
            else {
                level = 'BEGINNER';
            }
            if (levelCounts[level] !== undefined) {
                levelCounts[level] += 1;
            }
        });
        const total = Object.values(levelCounts).reduce((a, b) => a + b, 0);
        const colorMap = {
            'EXPERT': '#10b981',
            'PROFICIENT': '#3b82f6',
            'DEVELOPING': '#f59e0b',
            'BEGINNER': '#ef4444'
        };
        const labelMap = {
            'EXPERT': 'Expert',
            'PROFICIENT': 'Proficient',
            'DEVELOPING': 'Developing',
            'BEGINNER': 'Beginner'
        };
        return Object.entries(levelCounts).map(([level, count]) => ({
            name: labelMap[level] || level,
            value: total > 0 ? Math.round((count / total) * 100) : 0,
            color: colorMap[level] || '#6b7280'
        }));
    }
    async getLearningTrends() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const enrollments = await prisma_1.default.enrollment.findMany({
            where: {
                enrolledAt: { gte: sixMonthsAgo }
            },
            select: {
                status: true,
                enrolledAt: true,
                completedAt: true
            }
        });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = {};
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = months[date.getMonth()];
            monthlyData[monthKey] = { enrollments: 0, completions: 0 };
        }
        enrollments.forEach(enrollment => {
            const enrollMonth = months[new Date(enrollment.enrolledAt).getMonth()];
            if (monthlyData[enrollMonth]) {
                monthlyData[enrollMonth].enrollments += 1;
            }
            if (enrollment.completedAt) {
                const completionMonth = months[new Date(enrollment.completedAt).getMonth()];
                if (monthlyData[completionMonth]) {
                    monthlyData[completionMonth].completions += 1;
                }
            }
        });
        return Object.entries(monthlyData).map(([month, data]) => ({
            month,
            enrollments: data.enrollments,
            completions: data.completions
        }));
    }
    async getSuccessionReadiness() {
        const talentPool = await prisma_1.default.talentPool.findMany({
            select: { readinessStatus: true }
        });
        const statusCounts = {
            'READY_NOW': 0,
            'READY_6_MONTHS': 0,
            'READY_1_YEAR': 0,
            'NOT_READY': 0
        };
        talentPool.forEach(tp => {
            const status = tp.readinessStatus || 'NOT_READY';
            if (statusCounts[status] !== undefined) {
                statusCounts[status] += 1;
            }
        });
        const colorMap = {
            'READY_NOW': '#10b981',
            'READY_6_MONTHS': '#3b82f6',
            'READY_1_YEAR': '#f59e0b',
            'NOT_READY': '#ef4444'
        };
        const labelMap = {
            'READY_NOW': 'Ready Now',
            'READY_6_MONTHS': 'Ready in 6 Months',
            'READY_1_YEAR': 'Ready in 1 Year',
            'NOT_READY': 'Not Ready'
        };
        return Object.entries(statusCounts).map(([status, count]) => ({
            status: labelMap[status] || status,
            count,
            color: colorMap[status] || '#6b7280'
        }));
    }
    async getRecentActivity() {
        const activities = [];
        // Get recent training completions
        const recentTrainings = await prisma_1.default.training.findMany({
            where: {
                status: 'COMPLETED',
                endDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
            },
            orderBy: { endDate: 'desc' },
            take: 3,
            include: {
                _count: { select: { enrollments: true } }
            }
        });
        recentTrainings.forEach(training => {
            activities.push({
                id: training.id,
                type: 'training',
                message: `${training.title} completed by ${training._count.enrollments} participants`,
                time: this.getRelativeTime(training.endDate),
                status: 'completed'
            });
        });
        // Get recent course completions
        const recentEnrollments = await prisma_1.default.enrollment.findMany({
            where: {
                status: 'COMPLETED',
                completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { completedAt: 'desc' },
            take: 3,
            include: {
                employee: { select: { name: true } },
                course: { select: { title: true } }
            }
        });
        recentEnrollments.forEach(enrollment => {
            activities.push({
                id: enrollment.id,
                type: 'learning',
                message: `${enrollment.employee.name} completed "${enrollment.course.title}"`,
                time: this.getRelativeTime(enrollment.completedAt),
                status: 'completed'
            });
        });
        // Get upcoming trainings
        const upcomingTrainings = await prisma_1.default.training.findMany({
            where: {
                status: 'OPEN',
                startDate: { gte: new Date() }
            },
            orderBy: { startDate: 'asc' },
            take: 2
        });
        upcomingTrainings.forEach(training => {
            activities.push({
                id: training.id,
                type: 'training',
                message: `${training.title} scheduled to start`,
                time: this.getRelativeTime(training.startDate),
                status: 'scheduled'
            });
        });
        // Get recent succession updates
        const recentTalentPool = await prisma_1.default.talentPool.findMany({
            where: {
                updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { updatedAt: 'desc' },
            take: 2,
            include: {
                employee: { select: { name: true } },
                role: {
                    include: {
                        jobRole: { select: { name: true } }
                    }
                }
            }
        });
        recentTalentPool.forEach(tp => {
            activities.push({
                id: tp.id,
                type: 'succession',
                message: `${tp.employee.name} updated as successor for ${tp.role.jobRole.name}`,
                time: this.getRelativeTime(tp.updatedAt),
                status: 'pending'
            });
        });
        // Sort by time and return top 8
        return activities.slice(0, 8);
    }
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffMs < 0) {
            // Future date
            const futureDays = Math.abs(diffDays);
            if (futureDays === 0)
                return 'Today';
            if (futureDays === 1)
                return 'Tomorrow';
            return `In ${futureDays} days`;
        }
        if (diffMins < 60)
            return `${diffMins} minutes ago`;
        if (diffHours < 24)
            return `${diffHours} hours ago`;
        if (diffDays === 1)
            return '1 day ago';
        return `${diffDays} days ago`;
    }
}
exports.dashboardService = new DashboardService();

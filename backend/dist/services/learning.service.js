"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
const fileUpload_service_1 = require("./fileUpload.service");
const competency_service_1 = require("./competency.service");
const certificateGenerator_1 = require("../utils/certificateGenerator");
const competencyService = new competency_service_1.CompetencyService();
class LearningService {
    // ============================================
    // COURSE MANAGEMENT
    // ============================================
    async createCourseService(data, userId) {
        // Validate title
        if (!data.title || !data.title.trim()) {
            throw new appError_1.AppError('Course title is required', 400);
        }
        // Generate courseId automatically
        const lastCourse = await prisma_1.default.course.findFirst({
            where: {
                courseId: {
                    startsWith: 'CRS-'
                }
            },
            orderBy: {
                courseId: 'desc'
            }
        });
        let courseId;
        if (lastCourse) {
            const lastNumber = parseInt(lastCourse.courseId.replace('CRS-', '') || '0');
            courseId = `CRS-${String(lastNumber + 1).padStart(6, '0')}`;
        }
        else {
            courseId = 'CRS-000001';
        }
        // Check for duplicate courseId (shouldn't happen with auto-generation, but check anyway)
        const existingCourse = await prisma_1.default.course.findUnique({
            where: { courseId }
        });
        if (existingCourse) {
            // If duplicate found, generate next number
            const lastNumber = parseInt(courseId.replace('CRS-', ''));
            courseId = `CRS-${String(lastNumber + 1).padStart(6, '0')}`;
        }
        // Validate category if provided (and not empty string)
        if (data.categoryId && data.categoryId.trim() !== '') {
            const category = await prisma_1.default.courseCategory.findUnique({
                where: { id: data.categoryId }
            });
            if (!category) {
                throw new appError_1.AppError('Course category not found', 404);
            }
        }
        // Validate competencies if provided
        if (data.taggedCompetencies && data.taggedCompetencies.length > 0) {
            await this.validateCourseCompetencies(data.taggedCompetencies);
        }
        // Validate status
        const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
        const status = (data.status || 'DRAFT').toUpperCase();
        if (!validStatuses.includes(status)) {
            throw new appError_1.AppError('Invalid course status', 400);
        }
        return prisma_1.default.course.create({
            data: {
                courseId,
                title: data.title,
                description: data.description,
                categoryId: data.categoryId && data.categoryId.trim() !== '' ? data.categoryId : null,
                taggedCompetencies: data.taggedCompetencies || [],
                status: status,
                duration: data.duration,
                estimatedHours: data.estimatedHours,
                isRequired: data.isRequired || false,
                createdBy: userId,
            },
            include: {
                category: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
    }
    async getCoursesService(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.status) {
            where.status = filters.status.toUpperCase();
        }
        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }
        if (filters?.competencyId) {
            where.taggedCompetencies = {
                has: filters.competencyId
            };
        }
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { courseId: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        // Fetch courses and filter out null courseIds in JavaScript
        // This handles data integrity issues where some courses might have null courseId
        // We use a try-catch to handle Prisma errors gracefully
        let allCourses = [];
        let totalCount = 0;
        try {
            // Try to fetch all courses matching the where clause
            // We'll filter out invalid ones in JavaScript
            const [coursesRaw, countRaw] = await Promise.all([
                prisma_1.default.course.findMany({
                    where,
                    skip: 0,
                    take: limit * 10, // Fetch more to account for filtering
                    include: {
                        category: true,
                        materials: {
                            orderBy: { order: 'asc' }
                        },
                        quizzes: {
                            include: {
                                questions: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        },
                        enrollments: {
                            select: {
                                id: true,
                                status: true,
                            }
                        },
                        creator: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                prisma_1.default.course.findMany({
                    where,
                    select: { id: true, courseId: true }
                })
            ]);
            // Filter out courses with null/empty courseId (data integrity issue)
            allCourses = coursesRaw.filter((course) => course.courseId != null &&
                course.courseId !== '' &&
                typeof course.courseId === 'string' &&
                course.courseId.trim() !== '');
            totalCount = countRaw.filter((course) => course.courseId != null &&
                course.courseId !== '' &&
                typeof course.courseId === 'string' &&
                course.courseId.trim() !== '').length;
        }
        catch (error) {
            // If Prisma throws an error (e.g., due to null courseId in database),
            // try to fetch courses one by one or return empty results
            console.error('Error fetching courses:', error.message);
            // Try a simpler query without includes to get valid course IDs first
            try {
                const simpleCourses = await prisma_1.default.course.findMany({
                    where: {
                        ...where,
                        courseId: { not: null } // Try to filter nulls
                    },
                    select: { id: true, courseId: true },
                    take: limit * 10
                });
                const validIds = simpleCourses
                    .filter((c) => c.courseId != null && c.courseId !== '')
                    .map((c) => c.id)
                    .slice(0, limit);
                if (validIds.length > 0) {
                    allCourses = await prisma_1.default.course.findMany({
                        where: { id: { in: validIds } },
                        include: {
                            category: true,
                            materials: { orderBy: { order: 'asc' } },
                            quizzes: {
                                include: {
                                    questions: { orderBy: { order: 'asc' } }
                                }
                            },
                            enrollments: {
                                select: { id: true, status: true }
                            },
                            creator: {
                                select: { id: true, name: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    });
                }
                totalCount = validIds.length;
            }
            catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                allCourses = [];
                totalCount = 0;
            }
        }
        // Apply pagination after filtering
        const courses = allCourses.slice(skip, skip + limit);
        return {
            courses,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }
        };
    }
    async getCourseByIdService(id) {
        const course = await prisma_1.default.course.findUnique({
            where: { id },
            include: {
                category: true,
                materials: {
                    orderBy: { order: 'asc' }
                },
                quizzes: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                enrollments: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                updater: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        return course;
    }
    async updateCourseService(id, data, userId) {
        const course = await prisma_1.default.course.findUnique({
            where: { id }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        // Validate category if provided (and not empty string)
        if (data.categoryId && data.categoryId.trim() !== '') {
            const category = await prisma_1.default.courseCategory.findUnique({
                where: { id: data.categoryId }
            });
            if (!category) {
                throw new appError_1.AppError('Course category not found', 404);
            }
        }
        // Validate competencies if provided
        if (data.taggedCompetencies && data.taggedCompetencies.length > 0) {
            await this.validateCourseCompetencies(data.taggedCompetencies);
        }
        // Validate status if provided
        if (data.status) {
            const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
            const status = data.status.toUpperCase();
            if (!validStatuses.includes(status)) {
                throw new appError_1.AppError('Invalid course status', 400);
            }
        }
        // Clean categoryId - convert empty string to null
        const cleanedData = {
            ...data,
            categoryId: data.categoryId && data.categoryId.trim() !== '' ? data.categoryId : null,
            status: data.status ? data.status.toUpperCase() : undefined,
            updatedBy: userId,
        };
        return prisma_1.default.course.update({
            where: { id },
            data: cleanedData,
            include: {
                category: true,
                materials: {
                    orderBy: { order: 'asc' }
                },
                quizzes: true,
            }
        });
    }
    async deleteCourseService(id) {
        const course = await prisma_1.default.course.findUnique({
            where: { id },
            include: {
                enrollments: true,
            }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        // Check if course has active enrollments
        const activeEnrollments = course.enrollments.filter(e => e.status === 'IN_PROGRESS' || e.status === 'NOT_STARTED');
        if (activeEnrollments.length > 0) {
            throw new appError_1.AppError(`Cannot delete course with ${activeEnrollments.length} active enrollment(s). Please archive instead.`, 400);
        }
        // Delete related materials, quizzes, and attempts
        await prisma_1.default.courseMaterial.deleteMany({
            where: { courseId: id }
        });
        const quizzes = await prisma_1.default.quiz.findMany({
            where: { courseId: id },
            select: { id: true }
        });
        for (const quiz of quizzes) {
            await prisma_1.default.quizQuestion.deleteMany({
                where: { quizId: quiz.id }
            });
            await prisma_1.default.quizAttempt.deleteMany({
                where: { quizId: quiz.id }
            });
        }
        await prisma_1.default.quiz.deleteMany({
            where: { courseId: id }
        });
        return prisma_1.default.course.delete({
            where: { id }
        });
    }
    async validateCourseCompetencies(competencyIds) {
        const competencies = await prisma_1.default.competency.findMany({
            where: {
                id: { in: competencyIds }
            },
            select: { id: true }
        });
        if (competencies.length !== competencyIds.length) {
            throw new appError_1.AppError('One or more competency IDs are invalid', 400);
        }
        return true;
    }
    // ============================================
    // MATERIAL MANAGEMENT
    // ============================================
    async addMaterialService(data) {
        const course = await prisma_1.default.course.findUnique({
            where: { id: data.courseId }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        // Validate material type
        const validTypes = ['PDF', 'FILE', 'VIDEO', 'YOUTUBE'];
        const type = data.type.toUpperCase();
        if (!validTypes.includes(type)) {
            throw new appError_1.AppError('Invalid material type', 400);
        }
        // Validate URL format for YouTube
        if (type === 'YOUTUBE' && !this.isValidYouTubeUrl(data.url)) {
            throw new appError_1.AppError('Invalid YouTube URL format', 400);
        }
        // Validate URL format for PDF links
        if (type === 'PDF' && !this.isValidUrl(data.url)) {
            throw new appError_1.AppError('Invalid PDF URL format', 400);
        }
        return prisma_1.default.courseMaterial.create({
            data: {
                courseId: data.courseId,
                type: type,
                url: data.url,
                title: data.title,
                description: data.description,
                order: data.order || 0,
            }
        });
    }
    async uploadCourseMaterial(courseId, file) {
        const course = await prisma_1.default.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        // Validate file
        (0, fileUpload_service_1.validateFileType)(file);
        (0, fileUpload_service_1.validateFileSize)(file, 100 * 1024 * 1024); // 100MB max
        // Determine material type based on file
        let materialType = 'FILE';
        if (file.mimetype === 'application/pdf') {
            materialType = 'PDF';
        }
        else if (file.mimetype.startsWith('video/')) {
            materialType = 'VIDEO';
        }
        // Upload file
        const uploadResult = await (0, fileUpload_service_1.uploadFile)(file.buffer, 'course-materials', file.mimetype);
        return prisma_1.default.courseMaterial.create({
            data: {
                courseId,
                type: materialType,
                url: uploadResult.url,
                title: file.originalname,
                order: 0,
            }
        });
    }
    async updateMaterialService(id, data) {
        const material = await prisma_1.default.courseMaterial.findUnique({
            where: { id }
        });
        if (!material) {
            throw new appError_1.AppError('Material not found', 404);
        }
        return prisma_1.default.courseMaterial.update({
            where: { id },
            data
        });
    }
    async deleteMaterialService(id) {
        const material = await prisma_1.default.courseMaterial.findUnique({
            where: { id }
        });
        if (!material) {
            throw new appError_1.AppError('Material not found', 404);
        }
        // Delete file from Cloudinary if it's an uploaded file
        if (material.type === 'FILE' || material.type === 'VIDEO' || material.type === 'PDF') {
            try {
                // Extract public_id from URL if possible
                const urlParts = material.url.split('/');
                const publicId = urlParts[urlParts.length - 1].split('.')[0];
                await (0, fileUpload_service_1.deleteFile)(publicId, material.type === 'PDF' ? 'raw' : 'image');
            }
            catch (error) {
                // Continue even if file deletion fails
                console.error('Failed to delete file from storage:', error);
            }
        }
        return prisma_1.default.courseMaterial.delete({
            where: { id }
        });
    }
    // ============================================
    // QUIZ MANAGEMENT
    // ============================================
    async createQuizService(data) {
        const course = await prisma_1.default.course.findUnique({
            where: { id: data.courseId }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        // Validate questions
        if (!data.questions || data.questions.length === 0) {
            throw new appError_1.AppError('Quiz must have at least one question', 400);
        }
        // Validate passing score
        if (data.passingScore < 0 || data.passingScore > 100) {
            throw new appError_1.AppError('Passing score must be between 0 and 100', 400);
        }
        // Validate questions
        for (const question of data.questions) {
            if (!question.question || !question.question.trim()) {
                throw new appError_1.AppError('Question text is required', 400);
            }
            if (question.points <= 0) {
                throw new appError_1.AppError('Question points must be positive', 400);
            }
            const validTypes = ['MULTIPLE_CHOICE', 'TRUE_FALSE'];
            const questionType = question.questionType.toUpperCase();
            if (!validTypes.includes(questionType)) {
                throw new appError_1.AppError('Invalid question type', 400);
            }
            if (questionType === 'MULTIPLE_CHOICE') {
                if (!question.choices || question.choices.length < 2) {
                    throw new appError_1.AppError('Multiple choice questions must have at least 2 choices', 400);
                }
                const correctChoices = question.choices.filter(c => c.isCorrect);
                if (correctChoices.length !== 1) {
                    throw new appError_1.AppError('Multiple choice questions must have exactly one correct answer', 400);
                }
            }
        }
        // Create quiz with questions
        return prisma_1.default.quiz.create({
            data: {
                courseId: data.courseId,
                title: data.title,
                description: data.description,
                totalPoints: data.totalPoints,
                passingScore: data.passingScore,
                timeLimit: data.timeLimit,
                allowRetake: data.allowRetake || false,
                questions: {
                    create: data.questions.map(q => ({
                        question: q.question,
                        questionType: q.questionType.toUpperCase(),
                        points: q.points,
                        order: q.order || 0,
                        choices: q.choices,
                        correctAnswer: q.correctAnswer,
                    }))
                }
            },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    async updateQuizService(id, data) {
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id },
            include: {
                attempts: true
            }
        });
        if (!quiz) {
            throw new appError_1.AppError('Quiz not found', 404);
        }
        // Check if quiz has attempts (if locked, prevent major changes)
        if (quiz.attempts.length > 0 && (data.totalPoints || data.passingScore)) {
            throw new appError_1.AppError('Cannot modify quiz points or passing score after attempts have been made', 400);
        }
        // Update quiz
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.totalPoints)
            updateData.totalPoints = data.totalPoints;
        if (data.passingScore !== undefined)
            updateData.passingScore = data.passingScore;
        if (data.timeLimit !== undefined)
            updateData.timeLimit = data.timeLimit;
        if (data.allowRetake !== undefined)
            updateData.allowRetake = data.allowRetake;
        // Handle questions update
        if (data.questions) {
            // Delete existing questions
            await prisma_1.default.quizQuestion.deleteMany({
                where: { quizId: id }
            });
            // Create new questions
            await prisma_1.default.quizQuestion.createMany({
                data: data.questions.map(q => ({
                    quizId: id,
                    question: q.question,
                    questionType: q.questionType.toUpperCase(),
                    points: q.points,
                    order: q.order || 0,
                    choices: q.choices,
                    correctAnswer: q.correctAnswer,
                }))
            });
        }
        return prisma_1.default.quiz.update({
            where: { id },
            data: updateData,
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    async deleteQuizService(id) {
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id }
        });
        if (!quiz) {
            throw new appError_1.AppError('Quiz not found', 404);
        }
        // Delete questions and attempts
        await prisma_1.default.quizQuestion.deleteMany({
            where: { quizId: id }
        });
        await prisma_1.default.quizAttempt.deleteMany({
            where: { quizId: id }
        });
        return prisma_1.default.quiz.delete({
            where: { id }
        });
    }
    async getQuizService(id, enrollmentId) {
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });
        if (!quiz) {
            throw new appError_1.AppError('Quiz not found', 404);
        }
        // Check if user has already attempted this quiz
        let existingAttempt = null;
        if (enrollmentId) {
            existingAttempt = await prisma_1.default.quizAttempt.findFirst({
                where: {
                    enrollmentId,
                    quizId: id
                }
            });
            // If attempt exists and is locked, don't return correct answers
            if (existingAttempt && existingAttempt.locked) {
                // Remove correct answers from questions
                const questionsWithoutAnswers = quiz.questions.map((q) => {
                    const choices = Array.isArray(q.choices) ? q.choices : [];
                    return {
                        ...q,
                        correctAnswer: undefined,
                        choices: choices.map((c) => ({
                            text: c.text,
                            isCorrect: undefined
                        }))
                    };
                });
                return {
                    ...quiz,
                    questions: questionsWithoutAnswers,
                    existingAttempt
                };
            }
        }
        return {
            ...quiz,
            existingAttempt
        };
    }
    // ============================================
    // ENROLLMENT MANAGEMENT
    // ============================================
    async enrollEmployeeService(data) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: data.employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        const course = await prisma_1.default.course.findUnique({
            where: { id: data.courseId }
        });
        if (!course) {
            throw new appError_1.AppError('Course not found', 404);
        }
        // Check if course is published
        if (course.status !== 'PUBLISHED') {
            throw new appError_1.AppError('Cannot enroll in a course that is not published', 400);
        }
        // Check for duplicate enrollment
        const existingEnrollment = await prisma_1.default.enrollment.findFirst({
            where: {
                employeeId: data.employeeId,
                courseId: data.courseId
            }
        });
        if (existingEnrollment) {
            throw new appError_1.AppError('Employee is already enrolled in this course', 400);
        }
        return prisma_1.default.enrollment.create({
            data: {
                employeeId: data.employeeId,
                courseId: data.courseId,
                enrollmentType: 'MANUAL',
                isRequired: data.isRequired || false,
                status: 'NOT_STARTED',
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    }
                }
            }
        });
    }
    async autoEnrollBasedOnGapService(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Get employee's gap analysis
        const gapAnalyses = await prisma_1.default.gapAnalysis.findMany({
            where: {
                employeeId,
                gap: { gt: 0 } // Only gaps > 0
            },
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        if (gapAnalyses.length === 0) {
            return {
                message: 'No skill gaps found for auto-enrollment',
                enrollments: []
            };
        }
        // Get competency IDs with gaps
        const gapCompetencyIds = gapAnalyses.map(ga => ga.competencyId);
        // Find courses that match these competencies
        const courses = await prisma_1.default.course.findMany({
            where: {
                status: 'PUBLISHED',
                taggedCompetencies: {
                    hasSome: gapCompetencyIds
                }
            }
        });
        if (courses.length === 0) {
            return {
                message: 'No courses found matching skill gaps',
                enrollments: []
            };
        }
        // Create enrollments for matching courses
        const enrollments = [];
        for (const course of courses) {
            // Check if already enrolled
            const existing = await prisma_1.default.enrollment.findFirst({
                where: {
                    employeeId,
                    courseId: course.id
                }
            });
            if (!existing) {
                const enrollment = await prisma_1.default.enrollment.create({
                    data: {
                        employeeId,
                        courseId: course.id,
                        enrollmentType: 'AUTO',
                        isRequired: true,
                        status: 'NOT_STARTED',
                    },
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    }
                });
                enrollments.push(enrollment);
            }
        }
        return {
            message: `Auto-enrolled in ${enrollments.length} course(s)`,
            enrollments
        };
    }
    async deleteEnrollmentService(enrollmentId) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                quizAttempts: true,
                progressRecords: true,
                certificate: true
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        // Delete related records
        await prisma_1.default.quizAttempt.deleteMany({
            where: { enrollmentId }
        });
        await prisma_1.default.employeeCourseProgress.deleteMany({
            where: { enrollmentId }
        });
        if (enrollment.certificate) {
            await prisma_1.default.certificate.delete({
                where: { id: enrollment.certificate.id }
            });
        }
        return prisma_1.default.enrollment.delete({
            where: { id: enrollmentId }
        });
    }
    async getEmployeeEnrollmentsService(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        return prisma_1.default.enrollment.findMany({
            where: { employeeId },
            include: {
                course: {
                    include: {
                        category: true,
                        materials: {
                            select: {
                                id: true,
                                title: true,
                            }
                        },
                        quizzes: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    }
                },
                quizAttempts: {
                    include: {
                        quiz: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    }
                },
                progressRecords: {
                    include: {
                        material: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    }
                },
                certificate: true
            },
            orderBy: {
                enrolledAt: 'desc'
            }
        });
    }
    async updateEnrollmentProgressService(enrollmentId) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        materials: true,
                        quizzes: true
                    }
                },
                progressRecords: true,
                quizAttempts: true
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        // Calculate progress
        const progress = await this.calculateProgressService(enrollmentId);
        return prisma_1.default.enrollment.update({
            where: { id: enrollmentId },
            data: {
                completionPercentage: progress.percentage,
                lastActivity: new Date(),
            }
        });
    }
    async completeCourseService(enrollmentId) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        quizzes: true
                    }
                },
                quizAttempts: true // Get all attempts to calculate final grade
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        // Check if all quizzes are passed
        const totalQuizzes = enrollment.course.quizzes.length;
        const passedQuizzes = enrollment.quizAttempts.filter((attempt) => attempt.passed).length;
        if (totalQuizzes > 0 && passedQuizzes < totalQuizzes) {
            throw new appError_1.AppError('Cannot complete course: not all quizzes are passed', 400);
        }
        // Calculate final grade (average of quiz scores)
        let finalGrade = 0;
        if (enrollment.quizAttempts.length > 0) {
            const totalScore = enrollment.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
            finalGrade = totalScore / enrollment.quizAttempts.length;
        }
        else {
            finalGrade = 100; // If no quizzes, consider it 100%
        }
        // Update enrollment
        const updated = await prisma_1.default.enrollment.update({
            where: { id: enrollmentId },
            data: {
                status: 'COMPLETED',
                completionPercentage: 100,
                finalGrade,
                completedAt: new Date(),
            }
        });
        // Update competencies based on quiz scores
        // taggedCompetencies is a field (array), not a relation, so access it directly
        if (enrollment.course.taggedCompetencies && enrollment.course.taggedCompetencies.length > 0 && finalGrade >= 70) {
            await this.updateCompetencyFromCourse(enrollment.employeeId, enrollment.course.taggedCompetencies, finalGrade);
        }
        return updated;
    }
    // ============================================
    // CONTENT DELIVERY
    // ============================================
    async getCourseContentService(enrollmentId) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        materials: {
                            orderBy: { order: 'asc' }
                        },
                        quizzes: {
                            include: {
                                questions: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                },
                progressRecords: true,
                quizAttempts: true
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        return enrollment;
    }
    async submitQuizAnswerService(enrollmentId, quizId, answers) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true
            }
        });
        if (!quiz) {
            throw new appError_1.AppError('Quiz not found', 404);
        }
        // Check if already attempted and locked
        const existingAttempt = await prisma_1.default.quizAttempt.findFirst({
            where: {
                enrollmentId,
                quizId
            }
        });
        if (existingAttempt && existingAttempt.locked && !quiz.allowRetake) {
            throw new appError_1.AppError('Quiz has already been submitted and cannot be retaken', 400);
        }
        // Validate answers
        if (answers.length !== quiz.questions.length) {
            throw new appError_1.AppError('Number of answers must match number of questions', 400);
        }
        // Score the quiz
        let totalScore = 0;
        let totalPoints = 0;
        const scoredAnswers = [];
        for (const question of quiz.questions) {
            const answer = answers.find(a => a.questionId === question.id);
            if (!answer) {
                throw new appError_1.AppError(`Answer missing for question ${question.id}`, 400);
            }
            const isCorrect = answer.answer === question.correctAnswer;
            const points = isCorrect ? question.points : 0;
            totalScore += points;
            totalPoints += question.points;
            scoredAnswers.push({
                questionId: question.id,
                answer: answer.answer,
                isCorrect,
                points
            });
        }
        const percentageScore = (totalScore / totalPoints) * 100;
        const passed = percentageScore >= quiz.passingScore;
        // Create or update attempt
        if (existingAttempt && quiz.allowRetake) {
            // Update existing attempt
            return prisma_1.default.quizAttempt.update({
                where: { id: existingAttempt.id },
                data: {
                    answers: scoredAnswers,
                    score: percentageScore,
                    totalPoints,
                    passed,
                    submittedAt: new Date(),
                    locked: true,
                }
            });
        }
        else {
            // Create new attempt
            const attempt = await prisma_1.default.quizAttempt.create({
                data: {
                    enrollmentId,
                    quizId,
                    answers: scoredAnswers,
                    score: percentageScore,
                    totalPoints,
                    passed,
                    locked: true,
                }
            });
            // Update enrollment progress
            await this.updateEnrollmentProgressService(enrollmentId);
            return attempt;
        }
    }
    async getQuizAttemptService(enrollmentId, quizId) {
        return prisma_1.default.quizAttempt.findFirst({
            where: {
                enrollmentId,
                quizId
            },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        });
    }
    async markMaterialCompleteService(enrollmentId, materialId, timeSpent) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        const material = await prisma_1.default.courseMaterial.findUnique({
            where: { id: materialId }
        });
        if (!material) {
            throw new appError_1.AppError('Material not found', 404);
        }
        // Check if already completed
        const existing = await prisma_1.default.employeeCourseProgress.findFirst({
            where: {
                enrollmentId,
                materialId
            }
        });
        if (existing) {
            return prisma_1.default.employeeCourseProgress.update({
                where: { id: existing.id },
                data: {
                    completed: true,
                    completedAt: new Date(),
                    timeSpent: timeSpent || existing.timeSpent,
                    lastAccessedAt: new Date(),
                }
            });
        }
        else {
            const progress = await prisma_1.default.employeeCourseProgress.create({
                data: {
                    enrollmentId,
                    materialId,
                    completed: true,
                    completedAt: new Date(),
                    timeSpent: timeSpent || 0,
                    lastAccessedAt: new Date(),
                }
            });
            // Update enrollment progress
            await this.updateEnrollmentProgressService(enrollmentId);
            return progress;
        }
    }
    // ============================================
    // PROGRESS TRACKING
    // ============================================
    async calculateProgressService(enrollmentId) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        materials: true,
                        quizzes: true
                    }
                },
                progressRecords: {
                    where: {
                        completed: true
                    }
                },
                quizAttempts: {
                    where: {
                        passed: true
                    }
                }
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        const totalMaterials = enrollment.course.materials.length;
        const completedMaterials = enrollment.progressRecords.length;
        const materialsProgress = totalMaterials > 0
            ? (completedMaterials / totalMaterials) * 50
            : 0;
        const totalQuizzes = enrollment.course.quizzes.length;
        const passedQuizzes = enrollment.quizAttempts.length;
        const quizzesProgress = totalQuizzes > 0
            ? (passedQuizzes / totalQuizzes) * 50
            : 0;
        const totalProgress = materialsProgress + quizzesProgress;
        return {
            percentage: Math.round(totalProgress),
            materialsProgress: Math.round(materialsProgress * 2), // Convert back to percentage
            quizzesProgress: Math.round(quizzesProgress * 2), // Convert back to percentage
            completedMaterials,
            totalMaterials,
            passedQuizzes,
            totalQuizzes
        };
    }
    async getEmployeeProgressService(employeeId) {
        const enrollments = await this.getEmployeeEnrollmentsService(employeeId);
        const progressData = await Promise.all(enrollments.map(async (enrollment) => {
            const progress = await this.calculateProgressService(enrollment.id);
            return {
                enrollment,
                progress
            };
        }));
        return progressData;
    }
    // ============================================
    // COMPETENCY INTEGRATION
    // ============================================
    async updateCompetencyFromCourse(employeeId, competencyIds, quizScore) {
        // Calculate competency increase based on quiz score
        // Formula: (quizScore / 100) * gap
        for (const competencyId of competencyIds) {
            // Get competency to get weight
            const competency = await prisma_1.default.competency.findUnique({
                where: { id: competencyId }
            });
            if (!competency) {
                continue;
            }
            // Get employee competency
            let employeeCompetency = await prisma_1.default.employeeCompetency.findFirst({
                where: {
                    employeeId,
                    competencyId
                },
                include: {
                    competency: true
                }
            });
            // Get gap analysis
            const gapAnalysis = await prisma_1.default.gapAnalysis.findFirst({
                where: {
                    employeeId,
                    competencyId
                }
            });
            if (!gapAnalysis || gapAnalysis.gap <= 0) {
                continue; // No gap to fill
            }
            // Calculate increase (0.1 to 1.0 level increase based on quiz score)
            const increase = (quizScore / 100) * gapAnalysis.gap;
            const newLevel = Math.min(5, Math.max(1, gapAnalysis.currentLevel + increase));
            if (!employeeCompetency) {
                // Create new employee competency
                const newRating = Math.round(newLevel);
                const finalScore = (newRating * competency.weight) / 100;
                employeeCompetency = await prisma_1.default.employeeCompetency.create({
                    data: {
                        employeeId,
                        competencyId,
                        managerRating: newRating,
                        finalScore,
                    },
                    include: {
                        competency: true
                    }
                });
            }
            else {
                // Update existing
                const newRating = Math.round(newLevel);
                const weight = employeeCompetency.competency.weight;
                const finalScore = (newRating * weight) / 100;
                await prisma_1.default.employeeCompetency.update({
                    where: { id: employeeCompetency.id },
                    data: {
                        managerRating: newRating,
                        finalScore,
                    }
                });
            }
            // Recalculate gap analysis
            await competencyService.runGapAnalysis(employeeId, competencyId);
        }
    }
    async getRecommendedCoursesService(employeeId) {
        const gapAnalyses = await prisma_1.default.gapAnalysis.findMany({
            where: {
                employeeId,
                gap: { gt: 0 }
            },
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
        const gapCompetencyIds = gapAnalyses.map(ga => ga.competencyId);
        if (gapCompetencyIds.length === 0) {
            return [];
        }
        return prisma_1.default.course.findMany({
            where: {
                status: 'PUBLISHED',
                taggedCompetencies: {
                    hasSome: gapCompetencyIds
                }
            },
            include: {
                category: true,
                enrollments: {
                    where: {
                        employeeId
                    },
                    select: {
                        id: true,
                        status: true,
                    }
                }
            }
        });
    }
    // ============================================
    // CERTIFICATE GENERATION
    // ============================================
    async generateCertificateService(enrollmentId) {
        const enrollment = await prisma_1.default.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                employee: true,
                course: true
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        if (enrollment.status !== 'COMPLETED') {
            throw new appError_1.AppError('Course must be completed before generating certificate', 400);
        }
        // Check if certificate already exists
        const existing = await prisma_1.default.certificate.findUnique({
            where: { enrollmentId }
        });
        if (existing) {
            return existing;
        }
        // Generate certificate number
        const certificateNumber = `CERT-${enrollment.course.courseId}-${enrollment.employee.employeeId}-${Date.now()}`;
        // Generate and upload certificate PDF
        const pdfUrl = await (0, certificateGenerator_1.generateAndUploadCertificate)({
            employeeName: enrollment.employee.name,
            courseTitle: enrollment.course.title,
            courseId: enrollment.course.courseId,
            completionDate: enrollment.completedAt || new Date(),
            certificateNumber,
            finalGrade: enrollment.finalGrade || undefined,
        });
        return prisma_1.default.certificate.create({
            data: {
                enrollmentId,
                certificateNumber,
                pdfUrl,
            }
        });
    }
    async getCertificateService(enrollmentId) {
        return prisma_1.default.certificate.findUnique({
            where: { enrollmentId },
            include: {
                enrollment: {
                    include: {
                        employee: true,
                        course: true
                    }
                }
            }
        });
    }
    // ============================================
    // REPORTING
    // ============================================
    async getCompletionReport(filters) {
        const where = {
            status: 'COMPLETED'
        };
        if (filters?.employeeId) {
            where.employeeId = filters.employeeId;
        }
        if (filters?.courseId) {
            where.courseId = filters.courseId;
        }
        if (filters?.startDate || filters?.endDate) {
            where.completedAt = {};
            if (filters.startDate)
                where.completedAt.gte = filters.startDate;
            if (filters.endDate)
                where.completedAt.lte = filters.endDate;
        }
        const enrollments = await prisma_1.default.enrollment.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        });
        // Filter by department if provided
        let filteredEnrollments = enrollments;
        if (filters?.department) {
            filteredEnrollments = enrollments.filter(e => e.employee.department === filters.department);
        }
        const totalCompleted = filteredEnrollments.length;
        const totalPassed = filteredEnrollments.filter(e => (e.finalGrade || 0) >= 70).length;
        const totalFailed = totalCompleted - totalPassed;
        const averageScore = filteredEnrollments.length > 0
            ? filteredEnrollments.reduce((sum, e) => sum + (e.finalGrade || 0), 0) / filteredEnrollments.length
            : 0;
        return {
            totalCompleted,
            totalPassed,
            totalFailed,
            averageScore: Math.round(averageScore * 100) / 100,
            enrollments: filteredEnrollments
        };
    }
    async getLearningHoursReport(filters) {
        const where = {};
        if (filters?.employeeId) {
            where.employeeId = filters.employeeId;
        }
        if (filters?.startDate || filters?.endDate) {
            where.enrolledAt = {};
            if (filters.startDate)
                where.enrolledAt.gte = filters.startDate;
            if (filters.endDate)
                where.enrolledAt.lte = filters.endDate;
        }
        const enrollments = await prisma_1.default.enrollment.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        estimatedHours: true,
                    }
                },
                progressRecords: {
                    select: {
                        timeSpent: true,
                    }
                }
            }
        });
        // Filter by department if provided
        let filteredEnrollments = enrollments;
        if (filters?.department) {
            filteredEnrollments = enrollments.filter(e => e.employee.department === filters.department);
        }
        // Calculate hours per employee
        const employeeHours = {};
        for (const enrollment of filteredEnrollments) {
            const employeeId = enrollment.employeeId;
            if (!employeeHours[employeeId]) {
                employeeHours[employeeId] = {
                    employee: enrollment.employee,
                    totalHours: 0
                };
            }
            // Use actual time spent if available, otherwise use estimated hours
            const timeSpent = enrollment.progressRecords.reduce((sum, pr) => sum + pr.timeSpent, 0);
            const hours = timeSpent > 0 ? timeSpent / 60 : (enrollment.course.estimatedHours || 0);
            employeeHours[employeeId].totalHours += hours;
        }
        // Calculate hours per department
        const departmentHours = {};
        for (const enrollment of filteredEnrollments) {
            const dept = enrollment.employee.department || 'Unknown';
            departmentHours[dept] = (departmentHours[dept] || 0) + (enrollment.course.estimatedHours || 0);
        }
        return {
            employeeHours: Object.values(employeeHours),
            departmentHours,
            totalHours: Object.values(employeeHours).reduce((sum, e) => sum + e.totalHours, 0)
        };
    }
    async getCourseAnalytics() {
        const courses = await prisma_1.default.course.findMany({
            include: {
                enrollments: {
                    include: {
                        quizAttempts: true
                    }
                }
            }
        });
        const analytics = courses.map(course => {
            const totalEnrollments = course.enrollments.length;
            const completed = course.enrollments.filter(e => e.status === 'COMPLETED').length;
            const failed = course.enrollments.filter(e => e.status === 'FAILED').length;
            const inProgress = course.enrollments.filter(e => e.status === 'IN_PROGRESS').length;
            // Calculate average score
            const completedEnrollments = course.enrollments.filter(e => e.finalGrade !== null);
            const averageScore = completedEnrollments.length > 0
                ? completedEnrollments.reduce((sum, e) => sum + (e.finalGrade || 0), 0) / completedEnrollments.length
                : 0;
            // Determine difficulty based on average score
            let difficulty = 'Easy';
            if (averageScore < 60)
                difficulty = 'Hard';
            else if (averageScore < 80)
                difficulty = 'Medium';
            return {
                course: {
                    id: course.id,
                    title: course.title,
                    courseId: course.courseId,
                },
                totalEnrollments,
                completed,
                failed,
                inProgress,
                averageScore: Math.round(averageScore * 100) / 100,
                difficulty,
                completionRate: totalEnrollments > 0 ? (completed / totalEnrollments) * 100 : 0
            };
        });
        // Sort by most enrolled
        const mostEnrolled = [...analytics].sort((a, b) => b.totalEnrollments - a.totalEnrollments);
        const mostCompleted = [...analytics].sort((a, b) => b.completed - a.completed);
        const mostFailed = [...analytics].sort((a, b) => b.failed - a.failed);
        return {
            all: analytics,
            mostEnrolled: mostEnrolled.slice(0, 10),
            mostCompleted: mostCompleted.slice(0, 10),
            mostFailed: mostFailed.slice(0, 10),
        };
    }
    // ============================================
    // UTILITY METHODS
    // ============================================
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url);
    }
}
exports.LearningService = LearningService;

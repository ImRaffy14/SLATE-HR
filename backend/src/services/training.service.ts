import prisma from '../config/prisma'

export class TrainingService {
  // =======================
  // Training Sessions
  // =======================
  async createTrainingSessionService(data: any, userId: any) {
    return await prisma.trainingSession.create({
      data: {
        courseId: data.courseId,
        date: new Date(data.date),
        time: data.time,
        location: data.location,
        trainer: data.instructor,
        duration: data.duration,
        title: data.title,
        description: data.description,
        capacity: Number(data.capacity),
        createdBy: userId,
        status: "Scheduled",

        records: {
          create: data.selectedEnrollees.map((employeeId: string) => ({
            employeeId,
            attendance: false,
          })),
        },
      },
      include: {
        records: {
          include: {
            employee: true,
          },
        },
      },
    });
  }

  async getAllTrainingSessionsService() {
    return await prisma.trainingSession.findMany({
      include: { course: true, records: { include: { employee: true } } },
    });
  }

  async getTrainingSessionByIdService(id: string) {
    return await prisma.trainingSession.findUnique({
      where: { id },
      include: { course: true, records: true },
    });
  }

  async updateTrainingSessionService(id: string, data: any, userId: any) {
    return await prisma.trainingSession.update({
      where: { id },
      data: {
        courseId: data.courseId,
        date: new Date(data.date),
        time: data.time,
        location: data.location,
        trainer: data.instructor,
        duration: data.duration,
        title: data.title,
        description: data.description,
        capacity: Number(data.capacity),
        status: data.status,
        updatedBy: userId,

        records: {
          deleteMany: {}, // delete all current records for this session
          create: data.selectedEnrollees.map((employeeId: string) => ({
            employeeId,
            attendance: false,
          })),
        },
      },
      include: {
        records: {
          include: {
            employee: true,
          },
        },
      },
    });
  }


  async deleteTrainingSessionService(id: string) {
    return await prisma.trainingSession.delete({
      where: { id },
    });
  }

  // =======================
  // Training Records
  // =======================
  async addTrainingRecordService(data: any) {
    return await prisma.trainingRecord.create({
      data,
    });
  }

  async getRecordsBySessionService(trainingId: string) {
    return await prisma.trainingRecord.findMany({
      where: { trainingId },
      include: { employee: true, training: true },
    });
  }

  async getRecordsByEmployeeService(employeeId: string) {
    return await prisma.trainingRecord.findMany({
      where: { employeeId },
      include: { training: true },
    });
  }

  async updateTrainingRecordService(id: string, data: any) {
    return await prisma.trainingRecord.update({
      where: { id },
      data,
    });
  }
}

import prisma from '../config/prisma'

export class TrainingService {
  // =======================
  // Training Sessions
  // =======================
  async createTrainingSessionService(data: any) {
    return await prisma.trainingSession.create({
      data,
    });
  }

  async getAllTrainingSessionsService() {
    return await prisma.trainingSession.findMany({
      include: { course: true, records: true },
    });
  }

  async getTrainingSessionByIdService(id: string) {
    return await prisma.trainingSession.findUnique({
      where: { id },
      include: { course: true, records: true },
    });
  }

  async updateTrainingSessionService(id: string, data: any) {
    return await prisma.trainingSession.update({
      where: { id },
      data,
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

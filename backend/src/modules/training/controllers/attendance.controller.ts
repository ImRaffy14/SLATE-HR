import { Request, Response } from 'express';
import { TrainingAttendanceService } from '../services/attendance.service';
import { asyncHandler } from '../../../utils/asyncHandler';

export class TrainingAttendanceController {
  private attendanceService = new TrainingAttendanceService();

  // Generate QR code
  generateQRCode = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.attendanceService.generateQRCode(req.params.id);
    res.status(200).json({ status: 'success', ...result });
  });

  // Scan QR code and mark attendance
  scanQRCode = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, qrData, location } = req.body;
    const attendance = await this.attendanceService.scanQRCode(req.params.id, employeeId, qrData, location);
    res.status(200).json({ status: 'success', attendance });
  });

  // Get attendance list
  getAttendanceList = asyncHandler(async (req: Request, res: Response) => {
    const attendanceList = await this.attendanceService.getAttendanceList(req.params.id);
    res.status(200).json({ status: 'success', attendanceList });
  });

  // Update attendance manually
  updateAttendance = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await this.attendanceService.updateAttendance(req.params.id, req.body);
    res.status(200).json({ status: 'success', attendance });
  });

  // Create or update attendance by enrollmentId (HR/Admin/Manager only)
  createOrUpdateAttendanceByEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { enrollmentId } = req.params;
    const { status, timeIn, location } = req.body;
    
    const attendance = await this.attendanceService.createOrUpdateAttendanceByEnrollment(enrollmentId, {
      status,
      timeIn: timeIn ? new Date(timeIn) : undefined,
      location
    });
    
    res.status(200).json({ status: 'success', attendance });
  });
}


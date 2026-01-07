import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrainingAttendance, AttendanceStatus } from "@/types/training";
import { Star } from "lucide-react";

interface AttendanceTableProps {
  attendanceList: Array<{
    enrollmentId: string;
    employee: {
      id: string;
      name: string;
      email: string;
      department?: string;
    };
    attendance: TrainingAttendance | {
      status: AttendanceStatus;
      timeIn: null;
      timeOut: null;
      isLocked: false;
      id?: string;
    };
    evaluation?: {
      employeePerformanceRating?: number;
      employeeImprovementComments?: string;
    };
  }>;
  onRateEmployee?: (enrollmentId: string, employeeName: string) => void;
  onUpdateAttendance?: (enrollmentId: string, attendanceId: string | undefined, status: AttendanceStatus) => void;
  canManageAttendance?: boolean;
}

export function AttendanceTable({ 
  attendanceList, 
  onRateEmployee,
  onUpdateAttendance,
  canManageAttendance = false
}: AttendanceTableProps) {
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "bg-green-500";
      case AttendanceStatus.LATE:
        return "bg-yellow-500";
      case AttendanceStatus.ABSENT:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const hasAttendanceId = (attendance: any): attendance is TrainingAttendance => {
    return 'id' in attendance && attendance.id !== undefined;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time In</TableHead>
          <TableHead>Time Out</TableHead>
          <TableHead>Performance Rating</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendanceList.map((item) => (
          <TableRow key={item.enrollmentId}>
            <TableCell>
              <div>
                <div className="font-medium">{item.employee.name}</div>
                <div className="text-sm text-gray-500">{item.employee.email}</div>
              </div>
            </TableCell>
            <TableCell>{item.employee.department || '-'}</TableCell>
            <TableCell>
              {canManageAttendance && !item.attendance.isLocked ? (
                <Select
                  value={item.attendance.status}
                  onValueChange={(value) => {
                    if (onUpdateAttendance) {
                      const attendanceId = hasAttendanceId(item.attendance) ? item.attendance.id : undefined;
                      onUpdateAttendance(item.enrollmentId, attendanceId, value as AttendanceStatus);
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AttendanceStatus.PRESENT}>PRESENT</SelectItem>
                    <SelectItem value={AttendanceStatus.LATE}>LATE</SelectItem>
                    <SelectItem value={AttendanceStatus.ABSENT}>ABSENT</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(item.attendance.status)}>
                  {item.attendance.status}
                  {canManageAttendance && item.attendance.isLocked && (
                    <span className="ml-2 text-xs">(Locked)</span>
                  )}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {item.attendance.timeIn
                ? new Date(item.attendance.timeIn).toLocaleTimeString()
                : '-'}
            </TableCell>
            <TableCell>
              {item.attendance.timeOut
                ? new Date(item.attendance.timeOut).toLocaleTimeString()
                : '-'}
            </TableCell>
            <TableCell>
              {item.evaluation?.employeePerformanceRating ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= (item.evaluation?.employeePerformanceRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-1 text-sm">({item.evaluation.employeePerformanceRating}/5)</span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Not rated</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {onRateEmployee && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRateEmployee(item.enrollmentId, item.employee.name)}
                  >
                    {item.evaluation?.employeePerformanceRating ? 'Update Rating' : 'Rate Employee'}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


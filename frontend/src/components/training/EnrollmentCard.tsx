import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainingEnrollment, TrainingEnrollmentStatus } from "@/types/training";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface EnrollmentCardProps {
  enrollment: TrainingEnrollment;
  onApprove?: () => void;
  onReject?: () => void;
}

export function EnrollmentCard({ enrollment, onApprove, onReject }: EnrollmentCardProps) {
  const getStatusColor = (status: TrainingEnrollmentStatus) => {
    switch (status) {
      case TrainingEnrollmentStatus.PENDING:
        return "bg-yellow-500";
      case TrainingEnrollmentStatus.APPROVED:
        return "bg-green-500";
      case TrainingEnrollmentStatus.REJECTED:
        return "bg-red-500";
      case TrainingEnrollmentStatus.CANCELLED:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{enrollment.training?.title || 'Training'}</CardTitle>
            <CardDescription>{enrollment.employee?.name} - {enrollment.employee?.department}</CardDescription>
          </div>
          <Badge className={getStatusColor(enrollment.status)}>{enrollment.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
          </div>
          {enrollment.approvedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Approved: {new Date(enrollment.approvedAt).toLocaleDateString()}</span>
            </div>
          )}
          {enrollment.rejectionReason && (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{enrollment.rejectionReason}</span>
            </div>
          )}
          {enrollment.status === TrainingEnrollmentStatus.PENDING && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


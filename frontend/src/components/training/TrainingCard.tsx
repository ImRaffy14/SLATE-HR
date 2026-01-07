import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Training, TrainingStatus, TrainingType } from "@/types/training";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

interface TrainingCardProps {
  training: Training;
  onClick?: () => void;
}

export function TrainingCard({ training, onClick }: TrainingCardProps) {
  const getStatusColor = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.DRAFT:
        return "bg-gray-500";
      case TrainingStatus.OPEN:
        return "bg-blue-500";
      case TrainingStatus.ONGOING:
        return "bg-yellow-500";
      case TrainingStatus.COMPLETED:
        return "bg-green-500";
      case TrainingStatus.CANCELLED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const enrolledCount = training.enrollments?.filter(e => e.status === 'APPROVED').length || 0;

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{training.title}</CardTitle>
          <Badge className={getStatusColor(training.status)}>{training.status}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{training.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{new Date(training.startDate).toLocaleDateString()}</span>
          </div>
          {training.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{training.venue.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{enrolledCount}/{training.maxParticipants} enrolled</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{training.durationHours} hours</span>
          </div>
          <Badge variant="outline">{training.trainingType}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}


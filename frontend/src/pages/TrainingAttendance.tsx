import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeDisplay } from "@/components/training/QRCodeDisplay";
import { AttendanceTable } from "@/components/training/AttendanceTable";
import {
  getTrainings,
  generateQRCode,
  getAttendanceList,
  scanQRCode,
  updateAttendance
} from "@/api/training";
import FullPageLoader from "@/components/FullpageLoader";
import { Training } from "@/types/training";
// QR Scanner will be implemented with html5-qrcode library

export default function TrainingAttendance() {
  const queryClient = useQueryClient();
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [qrExpiresAt, setQrExpiresAt] = useState<string>("");
  const [scannerActive, setScannerActive] = useState(false);

  // Get trainings
  const { data: trainingsData, isLoading: isLoadingTrainings } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => getTrainings()
  });

  // Get attendance list
  const { data: attendanceList = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", selectedTrainingId],
    queryFn: () => getAttendanceList(selectedTrainingId),
    enabled: !!selectedTrainingId
  });

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: generateQRCode,
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setQrExpiresAt(data.expiresAt);
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("QR code generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Scan QR code mutation
  const scanQRMutation = useMutation({
    mutationFn: ({ trainingId, employeeId, qrData, location }: {
      trainingId: string;
      employeeId: string;
      qrData: string;
      location?: string;
    }) => scanQRCode(trainingId, employeeId, qrData, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance marked successfully");
      setScannerActive(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setScannerActive(false);
    }
  });

  const handleGenerateQR = () => {
    if (!selectedTrainingId) {
      toast.error("Please select a training first");
      return;
    }
    generateQRMutation.mutate(selectedTrainingId);
  };

  const handleScanQR = async () => {
    if (!selectedTrainingId) {
      toast.error("Please select a training first");
      return;
    }

    // For now, use a simple input. Full QR scanner can be added later
    const qrData = prompt("Enter QR code data or scan QR code:");
    const employeeId = prompt("Enter your employee ID:");
    
    if (qrData && employeeId) {
      scanQRMutation.mutate({
        trainingId: selectedTrainingId,
        employeeId,
        qrData
      });
    }
  };

  if (isLoadingTrainings) {
    return <FullPageLoader message="Loading trainings..." showLogo={false} />;
  }

  const trainings = trainingsData?.trainings || [];
  const selectedTraining = trainings.find((t: Training) => t.id === selectedTrainingId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Training Attendance</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Training</CardTitle>
          <CardDescription>Choose a training to manage attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a training" />
            </SelectTrigger>
            <SelectContent>
              {trainings.map((training: Training) => (
                <SelectItem key={training.id} value={training.id}>
                  {training.title} - {new Date(training.startDate).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTrainingId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Generate QR code for attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrCode ? (
                  <QRCodeDisplay
                    qrCode={qrCode}
                    expiresAt={qrExpiresAt}
                    trainingTitle={selectedTraining?.title}
                  />
                ) : (
                  <Button onClick={handleGenerateQR} className="w-full">
                    Generate QR Code
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scan QR Code</CardTitle>
                <CardDescription>Scan QR code to mark attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleScanQR} className="w-full">
                  Scan QR Code
                </Button>
                <p className="text-sm text-gray-500">
                  Click to scan QR code and mark attendance
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance List</CardTitle>
              <CardDescription>View attendance for this training</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <FullPageLoader message="Loading attendance..." showLogo={false} />
              ) : (
                <AttendanceTable attendanceList={attendanceList} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


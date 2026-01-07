import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrainingCard } from "@/components/training/TrainingCard";
import { EnrollmentCard } from "@/components/training/EnrollmentCard";
import {
  getTrainings,
  suggestTrainings,
  enrollInTraining,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  getEmployeeTrainings
} from "@/api/training";
import { getEmployees } from "@/api/employee";
import { useAuth } from "@/context/authContext";
import FullPageLoader from "@/components/FullpageLoader";
import { Training, TrainingEnrollment as TrainingEnrollmentType } from "@/types/training";

export default function TrainingEnrollment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  // Get employees for selection
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees
  });

  // Get all trainings
  const { data: trainingsData, isLoading: isLoadingTrainings } = useQuery({
    queryKey: ["trainings", "open"],
    queryFn: () => getTrainings({ status: "OPEN" })
  });

  // Get suggested trainings (if employee selected)
  const { data: suggestedTrainings = [], isLoading: isLoadingSuggested } = useQuery({
    queryKey: ["suggestedTrainings", selectedEmployeeId],
    queryFn: () => suggestTrainings(selectedEmployeeId),
    enabled: !!selectedEmployeeId
  });

  // Get pending enrollments
  const { data: pendingData, isLoading: isLoadingPending } = useQuery({
    queryKey: ["pendingEnrollments"],
    queryFn: () => getPendingEnrollments()
  });

  // Get employee trainings
  const { data: employeeTrainingsData, isLoading: isLoadingEmployeeTrainings, refetch: refetchEmployeeTrainings } = useQuery({
    queryKey: ["employeeTrainings", selectedEmployeeId],
    queryFn: () => getEmployeeTrainings(selectedEmployeeId),
    enabled: !!selectedEmployeeId
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: ({ trainingId, employeeId }: { trainingId: string; employeeId: string }) =>
      enrollInTraining(trainingId, employeeId, "SELF"),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      queryClient.invalidateQueries({ queryKey: ["employeeTrainings", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedTrainings", variables.employeeId] });
      // Refetch employee trainings immediately if this employee is selected
      if (selectedEmployeeId === variables.employeeId) {
        await refetchEmployeeTrainings();
      } else {
        await queryClient.refetchQueries({ queryKey: ["employeeTrainings", variables.employeeId] });
      }
      toast.success("Enrollment request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: approveEnrollment,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["employeeTrainings"] });
      // Refetch employee trainings if an employee is selected
      if (selectedEmployeeId) {
        await queryClient.refetchQueries({ queryKey: ["employeeTrainings", selectedEmployeeId] });
      }
      toast.success("Enrollment approved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectEnrollment(id, reason),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["employeeTrainings"] });
      // Refetch employee trainings if an employee is selected
      if (selectedEmployeeId) {
        await queryClient.refetchQueries({ queryKey: ["employeeTrainings", selectedEmployeeId] });
      }
      toast.success("Enrollment rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  if (isLoadingTrainings || isLoadingPending || isLoadingEmployees) {
    return <FullPageLoader message="Loading..." showLogo={false} />;
  }

  const trainings = trainingsData?.trainings || [];
  const pendingEnrollments = pendingData?.enrollments || [];
  const employeeTrainings = employeeTrainingsData?.enrollments || [];
  
  // Debug: Log employee trainings data to help diagnose the issue
  if (selectedEmployeeId && employeeTrainingsData) {
    console.log("Employee Trainings Data:", employeeTrainingsData);
    console.log("Employee Trainings Array:", employeeTrainings);
    console.log("Selected Employee ID:", selectedEmployeeId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Training Enrollment</h2>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Employee</CardTitle>
          <CardDescription>Choose an employee to view and manage their training enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="employee-select">Employee</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.employeeId} {emp.department ? `(${emp.department})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Trainings</TabsTrigger>
          <TabsTrigger value="suggested">Suggested Trainings</TabsTrigger>
          <TabsTrigger value="my-trainings">My Trainings</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Trainings</CardTitle>
              <CardDescription>Browse and enroll in available training programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainings.map((training: Training) => (
                  <TrainingCard
                    key={training.id}
                    training={training}
                    onClick={() => {
                      if (selectedEmployeeId) {
                        enrollMutation.mutate({
                          trainingId: training.id,
                          employeeId: selectedEmployeeId
                        });
                      } else {
                        toast.error("Please select an employee first");
                      }
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggested" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Trainings</CardTitle>
              <CardDescription>
                Trainings recommended based on your competency gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEmployeeId ? (
                <p className="text-gray-500">Please select an employee to see suggested trainings</p>
              ) : isLoadingSuggested ? (
                <FullPageLoader message="Loading suggestions..." showLogo={false} />
              ) : suggestedTrainings.length === 0 ? (
                <p className="text-gray-500">No suggested trainings available. This employee has no competency gaps or all gaps are already addressed.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedTrainings.map((training: any) => (
                    <TrainingCard
                      key={training.id}
                      training={training}
                      onClick={() => {
                        enrollMutation.mutate({
                          trainingId: training.id,
                          employeeId: selectedEmployeeId
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-trainings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Trainings</CardTitle>
              <CardDescription>View your training enrollments and status</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEmployeeId ? (
                <p className="text-gray-500">Please select an employee to see their trainings</p>
              ) : isLoadingEmployeeTrainings ? (
                <FullPageLoader message="Loading trainings..." showLogo={false} />
              ) : employeeTrainings.length === 0 ? (
                <p className="text-gray-500">No trainings found</p>
              ) : (
                <div className="space-y-4">
                  {employeeTrainings.map((enrollment: TrainingEnrollmentType) => (
                    <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pending Approvals (for HR/Manager) */}
      {(user?.role === "ADMIN" || user?.role === "HR" || user?.role === "MANAGER") && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Review and approve/reject enrollment requests</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingEnrollments.length === 0 ? (
              <p className="text-gray-500">No pending enrollments</p>
            ) : (
              <div className="space-y-4">
                {pendingEnrollments.map((enrollment: TrainingEnrollmentType) => (
                  <EnrollmentCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    onApprove={() => approveMutation.mutate(enrollment.id)}
                    onReject={() => {
                      const reason = prompt("Rejection reason (optional):");
                      rejectMutation.mutate({ id: enrollment.id, reason: reason || undefined });
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


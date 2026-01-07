import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "@/components/training/ReportFilters";
import {
  getTrainingHoursReport,
  getAttendanceSummaryReport,
  getCompetencyImprovementReport,
  getTrainerEffectivenessReport
} from "@/api/training";
import FullPageLoader from "@/components/FullpageLoader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TrainingReports() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
    department: "",
    competencyId: "",
    trainingId: "",
    trainerId: ""
  });

  // Training Hours Report
  const { data: hoursReport, isLoading: isLoadingHours } = useQuery({
    queryKey: ["trainingHoursReport", filters],
    queryFn: () => getTrainingHoursReport({
      employeeId: filters.employeeId || undefined,
      department: filters.department || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    })
  });

  // Attendance Summary Report
  const { data: attendanceReport, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendanceReport", filters],
    queryFn: () => getAttendanceSummaryReport({
      trainingId: filters.trainingId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      department: filters.department || undefined
    })
  });

  // Competency Improvement Report
  const { data: competencyReport, isLoading: isLoadingCompetency } = useQuery({
    queryKey: ["competencyReport", filters],
    queryFn: () => getCompetencyImprovementReport({
      employeeId: filters.employeeId || undefined,
      competencyId: filters.competencyId || undefined,
      trainingId: filters.trainingId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    })
  });

  // Trainer Effectiveness Report
  const { data: trainerReport = [], isLoading: isLoadingTrainer } = useQuery({
    queryKey: ["trainerReport", filters],
    queryFn: () => getTrainerEffectivenessReport({
      trainerId: filters.trainerId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    })
  });

  const handleExport = (reportType: string) => {
    // TODO: Implement export functionality
    alert(`Export ${reportType} functionality to be implemented`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Training Reports</h2>
      </div>

      <ReportFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({
          startDate: "",
          endDate: "",
          employeeId: "",
          department: "",
          competencyId: "",
          trainingId: "",
          trainerId: ""
        })}
        showEmployeeFilter={true}
        showDepartmentFilter={true}
        showCompetencyFilter={true}
        showTrainingFilter={true}
        showTrainerFilter={true}
      />

      <Tabs defaultValue="hours" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hours">Training Hours</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="competency">Competency Improvement</TabsTrigger>
          <TabsTrigger value="trainer">Trainer Effectiveness</TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Training Hours Report</CardTitle>
                  <CardDescription>Total training hours per employee</CardDescription>
                </div>
                <Button onClick={() => handleExport("hours")}>Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHours ? (
                <FullPageLoader message="Loading report..." showLogo={false} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Training Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hoursReport?.data?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.employee.name}</TableCell>
                        <TableCell>{item.employee.department || "-"}</TableCell>
                        <TableCell>{item.totalHours.toFixed(2)}</TableCell>
                        <TableCell>{item.trainingCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance Summary</CardTitle>
                  <CardDescription>Attendance statistics and details</CardDescription>
                </div>
                <Button onClick={() => handleExport("attendance")}>Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <FullPageLoader message="Loading report..." showLogo={false} />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{attendanceReport?.summary?.total || 0}</div>
                        <p className="text-sm text-gray-500">Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{attendanceReport?.summary?.present || 0}</div>
                        <p className="text-sm text-gray-500">Present</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{attendanceReport?.summary?.late || 0}</div>
                        <p className="text-sm text-gray-500">Late</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{attendanceReport?.summary?.absent || 0}</div>
                        <p className="text-sm text-gray-500">Absent</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="text-sm text-gray-600">
                    Attendance Rate: {attendanceReport?.summary?.attendanceRate || "0.00"}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competency" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Competency Improvement</CardTitle>
                  <CardDescription>Track competency improvements from training</CardDescription>
                </div>
                <Button onClick={() => handleExport("competency")}>Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCompetency ? (
                <FullPageLoader message="Loading report..." showLogo={false} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Competency</TableHead>
                      <TableHead>Previous Level</TableHead>
                      <TableHead>New Level</TableHead>
                      <TableHead>Improvement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competencyReport?.impacts?.map((impact) => (
                      <TableRow key={impact.id}>
                        <TableCell>{impact.employee?.name || "-"}</TableCell>
                        <TableCell>{impact.competency?.name || "-"}</TableCell>
                        <TableCell>{impact.previousLevel}</TableCell>
                        <TableCell>{impact.newLevel}</TableCell>
                        <TableCell className="text-green-600">+{impact.improvement}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainer" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trainer Effectiveness</CardTitle>
                  <CardDescription>Trainer performance metrics</CardDescription>
                </div>
                <Button onClick={() => handleExport("trainer")}>Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTrainer ? (
                <FullPageLoader message="Loading report..." showLogo={false} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Total Trainings</TableHead>
                      <TableHead>Total Evaluations</TableHead>
                      <TableHead>Avg Training Rating</TableHead>
                      <TableHead>Avg Trainer Rating</TableHead>
                      <TableHead>Avg Effectiveness</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainerReport.map((trainer, index) => (
                      <TableRow key={index}>
                        <TableCell>{trainer.trainer.name}</TableCell>
                        <TableCell>{trainer.totalTrainings}</TableCell>
                        <TableCell>{trainer.totalEvaluations}</TableCell>
                        <TableCell>{trainer.averageTrainingRating.toFixed(2)}</TableCell>
                        <TableCell>{trainer.averageTrainerRating.toFixed(2)}</TableCell>
                        <TableCell>{trainer.averageEffectivenessScore.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


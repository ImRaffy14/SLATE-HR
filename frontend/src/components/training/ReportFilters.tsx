import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportFiltersProps {
  filters: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    department?: string;
    competencyId?: string;
    trainingId?: string;
    trainerId?: string;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  showEmployeeFilter?: boolean;
  showDepartmentFilter?: boolean;
  showCompetencyFilter?: boolean;
  showTrainingFilter?: boolean;
  showTrainerFilter?: boolean;
}

export function ReportFilters({
  filters,
  onFilterChange,
  onReset,
  showEmployeeFilter = false,
  showDepartmentFilter = true,
  showCompetencyFilter = false,
  showTrainingFilter = false,
  showTrainerFilter = false
}: ReportFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Apply filters to generate reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            />
          </div>
          {showDepartmentFilter && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={filters.department || ""}
                onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
                placeholder="Filter by department"
              />
            </div>
          )}
          {showEmployeeFilter && (
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={filters.employeeId || ""}
                onChange={(e) => onFilterChange({ ...filters, employeeId: e.target.value })}
                placeholder="Filter by employee"
              />
            </div>
          )}
          {showCompetencyFilter && (
            <div className="space-y-2">
              <Label htmlFor="competencyId">Competency ID</Label>
              <Input
                id="competencyId"
                value={filters.competencyId || ""}
                onChange={(e) => onFilterChange({ ...filters, competencyId: e.target.value })}
                placeholder="Filter by competency"
              />
            </div>
          )}
          {showTrainingFilter && (
            <div className="space-y-2">
              <Label htmlFor="trainingId">Training ID</Label>
              <Input
                id="trainingId"
                value={filters.trainingId || ""}
                onChange={(e) => onFilterChange({ ...filters, trainingId: e.target.value })}
                placeholder="Filter by training"
              />
            </div>
          )}
          {showTrainerFilter && (
            <div className="space-y-2">
              <Label htmlFor="trainerId">Trainer ID</Label>
              <Input
                id="trainerId"
                value={filters.trainerId || ""}
                onChange={(e) => onFilterChange({ ...filters, trainerId: e.target.value })}
                placeholder="Filter by trainer"
              />
            </div>
          )}
          <div className="flex items-end">
            <Button variant="outline" onClick={onReset} className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


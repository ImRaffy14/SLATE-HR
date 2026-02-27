"use client"

import { useState } from "react"
import {
  Search,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  Trash2,
  Users,
  Briefcase,
  AlertCircle,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import FullPageLoader from "@/components/FullpageLoader"
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/api/employee"
import {
  getJobRoles,
  createJobRole,
  updateJobRole,
  deleteJobRole,
} from "@/api/jobRole"
import { JobRole } from "@/types/competency"

interface Employee {
  id: string
  employeeId: string
  name: string
  email?: string
  department?: string
  position?: string
  positionId?: string
  dateHired?: string
  status: "ACTIVE" | "INACTIVE"
  jobRole?: JobRole
  createdAt: string
  updatedAt: string
}

export default function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState("employees")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // Modal states
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false)
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false)
  const [isViewEmployeeModalOpen, setIsViewEmployeeModalOpen] = useState(false)
  const [isDeleteEmployeeModalOpen, setIsDeleteEmployeeModalOpen] = useState(false)
  const [isCreateJobRoleModalOpen, setIsCreateJobRoleModalOpen] = useState(false)
  const [isEditJobRoleModalOpen, setIsEditJobRoleModalOpen] = useState(false)
  const [isDeleteJobRoleModalOpen, setIsDeleteJobRoleModalOpen] = useState(false)

  // Selected items
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedJobRole, setSelectedJobRole] = useState<JobRole | null>(null)

  // Form data
  const [employeeFormData, setEmployeeFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    positionId: "",
    dateHired: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  })

  const [jobRoleFormData, setJobRoleFormData] = useState({
    name: "",
    description: "",
  })

  const queryClient = useQueryClient()

  // Queries
  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  })

  const { data: jobRoles = [], isLoading: isJobRolesLoading } = useQuery({
    queryKey: ["jobRoles"],
    queryFn: () => getJobRoles(),
  })

  // Mutations
  const { mutate: createEmployeeMutate, isPending: isCreatingEmployee } = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Employee created successfully!")
      setIsCreateEmployeeModalOpen(false)
      resetEmployeeForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create employee")
    },
  })

  const { mutate: updateEmployeeMutate, isPending: isUpdatingEmployee } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Employee updated successfully!")
      setIsEditEmployeeModalOpen(false)
      resetEmployeeForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update employee")
    },
  })

  const { mutate: deleteEmployeeMutate, isPending: isDeletingEmployee } = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Employee deleted successfully!")
      setIsDeleteEmployeeModalOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete employee")
    },
  })

  const { mutate: createJobRoleMutate, isPending: isCreatingJobRole } = useMutation({
    mutationFn: createJobRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobRoles"] })
      toast.success("Job role created successfully!")
      setIsCreateJobRoleModalOpen(false)
      resetJobRoleForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create job role")
    },
  })

  const { mutate: updateJobRoleMutate, isPending: isUpdatingJobRole } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateJobRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobRoles"] })
      toast.success("Job role updated successfully!")
      setIsEditJobRoleModalOpen(false)
      resetJobRoleForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update job role")
    },
  })

  const { mutate: deleteJobRoleMutate, isPending: isDeletingJobRole } = useMutation({
    mutationFn: deleteJobRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobRoles"] })
      toast.success("Job role deleted successfully!")
      setIsDeleteJobRoleModalOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete job role")
    },
  })

  // Helper functions
  const resetEmployeeForm = () => {
    setEmployeeFormData({
      name: "",
      email: "",
      department: "",
      position: "",
      positionId: "",
      dateHired: "",
      status: "ACTIVE",
    })
  }

  const resetJobRoleForm = () => {
    setJobRoleFormData({
      name: "",
      description: "",
    })
  }

  // Filter employees
  const filteredEmployees = (employees as Employee[]).filter((emp) => {
    const matchesSearch =
      emp?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || emp?.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Handlers
  const handleCreateEmployeeClick = () => {
    setSelectedEmployee(null)
    resetEmployeeForm()
    setIsCreateEmployeeModalOpen(true)
  }

  const handleEditEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEmployeeFormData({
      name: employee.name,
      email: employee.email || "",
      department: employee.department || "",
      position: employee.position || "",
      positionId: employee.positionId || "",
      dateHired: employee.dateHired ? new Date(employee.dateHired).toISOString().split("T")[0] : "",
      status: employee.status,
    })
    setIsEditEmployeeModalOpen(true)
  }

  const handleViewEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewEmployeeModalOpen(true)
  }

  const handleDeleteEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeleteEmployeeModalOpen(true)
  }

  const handleSubmitEmployee = () => {
    if (!employeeFormData.name.trim()) {
      toast.error("Name is required")
      return
    }

    // Prepare data, removing empty strings and converting to proper types
    const data: any = {
      name: employeeFormData.name.trim(),
      status: employeeFormData.status,
    }

    // Only include optional fields if they have values
    if (employeeFormData.email?.trim()) {
      data.email = employeeFormData.email.trim()
    }
    if (employeeFormData.department?.trim()) {
      data.department = employeeFormData.department.trim()
    }
    if (employeeFormData.position?.trim()) {
      data.position = employeeFormData.position.trim()
    }
    // Handle positionId - only include if it's not empty
    if (employeeFormData.positionId && employeeFormData.positionId.trim() !== "") {
      data.positionId = employeeFormData.positionId.trim()
    }
    if (employeeFormData.dateHired) {
      data.dateHired = new Date(employeeFormData.dateHired).toISOString()
    }

    if (selectedEmployee) {
      updateEmployeeMutate({ id: selectedEmployee.id, data })
    } else {
      createEmployeeMutate(data)
    }
  }

  const handleDeleteEmployeeConfirm = () => {
    if (!selectedEmployee) return
    deleteEmployeeMutate(selectedEmployee.id)
  }

  const handleCreateJobRoleClick = () => {
    resetJobRoleForm()
    setIsCreateJobRoleModalOpen(true)
  }

  const handleEditJobRoleClick = (jobRole: JobRole) => {
    setSelectedJobRole(jobRole)
    setJobRoleFormData({
      name: jobRole.name,
      description: jobRole.description || "",
    })
    setIsEditJobRoleModalOpen(true)
  }

  const handleDeleteJobRoleClick = (jobRole: JobRole) => {
    setSelectedJobRole(jobRole)
    setIsDeleteJobRoleModalOpen(true)
  }

  const handleSubmitJobRole = () => {
    if (!jobRoleFormData.name.trim()) {
      toast.error("Job role name is required")
      return
    }
    if (selectedJobRole) {
      updateJobRoleMutate({ id: selectedJobRole.id, data: jobRoleFormData })
    } else {
      createJobRoleMutate(jobRoleFormData)
    }
  }

  const handleDeleteJobRoleConfirm = () => {
    if (!selectedJobRole) return
    deleteJobRoleMutate(selectedJobRole.id)
  }

  const isLoading = isEmployeesLoading || isJobRolesLoading

  if (isLoading) {
    return <FullPageLoader message="Fetching Employee Data" showLogo={false} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Records</h2>
          <p className="text-gray-600">View employee records and job roles</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">
            <Users className="w-4 h-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="job-roles">
            <Briefcase className="w-4 h-4 mr-2" />
            Job Roles
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Employees</CardTitle>
                  <CardDescription>Employee information is read-only and managed in the main HR system</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employees Table */}
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Job Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Hired</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            {searchTerm || selectedStatus !== "all"
                              ? "No employees match your filters. Try adjusting your search criteria."
                              : "No employees found. Add your first employee to get started."}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((emp: Employee) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{emp.name?.charAt(0) || "E"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{emp.name}</div>
                                <div className="text-sm text-gray-600">{emp.email || "No email"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{emp.employeeId}</TableCell>
                          <TableCell>{emp.department || "—"}</TableCell>
                          <TableCell>
                            {emp.jobRole ? (
                              <Badge variant="outline">{emp.jobRole.name}</Badge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={emp.status === "ACTIVE" ? "default" : "secondary"}>
                              {emp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {emp.dateHired
                              ? new Date(emp.dateHired).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleViewEmployeeClick(emp)}>
                              <Eye size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Roles Tab */}
        <TabsContent value="job-roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Roles</CardTitle>
                  <CardDescription>Job roles are read-only and managed in the main HR system</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            No job roles found. Create your first job role to get started.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobRoles.map((role: JobRole) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description || "—"}</TableCell>
                          <TableCell>
                            {employees.filter((emp: Employee) => emp.positionId === role.id).length}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs text-gray-400">View only</span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Employee Modal */}
      <Dialog
        open={isCreateEmployeeModalOpen || isEditEmployeeModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateEmployeeModalOpen(false)
            setIsEditEmployeeModalOpen(false)
            setSelectedEmployee(null)
            resetEmployeeForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
            <DialogDescription>
              {selectedEmployee ? "Update employee information" : "Add a new employee to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={employeeFormData.name}
                onChange={(e) =>
                  setEmployeeFormData({ ...employeeFormData, name: e.target.value })
                }
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={employeeFormData.email}
                  onChange={(e) =>
                    setEmployeeFormData({ ...employeeFormData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={employeeFormData.department}
                  onChange={(e) =>
                    setEmployeeFormData({ ...employeeFormData, department: e.target.value })
                  }
                  placeholder="Department"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Role</Label>
                <div className="flex gap-2">
                  <Select
                    value={employeeFormData.positionId || undefined}
                    onValueChange={(value) =>
                      setEmployeeFormData({ ...employeeFormData, positionId: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRoles.map((role: JobRole) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {employeeFormData.positionId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setEmployeeFormData({ ...employeeFormData, positionId: "" })}
                      title="Clear job role"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Position (Legacy)</Label>
                <Input
                  value={employeeFormData.position}
                  onChange={(e) =>
                    setEmployeeFormData({ ...employeeFormData, position: e.target.value })
                  }
                  placeholder="Position title"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date Hired</Label>
                <Input
                  type="date"
                  value={employeeFormData.dateHired}
                  onChange={(e) =>
                    setEmployeeFormData({ ...employeeFormData, dateHired: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={employeeFormData.status}
                  onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                    setEmployeeFormData({ ...employeeFormData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateEmployeeModalOpen(false)
                setIsEditEmployeeModalOpen(false)
                resetEmployeeForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEmployee} disabled={isCreatingEmployee || isUpdatingEmployee}>
              {isCreatingEmployee || isUpdatingEmployee
                ? "Saving..."
                : selectedEmployee
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Employee Modal */}
      <Dialog open={isViewEmployeeModalOpen} onOpenChange={setIsViewEmployeeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>View detailed information about this employee</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name?.charAt(0) || "E"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-sm text-gray-600">{selectedEmployee.email || "No email"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Employee ID</Label>
                  <p className="text-sm">{selectedEmployee.employeeId}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Status</Label>
                  <Badge variant={selectedEmployee.status === "ACTIVE" ? "default" : "secondary"}>
                    {selectedEmployee.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Department</Label>
                  <p className="text-sm">{selectedEmployee.department || "—"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Job Role</Label>
                  {selectedEmployee.jobRole ? (
                    <Badge variant="outline">{selectedEmployee.jobRole.name}</Badge>
                  ) : (
                    <p className="text-sm text-gray-400">—</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Position</Label>
                  <p className="text-sm">{selectedEmployee.position || "—"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Date Hired</Label>
                  <p className="text-sm">
                    {selectedEmployee.dateHired
                      ? new Date(selectedEmployee.dateHired).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsViewEmployeeModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Modal */}
      <Dialog open={isDeleteEmployeeModalOpen} onOpenChange={setIsDeleteEmployeeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      This employee will be permanently deleted. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Employee Name</Label>
                <p className="text-sm font-medium">{selectedEmployee.name}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteEmployeeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployeeConfirm}
              disabled={isDeletingEmployee}
            >
              {isDeletingEmployee ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Job Role Modal */}
      <Dialog
        open={isCreateJobRoleModalOpen || isEditJobRoleModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateJobRoleModalOpen(false)
            setIsEditJobRoleModalOpen(false)
            resetJobRoleForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedJobRole ? "Edit Job Role" : "Create Job Role"}</DialogTitle>
            <DialogDescription>Create a new job role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Job Role Name *</Label>
              <Input
                value={jobRoleFormData.name}
                onChange={(e) =>
                  setJobRoleFormData({ ...jobRoleFormData, name: e.target.value })
                }
                placeholder="e.g., Software Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={jobRoleFormData.description}
                onChange={(e) =>
                  setJobRoleFormData({ ...jobRoleFormData, description: e.target.value })
                }
                placeholder="Describe this job role..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateJobRoleModalOpen(false)
                setIsEditJobRoleModalOpen(false)
                resetJobRoleForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitJobRole} disabled={isCreatingJobRole || isUpdatingJobRole}>
              {isCreatingJobRole || isUpdatingJobRole ? "Saving..." : selectedJobRole ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Job Role Modal */}
      <Dialog open={isDeleteJobRoleModalOpen} onOpenChange={setIsDeleteJobRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedJobRole && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      This job role will be permanently deleted. If it has employees, you may need to reassign them first.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Role Name</Label>
                <p className="text-sm font-medium">{selectedJobRole.name}</p>
              </div>
              {employees.filter((emp: Employee) => emp.positionId === selectedJobRole.id).length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This job role has {employees.filter((emp: Employee) => emp.positionId === selectedJobRole.id).length} employee(s). 
                    You may need to reassign them before deleting.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteJobRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteJobRoleConfirm}
              disabled={isDeletingJobRole}
            >
              {isDeletingJobRole ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


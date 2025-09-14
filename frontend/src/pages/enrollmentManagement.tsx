"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Search, MoreVertical, UserCheck, UserX, Clock, Eye, Send, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCourseById, deleteEnrollment as EnrollmentDelete } from "@/api/learning"
import { toast } from "react-hot-toast"
import FullPageLoader from "@/components/FullpageLoader"

// Mock data for enrollments
const mockEnrollments = [
  {
    id: 1,
    employeeName: "John Smith",
    email: "john.smith@company.com",
    department: "Drivers",
    enrolledDate: "2024-01-15",
    status: "In Progress",
    progress: 75,
    lastActivity: "2024-02-20",
  },
  {
    id: 2,
    employeeName: "Maria Garcia",
    email: "maria.garcia@company.com",
    department: "Warehouse",
    enrolledDate: "2024-01-20",
    status: "Completed",
    progress: 100,
    lastActivity: "2024-02-18",
  },
  {
    id: 3,
    employeeName: "David Johnson",
    email: "david.johnson@company.com",
    department: "Dispatch",
    enrolledDate: "2024-02-01",
    status: "Not Started",
    progress: 0,
    lastActivity: "2024-02-01",
  },
  {
    id: 4,
    employeeName: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    department: "Maintenance",
    enrolledDate: "2024-02-05",
    status: "In Progress",
    progress: 45,
    lastActivity: "2024-02-19",
  },
  {
    id: 5,
    employeeName: "Michael Brown",
    email: "michael.brown@company.com",
    department: "Drivers",
    enrolledDate: "2024-01-28",
    status: "Completed",
    progress: 100,
    lastActivity: "2024-02-15",
  },
  {
    id: 6,
    employeeName: "Lisa Davis",
    email: "lisa.davis@company.com",
    department: "Administration",
    enrolledDate: "2024-02-10",
    status: "In Progress",
    progress: 30,
    lastActivity: "2024-02-21",
  },
]

export default function EnrollmentManagement() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")

  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false)
  const [reminderMessage, setReminderMessage] = useState("")

  const queryClient = useQueryClient()

  const { data: courseData = [], isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId as string),
    enabled: !!courseId,
  })

  const { mutate: deleteEnrollment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => EnrollmentDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast.success("Enrollment deleted successfully")
      navigate(-1)
    },
  })

  const departments = [
    "All",
    ...Array.from(new Set(courseData.enrollments?.map((e: any) => e.employee.position) || [])),
  ]
  const statuses = ["All", "NOT_STARTED", "IN_PROGRESS", "COMPLETED"]

  const filteredEnrollments = courseData.enrollments?.filter((enrollment: any) => {
    const matchesSearch =
      enrollment.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || enrollment.status === statusFilter
    const matchesDepartment = departmentFilter === "All" || enrollment.employee.position === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "Completed":
        return "bg-green-600 text-white"
      case "IN_PROGRESS":
      case "In Progress":
        return "bg-blue-600 text-white"
      case "NOT_STARTED":
      case "Not Started":
        return "bg-gray-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleViewProgress = (enrollment: any) => {
    setSelectedEnrollment(enrollment)
    setIsProgressModalOpen(true)
  }

  const handleSendReminder = (enrollment: any) => {
    setSelectedEnrollment(enrollment)
    setReminderMessage(
      `Hi ${enrollment.employeeName || enrollment.employee?.name}, this is a friendly reminder about your enrollment in ${courseData?.title || "the course"}. Please continue with your learning progress.`,
    )
    setIsReminderModalOpen(true)
  }

  const handleUnenroll = (enrollment: any) => {
    setSelectedEnrollment(enrollment)
    setIsUnenrollModalOpen(true)
  }

  const confirmSendReminder = () => {
    toast.success(`Reminder sent to ${selectedEnrollment?.employeeName || selectedEnrollment?.employee?.name}`)
    setIsReminderModalOpen(false)
    setReminderMessage("")
  }

  const confirmUnenroll = () => {
    if (selectedEnrollment?.id) {
      deleteEnrollment(selectedEnrollment.id)
    }
  }

  if (isLoading) {
    return <FullPageLoader message="Loading course data..." showLogo={false} />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Enrollments</h2>
          <p className="text-gray-600">{courseData?.title || "Course"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">{filteredEnrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredEnrollments.filter((e: any) => e.status === "IN_PROGRESS").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredEnrollments.filter((e: any) => e.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <UserX className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredEnrollments.filter((e: any) => e.status === "NOT_STARTED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-gray-900">Filters</CardTitle>
          <CardDescription className="text-gray-600">Filter enrolled students</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                className="pl-9 bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {departments.map((dept: any) => (
                  <SelectItem key={dept} value={dept} className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("All")
                setDepartmentFilter("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-gray-900">Student Enrollments</CardTitle>
          <CardDescription className="text-gray-600">{filteredEnrollments.length} students found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold min-w-[200px] px-6 py-4">Student</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[120px] px-6 py-4">Department</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[120px] px-6 py-4">Enrolled Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[120px] px-6 py-4">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[150px] px-6 py-4">Progress</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[120px] px-6 py-4">Last Activity</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold min-w-[100px] px-6 py-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment: any) => (
                  <TableRow key={enrollment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {enrollment.employee?.name || enrollment.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">{enrollment.employee?.email || enrollment.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 px-6 py-4">
                      {enrollment.employee?.position || enrollment.department}
                    </TableCell>
                    <TableCell className="text-gray-900 px-6 py-4">
                      {enrollment.enrolledAt
                        ? new Date(enrollment.enrolledAt).toLocaleDateString()
                        : enrollment.enrolledDate}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={getStatusBadgeColor(enrollment.status)}>{enrollment.status}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 px-6 py-4">
                      {enrollment.lastActivity ? new Date(enrollment.lastActivity).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                          <DropdownMenuItem
                            className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewProgress(enrollment)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                            onClick={() => handleSendReminder(enrollment)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                            onClick={() => handleUnenroll(enrollment)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Unenroll Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Progress Modal */}
      <Dialog open={isProgressModalOpen} onOpenChange={setIsProgressModalOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto shadow-xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">Student Progress Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              Detailed progress information for {selectedEnrollment?.employee?.name || selectedEnrollment?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Student Name</Label>
                <p className="text-gray-900 font-medium mt-1">
                  {selectedEnrollment?.employee?.name || selectedEnrollment?.employeeName}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <p className="text-gray-900 mt-1">{selectedEnrollment?.employee?.email || selectedEnrollment?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Department</Label>
                <p className="text-gray-900 mt-1">
                  {selectedEnrollment?.employee?.position || selectedEnrollment?.department}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Enrollment Date</Label>
                <p className="text-gray-900 mt-1">
                  {selectedEnrollment?.enrolledAt
                    ? new Date(selectedEnrollment.enrolledAt).toLocaleDateString()
                    : selectedEnrollment?.enrolledDate}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <Label className="text-sm font-medium text-gray-700">Overall Progress</Label>
              <div className="mt-3 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion</span>
                  <span className="text-gray-900 font-medium">{selectedEnrollment?.progress}%</span>
                </div>
                <Progress value={selectedEnrollment?.progress} className="h-3" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="mt-2">
                <Badge className={getStatusBadgeColor(selectedEnrollment?.status)}>{selectedEnrollment?.status}</Badge>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <Label className="text-sm font-medium text-gray-700">Last Activity</Label>
              <p className="text-gray-900 mt-1">
                {selectedEnrollment?.lastActivity
                  ? new Date(selectedEnrollment.lastActivity).toLocaleDateString()
                  : "No recent activity"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Modal */}
      <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto shadow-xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">Send Reminder</DialogTitle>
            <DialogDescription className="text-gray-600">
              Send a reminder email to {selectedEnrollment?.employee?.name || selectedEnrollment?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div>
              <Label htmlFor="reminder-message" className="text-sm font-medium text-gray-700">
                Message
              </Label>
              <Textarea
                id="reminder-message"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="mt-2 bg-white border border-gray-300 text-gray-900 min-h-[120px] resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your reminder message..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button onClick={confirmSendReminder} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsReminderModalOpen(false)}
                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unenroll Modal */}
      <Dialog open={isUnenrollModalOpen} onOpenChange={setIsUnenrollModalOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-md w-[95vw] max-h-[90vh] overflow-y-auto shadow-xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-bold text-red-600">Confirm Unenrollment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to unenroll {selectedEnrollment?.employee?.name || selectedEnrollment?.employeeName}{" "}
              from this course?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">
                <strong>Warning:</strong> This action cannot be undone. The student will lose all progress and will need
                to re-enroll to continue.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={confirmUnenroll}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Unenrolling..." : "Unenroll Student"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsUnenrollModalOpen(false)}
                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

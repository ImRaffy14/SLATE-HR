"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Save,
  Star,
  TrendingUp,
  Target,
  BookOpen,
  UserPlus,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  createTrainingSession,
  getTrainingSessions,
  getTrainingSessionById,
  updateTrainingSession,
  addTrainingRecord,
  updateTrainingRecord,

} from "@/api/training"
import {
  getCourses
} from "@/api/learning"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import FullPageLoader from "@/components/FullpageLoader"
import { createSuccessionPlan } from "@/api/succession"


const mockEnrollees = [
  {
    id: 1,
    name: "John Doe",
    department: "Engineering",
    email: "john@company.com",
    position: "Senior Developer",
    selected: false,
    progress: 0,
  },
  {
    id: 2,
    name: "Jane Smith",
    department: "Marketing",
    email: "jane@company.com",
    position: "Marketing Manager",
    selected: false,
    progress: 0,
  },
  {
    id: 3,
    name: "Mike Johnson",
    department: "Sales",
    email: "mike@company.com",
    position: "Sales Representative",
    selected: false,
    progress: 0,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    department: "HR",
    email: "sarah@company.com",
    position: "HR Specialist",
    selected: false,
    progress: 0,
  },
  {
    id: 5,
    name: "Tom Brown",
    department: "Engineering",
    email: "tom@company.com",
    position: "Frontend Developer",
    selected: false,
    progress: 0,
  },
  {
    id: 6,
    name: "Lisa Davis",
    department: "Marketing",
    email: "lisa@company.com",
    position: "Content Creator",
    selected: false,
    progress: 0,
  },
  {
    id: 7,
    name: "David Lee",
    department: "IT",
    email: "david@company.com",
    position: "System Administrator",
    selected: false,
    progress: 0,
  },
  {
    id: 8,
    name: "Karen White",
    department: "Finance",
    email: "karen@company.com",
    position: "Financial Analyst",
    selected: false,
    progress: 0,
  },
]

const statuses = ["All", "Scheduled", "In Progress", "Completed", "Cancelled"]

export default function TrainingManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)

  const [isAssessEmployeeModalOpen, setIsAssessEmployeeModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [isManageEmployeeAssessmentsModalOpen, setIsManageEmployeeAssessmentsModalOpen] = useState(false)

  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    instructor: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    capacity: "",
    description: "",
    courseId: "",
    selectedEnrollees: [] as string[],
  })

  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    instructor: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    capacity: "",
    status: "",
    courseId: "",
    selectedEnrollees: [] as string[],
  })

  const [assessmentForm, setAssessmentForm] = useState({
    attended: false,
    rating: 0,
    readinessScore: 0,
    comments: "",
    developmentNeeds: "",
    completed: false,
  })

  const [scheduleErrors, setScheduleErrors] = useState({
    basic: "",
    course: "",
    enrollees: "",
  })

  const queryClient = useQueryClient()

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  })

  const { data: trainingSessions = [], isLoading: isLoadingTrainingSessions } = useQuery({
    queryKey: ["trainingSessions"],
    queryFn: getTrainingSessions,
  })

  const { mutate: createSuccessionPlanning, isPending: isCreatingSuccessionPlanning } = useMutation({
    mutationFn: createSuccessionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["successionPlans"] })
      queryClient.invalidateQueries({ queryKey: ["trainingSessions"] })
      setIsAssessEmployeeModalOpen(false)
      toast.success("Succession planning updated successfully")
    }
  })
    
  const { mutate: createSession, isPending: isCreatingSession } = useMutation({
    mutationFn: createTrainingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingSessions"] })
      setIsScheduleModalOpen(false)
      // Reset form
      setScheduleForm({
        title: "",
        instructor: "",
        date: "",
        time: "",
        duration: "",
        location: "",
        capacity: "",
        description: "",
        courseId: "",
        selectedEnrollees: [],
      })

      toast.success("Training session created successfully")
    },
  })

  const { mutate: updateTrainingSessionMutation, isPending: isUpdatingTrainingSession } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateTrainingSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingSessions"] })
      setIsEditSessionModalOpen(false)
      toast.success("Training session updated successfully")
    } 
  })

  const { mutate: updateTrainingRecordMutation, isPending: isUpdatingTrainingRecord } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateTrainingRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingRecords"] })
      setIsManageEmployeeAssessmentsModalOpen(false)
      toast.success("Training record updated successfully")
    }
  })

  const filteredSessions = trainingSessions.filter((session: any) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.trainer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || session.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-600 text-white"
      case "In Progress":
        return "bg-yellow-600 text-white"
      case "Completed":
        return "bg-green-600 text-white"
      case "Cancelled":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const validateScheduleForm = () => {
    const errors = { basic: "", course: "", enrollees: "" }
    let isValid = true

    // Validate basic info
    if (!scheduleForm.title.trim()) {
      errors.basic = "Session title is required"
      isValid = false
    } else if (!scheduleForm.instructor.trim()) {
      errors.basic = "Instructor name is required"
      isValid = false
    } else if (!scheduleForm.date) {
      errors.basic = "Date is required"
      isValid = false
    } else if (!scheduleForm.time) {
      errors.basic = "Time is required"
      isValid = false
    }

    // Validate course selection
    if (!scheduleForm.courseId) {
      errors.course = "Please select a course from the Learning Management System"
      isValid = false
    }

    // Validate enrollees
    if (scheduleForm.selectedEnrollees.length === 0) {
      errors.enrollees = "Please select at least one employee to enroll"
      isValid = false
    }

    setScheduleErrors(errors)
    return isValid
  }

  const getAttendanceRate = (attended: number, enrolled: number) => {
    if (enrolled === 0) return 0
    return Math.round((attended / enrolled) * 100)
  }

  const handleAssessEmployee = (employee: any) => {
    console.log(employee)
    setSelectedEmployee(employee)
    setAssessmentForm({
      attended: employee.attended || false,
      rating: employee.rating || 0,
      readinessScore: employee.readinessScore || 0,
      comments: employee.comments || "",
      developmentNeeds: employee.developmentNeeds || "",
      completed: employee.completed || false,
    })
    setIsAssessEmployeeModalOpen(true)
  }

  const handleViewDetails = (session: any) => {
    console.log("Opening session details for:", session)
    setSelectedSession(session)
    setIsViewDetailsModalOpen(true)
  }

  const handleEditSession = (session: any) => {
    console.log("Opening edit session for:", session)
    setSelectedSession(session)
    setEditForm({
      id: session.id || "",
      title: session.title || "",
      instructor: session.trainer || "",
      date: session.date || "",
      time: session.time || "",
      duration: session.duration || "",
      location: session.location || "",
      capacity: session.capacity?.toString() || "",
      status: session.status || "Scheduled",
      courseId: session.courseId?.toString() || "",
      selectedEnrollees: session.records?.map((e: any) => e.employeeId) || [],
    })
    setIsEditSessionModalOpen(true)
  }

  const handleManageAssessments = (session: any) => {
    console.log("Opening assessment management for:", session)

    const sessionWithEmployees = {
      ...session,
      employees: session.records
        ? session.records.slice(0, 6).map((record: any, index: number) => ({
            ...record,
            rating: index < 3 ? Math.floor(Math.random() * 5) + 1 : 0,
            readinessScore: index < 2 ? Math.floor(Math.random() * 5) + 1 : 0,
            completed: index < 2,
            comments: index < 2 ? "Good performance in training session" : "",
            developmentNeeds: index < 2 ? "Continue with advanced modules" : "",
            selectedForBulk: false,
          }))
        : [],
    };


    console.log(sessionWithEmployees)
    setSelectedSession(sessionWithEmployees)
    setIsManageEmployeeAssessmentsModalOpen(true)
  }

  const handleScheduleNewSession = () => {
    console.log("Opening schedule new session modal")
    setScheduleForm({
      title: "",
      instructor: "",
      date: "",
      time: "",
      duration: "",
      location: "",
      capacity: "",
      description: "",
      courseId: "",
      selectedEnrollees: [],
    })
    setScheduleErrors({ basic: "", course: "", enrollees: "" })
    setIsScheduleModalOpen(true)
  }

  const handleExportSessionData = (sessionId: number) => {
    console.log("Exporting session data:", {
      sessionId,
      exportType: "CSV",
      includeAssessments: true,
      includeAttendance: true,
      timestamp: new Date().toISOString(),
    })
  }

  const handleDuplicateSession = (session: any) => {
    console.log("Duplicating session:", {
      originalSessionId: session.id,
      newSessionData: {
        ...session,
        id: Date.now(), // Generate new ID
        title: `${session.title} (Copy)`,
        date: "", // Clear date for new scheduling
        time: "", // Clear time for new scheduling
        status: "Draft",
      },
      timestamp: new Date().toISOString(),
    })
  }

  const handleSendReminders = (sessionId: number) => {
    console.log("Sending training reminders:", {
      sessionId,
      reminderType: "email",
      recipients: "all_enrolled",
      reminderTime: "24_hours_before",
      timestamp: new Date().toISOString(),
    })
  }

  const handleGenerateCertificates = (sessionId: number) => {
    console.log("Generating completion certificates:", {
      sessionId,
      certificateType: "completion",
      eligibleEmployees: "completed_only",
      templateId: "standard_template",
      timestamp: new Date().toISOString(),
    })
  }

  const handleUpdateSessionStatus = (sessionId: number, newStatus: string) => {
    console.log("Updating session status:", {
      sessionId,
      oldStatus: "current_status",
      newStatus,
      updatedBy: "current_user",
      timestamp: new Date().toISOString(),
    })
  }

  const handleBulkEmployeeOperation = (operation: string, sessionId: number, employeeIds: number[]) => {
    console.log("Bulk employee operation:", {
      operation,
      sessionId,
      employeeIds,
      affectedCount: employeeIds.length,
      timestamp: new Date().toISOString(),
    })
  }

  const handleDownloadMaterial = (materialName: string, sessionId: number) => {
    console.log("Downloading training material:", {
      materialName,
      sessionId,
      downloadUrl: `/api/materials/${sessionId}/${materialName}`,
      timestamp: new Date().toISOString(),
    })
  }

  const handleSubmitFeedback = (sessionId: number, feedback: any) => {
    console.log("Submitting session feedback:", {
      sessionId,
      feedback,
      submittedBy: "current_user",
      timestamp: new Date().toISOString(),
    })
  }

  const resetAssessmentForm = () => {
    setAssessmentForm({
      attended: false,
      rating: 0,
      readinessScore: 0,
      comments: "",
      developmentNeeds: "",
      completed: false,
    })
  }

  const handleScheduleTraining = () => {
    handleScheduleNewSession()
  }

  const handleDeleteSession = (sessionId: number) => {
    console.log("Deleting session:", sessionId)
  }

  const handleScheduleSubmit = () => {
    if (validateScheduleForm()) {
      createSession(scheduleForm)
    }
  }

  const submitEmployeeAssessment = (sessionId: number, employeeId: number, assessmentForm: any) => {
    const data =  {
      sessionId,
      employeeId,
      assessmentForm,
      submittedBy: "current_user",
      timestamp: new Date().toISOString(),
    }
    createSuccessionPlanning({
      ...data
    })
  }

  const markTrainingCompleted = ( employeeId: any) => {
    const data = {
      attendance: assessmentForm.attended,
      completed: true,
      completedAt: new Date().toISOString(),
    }

    updateTrainingRecordMutation({ id: employeeId, data })
  }

  const updateEmployeeProgress = (sessionId: any, employeeId: any, progressData: any) => {
    console.log("Updating employee progress:", {
      sessionId,
      employeeId,
      progressData,
      updatedBy: "current_user",
      timestamp: new Date().toISOString(),
    })
  }

  if(isLoadingTrainingSessions || isLoadingCourses) {
    <FullPageLoader message="Loading training sessions..." showLogo={false} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Training Management</h2>
        <Button
          className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
          onClick={handleScheduleTraining}
        >
          <Plus size={16} />
          Schedule Training
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">48</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">36</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Attendance</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Filters</CardTitle>
          <CardDescription className="text-gray-600">Filter training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                className="pl-9 bg-white border border-gray-300 focus:border-blue-500 text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
                >
                  <Filter size={16} />
                  Status: {selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-200">
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className="text-gray-900 hover:bg-gray-100"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="gap-2 border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
              onClick={() => {
                setSearchTerm("")
                setSelectedStatus("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Sessions Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Training Sessions</CardTitle>
          <CardDescription className="text-gray-600">{filteredSessions.length} sessions found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-700 font-semibold min-w-[200px]">Session</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[120px]">Instructor</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[120px]">Date & Time</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[80px]">Duration</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[100px]">Enrollment</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[100px]">Attendance</TableHead>
                  <TableHead className="text-gray-700 font-semibold min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session: any) => (
                  <TableRow key={session.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{session.title}</div>
                        <div className="text-sm text-gray-500">{session.location}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">{session.trainer}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-gray-900">{new Date(session.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(session.date).toLocaleTimeString()}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900">{session.duration} Hours</TableCell>
                    <TableCell>
                      <div className="text-gray-900">
                        {session.records.length}/{session.capacity}
                        <div className="text-sm text-gray-500">
                          {Math.round((session.records.length / session.capacity) * 100)}% full
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.status !== "Completed" ? (
                        <div>
                          <div className="text-gray-900">
                            {session.records.filter((rec: any) => rec.attendance).length}/{session.records.length}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getAttendanceRate(session.records.filter((rec: any) => rec.attendance).length, session.records.length)}% attended
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`px-3 py-1 ${getStatusBadgeColor(session.status)}`}>{session.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(session)}
                            className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditSession(session)}
                            className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Edit size={16} className="mr-2" />
                            Edit Session
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManageAssessments(session)}
                            className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Users size={16} className="mr-2" />
                            Assess Employees
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

      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Schedule New Training Session</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new training session with course selection and enrollee management
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger
                value="basic"
                className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="course"
                className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
              >
                Course Selection
              </TabsTrigger>
              <TabsTrigger
                value="enrollees"
                className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
              >
                Add Enrollees
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              {scheduleErrors.basic && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{scheduleErrors.basic}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor" className="text-sm font-medium">
                    Instructor *
                  </Label>
                  <Input
                    id="instructor"
                    placeholder="Enter instructor name"
                    className="bg-white border-gray-300 text-gray-900 text-sm"
                    value={scheduleForm.instructor}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, instructor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="bg-white border-gray-300 text-gray-900 text-sm"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium">
                    Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    className="bg-white border-gray-300 text-gray-900 text-sm"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Duration
                  </Label>
                  <Select
                    value={scheduleForm.duration}
                    onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-sm">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                      <SelectItem value="4 hours">4 hours</SelectItem>
                      <SelectItem value="6 hours">6 hours</SelectItem>
                      <SelectItem value="8 hours">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter location or 'Online'"
                    className="bg-white border-gray-300 text-gray-900 text-sm"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-medium">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Maximum attendees"
                    className="bg-white border-gray-300 text-gray-900 text-sm"
                    value={scheduleForm.capacity}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, capacity: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter session description and objectives"
                  className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="course" className="space-y-4 mt-6">
              {scheduleErrors.course && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{scheduleErrors.course}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Select Course from Learning Management System *
                  </Label>
                  <div className="grid gap-3">
                    {courses?.map((course: any) => (
                      <Card
                        key={course.id}
                        className={`cursor-pointer transition-all border-2 ${
                          scheduleForm.courseId === course.id.toString()
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setScheduleForm((prev) => ({
                            ...prev,
                            courseId: course.id.toString(),
                            title: course.title,
                            duration: course.duration,
                            selectedEnrollees: [], // reset enrollees when changing course
                          }))
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{course.title}</h4>
                              <p className="text-sm text-gray-600">
                                {course.category} • {course.duration}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{course.description}</p>
                            </div>
                            <div className="flex items-center">
                              {scheduleForm.courseId === course.id.toString() && (
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                  {scheduleForm.courseId && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-medium">Course Selected</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        {courses.find((c: any) => c.id.toString() === scheduleForm.courseId)?.title} has been selected for
                        this training session.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>


              {/* ENROLLEES */}
              <TabsContent value="enrollees" className="space-y-4 mt-6">
                {scheduleErrors.enrollees && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{scheduleErrors.enrollees}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Select Employees from Enrollment Management *
                    </Label>

                    {/* Filter enrollees by selected course */}
                    {scheduleForm.courseId ? (
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-200">
                              <TableHead className="text-gray-700 text-sm w-12">Select</TableHead>
                              <TableHead className="text-gray-700 text-sm">Employee</TableHead>
                              <TableHead className="text-gray-700 text-sm">Department</TableHead>
                              <TableHead className="text-gray-700 text-sm">Position</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {courses
                              .find((c: any) => c.id.toString() === scheduleForm.courseId)
                              ?.enrollments.map((enrollee: any, index: number) => (
                                <TableRow key={index} className="border-gray-200">
                                  <TableCell>
                                    <Checkbox
                                      checked={scheduleForm.selectedEnrollees.includes(String(enrollee.employee.id))}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setScheduleForm((prev) => ({
                                            ...prev,
                                            selectedEnrollees: [...prev.selectedEnrollees, String(enrollee.employee.id)],
                                          }))
                                        } else {
                                          setScheduleForm((prev) => ({
                                            ...prev,
                                            selectedEnrollees: prev.selectedEnrollees.filter((id) => id !== String(enrollee.employee.id)),
                                          }))
                                        }
                                      }}
                                      className="border-gray-300 data-[state=checked]:bg-blue-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="text-gray-900 text-sm font-medium">{enrollee.employee.name}</div>
                                      <div className="text-gray-500 text-xs">{enrollee.employee.email}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-gray-600 text-sm">{enrollee.employee.department}</TableCell>
                                  <TableCell className="text-gray-600 text-sm">{enrollee.employee.position}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Please select a course first to view available enrollees.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsScheduleModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Cancel
            </Button>
            <Button onClick={handleScheduleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm" disabled={isCreatingSession}>
              <Save size={16} className="mr-2" />
              {isCreatingSession ? "Scheduling..." : "Schedule Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] min-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{selectedSession?.title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              Detailed information about this training session
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="course" className="text-xs sm:text-sm">
                  Course
                </TabsTrigger>
                <TabsTrigger value="attendees" className="text-xs sm:text-sm">
                  Attendees
                </TabsTrigger>
                <TabsTrigger value="feedback" className="text-xs sm:text-sm">
                  Feedback
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Session Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="text-gray-900">Instructor:</span> {selectedSession.trainer}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Date:</span> {new Date(selectedSession.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Time:</span> {new Date(selectedSession.date).toLocaleTimeString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Duration:</span> {selectedSession.duration} hours
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Location:</span> {selectedSession.location}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Enrollment Stats</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="text-gray-900">Capacity:</span> {selectedSession.capacity}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Enrolled:</span> {selectedSession.records.length}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Attended:</span> {selectedSession.records.filter((rec: any) => rec.attendance).length}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Attendance Rate:</span>{" "}
                          {getAttendanceRate(selectedSession.records.filter((rec: any) => rec.attendance).length, selectedSession.records.length)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="course" className="space-y-4">
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Associated Course from Learning Management
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="text-gray-900">Course:</span> {selectedSession.course.title}
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-900">Category:</span> {selectedSession.course.category}
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-900">Duration:</span> {selectedSession.course.duration} hours
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-900">Description:</span> {selectedSession.course.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendees" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-sm">Name</TableHead>
                        <TableHead className="text-gray-700 text-sm">Department</TableHead>
                        <TableHead className="text-gray-700 text-sm">Position</TableHead>
                        <TableHead className="text-gray-700 text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSession.records.slice(0, 4).map((enrollee: any, index: number) => (
                        <TableRow key={index} className="border-gray-200">
                          <TableCell>
                            <div>
                              <div className="text-gray-900 text-sm font-medium">{enrollee.employee.name}</div>
                              <div className="text-gray-500 text-xs">{enrollee.employee.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">{enrollee.employee.department}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{enrollee.employee.position}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                enrollee.employee.attendance ? "bg-green-600 text-white text-xs" : "bg-yellow-600 text-white text-xs"
                              }
                            >
                              {enrollee.employee.attendance ? "Attended" : "Enrolled"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Session Rating: 4.5/5</h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">"Excellent session with practical examples"</p>
                        <p className="text-gray-500 text-xs">- John Doe</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">"Very informative and well-structured"</p>
                        <p className="text-gray-500 text-xs">- Jane Smith</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDetailsModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSessionModalOpen} onOpenChange={setIsEditSessionModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Training Session</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update the details, course, and enrollees of this training session
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="basic" className="text-sm">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="course" className="text-sm">
                  Course
                </TabsTrigger>
                <TabsTrigger value="enrollees" className="text-sm">
                  Enrollees
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-sm font-medium">
                      Session Title
                    </Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-instructor" className="text-sm font-medium">
                      Instructor
                    </Label>
                    <Input
                      id="edit-instructor"
                      value={editForm.instructor}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, instructor: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date" className="text-sm font-medium">
                      Date
                    </Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-time" className="text-sm font-medium">
                      Time
                    </Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, time: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration" className="text-sm font-medium">
                      Duration
                    </Label>
                    <Input
                      id="edit-duration"
                      value={editForm.duration}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, duration: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-location" className="text-sm font-medium">
                      Location
                    </Label>
                    <Input
                      id="edit-location"
                      value={editForm.location}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-capacity" className="text-sm font-medium">
                      Capacity
                    </Label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, capacity: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="course" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Select Course from Learning Management</Label>
                  <Select
                    value={editForm.courseId}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{course.title}</span>
                            <span className="text-xs text-gray-500">
                              {course.category} • {course.duration}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {editForm.courseId && (
                    <Card className="border-blue-500 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              { courses.find((c: any) => c.id.toString() === editForm.courseId)?.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {courses.find((c: any) => c.id.toString() === editForm.courseId)?.category} •
                              {courses.find((c: any) => c.id.toString() === editForm.courseId)?.duration}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

            <TabsContent value="enrollees" className="space-y-4 mt-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Select Enrollees from Enrollment Management
                </Label>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="text-gray-700 text-sm">Employee</TableHead>
                        <TableHead className="text-gray-700 text-sm">Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses
                        .find((c: any) => c.id.toString() === editForm.courseId)
                        ?.enrollments.map((enrollee: any, index: number) => {
                          const empId = String(enrollee.employeeId);

                          return (
                            <TableRow key={index} className="border-gray-200">
                              <TableCell>
                                <Checkbox
                                  checked={editForm.selectedEnrollees.includes(empId)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setEditForm((prev) => ({
                                        ...prev,
                                        selectedEnrollees: prev.selectedEnrollees.includes(empId)
                                          ? prev.selectedEnrollees // already exists → don't duplicate
                                          : [...prev.selectedEnrollees, empId],
                                      }));
                                    } else {
                                      setEditForm((prev) => ({
                                        ...prev,
                                        selectedEnrollees: prev.selectedEnrollees.filter((id) => id !== empId),
                                      }));
                                    }
                                  }}
                                  className="border-gray-300 data-[state=checked]:bg-blue-600"
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-gray-900 text-sm font-medium">
                                    {enrollee.employee?.name}
                                  </div>
                                  <div className="text-gray-500 text-xs">{enrollee.employee?.email}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600 text-sm">
                                {enrollee.employee?.department}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {editForm.selectedEnrollees.length} enrollees
                </p>
              </div>
            </TabsContent>

            </Tabs>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditSessionModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateTrainingSessionMutation({id: editForm.id, data: editForm})
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              disabled={isUpdatingTrainingSession}
            >
              <Save size={16} className="mr-2" />
              {isUpdatingTrainingSession ? "Updating..." : "Update Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessEmployeeModalOpen} onOpenChange={setIsAssessEmployeeModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Assess Employee & Update Succession Planning</DialogTitle>
            <DialogDescription className="text-gray-600">
              Evaluate {selectedEmployee?.employee?.name} for {selectedSession?.employee?.title} and update succession planning readiness
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee:</span>
                    <span className="text-gray-900 ml-2">{selectedEmployee.employee?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="text-gray-900 ml-2">{selectedEmployee.employee?.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 ml-2">{selectedEmployee.employee?.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attended"
                    checked={assessmentForm.attended}
                    onCheckedChange={(checked) =>
                      setAssessmentForm((prev) => ({ ...prev, attended: checked as boolean }))
                    }
                    className="border-gray-300 data-[state=checked]:bg-green-600"
                  />
                  <Label htmlFor="attended" className="text-sm font-medium">
                    Employee attended the training session
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Performance Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAssessmentForm((prev) => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={
                            star <= assessmentForm.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400 hover:text-yellow-300"
                          }
                        />
                      </button>
                    ))}
                    <span className="text-gray-900 ml-2">{assessmentForm.rating}/5</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Succession Planning Readiness Score
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setAssessmentForm((prev) => ({ ...prev, readinessScore: score }))}
                        className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                          score <= assessmentForm.readinessScore
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                    <span className="text-gray-900 ml-2">{assessmentForm.readinessScore}/5</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Rate employee's readiness for succession planning based on this training performance
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-sm font-medium">
                    Assessment Comments
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Enter detailed feedback about the employee's performance, participation, and areas for improvement..."
                    value={assessmentForm.comments}
                    onChange={(e) => setAssessmentForm((prev) => ({ ...prev, comments: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900 text-sm min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="developmentNeeds" className="text-sm font-medium">
                    Development Needs for Succession Planning
                  </Label>
                  <Textarea
                    id="developmentNeeds"
                    placeholder="Identify specific areas for development to improve succession readiness..."
                    value={assessmentForm.developmentNeeds}
                    onChange={(e) => setAssessmentForm((prev) => ({ ...prev, developmentNeeds: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={assessmentForm.completed}
                    onCheckedChange={(checked) =>
                      setAssessmentForm((prev) => ({ ...prev, completed: checked as boolean }))
                    }
                    className="border-gray-300 data-[state=checked]:bg-green-600"
                  />
                  <Label htmlFor="completed" className="text-sm font-medium">
                    Mark training as completed for this employee
                  </Label>
                </div>

                {assessmentForm.completed && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-green-800 text-sm font-medium">Training Completion</span>
                    </div>
                    <p className="text-green-700 text-xs mt-1">
                      This will mark the training as 100% complete and update the employee's training record and
                      succession planning profile.
                    </p>
                  </div>
                )}

                {assessmentForm.rating >= 4 && assessmentForm.readinessScore >= 4 && assessmentForm.attended && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-600" />
                      <span className="text-blue-800 text-sm font-medium">High Succession Potential</span>
                    </div>
                    <p className="text-blue-700 text-xs mt-1">
                      High performance and readiness scores will significantly boost this employee's succession planning
                      profile and leadership potential assessment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAssessEmployeeModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedEmployee && selectedSession) {
                  submitEmployeeAssessment(selectedSession.id, selectedEmployee.id, assessmentForm)
                  if (assessmentForm.completed) {
                    markTrainingCompleted(selectedEmployee.id)
                  }
                  updateEmployeeProgress(selectedSession.id, selectedEmployee.id, {
                    progress: assessmentForm.completed ? 100 : assessmentForm.rating * 20,
                    ...assessmentForm,
                  })
                  // Reset form after submission
                  resetAssessmentForm()
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              disabled = {isCreatingSuccessionPlanning}
            >
              <Save size={16} className="mr-2" />
              {isCreatingSuccessionPlanning ? "Saving & Updating..." : "Save Assessment & Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Employee Assessments */}

     <Dialog open={isManageEmployeeAssessmentsModalOpen} onOpenChange={setIsManageEmployeeAssessmentsModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] min-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Manage Employee Assessments - {selectedSession?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Assess and manage employee performance for this training session
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <Tabs defaultValue="assessments" className="w-full">

              <TabsContent value="assessments" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Employee Assessments</h3>
                    <p className="text-sm text-gray-600">
                      {selectedSession.records.length} employees enrolled in this session
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 bg-gray-50">
                        <TableHead className="text-gray-700 text-sm font-semibold">Employee</TableHead>
                        <TableHead className="text-gray-700 text-sm font-semibold">Position</TableHead>
                        <TableHead className="text-gray-700 text-sm font-semibold">Department</TableHead>
                        <TableHead className="text-gray-700 text-sm font-semibold">Attended</TableHead>
                        <TableHead className="text-gray-700 text-sm font-semibold text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSession.records.map((employee: any) => (
                        <TableRow key={employee.id} className="border-gray-200 hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="text-gray-900 text-sm font-medium">{employee.employee.name}</div>
                              <div className="text-gray-500 text-xs">{employee.employee.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">{employee.employee.position}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{employee.employee.department}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="ml-2 text-sm text-gray-600">{employee.attendance ? "Yes" : "No"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAssessEmployee(employee)}
                              className="border-gray-300 text-gray-900 hover:bg-gray-100 text-xs bg-white"
                            >
                              Assess
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsManageEmployeeAssessmentsModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Close
            </Button>
            {/* <Button
              onClick={() => {
                // Enhanced save all assessments functionality
                console.log("Saving comprehensive assessment data:", {
                  sessionId: selectedSession.id,
                  sessionTitle: selectedSession.title,
                  operation: "save_all_assessments",
                  assessmentData: {
                    totalEmployees: selectedSession.employees.length,
                    attendedCount: selectedSession.employees.filter((e: any) => e.attended).length,
                    ratedCount: selectedSession.employees.filter((e: any) => e.rating > 0).length,
                    completedCount: selectedSession.employees.filter((e: any) => e.completed).length,
                    averageRating:
                      selectedSession.employees.filter((e: any) => e.rating > 0).length > 0
                        ? (
                            selectedSession.employees
                              .filter((e: any) => e.rating > 0)
                              .reduce((sum: number, e: any) => sum + e.rating, 0) /
                            selectedSession.employees.filter((e: any) => e.rating > 0).length
                          ).toFixed(2)
                        : 0,
                    averageReadiness:
                      selectedSession.employees.filter((e: any) => e.readinessScore > 0).length > 0
                        ? (
                            selectedSession.employees
                              .filter((e: any) => e.readinessScore > 0)
                              .reduce((sum: number, e: any) => sum + e.readinessScore, 0) /
                            selectedSession.employees.filter((e: any) => e.readinessScore > 0).length
                          ).toFixed(2)
                        : 0,
                  },
                  employeeAssessments: selectedSession.employees.map((emp: any) => ({
                    id: emp.id,
                    name: emp.name,
                    department: emp.department,
                    attended: emp.attended,
                    rating: emp.rating,
                    readinessScore: emp.readinessScore,
                    completed: emp.completed,
                    comments: emp.comments,
                    developmentNeeds: emp.developmentNeeds,
                  })),
                  timestamp: new Date().toISOString(),
                })
                setIsManageEmployeeAssessmentsModalOpen(false)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Save size={16} className="mr-2" />
              Save All Assessments
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

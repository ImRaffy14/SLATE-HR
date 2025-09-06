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
  UserCheck,
  UserX,
  Star,
  Award,
  TrendingUp,
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

const trainingSessions = [
  {
    id: 1,
    title: "React Advanced Patterns",
    instructor: "Sarah Johnson",
    date: "2024-01-15",
    time: "09:00 AM",
    duration: "4 hours",
    capacity: 20,
    enrolled: 18,
    attended: 16,
    status: "Completed",
    location: "Room A",
    employees: [
      {
        id: 1,
        name: "John Doe",
        department: "Engineering",
        email: "john@company.com",
        attended: true,
        rating: 4,
        comments: "Great participation",
        completed: true,
        progress: 100,
      },
      {
        id: 2,
        name: "Jane Smith",
        department: "Marketing",
        email: "jane@company.com",
        attended: true,
        rating: 5,
        comments: "Excellent understanding",
        completed: true,
        progress: 100,
      },
      {
        id: 3,
        name: "Mike Johnson",
        department: "Sales",
        email: "mike@company.com",
        attended: false,
        rating: 0,
        comments: "",
        completed: false,
        progress: 0,
      },
      {
        id: 4,
        name: "Sarah Wilson",
        department: "HR",
        email: "sarah@company.com",
        attended: true,
        rating: 3,
        comments: "Needs improvement",
        completed: false,
        progress: 75,
      },
    ],
  },
  {
    id: 2,
    title: "Leadership Workshop",
    instructor: "Mike Davis",
    date: "2024-01-20",
    time: "02:00 PM",
    duration: "6 hours",
    capacity: 15,
    enrolled: 12,
    attended: 0,
    status: "Scheduled",
    location: "Conference Hall",
    employees: [
      {
        id: 5,
        name: "Tom Brown",
        department: "Engineering",
        email: "tom@company.com",
        attended: false,
        rating: 0,
        comments: "",
        completed: false,
        progress: 0,
      },
      {
        id: 6,
        name: "Lisa Davis",
        department: "Marketing",
        email: "lisa@company.com",
        attended: false,
        rating: 0,
        comments: "",
        completed: false,
        progress: 0,
      },
    ],
  },
  {
    id: 3,
    title: "Data Science Fundamentals",
    instructor: "Emily Chen",
    date: "2024-01-18",
    time: "10:00 AM",
    duration: "8 hours",
    capacity: 25,
    enrolled: 22,
    attended: 20,
    status: "Completed",
    location: "Lab B",
    employees: [
      {
        id: 7,
        name: "David Lee",
        department: "IT",
        email: "david@company.com",
        attended: true,
        rating: 4,
        comments: "Quick learner",
        completed: true,
        progress: 100,
      },
      {
        id: 8,
        name: "Karen White",
        department: "Finance",
        email: "karen@company.com",
        attended: true,
        rating: 3,
        comments: "Good effort",
        completed: true,
        progress: 100,
      },
    ],
  },
  {
    id: 4,
    title: "Agile Methodology",
    instructor: "John Smith",
    date: "2024-01-25",
    time: "01:00 PM",
    duration: "3 hours",
    capacity: 30,
    enrolled: 28,
    attended: 0,
    status: "Scheduled",
    location: "Online",
    employees: [
      {
        id: 9,
        name: "Kevin Green",
        department: "Sales",
        email: "kevin@company.com",
        attended: false,
        rating: 0,
        comments: "",
        completed: false,
        progress: 0,
      },
      {
        id: 10,
        name: "Amy Black",
        department: "HR",
        email: "amy@company.com",
        attended: false,
        rating: 0,
        comments: "",
        completed: false,
        progress: 0,
      },
    ],
  },
  {
    id: 5,
    title: "Communication Skills",
    instructor: "Lisa Brown",
    date: "2024-01-12",
    time: "11:00 AM",
    duration: "5 hours",
    capacity: 18,
    enrolled: 15,
    attended: 14,
    status: "Completed",
    location: "Room C",
    employees: [
      {
        id: 11,
        name: "Chris Blue",
        department: "Marketing",
        email: "chris@company.com",
        attended: true,
        rating: 5,
        comments: "Exceptional communication",
        completed: true,
        progress: 100,
      },
      {
        id: 12,
        name: "Laura Gray",
        department: "Engineering",
        email: "laura@company.com",
        attended: true,
        rating: 4,
        comments: "Clear and concise",
        completed: true,
        progress: 100,
      },
    ],
  },
]

const statuses = ["All", "Scheduled", "In Progress", "Completed", "Cancelled"]

export default function TrainingManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false)
  const [isManageAttendanceModalOpen, setIsManageAttendanceModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)

  const [isManageEmployeeAssessmentsModalOpen, setIsManageEmployeeAssessmentsModalOpen] = useState(false)
  const [isAssessEmployeeModalOpen, setIsAssessEmployeeModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [assessmentForm, setAssessmentForm] = useState({
    rating: 0,
    comments: "",
    completed: false,
    attended: false,
  })

  const filteredSessions = trainingSessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.instructor.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getAttendanceRate = (attended: number, enrolled: number) => {
    if (enrolled === 0) return 0
    return Math.round((attended / enrolled) * 100)
  }

  const handleScheduleTraining = () => {
    setIsScheduleModalOpen(true)
  }

  const handleViewDetails = (session: any) => {
    setSelectedSession(session)
    setIsViewDetailsModalOpen(true)
  }

  const handleEditSession = (session: any) => {
    setSelectedSession(session)
    setIsEditSessionModalOpen(true)
  }

  const handleManageAttendance = (session: any) => {
    setSelectedSession(session)
    setIsManageAttendanceModalOpen(true)
  }

  const handleManageEmployeeAssessments = (session: any) => {
    setSelectedSession(session)
    setIsManageEmployeeAssessmentsModalOpen(true)
  }

  const handleAssessEmployee = (employee: any) => {
    setSelectedEmployee(employee)
    setAssessmentForm({
      rating: employee.rating || 0,
      comments: employee.comments || "",
      completed: employee.completed || false,
      attended: employee.attended || false,
    })
    setIsAssessEmployeeModalOpen(true)
  }

  const submitEmployeeAssessment = (sessionId: number, employeeId: number, assessmentData: any) => {
    console.log("Submitting employee assessment:", {
      sessionId,
      employeeId,
      assessmentData,
      timestamp: new Date().toISOString(),
    })
    setIsAssessEmployeeModalOpen(false)
  }

  const updateEmployeeProgress = (sessionId: number, employeeId: number, progressData: any) => {
    console.log("Updating employee progress:", {
      sessionId,
      employeeId,
      progressData,
      timestamp: new Date().toISOString(),
    })
  }

  const markTrainingCompleted = (sessionId: number, employeeId: number) => {
    console.log("Marking training as completed:", {
      sessionId,
      employeeId,
      completedAt: new Date().toISOString(),
    })
  }

  const bulkAssessEmployees = (sessionId: number, assessments: any[]) => {
    console.log("Bulk assessing employees:", {
      sessionId,
      assessments,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Training Management</h2>
        <Button
          className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700"
          onClick={handleScheduleTraining}
        >
          <Plus size={16} />
          Schedule Training
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Total Sessions</p>
                <p className="text-2xl font-bold text-white">48</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Total Attendees</p>
                <p className="text-2xl font-bold text-white">342</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-white">36</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-300">Avg. Attendance</p>
                <p className="text-2xl font-bold text-white">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
          <CardDescription className="text-gray-300">Filter training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search sessions..."
                className="pl-9 bg-gray-700 border-2 border-gray-600 focus:border-gray-500 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
                >
                  <Filter size={16} />
                  Status: {selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-600">
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className="text-white hover:bg-gray-700"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="gap-2 border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
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
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Training Sessions</CardTitle>
          <CardDescription className="text-gray-300">{filteredSessions.length} sessions found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300 font-semibold min-w-[200px]">Session</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[120px]">Instructor</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[120px]">Date & Time</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[80px]">Duration</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[100px]">Enrollment</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[100px]">Attendance</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[100px]">Progress</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right text-gray-300 font-semibold min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id} className="border-gray-600 hover:bg-gray-700">
                    {/* ... existing cells ... */}
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{session.title}</div>
                        <div className="text-sm text-gray-400">{session.location}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{session.instructor}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-white">{session.date}</div>
                        <div className="text-sm text-gray-400">{session.time}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{session.duration}</TableCell>
                    <TableCell>
                      <div className="text-white">
                        {session.enrolled}/{session.capacity}
                        <div className="text-sm text-gray-400">
                          {Math.round((session.enrolled / session.capacity) * 100)}% full
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.status === "Completed" ? (
                        <div>
                          <div className="text-white">
                            {session.attended}/{session.enrolled}
                          </div>
                          <div className="text-sm text-gray-400">
                            {getAttendanceRate(session.attended, session.enrolled)}% attended
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {session.employees ? (
                        <div>
                          <div className="text-white">
                            {session.employees.filter((emp) => emp.completed).length}/{session.employees.length}
                          </div>
                          <div className="text-sm text-gray-400">
                            {Math.round(
                              (session.employees.filter((emp) => emp.completed).length / session.employees.length) *
                                100,
                            )}
                            % completed
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(session.status)}>{session.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                          <DropdownMenuItem
                            className="gap-2 text-white hover:bg-gray-700"
                            onClick={() => handleViewDetails(session)}
                          >
                            <Eye size={16} />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-white hover:bg-gray-700"
                            onClick={() => handleEditSession(session)}
                          >
                            <Edit size={16} />
                            Edit Session
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-white hover:bg-gray-700"
                            onClick={() => handleManageAttendance(session)}
                          >
                            <Users size={16} />
                            Manage Attendance
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-white hover:bg-gray-700"
                            onClick={() => handleManageEmployeeAssessments(session)}
                          >
                            <Award size={16} />
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
        <DialogContent className="bg-gray-800 border-gray-600 text-white w-[95vw] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Schedule New Training Session</DialogTitle>
            <DialogDescription className="text-gray-300">
              Create a new training session for your organization
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Session Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter session title"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-sm font-medium">
                  Instructor
                </Label>
                <Input
                  id="instructor"
                  placeholder="Enter instructor name"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date
                </Label>
                <Input id="date" type="date" className="bg-gray-700 border-gray-600 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">
                  Time
                </Label>
                <Input id="time" type="time" className="bg-gray-700 border-gray-600 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration
                </Label>
                <Select>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
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
                  className="bg-gray-700 border-gray-600 text-white text-sm"
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
                  className="bg-gray-700 border-gray-600 text-white text-sm"
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
                className="bg-gray-700 border-gray-600 text-white text-sm min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsScheduleModalOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsScheduleModalOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Save size={16} className="mr-2" />
              Schedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white w-[95vw] max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{selectedSession?.title}</DialogTitle>
            <DialogDescription className="text-gray-300">
              Detailed information about this training session
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-700">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="attendees" className="text-xs sm:text-sm">
                  Attendees
                </TabsTrigger>
                <TabsTrigger value="materials" className="text-xs sm:text-sm">
                  Materials
                </TabsTrigger>
                <TabsTrigger value="feedback" className="text-xs sm:text-sm">
                  Feedback
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-2 text-sm">Session Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">
                          <span className="text-white">Instructor:</span> {selectedSession.instructor}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-white">Date:</span> {selectedSession.date}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-white">Time:</span> {selectedSession.time}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-white">Duration:</span> {selectedSession.duration}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-white">Location:</span> {selectedSession.location}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-2 text-sm">Enrollment Stats</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">
                          <span className="text-white">Capacity:</span> {selectedSession.capacity}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-white">Enrolled:</span> {selectedSession.enrolled}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-white">Attended:</span> {selectedSession.attended}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-white">Attendance Rate:</span>{" "}
                          {getAttendanceRate(selectedSession.attended, selectedSession.enrolled)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="attendees" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-600">
                        <TableHead className="text-gray-300 text-sm">Name</TableHead>
                        <TableHead className="text-gray-300 text-sm">Department</TableHead>
                        <TableHead className="text-gray-300 text-sm">Status</TableHead>
                        <TableHead className="text-gray-300 text-sm">Completion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"].map((name, index) => (
                        <TableRow key={index} className="border-gray-600">
                          <TableCell className="text-white text-sm">{name}</TableCell>
                          <TableCell className="text-gray-300 text-sm">Engineering</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                index < 3 ? "bg-green-600 text-white text-xs" : "bg-yellow-600 text-white text-xs"
                              }
                            >
                              {index < 3 ? "Attended" : "Enrolled"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">{index < 3 ? "100%" : "0%"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div className="space-y-3">
                  {["Session Slides.pdf", "Exercise Workbook.docx", "Reference Guide.pdf"].map((material, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">{material}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-white hover:bg-gray-600 text-xs bg-transparent"
                          >
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-3 text-sm">Session Rating: 4.5/5</h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="text-white font-medium">"Excellent session with practical examples"</p>
                        <p className="text-gray-400 text-xs">- John Doe</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-white font-medium">"Very informative and well-structured"</p>
                        <p className="text-gray-400 text-xs">- Jane Smith</p>
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
              className="border-gray-600 text-white hover:bg-gray-700 text-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSessionModalOpen} onOpenChange={setIsEditSessionModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white w-[95vw] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Training Session</DialogTitle>
            <DialogDescription className="text-gray-300">Update the details of this training session</DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm font-medium">
                    Session Title
                  </Label>
                  <Input
                    id="edit-title"
                    defaultValue={selectedSession.title}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-instructor" className="text-sm font-medium">
                    Instructor
                  </Label>
                  <Input
                    id="edit-instructor"
                    defaultValue={selectedSession.instructor}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
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
                    defaultValue={selectedSession.date}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time" className="text-sm font-medium">
                    Time
                  </Label>
                  <Input
                    id="edit-time"
                    type="time"
                    defaultValue={selectedSession.time}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration" className="text-sm font-medium">
                    Duration
                  </Label>
                  <Input
                    id="edit-duration"
                    defaultValue={selectedSession.duration}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
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
                    defaultValue={selectedSession.location}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity" className="text-sm font-medium">
                    Capacity
                  </Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    defaultValue={selectedSession.capacity}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </Label>
                <Select defaultValue={selectedSession.status}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditSessionModalOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsEditSessionModalOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageAttendanceModalOpen} onOpenChange={setIsManageAttendanceModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white w-[95vw] max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Manage Attendance</DialogTitle>
            <DialogDescription className="text-gray-300">
              Mark attendance for {selectedSession?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-700 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-300">Session:</span>
                  <span className="text-white ml-2">{selectedSession.title}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">Date:</span>
                  <span className="text-white ml-2">{selectedSession.date}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">Enrolled:</span>
                  <span className="text-white ml-2">{selectedSession.enrolled}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600">
                      <TableHead className="text-gray-300 text-sm">Attendee</TableHead>
                      <TableHead className="text-gray-300 text-sm">Department</TableHead>
                      <TableHead className="text-gray-300 text-sm">Email</TableHead>
                      <TableHead className="text-center text-gray-300 text-sm">Present</TableHead>
                      <TableHead className="text-center text-gray-300 text-sm">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "John Doe", department: "Engineering", email: "john@company.com", present: true },
                      { name: "Jane Smith", department: "Marketing", email: "jane@company.com", present: true },
                      { name: "Mike Johnson", department: "Sales", email: "mike@company.com", present: false },
                      { name: "Sarah Wilson", department: "HR", email: "sarah@company.com", present: true },
                      { name: "Tom Brown", department: "Engineering", email: "tom@company.com", present: false },
                    ].map((attendee, index) => (
                      <TableRow key={index} className="border-gray-600">
                        <TableCell className="text-white text-sm font-medium">{attendee.name}</TableCell>
                        <TableCell className="text-gray-300 text-sm">{attendee.department}</TableCell>
                        <TableCell className="text-gray-300 text-sm">{attendee.email}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={attendee.present}
                            className="border-gray-600 data-[state=checked]:bg-green-600"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={!attendee.present}
                            className="border-gray-600 data-[state=checked]:bg-red-600"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 p-4 bg-gray-700 rounded-lg">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                  <UserCheck size={16} className="mr-2" />
                  Mark All Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-600 text-xs bg-transparent"
                >
                  <UserX size={16} className="mr-2" />
                  Mark All Absent
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsManageAttendanceModalOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsManageAttendanceModalOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Save size={16} className="mr-2" />
              Save Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageEmployeeAssessmentsModalOpen} onOpenChange={setIsManageEmployeeAssessmentsModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white w-[95vw] max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Manage Employee Assessments</DialogTitle>
            <DialogDescription className="text-gray-300">
              Assess and track progress for {selectedSession?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-700 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-300">Session:</span>
                  <span className="text-white ml-2">{selectedSession.title}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">Date:</span>
                  <span className="text-white ml-2">{selectedSession.date}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-300">Enrolled:</span>
                  <span className="text-white ml-2">{selectedSession.employees?.length || 0}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600">
                      <TableHead className="text-gray-300 text-sm">Employee</TableHead>
                      <TableHead className="text-gray-300 text-sm">Department</TableHead>
                      <TableHead className="text-center text-gray-300 text-sm">Attended</TableHead>
                      <TableHead className="text-center text-gray-300 text-sm">Rating</TableHead>
                      <TableHead className="text-center text-gray-300 text-sm">Progress</TableHead>
                      <TableHead className="text-center text-gray-300 text-sm">Completed</TableHead>
                      <TableHead className="text-center text-gray-300 text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSession.employees?.map((employee: any) => (
                      <TableRow key={employee.id} className="border-gray-600">
                        <TableCell>
                          <div>
                            <div className="text-white text-sm font-medium">{employee.name}</div>
                            <div className="text-gray-400 text-xs">{employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">{employee.department}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              employee.attended ? "bg-green-600 text-white text-xs" : "bg-red-600 text-white text-xs"
                            }
                          >
                            {employee.attended ? "Present" : "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= employee.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-500"
                                }
                              />
                            ))}
                            <span className="text-white text-xs ml-1">{employee.rating}/5</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${employee.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-xs">{employee.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              employee.completed ? "bg-green-600 text-white text-xs" : "bg-gray-600 text-white text-xs"
                            }
                          >
                            {employee.completed ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleAssessEmployee(employee)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            <Edit size={12} className="mr-1" />
                            Assess
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 p-4 bg-gray-700 rounded-lg">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  onClick={() => bulkAssessEmployees(selectedSession.id, selectedSession.employees)}
                >
                  <TrendingUp size={16} className="mr-2" />
                  Bulk Update Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-600 text-xs bg-transparent"
                  onClick={() => {
                    selectedSession.employees?.forEach((emp: any) => {
                      if (emp.attended && emp.rating >= 3) {
                        markTrainingCompleted(selectedSession.id, emp.id)
                      }
                    })
                  }}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Auto-Complete Eligible
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManageEmployeeAssessmentsModalOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700 text-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessEmployeeModalOpen} onOpenChange={setIsAssessEmployeeModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white w-[95vw] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Assess Employee</DialogTitle>
            <DialogDescription className="text-gray-300">
              Evaluate {selectedEmployee?.name} for {selectedSession?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Employee:</span>
                    <span className="text-white ml-2">{selectedEmployee.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Department:</span>
                    <span className="text-white ml-2">{selectedEmployee.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Email:</span>
                    <span className="text-white ml-2">{selectedEmployee.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Current Progress:</span>
                    <span className="text-white ml-2">{selectedEmployee.progress}%</span>
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
                    className="border-gray-600 data-[state=checked]:bg-green-600"
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
                              : "text-gray-500 hover:text-yellow-300"
                          }
                        />
                      </button>
                    ))}
                    <span className="text-white ml-2">{assessmentForm.rating}/5</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent
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
                    className="bg-gray-700 border-gray-600 text-white text-sm min-h-[100px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={assessmentForm.completed}
                    onCheckedChange={(checked) =>
                      setAssessmentForm((prev) => ({ ...prev, completed: checked as boolean }))
                    }
                    className="border-gray-600 data-[state=checked]:bg-green-600"
                  />
                  <Label htmlFor="completed" className="text-sm font-medium">
                    Mark training as completed for this employee
                  </Label>
                </div>

                {assessmentForm.completed && (
                  <div className="p-3 bg-green-900/20 border border-green-600 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-400 text-sm font-medium">Training Completion</span>
                    </div>
                    <p className="text-green-300 text-xs mt-1">
                      This will mark the training as 100% complete and update the employee's training record.
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
              className="border-gray-600 text-white hover:bg-gray-700 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedEmployee && selectedSession) {
                  submitEmployeeAssessment(selectedSession.id, selectedEmployee.id, assessmentForm)
                  if (assessmentForm.completed) {
                    markTrainingCompleted(selectedSession.id, selectedEmployee.id)
                  }
                  updateEmployeeProgress(selectedSession.id, selectedEmployee.id, {
                    progress: assessmentForm.completed ? 100 : assessmentForm.rating * 20,
                    ...assessmentForm,
                  })
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Save size={16} className="mr-2" />
              Save Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

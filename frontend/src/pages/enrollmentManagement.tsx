"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Search, MoreVertical, UserCheck, UserX, Clock, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const courses = [
  { id: 1, title: "CDL Training Program" },
  { id: 2, title: "DOT Regulations & Compliance" },
  { id: 3, title: "Warehouse Safety Operations" },
  { id: 4, title: "Fleet Management Systems" },
  { id: 5, title: "Leadership in Logistics" },
]

export default function EnrollmentManagement() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")

  const course = courses.find((c) => c.id === Number.parseInt(courseId || "1"))
  const departments = ["All", ...Array.from(new Set(mockEnrollments.map((e) => e.department)))]
  const statuses = ["All", "Not Started", "In Progress", "Completed"]

  const filteredEnrollments = mockEnrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || enrollment.status === statusFilter
    const matchesDepartment = departmentFilter === "All" || enrollment.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-600 text-white"
      case "In Progress":
        return "bg-blue-600 text-white"
      case "Not Started":
        return "bg-gray-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Enrollments</h2>
          <p className="text-gray-300">{course?.title || "Course"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Total Enrolled</p>
                <p className="text-2xl font-bold text-white">{mockEnrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">In Progress</p>
                <p className="text-2xl font-bold text-white">
                  {mockEnrollments.filter((e) => e.status === "In Progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {mockEnrollments.filter((e) => e.status === "Completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm text-gray-300">Not Started</p>
                <p className="text-2xl font-bold text-white">
                  {mockEnrollments.filter((e) => e.status === "Not Started").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
          <CardDescription className="text-gray-300">Filter enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search students..."
                className="pl-9 bg-gray-700 border-2 border-gray-600 focus:border-gray-500 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-white hover:bg-gray-700">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-white hover:bg-gray-700">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
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
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Student Enrollments</CardTitle>
          <CardDescription className="text-gray-300">{filteredEnrollments.length} students found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300 font-semibold min-w-[200px]">Student</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[120px]">Department</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[120px]">Enrolled Date</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[120px]">Status</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[150px]">Progress</TableHead>
                  <TableHead className="text-gray-300 font-semibold min-w-[120px]">Last Activity</TableHead>
                  <TableHead className="text-right text-gray-300 font-semibold min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} className="border-gray-600 hover:bg-gray-700">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{enrollment.employeeName}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <Mail size={12} />
                          {enrollment.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{enrollment.department}</TableCell>
                    <TableCell className="text-white">{enrollment.enrolledDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(enrollment.status)}>{enrollment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{enrollment.lastActivity}</TableCell>
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
                          <DropdownMenuItem className="text-white hover:bg-gray-700">View Progress</DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-gray-700">Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-gray-700">Unenroll Student</DropdownMenuItem>
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
    </div>
  )
}

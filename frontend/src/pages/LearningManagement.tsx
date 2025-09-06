"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, MoreVertical, Edit, Eye, Plus, BookOpen, Users, Clock, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
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

// Mock data
const courses = [
  {
    id: 1,
    title: "CDL Training Program",
    type: "Hybrid",
    duration: "80 hours",
    enrolled: 15,
    completed: 12,
    rating: 4.8,
    status: "Active",
    category: "Safety & Compliance",
    description:
      "Comprehensive commercial driver's license training program covering safety regulations, vehicle inspection, and driving techniques.",
    instructor: "Mike Johnson",
    prerequisites: "Valid driver's license, clean driving record",
    materials: "Training manual, practice tests, simulator access",
  },
  {
    id: 2,
    title: "DOT Regulations & Compliance",
    type: "Online",
    duration: "16 hours",
    enrolled: 8,
    completed: 6,
    rating: 4.5,
    status: "Active",
    category: "Safety & Compliance",
    description: "Essential training on Department of Transportation regulations and compliance requirements.",
    instructor: "Sarah Davis",
    prerequisites: "None",
    materials: "Online modules, regulation handbook",
  },
  {
    id: 3,
    title: "Warehouse Safety Operations",
    type: "Offline",
    duration: "24 hours",
    enrolled: 20,
    completed: 18,
    rating: 4.9,
    status: "Active",
    category: "Operations",
    description:
      "Comprehensive warehouse safety training covering equipment operation, hazard identification, and emergency procedures.",
    instructor: "Tom Wilson",
    prerequisites: "Basic safety orientation",
    materials: "Safety manual, equipment guides, PPE",
  },
  {
    id: 4,
    title: "Fleet Management Systems",
    type: "Online",
    duration: "32 hours",
    enrolled: 12,
    completed: 10,
    rating: 4.3,
    status: "Active",
    category: "Technology",
    description: "Training on fleet management software, GPS tracking, and maintenance scheduling systems.",
    instructor: "Lisa Chen",
    prerequisites: "Basic computer skills",
    materials: "Software access, user manuals",
  },
  {
    id: 5,
    title: "Leadership in Logistics",
    type: "Hybrid",
    duration: "40 hours",
    enrolled: 18,
    completed: 15,
    rating: 4.6,
    status: "Draft",
    category: "Leadership",
    description: "Leadership development program specifically designed for logistics and transportation supervisors.",
    instructor: "Robert Martinez",
    prerequisites: "2+ years supervisory experience",
    materials: "Leadership handbook, case studies",
  },
]

const courseTypes = ["All", "Online", "Offline", "Hybrid"]
const categories = ["All", "Safety & Compliance", "Operations", "Technology", "Leadership"]

const mockEnrollments = [
  {
    id: 1,
    employeeName: "John Smith",
    department: "Drivers",
    enrolledDate: "2024-01-15",
    status: "In Progress",
    progress: 75,
  },
  {
    id: 2,
    employeeName: "Maria Garcia",
    department: "Warehouse",
    enrolledDate: "2024-01-20",
    status: "Completed",
    progress: 100,
  },
  {
    id: 3,
    employeeName: "David Johnson",
    department: "Dispatch",
    enrolledDate: "2024-02-01",
    status: "Not Started",
    progress: 0,
  },
  {
    id: 4,
    employeeName: "Sarah Wilson",
    department: "Maintenance",
    enrolledDate: "2024-02-05",
    status: "In Progress",
    progress: 45,
  },
]

export default function LearningManagement() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    category: "",
    duration: "",
    description: "",
    instructor: "",
    prerequisites: "",
    materials: "",
    status: "Draft",
  })

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "All" || course.type === selectedType
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const handleCreateCourse = () => {
    setFormData({
      title: "",
      type: "",
      category: "",
      duration: "",
      description: "",
      instructor: "",
      prerequisites: "",
      materials: "",
      status: "Draft",
    })
    setIsCreateModalOpen(true)
  }

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course)
    setIsViewModalOpen(true)
  }

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title,
      type: course.type,
      category: course.category,
      duration: course.duration,
      description: course.description,
      instructor: course.instructor,
      prerequisites: course.prerequisites,
      materials: course.materials,
      status: course.status,
    })
    setIsEditModalOpen(true)
  }

  const handleManageEnrollments = (course: any) => {
    navigate(`/enrollments/${course.id}`)
  }

  const handleSubmit = () => {
    console.log("[v0] Form submitted:", formData)
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-600 text-white"
      case "Draft":
        return "bg-yellow-600 text-white"
      case "Archived":
        return "bg-gray-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Online":
        return "bg-blue-600 text-white"
      case "Offline":
        return "bg-purple-600 text-white"
      case "Hybrid":
        return "bg-orange-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Learning Management</h2>
        <Button
          className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700"
          onClick={handleCreateCourse}
        >
          <Plus size={16} />
          Create Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Total Courses</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Total Enrollments</p>
                <p className="text-2xl font-bold text-white">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-300">Completions</p>
                <p className="text-2xl font-bold text-white">128</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-300">Avg. Rating</p>
                <p className="text-2xl font-bold text-white">4.6/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
          <CardDescription className="text-gray-300">Filter courses and training materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search courses..."
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
                  Type: {selectedType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-600">
                {courseTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="text-white hover:bg-gray-700"
                  >
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
                >
                  <Filter size={16} />
                  Category: {selectedCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-600">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="text-white hover:bg-gray-700"
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="gap-2 border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
              onClick={() => {
                setSearchTerm("")
                setSelectedType("All")
                setSelectedCategory("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Course Library</CardTitle>
          <CardDescription className="text-gray-300">{filteredCourses.length} courses found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300 font-semibold">Course</TableHead>
                <TableHead className="text-gray-300 font-semibold">Type</TableHead>
                <TableHead className="text-gray-300 font-semibold">Duration</TableHead>
                <TableHead className="text-gray-300 font-semibold">Enrollment</TableHead>
                <TableHead className="text-gray-300 font-semibold">Completion Rate</TableHead>
                <TableHead className="text-gray-300 font-semibold">Rating</TableHead>
                <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} className="border-gray-600 hover:bg-gray-700">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{course.title}</div>
                      <div className="text-sm text-gray-400">{course.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(course.type)}>{course.type}</Badge>
                  </TableCell>
                  <TableCell className="text-white">{course.duration}</TableCell>
                  <TableCell className="text-white">{course.enrolled} enrolled</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {course.completed}/{course.enrolled}
                        </span>
                        <span className="text-gray-400">{Math.round((course.completed / course.enrolled) * 100)}%</span>
                      </div>
                      <Progress value={(course.completed / course.enrolled) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="text-white">⭐ {course.rating}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(course.status)}>{course.status}</Badge>
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
                          onClick={() => handleViewCourse(course)}
                        >
                          <Eye size={16} />
                          View Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit size={16} />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleManageEnrollments(course)}
                        >
                          <Users size={16} />
                          Manage Enrollments
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-gray-800 border-2 border-gray-600 text-white max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Create New Course</DialogTitle>
            <DialogDescription className="text-gray-300">
              Add a new training course to the learning management system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">
                  Course Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-700 border-2 border-gray-600 text-white"
                  placeholder="Enter course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-gray-300">
                  Instructor
                </Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="bg-gray-700 border-2 border-gray-600 text-white"
                  placeholder="Enter instructor name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">
                  Course Type
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Online" className="text-white hover:bg-gray-700">
                      Online
                    </SelectItem>
                    <SelectItem value="Offline" className="text-white hover:bg-gray-700">
                      Offline
                    </SelectItem>
                    <SelectItem value="Hybrid" className="text-white hover:bg-gray-700">
                      Hybrid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Safety & Compliance" className="text-white hover:bg-gray-700">
                      Safety & Compliance
                    </SelectItem>
                    <SelectItem value="Operations" className="text-white hover:bg-gray-700">
                      Operations
                    </SelectItem>
                    <SelectItem value="Technology" className="text-white hover:bg-gray-700">
                      Technology
                    </SelectItem>
                    <SelectItem value="Leadership" className="text-white hover:bg-gray-700">
                      Leadership
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-300">
                  Duration
                </Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="bg-gray-700 border-2 border-gray-600 text-white"
                  placeholder="e.g., 40 hours"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="Enter course description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prerequisites" className="text-gray-300">
                Prerequisites
              </Label>
              <Input
                id="prerequisites"
                value={formData.prerequisites}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="Enter prerequisites"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="materials" className="text-gray-300">
                Course Materials
              </Label>
              <Textarea
                id="materials"
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="List course materials and resources"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-gray-800 border-2 border-gray-600 text-white max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">{selectedCourse?.title}</DialogTitle>
            <DialogDescription className="text-gray-300">Course details and information</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 font-semibold">Instructor</Label>
                  <p className="text-white">{selectedCourse.instructor}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-semibold">Duration</Label>
                  <p className="text-white">{selectedCourse.duration}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300 font-semibold">Type</Label>
                  <div className="mt-1">
                    <Badge className={getTypeBadgeColor(selectedCourse.type)}>{selectedCourse.type}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300 font-semibold">Category</Label>
                  <p className="text-white">{selectedCourse.category}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-semibold">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(selectedCourse.status)}>{selectedCourse.status}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-gray-300 font-semibold">Description</Label>
                <p className="text-white mt-1">{selectedCourse.description}</p>
              </div>
              <div>
                <Label className="text-gray-300 font-semibold">Prerequisites</Label>
                <p className="text-white mt-1">{selectedCourse.prerequisites}</p>
              </div>
              <div>
                <Label className="text-gray-300 font-semibold">Course Materials</Label>
                <p className="text-white mt-1">{selectedCourse.materials}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300 font-semibold">Enrolled</Label>
                  <p className="text-white">{selectedCourse.enrolled} students</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-semibold">Completed</Label>
                  <p className="text-white">{selectedCourse.completed} students</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-semibold">Rating</Label>
                  <p className="text-white">⭐ {selectedCourse.rating}/5</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600 w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-gray-800 border-2 border-gray-600 text-white max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Course</DialogTitle>
            <DialogDescription className="text-gray-300">Update course information and settings</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-gray-300">
                  Course Title
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-700 border-2 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructor" className="text-gray-300">
                  Instructor
                </Label>
                <Input
                  id="edit-instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="bg-gray-700 border-2 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type" className="text-gray-300">
                  Type
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Online" className="text-white hover:bg-gray-700">
                      Online
                    </SelectItem>
                    <SelectItem value="Offline" className="text-white hover:bg-gray-700">
                      Offline
                    </SelectItem>
                    <SelectItem value="Hybrid" className="text-white hover:bg-gray-700">
                      Hybrid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-gray-300">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Safety & Compliance" className="text-white hover:bg-gray-700">
                      Safety & Compliance
                    </SelectItem>
                    <SelectItem value="Operations" className="text-white hover:bg-gray-700">
                      Operations
                    </SelectItem>
                    <SelectItem value="Technology" className="text-white hover:bg-gray-700">
                      Technology
                    </SelectItem>
                    <SelectItem value="Leadership" className="text-white hover:bg-gray-700">
                      Leadership
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration" className="text-gray-300">
                  Duration
                </Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="bg-gray-700 border-2 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-gray-300">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Active" className="text-white hover:bg-gray-700">
                      Active
                    </SelectItem>
                    <SelectItem value="Draft" className="text-white hover:bg-gray-700">
                      Draft
                    </SelectItem>
                    <SelectItem value="Archived" className="text-white hover:bg-gray-700">
                      Archived
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prerequisites" className="text-gray-300">
                Prerequisites
              </Label>
              <Input
                id="edit-prerequisites"
                value={formData.prerequisites}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-materials" className="text-gray-300">
                Course Materials
              </Label>
              <Textarea
                id="edit-materials"
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

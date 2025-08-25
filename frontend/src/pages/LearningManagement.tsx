"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Edit, Eye, Plus, BookOpen, Users, Clock, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

// Mock data
const courses = [
  {
    id: 1,
    title: "Advanced JavaScript",
    type: "Online",
    duration: "40 hours",
    enrolled: 15,
    completed: 12,
    rating: 4.8,
    status: "Active",
    category: "Technical",
  },
  {
    id: 2,
    title: "Leadership Fundamentals",
    type: "Offline",
    duration: "16 hours",
    enrolled: 8,
    completed: 6,
    rating: 4.5,
    status: "Active",
    category: "Leadership",
  },
  {
    id: 3,
    title: "Data Analytics with Python",
    type: "Online",
    duration: "60 hours",
    enrolled: 20,
    completed: 18,
    rating: 4.9,
    status: "Active",
    category: "Technical",
  },
  {
    id: 4,
    title: "Communication Skills",
    type: "Hybrid",
    duration: "24 hours",
    enrolled: 12,
    completed: 10,
    rating: 4.3,
    status: "Active",
    category: "Soft Skills",
  },
  {
    id: 5,
    title: "Project Management Basics",
    type: "Online",
    duration: "32 hours",
    enrolled: 18,
    completed: 15,
    rating: 4.6,
    status: "Draft",
    category: "Management",
  },
]

const courseTypes = ["All", "Online", "Offline", "Hybrid"]
const categories = ["All", "Technical", "Leadership", "Soft Skills", "Management"]

export default function LearningManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "All" || course.type === selectedType
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory
    return matchesSearch && matchesType && matchesCategory
  })

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
        <Button className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700">
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
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Eye size={16} />
                          View Course
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Edit size={16} />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
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
    </div>
  )
}

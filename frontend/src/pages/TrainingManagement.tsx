"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Edit, Eye, Plus, Calendar, Users, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data
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
  },
]

const statuses = ["All", "Scheduled", "In Progress", "Completed", "Cancelled"]

export default function TrainingManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Training Management</h2>
        <Button className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700">
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
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300 font-semibold">Session</TableHead>
                <TableHead className="text-gray-300 font-semibold">Instructor</TableHead>
                <TableHead className="text-gray-300 font-semibold">Date & Time</TableHead>
                <TableHead className="text-gray-300 font-semibold">Duration</TableHead>
                <TableHead className="text-gray-300 font-semibold">Enrollment</TableHead>
                <TableHead className="text-gray-300 font-semibold">Attendance</TableHead>
                <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} className="border-gray-600 hover:bg-gray-700">
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
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Eye size={16} />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Edit size={16} />
                          Edit Session
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Users size={16} />
                          Manage Attendance
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

"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Edit, Eye, Plus, TrendingUp, Users, Star, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

// Mock data
const successionCandidates = [
  {
    id: 1,
    name: "Sarah Johnson",
    currentRole: "Senior Developer",
    targetRole: "Tech Lead",
    readinessScore: 85,
    potential: "High",
    experience: "5 years",
    competencyScore: 4.2,
    trainingCompleted: 12,
  },
  {
    id: 2,
    name: "Mike Davis",
    currentRole: "Project Manager",
    targetRole: "Director",
    readinessScore: 72,
    potential: "Medium",
    experience: "8 years",
    competencyScore: 3.8,
    trainingCompleted: 15,
  },
  {
    id: 3,
    name: "Emily Chen",
    currentRole: "Data Analyst",
    targetRole: "Data Science Lead",
    readinessScore: 91,
    potential: "High",
    experience: "4 years",
    competencyScore: 4.5,
    trainingCompleted: 18,
  },
  {
    id: 4,
    name: "John Smith",
    currentRole: "HR Specialist",
    targetRole: "HR Manager",
    readinessScore: 68,
    potential: "Medium",
    experience: "6 years",
    competencyScore: 3.6,
    trainingCompleted: 10,
  },
  {
    id: 5,
    name: "Lisa Brown",
    currentRole: "Marketing Coordinator",
    targetRole: "Marketing Manager",
    readinessScore: 79,
    potential: "High",
    experience: "3 years",
    competencyScore: 4.0,
    trainingCompleted: 14,
  },
]

const potentialLevels = ["All", "High", "Medium", "Low"]
const departments = ["All", "Technology", "Management", "Data Science", "HR", "Marketing"]

export default function SuccessionPlanning() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPotential, setSelectedPotential] = useState("All")
  const [selectedDepartment, setSelectedDepartment] = useState("All")

  const filteredCandidates = successionCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPotential = selectedPotential === "All" || candidate.potential === selectedPotential
    return matchesSearch && matchesPotential
  })

  const getPotentialBadgeColor = (potential: string) => {
    switch (potential) {
      case "High":
        return "bg-green-600 text-white"
      case "Medium":
        return "bg-yellow-600 text-white"
      case "Low":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Succession Planning</h2>
        <Button className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700">
          <Plus size={16} />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Total Candidates</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">High Potential</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-300">Ready for Promotion</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-300">Avg. Readiness</p>
                <p className="text-2xl font-bold text-white">79%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
          <CardDescription className="text-gray-300">Filter succession candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search candidates..."
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
                  Potential: {selectedPotential}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-600">
                {potentialLevels.map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() => setSelectedPotential(level)}
                    className="text-white hover:bg-gray-700"
                  >
                    {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="gap-2 border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
              onClick={() => {
                setSearchTerm("")
                setSelectedPotential("All")
                setSelectedDepartment("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Succession Candidates Table */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Succession Pipeline</CardTitle>
          <CardDescription className="text-gray-300">{filteredCandidates.length} candidates found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300 font-semibold">Candidate</TableHead>
                <TableHead className="text-gray-300 font-semibold">Current → Target Role</TableHead>
                <TableHead className="text-gray-300 font-semibold">Potential</TableHead>
                <TableHead className="text-gray-300 font-semibold">Readiness Score</TableHead>
                <TableHead className="text-gray-300 font-semibold">Competency</TableHead>
                <TableHead className="text-gray-300 font-semibold">Training</TableHead>
                <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="border-gray-600 hover:bg-gray-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-gray-600 text-white">{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{candidate.name}</div>
                        <div className="text-sm text-gray-400">{candidate.experience} experience</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-white">{candidate.currentRole}</div>
                      <div className="text-sm text-gray-400">→ {candidate.targetRole}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPotentialBadgeColor(candidate.potential)}>{candidate.potential}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={`font-medium ${getReadinessColor(candidate.readinessScore)}`}>
                          {candidate.readinessScore}%
                        </span>
                      </div>
                      <Progress value={candidate.readinessScore} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-white">⭐ {candidate.competencyScore}/5</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-white">{candidate.trainingCompleted} courses</div>
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Edit size={16} />
                          Update Assessment
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Target size={16} />
                          Development Plan
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

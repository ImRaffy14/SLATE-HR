"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  TrendingUp,
  Users,
  Star,
  Target,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
// const departments = ["All", "Technology", "Management", "Data Science", "HR", "Marketing"]

export default function SuccessionPlanning() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPotential, setSelectedPotential] = useState("All")
  const [_selectedDepartment, setSelectedDepartment] = useState("All")

  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false)
  const [showViewProfileModal, setShowViewProfileModal] = useState(false)
  const [showUpdateAssessmentModal, setShowUpdateAssessmentModal] = useState(false)
  const [showDevelopmentPlanModal, setShowDevelopmentPlanModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

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

  const handleViewProfile = (candidate: any) => {
    setSelectedCandidate(candidate)
    setShowViewProfileModal(true)
  }

  const handleUpdateAssessment = (candidate: any) => {
    setSelectedCandidate(candidate)
    setShowUpdateAssessmentModal(true)
  }

  const handleDevelopmentPlan = (candidate: any) => {
    setSelectedCandidate(candidate)
    setShowDevelopmentPlanModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Succession Planning</h2>
        <Button
          className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700 w-full sm:w-auto"
          onClick={() => setShowAddCandidateModal(true)}
        >
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
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300 font-semibold min-w-[200px]">Candidate</TableHead>
                <TableHead className="text-gray-300 font-semibold min-w-[250px]">Current → Target Role</TableHead>
                <TableHead className="text-gray-300 font-semibold min-w-[100px]">Potential</TableHead>
                <TableHead className="text-gray-300 font-semibold min-w-[150px]">Readiness Score</TableHead>
                <TableHead className="text-gray-300 font-semibold min-w-[120px]">Competency</TableHead>
                <TableHead className="text-gray-300 font-semibold min-w-[100px]">Training</TableHead>
                <TableHead className="text-right text-gray-300 font-semibold min-w-[80px]">Actions</TableHead>
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
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleViewProfile(candidate)}
                        >
                          <Eye size={16} />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleUpdateAssessment(candidate)}
                        >
                          <Edit size={16} />
                          Update Assessment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleDevelopmentPlan(candidate)}
                        >
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

      <Dialog open={showAddCandidateModal} onOpenChange={setShowAddCandidateModal}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl">Add New Succession Candidate</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Add a new employee to the succession planning pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-role" className="text-sm font-medium">
                  Current Role
                </Label>
                <Input
                  id="current-role"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="Current position"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-role" className="text-sm font-medium">
                  Target Role
                </Label>
                <Input
                  id="target-role"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="Target position"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="potential" className="text-sm font-medium">
                  Potential Level
                </Label>
                <Select>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                    <SelectValue placeholder="Select potential" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="high" className="text-white">
                      High
                    </SelectItem>
                    <SelectItem value="medium" className="text-white">
                      Medium
                    </SelectItem>
                    <SelectItem value="low" className="text-white">
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium">
                  Experience
                </Label>
                <Input
                  id="experience"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="e.g., 5 years"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competency" className="text-sm font-medium">
                  Competency Score
                </Label>
                <Input
                  id="competency"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="1-5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="bg-gray-700 border-gray-600 text-white text-sm min-h-[80px]"
                placeholder="Additional notes about the candidate"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAddCandidateModal(false)}
              className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">Add Candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewProfileModal} onOpenChange={setShowViewProfileModal}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl">Candidate Profile</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Detailed view of {selectedCandidate?.name}'s succession planning profile
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-700">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="competencies" className="text-xs sm:text-sm">
                  Skills
                </TabsTrigger>
                <TabsTrigger value="development" className="text-xs sm:text-sm">
                  Development
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                  Timeline
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User size={20} />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-gray-600 text-white text-lg">
                            {selectedCandidate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{selectedCandidate.name}</h3>
                          <p className="text-gray-300 text-sm">{selectedCandidate.currentRole}</p>
                          <p className="text-gray-400 text-sm">{selectedCandidate.experience} experience</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target size={20} />
                        Succession Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Target Role:</span>
                          <span className="text-white font-medium">{selectedCandidate.targetRole}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Potential Level:</span>
                          <Badge className={getPotentialBadgeColor(selectedCandidate.potential)}>
                            {selectedCandidate.potential}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Readiness Score:</span>
                          <span className={`font-medium ${getReadinessColor(selectedCandidate.readinessScore)}`}>
                            {selectedCandidate.readinessScore}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <Progress value={selectedCandidate.readinessScore} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="competencies" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "Leadership",
                    "Technical Skills",
                    "Communication",
                    "Strategic Thinking",
                    "Team Management",
                    "Problem Solving",
                  ].map((skill, index) => (
                    <Card key={skill} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium text-sm">{skill}</span>
                            <span className="text-gray-300 text-sm">{(4.5 - index * 0.2).toFixed(1)}/5</span>
                          </div>
                          <Progress value={(4.5 - index * 0.2) * 20} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="development" className="space-y-4 mt-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen size={20} />
                      Training Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Completed Courses:</span>
                        <span className="text-white font-medium">{selectedCandidate.trainingCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">In Progress:</span>
                        <span className="text-white font-medium">3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Recommended:</span>
                        <span className="text-white font-medium">5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="timeline" className="space-y-4 mt-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar size={20} />
                      Development Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { date: "2024-01", event: "Leadership Assessment Completed", status: "completed" },
                        { date: "2024-03", event: "Management Training Started", status: "completed" },
                        { date: "2024-06", event: "Mentorship Program Enrolled", status: "in-progress" },
                        { date: "2024-09", event: "Strategic Planning Workshop", status: "upcoming" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              item.status === "completed"
                                ? "bg-green-500"
                                : item.status === "in-progress"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{item.event}</div>
                            <div className="text-gray-400 text-xs">{item.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowViewProfileModal(false)}
              className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateAssessmentModal} onOpenChange={setShowUpdateAssessmentModal}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl">Update Assessment</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Update the succession assessment for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="readiness" className="text-sm font-medium">
                  Readiness Score (%)
                </Label>
                <Input
                  id="readiness"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedCandidate?.readinessScore}
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competency-update" className="text-sm font-medium">
                  Competency Score
                </Label>
                <Input
                  id="competency-update"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  defaultValue={selectedCandidate?.competencyScore}
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="potential-update" className="text-sm font-medium">
                Potential Level
              </Label>
              <Select defaultValue={selectedCandidate?.potential?.toLowerCase()}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="high" className="text-white">
                    High
                  </SelectItem>
                  <SelectItem value="medium" className="text-white">
                    Medium
                  </SelectItem>
                  <SelectItem value="low" className="text-white">
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Key Competencies</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Leadership", "Technical Skills", "Communication", "Strategic Thinking"].map((skill) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">{skill}</span>
                      <span className="text-gray-300">4.2/5</span>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      defaultValue="4.2"
                      className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessment-notes" className="text-sm font-medium">
                Assessment Notes
              </Label>
              <Textarea
                id="assessment-notes"
                className="bg-gray-700 border-gray-600 text-white text-sm min-h-[80px]"
                placeholder="Add notes about this assessment update"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowUpdateAssessmentModal(false)}
              className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">Update Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDevelopmentPlanModal} onOpenChange={setShowDevelopmentPlanModal}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl">Development Plan</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Create or update development plan for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="current" className="text-sm">
                Current Plan
              </TabsTrigger>
              <TabsTrigger value="new" className="text-sm">
                Add Activities
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="space-y-4 mt-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg">Current Development Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { activity: "Leadership Fundamentals Course", status: "completed", progress: 100 },
                      { activity: "Cross-functional Project Lead", status: "in-progress", progress: 65 },
                      { activity: "Executive Mentorship Program", status: "in-progress", progress: 40 },
                      { activity: "Strategic Planning Workshop", status: "planned", progress: 0 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              size={16}
                              className={
                                item.status === "completed"
                                  ? "text-green-500"
                                  : item.status === "in-progress"
                                    ? "text-yellow-500"
                                    : "text-gray-500"
                              }
                            />
                            <span className="text-white text-sm font-medium">{item.activity}</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="new" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-type" className="text-sm font-medium">
                    Activity Type
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="training" className="text-white">
                        Training Course
                      </SelectItem>
                      <SelectItem value="mentorship" className="text-white">
                        Mentorship
                      </SelectItem>
                      <SelectItem value="project" className="text-white">
                        Special Project
                      </SelectItem>
                      <SelectItem value="workshop" className="text-white">
                        Workshop
                      </SelectItem>
                      <SelectItem value="certification" className="text-white">
                        Certification
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity-name" className="text-sm font-medium">
                      Activity Name
                    </Label>
                    <Input
                      id="activity-name"
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                      placeholder="Enter activity name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-date" className="text-sm font-medium">
                      Target Completion
                    </Label>
                    <Input id="target-date" type="date" className="bg-gray-700 border-gray-600 text-white text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-description" className="text-sm font-medium">
                    Description & Objectives
                  </Label>
                  <Textarea
                    id="activity-description"
                    className="bg-gray-700 border-gray-600 text-white text-sm min-h-[80px]"
                    placeholder="Describe the development activity and its objectives"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="success-metrics" className="text-sm font-medium">
                    Success Metrics
                  </Label>
                  <Textarea
                    id="success-metrics"
                    className="bg-gray-700 border-gray-600 text-white text-sm min-h-[60px]"
                    placeholder="How will success be measured?"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDevelopmentPlanModal(false)}
              className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
              Save Development Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

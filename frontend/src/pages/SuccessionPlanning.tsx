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
    recentTrainingAssessments: [
      {
        trainingId: 1,
        trainingTitle: "React Advanced Patterns",
        completedDate: "2024-01-15",
        rating: 5,
        comments: "Excellent understanding of advanced concepts",
        instructor: "Sarah Johnson",
      },
      {
        trainingId: 5,
        trainingTitle: "Communication Skills",
        completedDate: "2024-01-12",
        rating: 4,
        comments: "Clear and concise communication",
        instructor: "Lisa Brown",
      },
    ],
    skillAssessments: {
      leadership: 4.2,
      technicalSkills: 4.8,
      communication: 4.5,
      strategicThinking: 3.9,
      teamManagement: 4.0,
      problemSolving: 4.6,
    },
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
    recentTrainingAssessments: [
      {
        trainingId: 2,
        trainingTitle: "Leadership Workshop",
        completedDate: "2024-01-20",
        rating: 4,
        comments: "Good leadership potential, needs more practice",
        instructor: "Mike Davis",
      },
    ],
    skillAssessments: {
      leadership: 4.0,
      technicalSkills: 3.5,
      communication: 4.2,
      strategicThinking: 4.1,
      teamManagement: 4.3,
      problemSolving: 3.7,
    },
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
    recentTrainingAssessments: [
      {
        trainingId: 3,
        trainingTitle: "Data Science Fundamentals",
        completedDate: "2024-01-18",
        rating: 5,
        comments: "Outstanding analytical skills and quick learner",
        instructor: "Emily Chen",
      },
    ],
    skillAssessments: {
      leadership: 3.8,
      technicalSkills: 4.9,
      communication: 4.2,
      strategicThinking: 4.6,
      teamManagement: 3.5,
      problemSolving: 4.8,
    },
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
    recentTrainingAssessments: [],
    skillAssessments: {
      leadership: 3.5,
      technicalSkills: 3.2,
      communication: 4.0,
      strategicThinking: 3.4,
      teamManagement: 3.8,
      problemSolving: 3.6,
    },
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
    recentTrainingAssessments: [
      {
        trainingId: 5,
        trainingTitle: "Communication Skills",
        completedDate: "2024-01-12",
        rating: 5,
        comments: "Exceptional communication and presentation skills",
        instructor: "Lisa Brown",
      },
    ],
    skillAssessments: {
      leadership: 4.1,
      technicalSkills: 3.7,
      communication: 4.8,
      strategicThinking: 4.0,
      teamManagement: 4.2,
      problemSolving: 3.9,
    },
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
        return "bg-green-100 text-green-800 border border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "Low":
        return "bg-red-100 text-red-800 border border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
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

  const calculateUpdatedReadinessScore = (candidate: any) => {
    let baseScore = candidate.readinessScore

    // Factor in recent training performance
    if (candidate.recentTrainingAssessments && candidate.recentTrainingAssessments.length > 0) {
      const avgTrainingRating =
        candidate.recentTrainingAssessments.reduce((sum: number, assessment: any) => sum + assessment.rating, 0) /
        candidate.recentTrainingAssessments.length
      const trainingBonus = (avgTrainingRating - 3) * 5 // Each point above 3 adds 5% to readiness
      baseScore = Math.min(100, baseScore + trainingBonus)
    }

    return Math.round(baseScore)
  }

  const getAverageCompetencyScore = (skillAssessments: any) => {
    const skills = Object.values(skillAssessments) as number[]
    return (skills.reduce((sum, score) => sum + score, 0) / skills.length).toFixed(1)
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Succession Planning</h2>
        <Button
          className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-sm w-full sm:w-auto"
          onClick={() => setShowAddCandidateModal(true)}
        >
          <Plus size={16} />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">High Potential</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-100">
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Ready for Promotion</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Avg. Readiness</p>
                <p className="text-3xl font-bold text-gray-900">79%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900">Filters</CardTitle>
          <CardDescription className="text-gray-600">Filter succession candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                className="pl-9 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 h-11"
                >
                  <Filter size={16} />
                  Potential: {selectedPotential}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                {potentialLevels.map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() => setSelectedPotential(level)}
                    className="text-gray-700 hover:bg-gray-50"
                  >
                    {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 h-11"
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
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900">Succession Pipeline</CardTitle>
          <CardDescription className="text-gray-600">{filteredCandidates.length} candidates found</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-700 font-semibold min-w-[200px]">Candidate</TableHead>
                <TableHead className="text-gray-700 font-semibold min-w-[250px]">Current → Target Role</TableHead>
                <TableHead className="text-gray-700 font-semibold min-w-[100px]">Potential</TableHead>
                <TableHead className="text-gray-700 font-semibold min-w-[150px]">Readiness Score</TableHead>
                <TableHead className="text-gray-700 font-semibold min-w-[120px]">Competency</TableHead>
                <TableHead className="text-gray-700 font-semibold min-w-[100px]">Training</TableHead>
                <TableHead className="text-gray-700 font-semibold min-w-[120px]">Recent Assessment</TableHead>
                <TableHead className="text-right text-gray-700 font-semibold min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => {
                const updatedReadinessScore = calculateUpdatedReadinessScore(candidate)
                const avgCompetencyScore = getAverageCompetencyScore(candidate.skillAssessments)
                const latestAssessment = candidate.recentTrainingAssessments?.[0]

                return (
                  <TableRow key={candidate.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-gray-200">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-gray-100 text-gray-700">
                            {candidate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{candidate.name}</div>
                          <div className="text-sm text-gray-500">{candidate.experience} experience</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-gray-900">{candidate.currentRole}</div>
                        <div className="text-sm text-gray-500">→ {candidate.targetRole}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPotentialBadgeColor(candidate.potential)}>{candidate.potential}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={`font-medium ${getReadinessColor(updatedReadinessScore)}`}>
                            {updatedReadinessScore}%
                            {updatedReadinessScore !== candidate.readinessScore && (
                              <span className="text-xs text-green-600 ml-1">
                                (+{updatedReadinessScore - candidate.readinessScore})
                              </span>
                            )}
                          </span>
                        </div>
                        <Progress value={updatedReadinessScore} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-900">⭐ {avgCompetencyScore}/5</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-900">{candidate.trainingCompleted} courses</div>
                    </TableCell>
                    <TableCell>
                      {latestAssessment ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={
                                  star <= latestAssessment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">{latestAssessment.rating}/5</span>
                          </div>
                          <div className="text-xs text-gray-500">{latestAssessment.trainingTitle}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No recent assessments</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                          <DropdownMenuItem
                            className="gap-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => handleViewProfile(candidate)}
                          >
                            <Eye size={16} />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => handleUpdateAssessment(candidate)}
                          >
                            <Edit size={16} />
                            Update Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-gray-700 hover:bg-gray-50"
                            onClick={() => handleDevelopmentPlan(candidate)}
                          >
                            <Target size={16} />
                            Development Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddCandidateModal} onOpenChange={setShowAddCandidateModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto shadow-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl text-gray-900">Add New Succession Candidate</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Add a new employee to the succession planning pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-role" className="text-sm font-medium text-gray-700">
                  Current Role
                </Label>
                <Input
                  id="current-role"
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                  placeholder="Current position"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-role" className="text-sm font-medium text-gray-700">
                  Target Role
                </Label>
                <Input
                  id="target-role"
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                  placeholder="Target position"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="potential" className="text-sm font-medium text-gray-700">
                  Potential Level
                </Label>
                <Select>
                  <SelectTrigger className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11">
                    <SelectValue placeholder="Select potential" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-lg">
                    <SelectItem value="high" className="text-gray-900 hover:bg-gray-50">
                      High
                    </SelectItem>
                    <SelectItem value="medium" className="text-gray-900 hover:bg-gray-50">
                      Medium
                    </SelectItem>
                    <SelectItem value="low" className="text-gray-900 hover:bg-gray-50">
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Experience
                </Label>
                <Input
                  id="experience"
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                  placeholder="e.g., 5 years"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competency" className="text-sm font-medium text-gray-700">
                  Competency Score
                </Label>
                <Input
                  id="competency"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                  placeholder="1-5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm min-h-[100px] resize-none"
                placeholder="Additional notes about the candidate"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowAddCandidateModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-2">
              Add Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewProfileModal} onOpenChange={setShowViewProfileModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto shadow-xl">
          <DialogHeader className="space-y-3 pb-6 border-b border-gray-200">
            <DialogTitle className="text-xl sm:text-2xl text-gray-900">Candidate Profile</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Detailed view of {selectedCandidate?.name}'s succession planning profile
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-gray-100 border border-gray-200 p-1">
                <TabsTrigger
                  value="overview"
                  className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="competencies"
                  className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger
                  value="training"
                  className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
                >
                  Training History
                </TabsTrigger>
                <TabsTrigger
                  value="development"
                  className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
                >
                  Development
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
                >
                  Timeline
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-50 border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                        <User size={20} />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 ring-2 ring-gray-200">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-lg">
                            {selectedCandidate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedCandidate.name}</h3>
                          <p className="text-gray-600 text-sm">{selectedCandidate.currentRole}</p>
                          <p className="text-gray-500 text-sm">{selectedCandidate.experience} experience</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                        <Target size={20} />
                        Succession Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target Role:</span>
                          <span className="text-gray-900 font-medium">{selectedCandidate.targetRole}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Potential Level:</span>
                          <Badge className={getPotentialBadgeColor(selectedCandidate.potential)}>
                            {selectedCandidate.potential}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Readiness Score:</span>
                          <span
                            className={`font-medium ${getReadinessColor(calculateUpdatedReadinessScore(selectedCandidate))}`}
                          >
                            {calculateUpdatedReadinessScore(selectedCandidate)}%
                          </span>
                        </div>
                        <div className="mt-3">
                          <Progress value={calculateUpdatedReadinessScore(selectedCandidate)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="competencies" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedCandidate.skillAssessments).map(([skill, score]) => (
                    <Card key={skill} className="bg-gray-50 border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-medium text-sm capitalize">
                              {skill.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span className="text-gray-600 text-sm">{String(score)}/5</span>
                          </div>
                          <Progress value={(score as number) * 20} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="training" className="space-y-6 mt-6">
                <Card className="bg-gray-50 border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <BookOpen size={20} />
                      Recent Training Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCandidate.recentTrainingAssessments &&
                    selectedCandidate.recentTrainingAssessments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCandidate.recentTrainingAssessments.map((assessment: any, index: number) => (
                          <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{assessment.trainingTitle}</h4>
                                <p className="text-sm text-gray-600">Instructor: {assessment.instructor}</p>
                                <p className="text-sm text-gray-500">Completed: {assessment.completedDate}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={16}
                                    className={
                                      star <= assessment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">{assessment.rating}/5</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{assessment.comments}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No recent training assessments available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="development" className="space-y-6 mt-6">
                <Card className="bg-gray-50 border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <BookOpen size={20} />
                      Training Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed Courses:</span>
                        <span className="text-gray-900 font-medium">{selectedCandidate.trainingCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">In Progress:</span>
                        <span className="text-gray-900 font-medium">3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Recommended:</span>
                        <span className="text-gray-900 font-medium">5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average Training Rating:</span>
                        <span className="text-gray-900 font-medium">
                          {selectedCandidate.recentTrainingAssessments &&
                          selectedCandidate.recentTrainingAssessments.length > 0
                            ? (
                                selectedCandidate.recentTrainingAssessments.reduce(
                                  (sum: number, assessment: any) => sum + assessment.rating,
                                  0,
                                ) / selectedCandidate.recentTrainingAssessments.length
                              ).toFixed(1)
                            : "N/A"}
                          /5
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="timeline" className="space-y-6 mt-6">
                <Card className="bg-gray-50 border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
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
                                  : "bg-gray-400"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="text-gray-900 text-sm font-medium">{item.event}</div>
                            <div className="text-gray-500 text-xs">{item.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowViewProfileModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateAssessmentModal} onOpenChange={setShowUpdateAssessmentModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto shadow-xl">
          <DialogHeader className="space-y-3 pb-6 border-b border-gray-200">
            <DialogTitle className="text-xl sm:text-2xl text-gray-900">Update Assessment</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Update the succession assessment for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="readiness" className="text-sm font-medium text-gray-700">
                  Readiness Score (%)
                </Label>
                <Input
                  id="readiness"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedCandidate?.readinessScore}
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competency-update" className="text-sm font-medium text-gray-700">
                  Competency Score
                </Label>
                <Input
                  id="competency-update"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  defaultValue={selectedCandidate?.competencyScore}
                  className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="potential-update" className="text-sm font-medium text-gray-700">
                Potential Level
              </Label>
              <Select defaultValue={selectedCandidate?.potential?.toLowerCase()}>
                <SelectTrigger className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="high" className="text-gray-900 hover:bg-gray-50">
                    High
                  </SelectItem>
                  <SelectItem value="medium" className="text-gray-900 hover:bg-gray-50">
                    Medium
                  </SelectItem>
                  <SelectItem value="low" className="text-gray-900 hover:bg-gray-50">
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Key Competencies</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Leadership", "Technical Skills", "Communication", "Strategic Thinking"].map((skill) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">{skill}</span>
                      <span className="text-gray-600">4.2/5</span>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      defaultValue="4.2"
                      className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-9"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessment-notes" className="text-sm font-medium text-gray-700">
                Assessment Notes
              </Label>
              <Textarea
                id="assessment-notes"
                className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm min-h-[100px] resize-none"
                placeholder="Add notes about this assessment update"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowUpdateAssessmentModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-2">
              Update Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDevelopmentPlanModal} onOpenChange={setShowDevelopmentPlanModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto shadow-xl">
          <DialogHeader className="space-y-3 pb-6 border-b border-gray-200">
            <DialogTitle className="text-xl sm:text-2xl text-gray-900">Development Plan</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Create or update development plan for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200 p-1">
              <TabsTrigger
                value="current"
                className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
              >
                Current Plan
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
              >
                Add Activities
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="space-y-6 mt-6">
              <Card className="bg-gray-50 border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Current Development Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { activity: "Leadership Fundamentals Course", status: "completed", progress: 100 },
                      { activity: "Cross-functional Project Lead", status: "in-progress", progress: 65 },
                      { activity: "Executive Mentorship Program", status: "in-progress", progress: 40 },
                      { activity: "Strategic Planning Workshop", status: "planned", progress: 0 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              size={16}
                              className={
                                item.status === "completed"
                                  ? "text-green-500"
                                  : item.status === "in-progress"
                                    ? "text-yellow-500"
                                    : "text-gray-400"
                              }
                            />
                            <span className="text-gray-900 text-sm font-medium">{item.activity}</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
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
            <TabsContent value="new" className="space-y-6 mt-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="activity-type" className="text-sm font-medium text-gray-700">
                    Activity Type
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      <SelectItem value="training" className="text-gray-900 hover:bg-gray-50">
                        Training Course
                      </SelectItem>
                      <SelectItem value="mentorship" className="text-gray-900 hover:bg-gray-50">
                        Mentorship
                      </SelectItem>
                      <SelectItem value="project" className="text-gray-900 hover:bg-gray-50">
                        Special Project
                      </SelectItem>
                      <SelectItem value="workshop" className="text-gray-900 hover:bg-gray-50">
                        Workshop
                      </SelectItem>
                      <SelectItem value="certification" className="text-gray-900 hover:bg-gray-50">
                        Certification
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity-name" className="text-sm font-medium text-gray-700">
                      Activity Name
                    </Label>
                    <Input
                      id="activity-name"
                      className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                      placeholder="Enter activity name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-date" className="text-sm font-medium text-gray-700">
                      Target Completion
                    </Label>
                    <Input
                      id="target-date"
                      type="date"
                      className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-description" className="text-sm font-medium text-gray-700">
                    Description & Objectives
                  </Label>
                  <Textarea
                    id="activity-description"
                    className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm min-h-[100px] resize-none"
                    placeholder="Describe the development activity and its objectives"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="success-metrics" className="text-sm font-medium text-gray-700">
                    Success Metrics
                  </Label>
                  <Textarea
                    id="success-metrics"
                    className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm min-h-[80px] resize-none"
                    placeholder="How will success be measured?"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowDevelopmentPlanModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto order-1 sm:order-2">
              Save Development Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  TrendingUp,
  Brain,
  BarChart3,
  Users,
  Target,
  AlertTriangle,
  Download,
  Award,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data
const performanceInsights = [
  {
    id: 1,
    employee: "Sarah Johnson",
    role: "Senior Developer",
    performanceScore: 92,
    riskLevel: "Low",
    promotionReadiness: 85,
    skillGaps: 1,
    trainingEffectiveness: 94,
  },
  {
    id: 2,
    employee: "Mike Davis",
    role: "Project Manager",
    performanceScore: 78,
    riskLevel: "Medium",
    promotionReadiness: 65,
    skillGaps: 3,
    trainingEffectiveness: 82,
  },
  {
    id: 3,
    employee: "Emily Chen",
    role: "Data Analyst",
    performanceScore: 95,
    riskLevel: "Low",
    promotionReadiness: 90,
    skillGaps: 0,
    trainingEffectiveness: 96,
  },
  {
    id: 4,
    employee: "John Smith",
    role: "HR Specialist",
    performanceScore: 71,
    riskLevel: "High",
    promotionReadiness: 45,
    skillGaps: 4,
    trainingEffectiveness: 68,
  },
  {
    id: 5,
    employee: "Lisa Brown",
    role: "Marketing Coordinator",
    performanceScore: 84,
    riskLevel: "Low",
    promotionReadiness: 72,
    skillGaps: 2,
    trainingEffectiveness: 88,
  },
]

const aiRecommendations = [
  {
    type: "promotion",
    employee: "Emily Chen",
    confidence: 95,
    reason: "Consistently high performance and skill mastery",
    action: "Consider for Data Science Lead role",
  },
  {
    type: "training",
    employee: "John Smith",
    confidence: 88,
    reason: "Multiple skill gaps identified",
    action: "Enroll in Leadership Fundamentals course",
  },
  {
    type: "risk",
    employee: "Mike Davis",
    confidence: 76,
    reason: "Performance trend declining",
    action: "Schedule performance review and support plan",
  },
  {
    type: "succession",
    employee: "Sarah Johnson",
    confidence: 92,
    reason: "High potential and readiness scores",
    action: "Include in succession planning for Tech Lead",
  },
]

const skillGapAnalysis = [
  { skill: "JavaScript", avgGap: 1.2, employeesAffected: 8, trainingAvailable: true, priority: "High" },
  { skill: "Leadership", avgGap: 2.1, employeesAffected: 12, trainingAvailable: true, priority: "High" },
  { skill: "Data Analysis", avgGap: 0.8, employeesAffected: 5, trainingAvailable: true, priority: "Medium" },
  { skill: "Communication", avgGap: 1.5, employeesAffected: 15, trainingAvailable: true, priority: "High" },
  { skill: "Project Management", avgGap: 1.8, employeesAffected: 10, trainingAvailable: false, priority: "Medium" },
]

const riskLevels = ["All", "Low", "Medium", "High"]

export default function PerformanceAnalysis() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRisk, setSelectedRisk] = useState("All")

  const [viewDetailsModal, setViewDetailsModal] = useState<{ open: boolean; employee: any }>({
    open: false,
    employee: null,
  })
  const [performanceReportModal, setPerformanceReportModal] = useState<{ open: boolean; employee: any }>({
    open: false,
    employee: null,
  })
  const [generateReportModal, setGenerateReportModal] = useState(false)
  const [takeActionModal, setTakeActionModal] = useState<{ open: boolean; recommendation: any }>({
    open: false,
    recommendation: null,
  })
  const [trainingPlanModal, setTrainingPlanModal] = useState<{ open: boolean; skill: any }>({
    open: false,
    skill: null,
  })

  const filteredInsights = performanceInsights.filter((insight) => {
    const matchesSearch =
      insight.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = selectedRisk === "All" || insight.riskLevel === selectedRisk
    return matchesSearch && matchesRisk
  })

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-600 text-white"
      case "Medium":
        return "bg-yellow-600 text-white"
      case "High":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case "training":
        return <Target className="h-5 w-5 text-blue-400" />
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      case "succession":
        return <Users className="h-5 w-5 text-purple-400" />
      default:
        return <Brain className="h-5 w-5 text-gray-400" />
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-600 text-white"
      case "Medium":
        return "bg-yellow-600 text-white"
      case "Low":
        return "bg-green-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Performance Analysis</h2>
          <Badge className="bg-purple-600 text-white">
            <Brain size={14} className="mr-1" />
            AI-Powered
          </Badge>
        </div>
        <Button
          className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700"
          onClick={() => setGenerateReportModal(true)}
        >
          <BarChart3 size={16} />
          Generate Report
        </Button>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Avg Performance</p>
                <p className="text-2xl font-bold text-white">84%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Ready for Promotion</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-sm text-gray-300">At Risk</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-300">Training Effectiveness</p>
                <p className="text-2xl font-bold text-white">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="bg-gray-800 border border-gray-600">
          <TabsTrigger value="insights" className="data-[state=active]:bg-gray-700 text-white">
            Performance Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-gray-700 text-white">
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="skillgaps" className="data-[state=active]:bg-gray-700 text-white">
            Skill Gap Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {/* Filters */}
          <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Filters</CardTitle>
              <CardDescription className="text-gray-300">Filter performance insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search employees..."
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
                      Risk: {selectedRisk}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-600">
                    {riskLevels.map((risk) => (
                      <DropdownMenuItem
                        key={risk}
                        onClick={() => setSelectedRisk(risk)}
                        className="text-white hover:bg-gray-700"
                      >
                        {risk}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  className="gap-2 border-2 border-gray-600 text-white bg-gray-700 hover:bg-gray-600"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedRisk("All")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights Table */}
          <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Employee Performance Insights</CardTitle>
              <CardDescription className="text-gray-300">{filteredInsights.length} employees analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-gray-300 font-semibold">Employee</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Performance Score</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Risk Level</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Promotion Readiness</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Skill Gaps</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Training Effectiveness</TableHead>
                    <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsights.map((insight) => (
                    <TableRow key={insight.id} className="border-gray-600 hover:bg-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="bg-gray-600 text-white">
                              {insight.employee.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{insight.employee}</div>
                            <div className="text-sm text-gray-400">{insight.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-white font-medium">{insight.performanceScore}%</div>
                          <Progress value={insight.performanceScore} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadgeColor(insight.riskLevel)}>{insight.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-white">{insight.promotionReadiness}%</div>
                          <Progress value={insight.promotionReadiness} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{insight.skillGaps} gaps</TableCell>
                      <TableCell>
                        <div className="text-white">{insight.trainingEffectiveness}%</div>
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
                              onClick={() => setViewDetailsModal({ open: true, employee: insight })}
                            >
                              <Eye size={16} />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-white hover:bg-gray-700"
                              onClick={() => setPerformanceReportModal({ open: true, employee: insight })}
                            >
                              <BarChart3 size={16} />
                              Performance Report
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
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">AI-Generated Recommendations</CardTitle>
              <CardDescription className="text-gray-300">
                Machine learning insights and suggested actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{rec.employee}</h3>
                      <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{rec.reason}</p>
                    <p className="text-blue-400 text-sm font-medium">{rec.action}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setTakeActionModal({ open: true, recommendation: rec })}
                  >
                    Take Action
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skillgaps" className="space-y-4">
          <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Skill Gap Analysis</CardTitle>
              <CardDescription className="text-gray-300">
                Organization-wide skill gaps and training needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-gray-300 font-semibold">Skill</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Avg Gap Level</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Employees Affected</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Training Available</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Priority</TableHead>
                    <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skillGapAnalysis.map((skill, index) => (
                    <TableRow key={index} className="border-gray-600 hover:bg-gray-700">
                      <TableCell className="text-white font-medium">{skill.skill}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-white">{skill.avgGap.toFixed(1)}</div>
                          <Progress value={skill.avgGap * 20} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{skill.employeesAffected} employees</TableCell>
                      <TableCell>
                        <Badge
                          className={skill.trainingAvailable ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                        >
                          {skill.trainingAvailable ? "Available" : "Not Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadgeColor(skill.priority)}>{skill.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setTrainingPlanModal({ open: true, skill })}
                        >
                          Create Training Plan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Details Modal */}
      <Dialog open={viewDetailsModal.open} onOpenChange={(open) => setViewDetailsModal({ open, employee: null })}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gray-600 text-white">
                  {viewDetailsModal.employee?.employee?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg sm:text-xl">{viewDetailsModal.employee?.employee}</div>
                <div className="text-sm text-gray-400">{viewDetailsModal.employee?.role}</div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-300">Detailed performance analysis and insights</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-300">Performance Score</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {viewDetailsModal.employee?.performanceScore}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-300">Promotion Readiness</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {viewDetailsModal.employee?.promotionReadiness}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-300">Training Effectiveness</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {viewDetailsModal.employee?.trainingEffectiveness}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 sm:mt-6 space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Performance Trends</h3>
              <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                <p className="text-sm sm:text-base text-gray-300">
                  Performance has been consistently high over the past 6 months with a slight upward trend in Q4.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Key Strengths</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Badge className="bg-green-600 text-white justify-start text-xs sm:text-sm py-1">
                  Technical Excellence
                </Badge>
                <Badge className="bg-green-600 text-white justify-start text-xs sm:text-sm py-1">
                  Team Collaboration
                </Badge>
                <Badge className="bg-green-600 text-white justify-start text-xs sm:text-sm py-1">Problem Solving</Badge>
                <Badge className="bg-green-600 text-white justify-start text-xs sm:text-sm py-1">Initiative</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Development Areas</h3>
              <div className="space-y-2">
                {Array.from({ length: viewDetailsModal.employee?.skillGaps || 0 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-300">Leadership Skills</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Performance Report Modal */}
      <Dialog
        open={performanceReportModal.open}
        onOpenChange={(open) => setPerformanceReportModal({ open, employee: null })}
      >
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-xl lg:max-w-2xl mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Performance Report - {performanceReportModal.employee?.employee}
            </DialogTitle>
            <DialogDescription className="text-gray-300">Generate a comprehensive performance report</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 sm:mt-6">
            <div>
              <Label className="text-white text-sm sm:text-base">Report Type</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="quarterly">Quarterly Review</SelectItem>
                  <SelectItem value="annual">Annual Review</SelectItem>
                  <SelectItem value="promotion">Promotion Assessment</SelectItem>
                  <SelectItem value="development">Development Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Time Period</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="last3months">Last 3 Months</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Include Sections</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goals" defaultChecked />
                  <Label htmlFor="goals" className="text-xs sm:text-sm text-gray-300">
                    Goals & Objectives
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="skills" defaultChecked />
                  <Label htmlFor="skills" className="text-xs sm:text-sm text-gray-300">
                    Skills Assessment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feedback" defaultChecked />
                  <Label htmlFor="feedback" className="text-xs sm:text-sm text-gray-300">
                    360° Feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="development" defaultChecked />
                  <Label htmlFor="development" className="text-xs sm:text-sm text-gray-300">
                    Development Plan
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 bg-transparent">
                Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Report Modal */}
      <Dialog open={generateReportModal} onOpenChange={setGenerateReportModal}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-md lg:max-w-lg mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Generate Performance Report</DialogTitle>
            <DialogDescription className="text-gray-300">
              Create organization-wide performance analytics report
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 sm:mt-6">
            <div>
              <Label className="text-white text-sm sm:text-base">Report Scope</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="department">By Department</SelectItem>
                  <SelectItem value="team">By Team</SelectItem>
                  <SelectItem value="role">By Role</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Format</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="dashboard">Interactive Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                onClick={() => setGenerateReportModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Take Action Modal */}
      <Dialog open={takeActionModal.open} onOpenChange={(open) => setTakeActionModal({ open, recommendation: null })}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-xl lg:max-w-2xl mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-lg sm:text-xl">
              {getRecommendationIcon(takeActionModal.recommendation?.type)}
              <span>Take Action - {takeActionModal.recommendation?.employee}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Implement the AI recommendation for this employee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 sm:mt-6">
            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Recommendation</h3>
              <p className="text-gray-300 mb-2 text-sm sm:text-base">{takeActionModal.recommendation?.reason}</p>
              <p className="text-blue-400 font-medium text-sm sm:text-base">{takeActionModal.recommendation?.action}</p>
              <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs mt-2">
                {takeActionModal.recommendation?.confidence}% confidence
              </Badge>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Action Plan</Label>
              <Textarea
                placeholder="Describe the specific steps you'll take to implement this recommendation..."
                className="bg-gray-700 border-gray-600 text-white mt-2 text-sm sm:text-base"
                rows={4}
              />
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Timeline</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="immediate">Immediate (1-2 weeks)</SelectItem>
                  <SelectItem value="short">Short-term (1 month)</SelectItem>
                  <SelectItem value="medium">Medium-term (3 months)</SelectItem>
                  <SelectItem value="long">Long-term (6+ months)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Assign To</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="manager">Direct Manager</SelectItem>
                  <SelectItem value="hr">HR Team</SelectItem>
                  <SelectItem value="learning">Learning & Development</SelectItem>
                  <SelectItem value="self">Self (Employee)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Implement Action
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                onClick={() => setTakeActionModal({ open: false, recommendation: null })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Plan Modal */}
      <Dialog open={trainingPlanModal.open} onOpenChange={(open) => setTrainingPlanModal({ open, skill: null })}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Create Training Plan - {trainingPlanModal.skill?.skill}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Design a comprehensive training program to address skill gaps
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-300">Employees Affected</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {trainingPlanModal.skill?.employeesAffected}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-300">Avg Gap Level</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {trainingPlanModal.skill?.avgGap?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-700 border-gray-600 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-300">Priority</p>
                      <Badge className={getPriorityBadgeColor(trainingPlanModal.skill?.priority)}>
                        {trainingPlanModal.skill?.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Training Program Name</Label>
              <Input
                placeholder={`${trainingPlanModal.skill?.skill} Mastery Program`}
                className="bg-gray-700 border-gray-600 text-white mt-2"
              />
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Training Format</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="online" defaultChecked />
                  <Label htmlFor="online" className="text-xs sm:text-sm text-gray-300">
                    Online Courses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="workshop" />
                  <Label htmlFor="workshop" className="text-xs sm:text-sm text-gray-300">
                    Workshops
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mentoring" />
                  <Label htmlFor="mentoring" className="text-xs sm:text-sm text-gray-300">
                    Mentoring
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="certification" />
                  <Label htmlFor="certification" className="text-xs sm:text-sm text-gray-300">
                    Certification
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Duration</Label>
              <Select>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="2weeks">2 Weeks</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Learning Objectives</Label>
              <Textarea
                placeholder="Define what participants will learn and achieve..."
                className="bg-gray-700 border-gray-600 text-white mt-2 text-sm sm:text-base"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-white text-sm sm:text-base">Success Metrics</Label>
              <Textarea
                placeholder="How will you measure the success of this training program..."
                className="bg-gray-700 border-gray-600 text-white mt-2 text-sm sm:text-base"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                Create Training Plan
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                onClick={() => setTrainingPlanModal({ open: false, skill: null })}
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

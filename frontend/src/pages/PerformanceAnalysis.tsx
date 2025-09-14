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
        return "bg-green-100 text-green-800 border border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "High":
        return "bg-red-100 text-red-800 border border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
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
        return "bg-red-100 text-red-800 border border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Performance Analysis</h2>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Brain size={14} className="mr-1" />
            AI-Powered
          </Badge>
        </div>
        <Button
          className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-sm"
          onClick={() => setGenerateReportModal(true)}
        >
          <BarChart3 size={16} />
          Generate Report
        </Button>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Avg Performance</p>
                <p className="text-3xl font-bold text-gray-900">84%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Ready for Promotion</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">At Risk</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Training Effectiveness</p>
                <p className="text-3xl font-bold text-gray-900">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="bg-gray-100 border border-gray-200 p-1">
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
          >
            Performance Insights
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
          >
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger
            value="skillgaps"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
          >
            Skill Gap Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900">Filters</CardTitle>
              <CardDescription className="text-gray-600">Filter performance insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
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
                      Risk: {selectedRisk}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                    {riskLevels.map((risk) => (
                      <DropdownMenuItem
                        key={risk}
                        onClick={() => setSelectedRisk(risk)}
                        className="text-gray-700 hover:bg-gray-50"
                      >
                        {risk}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  className="gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 h-11"
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
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900">Employee Performance Insights</CardTitle>
              <CardDescription className="text-gray-600">{filteredInsights.length} employees analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-700 font-semibold">Employee</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Performance Score</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Risk Level</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Promotion Readiness</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Skill Gaps</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Training Effectiveness</TableHead>
                    <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsights.map((insight) => (
                    <TableRow key={insight.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 ring-2 ring-gray-200">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="bg-gray-100 text-gray-700">
                              {insight.employee.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{insight.employee}</div>
                            <div className="text-sm text-gray-500">{insight.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-gray-900 font-medium">{insight.performanceScore}%</div>
                          <Progress value={insight.performanceScore} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadgeColor(insight.riskLevel)}>{insight.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-gray-900">{insight.promotionReadiness}%</div>
                          <Progress value={insight.promotionReadiness} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">{insight.skillGaps} gaps</TableCell>
                      <TableCell>
                        <div className="text-gray-900">{insight.trainingEffectiveness}%</div>
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
                              className="gap-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setViewDetailsModal({ open: true, employee: insight })}
                            >
                              <Eye size={16} />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-gray-700 hover:bg-gray-100"
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

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900">AI-Generated Recommendations</CardTitle>
              <CardDescription className="text-gray-600">
                Machine learning insights and suggested actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900 font-medium">{rec.employee}</h3>
                      <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{rec.reason}</p>
                    <p className="text-blue-600 text-sm font-medium">{rec.action}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    onClick={() => setTakeActionModal({ open: true, recommendation: rec })}
                  >
                    Take Action
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skillgaps" className="space-y-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900">Skill Gap Analysis</CardTitle>
              <CardDescription className="text-gray-600">
                Organization-wide skill gaps and training needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-700 font-semibold">Skill</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Avg Gap Level</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Employees Affected</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Training Available</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Priority</TableHead>
                    <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skillGapAnalysis.map((skill, index) => (
                    <TableRow key={index} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="text-gray-900 font-medium">{skill.skill}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-gray-900">{skill.avgGap.toFixed(1)}</div>
                          <Progress value={skill.avgGap * 20} className="h-2 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">{skill.employeesAffected} employees</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            skill.trainingAvailable
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
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
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-gray-200">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gray-100 text-gray-700">
                  {viewDetailsModal.employee?.employee?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg sm:text-xl text-gray-900">{viewDetailsModal.employee?.employee}</div>
                <div className="text-sm text-gray-500">{viewDetailsModal.employee?.role}</div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600">Detailed performance analysis and insights</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl border border-green-200">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Performance Score</p>
                    <p className="text-2xl font-bold text-gray-900">{viewDetailsModal.employee?.performanceScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl border border-purple-200">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Promotion Readiness</p>
                    <p className="text-2xl font-bold text-gray-900">{viewDetailsModal.employee?.promotionReadiness}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border border-gray-200 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Training Effectiveness</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {viewDetailsModal.employee?.trainingEffectiveness}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Performance Trends</h3>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
                <p className="text-sm sm:text-base text-gray-700">
                  Performance has been consistently high over the past 6 months with a slight upward trend in Q4.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Strengths</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Badge className="bg-green-50 text-green-700 border border-green-200 justify-start text-sm py-2 px-3">
                  Technical Excellence
                </Badge>
                <Badge className="bg-green-50 text-green-700 border border-green-200 justify-start text-sm py-2 px-3">
                  Team Collaboration
                </Badge>
                <Badge className="bg-green-50 text-green-700 border border-green-200 justify-start text-sm py-2 px-3">
                  Problem Solving
                </Badge>
                <Badge className="bg-green-50 text-green-700 border border-green-200 justify-start text-sm py-2 px-3">
                  Initiative
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Areas</h3>
              <div className="space-y-3">
                {Array.from({ length: viewDetailsModal.employee?.skillGaps || 0 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Leadership Skills</span>
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
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-xl lg:max-w-2xl mx-2 sm:mx-4 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-gray-900">
              Performance Report - {performanceReportModal.employee?.employee}
            </DialogTitle>
            <DialogDescription className="text-gray-600">Generate a comprehensive performance report</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Report Type</Label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="quarterly">Quarterly Review</SelectItem>
                  <SelectItem value="annual">Annual Review</SelectItem>
                  <SelectItem value="promotion">Promotion Assessment</SelectItem>
                  <SelectItem value="development">Development Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Time Period</Label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="last3months">Last 3 Months</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Include Sections</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="goals" defaultChecked />
                  <Label htmlFor="goals" className="text-xs sm:text-sm text-gray-700">
                    Goals & Objectives
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="skills" defaultChecked />
                  <Label htmlFor="skills" className="text-xs sm:text-sm text-gray-700">
                    Skills Assessment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feedback" defaultChecked />
                  <Label htmlFor="feedback" className="text-xs sm:text-sm text-gray-700">
                    360° Feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="development" defaultChecked />
                  <Label htmlFor="development" className="text-xs sm:text-sm text-gray-700">
                    Development Plan
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white">
                Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Report Modal */}
      <Dialog open={generateReportModal} onOpenChange={setGenerateReportModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-md lg:max-w-lg mx-2 sm:mx-4 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-gray-900">Generate Performance Report</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create organization-wide performance analytics report
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Report Scope</Label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="department">By Department</SelectItem>
                  <SelectItem value="team">By Team</SelectItem>
                  <SelectItem value="role">By Role</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Format</Label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="dashboard">Interactive Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
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
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-xl lg:max-w-2xl mx-2 sm:mx-4 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-lg sm:text-xl text-gray-900">
              {getRecommendationIcon(takeActionModal.recommendation?.type)}
              <span>Take Action - {takeActionModal.recommendation?.employee}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Implement the AI recommendation for this employee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Recommendation</h3>
              <p className="text-gray-700 mb-2 text-sm sm:text-base">{takeActionModal.recommendation?.reason}</p>
              <p className="text-blue-600 font-medium text-sm sm:text-base">{takeActionModal.recommendation?.action}</p>
              <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs mt-2">
                {takeActionModal.recommendation?.confidence}% confidence
              </Badge>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Action Plan</Label>
              <Textarea
                placeholder="Describe the specific steps you'll take to implement this recommendation..."
                className="bg-gray-50 border-gray-200 text-gray-900 mt-2 text-sm sm:text-base"
                rows={4}
              />
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Timeline</Label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="immediate">Immediate (1-2 weeks)</SelectItem>
                  <SelectItem value="short">Short-term (1 month)</SelectItem>
                  <SelectItem value="medium">Medium-term (3 months)</SelectItem>
                  <SelectItem value="long">Long-term (6+ months)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Assign To</Label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="manager">Direct Manager</SelectItem>
                  <SelectItem value="hr">HR Team</SelectItem>
                  <SelectItem value="learning">Learning & Development</SelectItem>
                  <SelectItem value="self">Self (Employee)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Implement Action
              </Button>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
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
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-gray-900">
              Create Training Plan - {trainingPlanModal.skill?.skill}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Design a comprehensive training program to address skill gaps
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Employees Affected</p>
                      <p className="text-xl font-bold text-gray-900">{trainingPlanModal.skill?.employeesAffected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-xl border border-yellow-200">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Avg Gap Level</p>
                      <p className="text-xl font-bold text-gray-900">{trainingPlanModal.skill?.avgGap?.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border border-gray-200 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl border border-purple-200">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Priority</p>
                      <Badge className={getPriorityBadgeColor(trainingPlanModal.skill?.priority)}>
                        {trainingPlanModal.skill?.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Training Program Name</Label>
              <Input
                placeholder={`${trainingPlanModal.skill?.skill} Mastery Program`}
                className="bg-gray-50 border-gray-200 text-gray-900 mt-2"
              />
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Training Format</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="online" defaultChecked />
                  <Label htmlFor="online" className="text-xs sm:text-sm text-gray-700">
                    Online Courses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="workshop" />
                  <Label htmlFor="workshop" className="text-xs sm:text-sm text-gray-700">
                    Workshops
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mentoring" />
                  <Label htmlFor="mentoring" className="text-xs sm:text-sm text-gray-700">
                    Mentoring
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="certification" />
                  <Label htmlFor="certification" className="text-xs sm:text-sm text-gray-700">
                    Certification
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Duration</Label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="2weeks">2 Weeks</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Learning Objectives</Label>
              <Textarea
                placeholder="Define what participants will learn and achieve..."
                className="bg-gray-50 border-gray-200 text-gray-900 mt-2 text-sm sm:text-base"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-gray-900 text-sm sm:text-base font-medium">Success Metrics</Label>
              <Textarea
                placeholder="How will you measure the success of this training program..."
                className="bg-gray-50 border-gray-200 text-gray-900 mt-2 text-sm sm:text-base"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Create Training Plan
              </Button>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
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

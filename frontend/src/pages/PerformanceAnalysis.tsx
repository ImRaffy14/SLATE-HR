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
        <Button className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700">
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
                            <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                              <Eye size={16} />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
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
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
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
    </div>
  )
}

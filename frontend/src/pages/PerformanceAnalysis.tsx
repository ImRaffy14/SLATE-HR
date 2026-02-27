"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
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
  Loader2,
  RefreshCw,
  Sparkles,
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
import {
  getAllEmployeesWithMetrics,
  getDashboardSummary,
  analyzeEmployeeWithAI,
  getAIRecommendations,
  syncPerformanceSnapshots,
  getEmployeeMetrics,
  getExplainableAI,
  getOrgAnalytics,
  EmployeeWithMetrics,
  AIAnalysisResult,
  AIRecommendation,
  OrgAnalytics,
} from "@/api/performance"

const riskLevels = ["All", "Low", "Medium", "High"]

export default function PerformanceAnalysis() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRisk, setSelectedRisk] = useState("All")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithMetrics | null>(null)

  const [viewDetailsModal, setViewDetailsModal] = useState<{ open: boolean; employee: EmployeeWithMetrics | null }>({
    open: false,
    employee: null,
  })
  const [aiAnalysisModal, setAiAnalysisModal] = useState<{ 
    open: boolean; 
    employee: EmployeeWithMetrics | null;
    analysis: any | null;
    loading: boolean;
  }>({
    open: false,
    employee: null,
    analysis: null,
    loading: false,
  })
  const [recommendationsModal, setRecommendationsModal] = useState<{
    open: boolean;
    employee: EmployeeWithMetrics | null;
    recommendations: AIRecommendation[];
    loading: boolean;
  }>({
    open: false,
    employee: null,
    recommendations: [],
    loading: false,
  })
  const [generateReportModal, setGenerateReportModal] = useState(false)
  const [reportScope, setReportScope] = useState<"all" | "department" | "team" | "role">("all")
  const [reportFormat, setReportFormat] = useState<"pdf" | "excel" | "dashboard" | "">("")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Fetch dashboard summary
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["performance-dashboard"],
    queryFn: getDashboardSummary,
  })

  // Fetch all employees with metrics
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["performance-employees"],
    queryFn: getAllEmployeesWithMetrics,
  })

  // Sync snapshots mutation
  const syncMutation = useMutation({
    mutationFn: syncPerformanceSnapshots,
    onSuccess: (data) => {
      toast.success(`Synced ${data?.synced || 0} employee snapshots`);
      queryClient.invalidateQueries({ queryKey: ["performance-employees"] });
      queryClient.invalidateQueries({ queryKey: ["performance-dashboard"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sync snapshots");
    },
  })

  // AI Analysis mutation
  const analyzeEmployeeMutation = useMutation({
    mutationFn: ({ employeeId, forceRefresh }: { employeeId: string; forceRefresh: boolean }) =>
      analyzeEmployeeWithAI(employeeId, forceRefresh),
    onSuccess: (data) => {
      setAiAnalysisModal(prev => ({
        ...prev,
        analysis: data,
        loading: false,
      }));
      queryClient.invalidateQueries({ queryKey: ["performance-employees"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to analyze employee");
      setAiAnalysisModal(prev => ({ ...prev, loading: false }));
    },
  })

  // Recommendations mutation
  const getRecommendationsMutation = useMutation({
    mutationFn: ({ employeeId, forceRefresh }: { employeeId: string; forceRefresh: boolean }) =>
      getAIRecommendations(employeeId, forceRefresh),
    onSuccess: (data) => {
      setRecommendationsModal(prev => ({
        ...prev,
        recommendations: data?.recommendations || [],
        loading: false,
      }));
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to get recommendations");
      setRecommendationsModal(prev => ({ ...prev, loading: false }));
    },
  })

  const employees: EmployeeWithMetrics[] = employeesData?.employees || []

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (emp.department?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    
    const riskLevel = emp.latestInsight?.analysisResult?.riskLevel || 
      (emp.latestSnapshot?.overallScore ? 
        (emp.latestSnapshot.overallScore < 50 ? "High" : 
         emp.latestSnapshot.overallScore < 70 ? "Medium" : "Low") 
        : "Unknown")
    
    const matchesRisk = selectedRisk === "All" || riskLevel === selectedRisk
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

  const getEmployeeRiskLevel = (emp: EmployeeWithMetrics) => {
    if (emp.latestInsight?.analysisResult?.riskLevel) {
      return emp.latestInsight.analysisResult.riskLevel
    }
    if (emp.latestSnapshot?.overallScore) {
      if (emp.latestSnapshot.overallScore < 50) return "High"
      if (emp.latestSnapshot.overallScore < 70) return "Medium"
      return "Low"
    }
    return "Unknown"
  }

  const handleAnalyzeWithAI = (emp: EmployeeWithMetrics, forceRefresh = false) => {
    setAiAnalysisModal({
      open: true,
      employee: emp,
      analysis: null,
      loading: true,
    })
    analyzeEmployeeMutation.mutate({ employeeId: emp.id, forceRefresh })
  }

  const handleGetRecommendations = (emp: EmployeeWithMetrics, forceRefresh = false) => {
    setRecommendationsModal({
      open: true,
      employee: emp,
      recommendations: [],
      loading: true,
    })
    getRecommendationsMutation.mutate({ employeeId: emp.id, forceRefresh })
  }

  const handleGenerateReport = async () => {
    if (!reportFormat) {
      toast.error("Please select a report format (e.g., Excel).")
      return
    }

    if (reportFormat !== "excel") {
      toast.error("Only Excel format is supported at the moment.")
      return
    }

    setIsGeneratingReport(true)
    try {
      const analytics = (await getOrgAnalytics()) as OrgAnalytics

      if (!analytics) {
        throw new Error("No analytics data available.")
      }

      const lines: string[] = []
      lines.push([
        "section",
        "name",
        "department",
        "overallScore",
        "riskLevel",
        "employeeCount",
        "avgScore",
        "totalEmployees",
        "avgPerformanceScore",
        "avgCompetencyScore",
        "avgLearningScore",
        "avgTrainingScore",
        "lowRisk",
        "mediumRisk",
        "highRisk",
      ].join(","))

      // Summary row
      lines.push([
        "summary",
        "",
        "",
        "",
        "",
        "",
        "",
        String(analytics.totalEmployees ?? ""),
        String(Math.round(analytics.avgPerformanceScore ?? 0)),
        String(Math.round(analytics.avgCompetencyScore ?? 0)),
        String(Math.round(analytics.avgLearningScore ?? 0)),
        String(Math.round(analytics.avgTrainingScore ?? 0)),
        String(analytics.riskDistribution?.low ?? 0),
        String(analytics.riskDistribution?.medium ?? 0),
        String(analytics.riskDistribution?.high ?? 0),
      ].join(","))

      // Department breakdown
      analytics.departmentBreakdown?.forEach((dept) => {
        lines.push([
          "department",
          "",
          `"${dept.department}"`,
          "",
          "",
          String(dept.employeeCount ?? 0),
          String(Math.round(dept.avgScore ?? 0)),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ].join(","))
      })

      // Top performers
      analytics.topPerformers?.forEach((emp) => {
        lines.push([
          "topPerformer",
          `"${emp.name}"`,
          `"${emp.department ?? ""}"`,
          String(Math.round(emp.overallScore ?? 0)),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ].join(","))
      })

      // Needs attention
      analytics.needsAttention?.forEach((emp) => {
        lines.push([
          "needsAttention",
          `"${emp.name}"`,
          `"${emp.department ?? ""}"`,
          String(Math.round(emp.overallScore ?? 0)),
          emp.riskLevel ?? "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ].join(","))
      })

      const csvContent = lines.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const timestamp = new Date().toISOString().split("T")[0]
      link.href = url
      link.download = `performance-report-${timestamp}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Performance report (Excel/CSV) generated.")
      setGenerateReportModal(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to generate report.")
    } finally {
      setIsGeneratingReport(false)
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Sync Data
          </Button>
          <Button
            className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-sm"
            onClick={() => setGenerateReportModal(true)}
          >
            <BarChart3 size={16} />
            Generate Report
          </Button>
        </div>
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
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingDashboard ? "..." : `${Math.round(dashboardData?.avgPerformanceScore || 0)}%`}
                </p>
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
                <p className="text-sm font-medium text-gray-500 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingDashboard ? "..." : dashboardData?.totalEmployees || 0}
                </p>
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
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingDashboard ? "..." : dashboardData?.riskDistribution?.high || 0}
                </p>
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
                <p className="text-sm font-medium text-gray-500 mb-1">Avg Competency</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingDashboard ? "..." : `${Math.round(dashboardData?.avgCompetencyScore || 0)}%`}
                </p>
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
            value="topperformers"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
          >
            Top Performers
          </TabsTrigger>
          <TabsTrigger
            value="needsattention"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 data-[state=active]:text-gray-900"
          >
            Needs Attention
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
              <CardDescription className="text-gray-600">
                {isLoadingEmployees ? "Loading..." : `${filteredEmployees.length} employees`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEmployees ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Employee</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Overall Score</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Risk Level</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Performance</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Competency</TableHead>
                      <TableHead className="text-gray-700 font-semibold">AI Status</TableHead>
                      <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp.id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 ring-2 ring-gray-200">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback className="bg-gray-100 text-gray-700">
                                {emp.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{emp.name}</div>
                              <div className="text-sm text-gray-500">{emp.position || emp.department || "N/A"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {emp.latestSnapshot ? (
                            <div className="space-y-1">
                              <div className="text-gray-900 font-medium">
                                {Math.round(emp.latestSnapshot.overallScore)}%
                              </div>
                              <Progress value={emp.latestSnapshot.overallScore} className="h-2 w-20" />
                            </div>
                          ) : (
                            <span className="text-gray-400">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(getEmployeeRiskLevel(emp))}>
                            {getEmployeeRiskLevel(emp)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {emp.latestSnapshot ? (
                            <div className="text-gray-900">
                              {Math.round(emp.latestSnapshot.performanceScore)}%
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {emp.latestSnapshot ? (
                            <div className="text-gray-900">
                              {Math.round(emp.latestSnapshot.competencyScore)}%
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {emp.latestInsight ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <Sparkles size={12} className="mr-1" />
                              Analyzed
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                              Not Analyzed
                            </Badge>
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
                                className="gap-2 text-gray-700 hover:bg-gray-100"
                                onClick={() => setViewDetailsModal({ open: true, employee: emp })}
                              >
                                <Eye size={16} />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-purple-700 hover:bg-purple-50"
                                onClick={() => handleAnalyzeWithAI(emp, false)}
                              >
                                <Brain size={16} />
                                Analyze with AI
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-blue-700 hover:bg-blue-50"
                                onClick={() => handleGetRecommendations(emp, false)}
                              >
                                <Target size={16} />
                                Get Recommendations
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topperformers" className="space-y-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription className="text-gray-600">
                Employees with highest performance scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDashboard ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {(dashboardData?.topPerformers || []).map((emp: any, index: number) => (
                    <div key={emp.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="w-12 h-12 ring-2 ring-gray-200">
                        <AvatarFallback className="bg-gray-100 text-gray-700">
                          {emp.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-500">{emp.department || "N/A"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{Math.round(emp.overallScore)}%</div>
                        <div className="text-xs text-gray-500">Overall Score</div>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData?.topPerformers || dashboardData.topPerformers.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No top performers data available. Sync data first.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needsattention" className="space-y-6">
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Needs Attention
              </CardTitle>
              <CardDescription className="text-gray-600">
                Employees requiring performance support
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDashboard ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {(dashboardData?.needsAttention || []).map((emp: any) => (
                    <div key={emp.id} className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
                      <Avatar className="w-12 h-12 ring-2 ring-red-200">
                        <AvatarFallback className="bg-red-100 text-red-700">
                          {emp.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-500">{emp.department || "N/A"}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getRiskBadgeColor(emp.riskLevel)}>{emp.riskLevel}</Badge>
                        <div className="text-sm text-gray-500 mt-1">Score: {Math.round(emp.overallScore)}%</div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          const fullEmp = employees.find(e => e.id === emp.id)
                          if (fullEmp) handleAnalyzeWithAI(fullEmp, false)
                        }}
                      >
                        <Brain size={14} className="mr-1" />
                        Analyze
                      </Button>
                    </div>
                  ))}
                  {(!dashboardData?.needsAttention || dashboardData.needsAttention.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No employees needing attention. Great job!</p>
                  )}
                </div>
              )}
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
                <AvatarFallback className="bg-gray-100 text-gray-700">
                  {viewDetailsModal.employee?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg sm:text-xl text-gray-900">{viewDetailsModal.employee?.name}</div>
                <div className="text-sm text-gray-500">
                  {viewDetailsModal.employee?.position || viewDetailsModal.employee?.department || "N/A"}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600">Detailed performance analysis and insights</DialogDescription>
          </DialogHeader>

          {viewDetailsModal.employee?.latestSnapshot && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Overall Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(viewDetailsModal.employee.latestSnapshot.overallScore)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Performance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(viewDetailsModal.employee.latestSnapshot.performanceScore)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Competency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(viewDetailsModal.employee.latestSnapshot.competencyScore)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Learning</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(viewDetailsModal.employee.latestSnapshot.learningScore)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {viewDetailsModal.employee?.latestInsight && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Trend: {viewDetailsModal.employee.latestInsight.analysisResult.performanceTrend}
                  </span>
                  <Badge className={getRiskBadgeColor(viewDetailsModal.employee.latestInsight.analysisResult.riskLevel)}>
                    {viewDetailsModal.employee.latestInsight.analysisResult.riskLevel} Risk
                  </Badge>
                </div>
                <p className="text-gray-700">
                  {viewDetailsModal.employee.latestInsight.analysisResult.insightSummary}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                if (viewDetailsModal.employee) {
                  setViewDetailsModal({ open: false, employee: null })
                  handleAnalyzeWithAI(viewDetailsModal.employee, true)
                }
              }}
            >
              <Brain className="h-4 w-4 mr-2" />
              Analyze with AI
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setViewDetailsModal({ open: false, employee: null })}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={aiAnalysisModal.open} onOpenChange={(open) => setAiAnalysisModal({ open, employee: null, analysis: null, loading: false })}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900">
              <Brain className="h-6 w-6 text-purple-600" />
              AI Performance Analysis
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {aiAnalysisModal.employee?.name} - AI-powered insights and recommendations
            </DialogDescription>
          </DialogHeader>

          {aiAnalysisModal.loading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
              <p className="text-gray-600">Analyzing with AI...</p>
              <p className="text-sm text-gray-400">This may take a few seconds</p>
            </div>
          ) : aiAnalysisModal.analysis ? (
            <div className="space-y-6 mt-4">
              {/* Summary */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Performance Trend</span>
                  </div>
                  <Badge className={getRiskBadgeColor(aiAnalysisModal.analysis.analysis?.riskLevel)}>
                    {aiAnalysisModal.analysis.analysis?.riskLevel} Risk
                  </Badge>
                </div>
                <p className="text-gray-700">{aiAnalysisModal.analysis.analysis?.insightSummary}</p>
              </div>

              {/* Key Factors */}
              {aiAnalysisModal.analysis.analysis?.keyFactors?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Key Factors</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysisModal.analysis.analysis.keyFactors.map((factor: string, i: number) => (
                      <Badge key={i} className="bg-blue-100 text-blue-700 border-blue-200">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Development Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiAnalysisModal.analysis.analysis?.strengthAreas?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-700 mb-3">Strengths</h3>
                    <div className="space-y-2">
                      {aiAnalysisModal.analysis.analysis.strengthAreas.map((s: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {aiAnalysisModal.analysis.analysis?.developmentAreas?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-yellow-700 mb-3">Development Areas</h3>
                    <div className="space-y-2">
                      {aiAnalysisModal.analysis.analysis.developmentAreas.map((d: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Target className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-gray-700">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {aiAnalysisModal.analysis.analysis?.recommendations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {aiAnalysisModal.analysis.analysis.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-500">
                <strong>AI Disclaimer:</strong> This analysis is AI-generated and should be used as a decision-support tool. 
                Final decisions should incorporate human judgment and additional context.
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 text-gray-500">
              No analysis available
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {aiAnalysisModal.employee && !aiAnalysisModal.loading && (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleAnalyzeWithAI(aiAnalysisModal.employee!, true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            )}
            <Button
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setAiAnalysisModal({ open: false, employee: null, analysis: null, loading: false })}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recommendations Modal */}
      <Dialog open={recommendationsModal.open} onOpenChange={(open) => setRecommendationsModal({ open, employee: null, recommendations: [], loading: false })}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900">
              <Target className="h-6 w-6 text-blue-600" />
              Development Recommendations
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {recommendationsModal.employee?.name} - Personalized development plan
            </DialogDescription>
          </DialogHeader>

          {recommendationsModal.loading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-gray-600">Generating recommendations...</p>
            </div>
          ) : recommendationsModal.recommendations.length > 0 ? (
            <div className="space-y-4 mt-4">
              {recommendationsModal.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          rec.priority === "High" ? "bg-red-100 text-red-700 border-red-200" :
                          rec.priority === "Medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                          "bg-green-100 text-green-700 border-green-200"
                        }>
                          {rec.priority} Priority
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          {rec.type}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-sm text-blue-600">{rec.rationale}</p>
                    </div>
                    {(rec.linkedCourseId || rec.linkedTrainingId) && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        Enroll
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 text-gray-500">
              No recommendations available
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {recommendationsModal.employee && !recommendationsModal.loading && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleGetRecommendations(recommendationsModal.employee!, true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
            <Button
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setRecommendationsModal({ open: false, employee: null, recommendations: [], loading: false })}
            >
              Close
            </Button>
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
              <Select value={reportScope} onValueChange={(value) => setReportScope(value as typeof reportScope)}>
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
              <Select value={reportFormat} onValueChange={(value) => setReportFormat(value as typeof reportFormat)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {isGeneratingReport ? "Generating..." : "Generate Report"}
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
    </div>
  )
}

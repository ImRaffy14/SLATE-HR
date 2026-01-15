"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
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
  Trash2,
  RefreshCw,
  AlertTriangle,
  Award,
  ArrowRight,
  Loader2,
  Bell,
  X,
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
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

import * as successionApi from "@/api/succession"
import { getJobRoles } from "@/api/jobRole"
import { getEmployees } from "@/api/employee"
import { getCourses } from "@/api/learning"
import { getTrainings } from "@/api/training"

// Helper functions
const getReadinessColor = (status: string) => {
  switch (status) {
    case "READY_NOW":
      return "bg-green-100 text-green-800 border-green-200"
    case "READY_6_MONTHS":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "READY_1_YEAR":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "NOT_READY":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getReadinessLabel = (status: string) => {
  switch (status) {
    case "READY_NOW":
      return "Ready Now"
    case "READY_6_MONTHS":
      return "Ready in 6 Months"
    case "READY_1_YEAR":
      return "Ready in 1 Year"
    case "NOT_READY":
      return "Not Ready"
    default:
      return status
  }
}

const getRiskColor = (level: string | null) => {
  switch (level) {
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200"
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "LOW":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getScoreColor = (score: number | null) => {
  if (!score) return "text-gray-500"
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

// 9-Box Grid Component
const NineBoxGrid = ({ data }: { data: any }) => {
  const gridLabels = [
    { x: 1, y: 3, label: "Rough Diamond" },
    { x: 2, y: 3, label: "High Potential" },
    { x: 3, y: 3, label: "Star" },
    { x: 1, y: 2, label: "Inconsistent Player" },
    { x: 2, y: 2, label: "Core Player" },
    { x: 3, y: 2, label: "High Performer" },
    { x: 1, y: 1, label: "Underperformer" },
    { x: 2, y: 1, label: "Effective" },
    { x: 3, y: 1, label: "Trusted Professional" },
  ]

  const getGridColor = (x: number, y: number) => {
    if (x === 3 && y === 3) return "bg-green-100 border-green-300"
    if ((x === 3 && y === 2) || (x === 2 && y === 3)) return "bg-green-50 border-green-200"
    if (x === 2 && y === 2) return "bg-blue-50 border-blue-200"
    if ((x === 1 && y === 3) || (x === 3 && y === 1)) return "bg-yellow-50 border-yellow-200"
    if ((x === 1 && y === 2) || (x === 2 && y === 1)) return "bg-orange-50 border-orange-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <div className="w-12"></div>
        <div className="flex-1 text-center font-semibold text-gray-700">Performance →</div>
      </div>
      <div className="flex">
        <div className="w-12 flex flex-col items-center justify-center">
          <span className="font-semibold text-gray-700 -rotate-90 whitespace-nowrap">Potential →</span>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2">
          {gridLabels.map((cell) => {
            const key = `${cell.x}-${cell.y}`
            const cellData = data?.grid?.[key]
            return (
              <div
                key={key}
                className={`p-3 border-2 rounded-lg ${getGridColor(cell.x, cell.y)} min-h-[100px] flex flex-col`}
                style={{ order: (3 - cell.y) * 3 + cell.x }}
              >
                <div className="text-xs font-medium text-gray-700 mb-2">{cell.label}</div>
                <div className="text-2xl font-bold text-gray-900">{cellData?.count || 0}</div>
                {cellData?.employees && cellData.employees.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {cellData.employees.slice(0, 3).map((e: any) => e.name).join(", ")}
                    {cellData.employees.length > 3 && ` +${cellData.employees.length - 3} more`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex mt-2">
        <div className="w-12"></div>
        <div className="flex-1 flex justify-between text-xs text-gray-500">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}

export default function SuccessionPlanning() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Critical Roles State
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [roleFormData, setRoleFormData] = useState({
    jobRoleId: "",
    description: "",
    isCritical: true,
    requiredCompetencies: [] as Array<{ competencyId: string; requiredLevel: number; weight: number }>,
  })

  // Talent Pool State
  const [showAddTalentModal, setShowAddTalentModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [showRatePotentialModal, setShowRatePotentialModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [potentialRating, setPotentialRating] = useState({ rating: 3, comments: "" })

  // IDP State
  const [showCreateIDPModal, setShowCreateIDPModal] = useState(false)
  const [showIDPDetailModal, setShowIDPDetailModal] = useState(false)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [selectedIDP, setSelectedIDP] = useState<any>(null)
  const [selectedEmployeeForIDP, setSelectedEmployeeForIDP] = useState<any>(null)
  const [idpFormData, setIdpFormData] = useState({
    targetRoleId: "",
    autoGenerateGoals: true,
  })
  const [goalFormData, setGoalFormData] = useState({
    title: "",
    description: "",
    goalType: "SHORT_TERM" as "SHORT_TERM" | "LONG_TERM",
    targetDate: "",
    courseId: "",
    trainingId: "",
    competencyId: "",
  })

  // Promotion State
  const [showPromotionAlertModal, setShowPromotionAlertModal] = useState(false)
  const [promotionAlertData, setPromotionAlertData] = useState({
    employeeId: "",
    roleId: "",
    message: "",
  })

  // ===========================================
  // API QUERIES
  // ===========================================

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["succession-dashboard"],
    queryFn: () => successionApi.getDashboardSummary(),
  })

  const { data: criticalRolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["critical-roles"],
    queryFn: () => successionApi.getCriticalRoles(),
  })

  const { data: jobRolesData } = useQuery({
    queryKey: ["job-roles"],
    queryFn: getJobRoles,
  })

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  })

  const { data: competenciesData } = useQuery({
    queryKey: ["succession-competencies"],
    queryFn: () => successionApi.getCompetenciesForMapping(),
  })

  const { data: nineBoxData, isLoading: isLoading9Box } = useQuery({
    queryKey: ["9box-data"],
    queryFn: () => successionApi.get9BoxData(),
  })

  const { data: readinessData, isLoading: isLoadingReadiness } = useQuery({
    queryKey: ["readiness-report"],
    queryFn: () => successionApi.getReadinessReport(),
  })

  const { data: riskData, isLoading: isLoadingRisk } = useQuery({
    queryKey: ["risk-analysis"],
    queryFn: () => successionApi.getRiskAnalysis(),
  })

  const { data: promotionData, isLoading: isLoadingPromotion } = useQuery({
    queryKey: ["promotion-pipeline"],
    queryFn: () => successionApi.getPromotionPipeline(),
  })

  const { data: coursesData } = useQuery({
    queryKey: ["courses-for-idp"],
    queryFn: () => getCourses({ status: "PUBLISHED" }),
  })

  const { data: trainingsData } = useQuery({
    queryKey: ["trainings-for-idp"],
    queryFn: () => getTrainings({ status: "OPEN" }),
  })

  // ===========================================
  // MUTATIONS
  // ===========================================

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => successionApi.createCriticalRole(data),
    onSuccess: () => {
      toast.success("Critical role created successfully")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      queryClient.invalidateQueries({ queryKey: ["succession-dashboard"] })
      setShowCreateRoleModal(false)
      resetRoleForm()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create critical role")
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => successionApi.updateCriticalRole(id, data),
    onSuccess: () => {
      toast.success("Critical role updated successfully")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      setShowEditRoleModal(false)
      setSelectedRole(null)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update critical role")
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => successionApi.deleteCriticalRole(id),
    onSuccess: () => {
      toast.success("Critical role deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      queryClient.invalidateQueries({ queryKey: ["succession-dashboard"] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete critical role")
    },
  })

  const addToTalentPoolMutation = useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: any }) =>
      successionApi.addToTalentPool(roleId, data),
    onSuccess: () => {
      toast.success("Employee added to talent pool")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      queryClient.invalidateQueries({ queryKey: ["succession-dashboard"] })
      setShowAddTalentModal(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to talent pool")
    },
  })

  const removeFromTalentPoolMutation = useMutation({
    mutationFn: (id: string) => successionApi.removeFromTalentPool(id),
    onSuccess: () => {
      toast.success("Removed from talent pool")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      queryClient.invalidateQueries({ queryKey: ["succession-dashboard"] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove from talent pool")
    },
  })

  const ratePotentialMutation = useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: any }) =>
      successionApi.ratePotential(employeeId, data),
    onSuccess: () => {
      toast.success("Potential rating saved")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      queryClient.invalidateQueries({ queryKey: ["9box-data"] })
      setShowRatePotentialModal(false)
      setPotentialRating({ rating: 3, comments: "" })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save potential rating")
    },
  })

  const createIDPMutation = useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: any }) =>
      successionApi.createIDP(employeeId, data),
    onSuccess: () => {
      toast.success("IDP created successfully")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      setShowCreateIDPModal(false)
      setIdpFormData({ targetRoleId: "", autoGenerateGoals: true })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create IDP")
    },
  })

  const addGoalMutation = useMutation({
    mutationFn: ({ idpId, data }: { idpId: string; data: any }) =>
      successionApi.addIDPGoal(idpId, data),
    onSuccess: () => {
      toast.success("Goal added successfully")
      queryClient.invalidateQueries({ queryKey: ["idp-detail", selectedIDP?.id] })
      setShowAddGoalModal(false)
      resetGoalForm()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add goal")
    },
  })

  const updateGoalProgressMutation = useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: any }) =>
      successionApi.updateGoalProgress(goalId, data),
    onSuccess: () => {
      toast.success("Goal progress updated")
      queryClient.invalidateQueries({ queryKey: ["idp-detail", selectedIDP?.id] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update goal progress")
    },
  })

  const sendPromotionAlertMutation = useMutation({
    mutationFn: (data: any) => successionApi.sendPromotionAlert(data),
    onSuccess: () => {
      toast.success("Promotion alert sent")
      setShowPromotionAlertModal(false)
      setPromotionAlertData({ employeeId: "", roleId: "", message: "" })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send promotion alert")
    },
  })

  const recalculateScoresMutation = useMutation({
    mutationFn: (roleId: string) => successionApi.recalculateRoleScores(roleId),
    onSuccess: (data) => {
      toast.success(data?.message || "Scores recalculated")
      queryClient.invalidateQueries({ queryKey: ["critical-roles"] })
      queryClient.invalidateQueries({ queryKey: ["readiness-report"] })
      queryClient.invalidateQueries({ queryKey: ["9box-data"] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to recalculate scores")
    },
  })

  // ===========================================
  // HELPER FUNCTIONS
  // ===========================================

  const resetRoleForm = () => {
    setRoleFormData({
      jobRoleId: "",
      description: "",
      isCritical: true,
      requiredCompetencies: [],
    })
  }

  const resetGoalForm = () => {
    setGoalFormData({
      title: "",
      description: "",
      goalType: "SHORT_TERM",
      targetDate: "",
      courseId: "",
      trainingId: "",
      competencyId: "",
    })
  }

  const handleAddCompetency = () => {
    setRoleFormData((prev) => ({
      ...prev,
      requiredCompetencies: [
        ...prev.requiredCompetencies,
        { competencyId: "", requiredLevel: 3, weight: 0 },
      ],
    }))
  }

  const handleRemoveCompetency = (index: number) => {
    setRoleFormData((prev) => ({
      ...prev,
      requiredCompetencies: prev.requiredCompetencies.filter((_, i) => i !== index),
    }))
  }

  const handleCompetencyChange = (index: number, field: string, value: any) => {
    setRoleFormData((prev) => ({
      ...prev,
      requiredCompetencies: prev.requiredCompetencies.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }))
  }

  const getTotalWeight = () => {
    return roleFormData.requiredCompetencies.reduce((sum, c) => sum + c.weight, 0)
  }

  const handleCreateRole = () => {
    if (!roleFormData.jobRoleId) {
      toast.error("Please select a job role")
      return
    }
    if (roleFormData.requiredCompetencies.length > 0 && getTotalWeight() !== 100) {
      toast.error("Competency weights must sum to 100")
      return
    }
    createRoleMutation.mutate(roleFormData)
  }

  const handleUpdateRole = () => {
    if (!selectedRole) return
    if (roleFormData.requiredCompetencies.length > 0 && getTotalWeight() !== 100) {
      toast.error("Competency weights must sum to 100")
      return
    }
    updateRoleMutation.mutate({
      id: selectedRole.id,
      data: {
        description: roleFormData.description,
        isCritical: roleFormData.isCritical,
        requiredCompetencies: roleFormData.requiredCompetencies,
      },
    })
  }

  const handleEditRole = (role: any) => {
    setSelectedRole(role)
    setRoleFormData({
      jobRoleId: role.jobRoleId,
      description: role.description || "",
      isCritical: role.isCritical,
      requiredCompetencies: role.requiredCompetencies || [],
    })
    setShowEditRoleModal(true)
  }

  const filteredRoles = criticalRolesData?.roles?.filter((role: any) =>
    role.jobRole?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const jobRoles = jobRolesData || []
  const employees = employeesData || []
  const competencies = competenciesData?.competencies || []
  const courses = coursesData?.courses || []
  const trainings = trainingsData?.trainings || []

  // Filter out job roles that already have critical roles
  const availableJobRoles = jobRoles.filter(
    (jr: any) => !criticalRolesData?.roles?.some((cr: any) => cr.jobRoleId === jr.id)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Succession Planning</h2>
          <p className="text-gray-500 mt-1">Identify, evaluate, and develop employees for future leadership roles</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 bg-gray-100 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs sm:text-sm">Critical Roles</TabsTrigger>
          <TabsTrigger value="talent" className="text-xs sm:text-sm">Talent Pool</TabsTrigger>
          <TabsTrigger value="idp" className="text-xs sm:text-sm">Development Plans</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          <TabsTrigger value="promotion" className="text-xs sm:text-sm">Promotion</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {isLoadingDashboard ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Critical Roles</p>
                        <p className="text-2xl font-bold">{dashboardData?.overview?.criticalRoles || 0}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Talent Pool Size</p>
                        <p className="text-2xl font-bold">{dashboardData?.overview?.talentPoolSize || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Active IDPs</p>
                        <p className="text-2xl font-bold">{dashboardData?.overview?.activeIDPs || 0}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Ready Successors</p>
                        <p className="text-2xl font-bold">{dashboardData?.overview?.readySuccessors || 0}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">High Risk</p>
                        <p className="text-2xl font-bold">{dashboardData?.overview?.highRiskCandidates || 0}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Candidates & Roles at Risk */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Top Candidates
                    </CardTitle>
                    <CardDescription>High-scoring candidates ready for promotion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.topCandidates?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.topCandidates.slice(0, 5).map((candidate: any) => (
                          <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{candidate.employeeName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{candidate.employeeName}</p>
                                <p className="text-sm text-gray-500">{candidate.roleName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${getScoreColor(candidate.overallScore)}`}>
                                {candidate.overallScore?.toFixed(1)}%
                              </p>
                              <Badge className={getReadinessColor(candidate.readinessStatus)}>
                                {getReadinessLabel(candidate.readinessStatus)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No top candidates yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Roles at Risk
                    </CardTitle>
                    <CardDescription>Critical roles without ready successors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.rolesAtRisk?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.rolesAtRisk.map((role: any) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                            <div>
                              <p className="font-medium text-gray-900">{role.roleName}</p>
                              <p className="text-sm text-gray-500">
                                {role.candidateCount} candidates, none ready
                              </p>
                            </div>
                            {role.hasNoCandidates && (
                              <Badge variant="destructive">No Candidates</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">All critical roles have ready successors</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Critical Roles Tab */}
        <TabsContent value="roles" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowCreateRoleModal(true)} className="gap-2">
              <Plus size={16} />
              Add Critical Role
            </Button>
          </div>

          {isLoadingRoles ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <Card className="bg-white border-2">
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Critical Roles</h3>
                <p className="text-gray-500 mb-4">Start by defining critical positions for succession planning</p>
                <Button onClick={() => setShowCreateRoleModal(true)}>Add Critical Role</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role: any) => (
                <Card key={role.id} className="bg-white border-2 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{role.jobRole?.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {role.description || "No description"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRole(role)}>
                            <Edit size={14} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => recalculateScoresMutation.mutate(role.id)}>
                            <RefreshCw size={14} className="mr-2" /> Recalculate Scores
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteRoleMutation.mutate(role.id)}
                            className="text-red-600"
                          >
                            <Trash2 size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Required Competencies</span>
                        <span className="font-medium">{role.requiredCompetencies?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Talent Pool Size</span>
                        <span className="font-medium">{role.talentPool?.length || 0}</span>
                      </div>
                      {role.isCritical && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedRole(role)
                          setShowAddTalentModal(true)
                        }}
                      >
                        <Plus size={14} className="mr-2" /> Add to Talent Pool
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Talent Pool Tab */}
        <TabsContent value="talent" className="space-y-6 mt-6">
          {isLoadingRoles ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {criticalRolesData?.roles?.map((role: any) => (
                <Card key={role.id} className="bg-white border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{role.jobRole?.name}</CardTitle>
                        <CardDescription>{role.talentPool?.length || 0} candidates in pool</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRole(role)
                          setShowAddTalentModal(true)
                        }}
                      >
                        <Plus size={14} className="mr-2" /> Add Candidate
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {role.talentPool?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Overall Score</TableHead>
                            <TableHead>Readiness</TableHead>
                            <TableHead>Risk</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {role.talentPool.map((tp: any) => (
                            <TableRow key={tp.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{tp.employee?.name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{tp.employee?.name}</p>
                                    <p className="text-xs text-gray-500">{tp.employee?.department}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`font-bold ${getScoreColor(tp.overallScore)}`}>
                                  {tp.overallScore?.toFixed(1) || "N/A"}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getReadinessColor(tp.readinessStatus)}>
                                  {getReadinessLabel(tp.readinessStatus)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getRiskColor(tp.riskLevel)}>
                                  {tp.riskLevel || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedCandidate(tp)
                                        setShowRatePotentialModal(true)
                                      }}
                                    >
                                      <Star size={14} className="mr-2" /> Rate Potential
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedEmployeeForIDP(tp.employee)
                                        setShowCreateIDPModal(true)
                                      }}
                                    >
                                      <BookOpen size={14} className="mr-2" /> Create IDP
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => removeFromTalentPoolMutation.mutate(tp.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 size={14} className="mr-2" /> Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No candidates in talent pool</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* IDP Tab */}
        <TabsContent value="idp" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateIDPModal(true)}>
              <Plus size={16} className="mr-2" /> Create IDP
            </Button>
          </div>
          {isLoadingRoles ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Card className="bg-white border-2">
              <CardHeader>
                <CardTitle>Individual Development Plans</CardTitle>
                <CardDescription>Track employee development progress towards succession roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Target Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalRolesData?.roles?.flatMap((role: any) =>
                      role.idps?.map((idp: any) => (
                        <TableRow key={idp.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{idp.employee?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{idp.employee?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{role.jobRole?.name}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                idp.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : idp.status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {idp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={idp.progress} className="h-2 w-20" />
                              <span className="text-sm">{idp.progress?.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const detail = await successionApi.getIDPById(idp.id)
                                setSelectedIDP(detail?.idp)
                                setShowIDPDetailModal(true)
                              }}
                            >
                              <Eye size={14} className="mr-2" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 9-Box Grid */}
            <Card className="bg-white border-2">
              <CardHeader>
                <CardTitle>9-Box Grid</CardTitle>
                <CardDescription>Performance vs Potential matrix</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading9Box ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <NineBoxGrid data={nineBoxData} />
                )}
              </CardContent>
            </Card>

            {/* Readiness Summary */}
            <Card className="bg-white border-2">
              <CardHeader>
                <CardTitle>Readiness Summary</CardTitle>
                <CardDescription>Succession readiness across all roles</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReadiness ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">Ready Now</p>
                        <p className="text-2xl font-bold text-green-800">
                          {readinessData?.summary?.readyNow || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">Ready in 6 Months</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {readinessData?.summary?.readySoon || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700">Ready in 1 Year</p>
                        <p className="text-2xl font-bold text-yellow-800">
                          {readinessData?.summary?.readyLater || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">Not Ready</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {readinessData?.summary?.notReady || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis */}
          <Card className="bg-white border-2">
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Identify flight risks and retention priorities</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRisk ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">Critical Risk</p>
                    <p className="text-2xl font-bold text-red-800">{riskData?.summary?.critical || 0}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700">High Risk</p>
                    <p className="text-2xl font-bold text-orange-800">{riskData?.summary?.high || 0}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">Medium Risk</p>
                    <p className="text-2xl font-bold text-yellow-800">{riskData?.summary?.medium || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">Low Risk</p>
                    <p className="text-2xl font-bold text-green-800">{riskData?.summary?.low || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotion Tab */}
        <TabsContent value="promotion" className="space-y-6 mt-6">
          {isLoadingPromotion ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Candidates</p>
                      <p className="text-3xl font-bold">{promotionData?.summary?.totalCandidates || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Eligible for Promotion</p>
                      <p className="text-3xl font-bold text-green-600">{promotionData?.summary?.eligibleCount || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Not Yet Eligible</p>
                      <p className="text-3xl font-bold text-yellow-600">{promotionData?.summary?.notYetEligibleCount || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white border-2">
                <CardHeader>
                  <CardTitle>Eligible for Promotion</CardTitle>
                  <CardDescription>Candidates who meet all promotion criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  {promotionData?.eligible?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Target Role</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Readiness</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promotionData.eligible.map((candidate: any) => (
                          <TableRow key={candidate.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{candidate.employee?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{candidate.employee?.name}</p>
                                  <p className="text-xs text-gray-500">{candidate.employee?.department}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.roleName}</TableCell>
                            <TableCell>
                              <span className={`font-bold ${getScoreColor(candidate.overallScore)}`}>
                                {candidate.overallScore?.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getReadinessColor(candidate.readinessStatus)}>
                                {getReadinessLabel(candidate.readinessStatus)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setPromotionAlertData({
                                    employeeId: candidate.employeeId,
                                    roleId: candidate.role?.id || "",
                                    message: "",
                                  })
                                  setShowPromotionAlertModal(true)
                                }}
                              >
                                <Bell size={14} className="mr-2" /> Notify
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No candidates currently eligible for promotion</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Critical Role Modal */}
      <Dialog open={showCreateRoleModal} onOpenChange={setShowCreateRoleModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Critical Role</DialogTitle>
            <DialogDescription>Define a critical position for succession planning</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Job Role *</Label>
              <Select
                value={roleFormData.jobRoleId}
                onValueChange={(value) => setRoleFormData((prev) => ({ ...prev, jobRoleId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job role" />
                </SelectTrigger>
                <SelectContent>
                  {availableJobRoles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={roleFormData.description}
                onChange={(e) => setRoleFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role and its importance"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isCritical"
                checked={roleFormData.isCritical}
                onCheckedChange={(checked) =>
                  setRoleFormData((prev) => ({ ...prev, isCritical: checked as boolean }))
                }
              />
              <Label htmlFor="isCritical">Mark as Critical</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Required Competencies</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCompetency}>
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
              {roleFormData.requiredCompetencies.length > 0 && (
                <div className="text-sm text-gray-500">
                  Total Weight: {getTotalWeight()}%{" "}
                  {getTotalWeight() !== 100 && <span className="text-red-500">(Must equal 100%)</span>}
                </div>
              )}
              {roleFormData.requiredCompetencies.map((comp, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Select
                    value={comp.competencyId}
                    onValueChange={(value) => handleCompetencyChange(index, "competencyId", value)}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Select competency" />
                    </SelectTrigger>
                    <SelectContent>
                      {competencies.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Level:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      className="w-16"
                      value={comp.requiredLevel}
                      onChange={(e) => handleCompetencyChange(index, "requiredLevel", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Weight:</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16"
                      value={comp.weight}
                      onChange={(e) => handleCompetencyChange(index, "weight", parseInt(e.target.value))}
                    />
                    <span className="text-xs">%</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCompetency(index)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRoleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Critical Role Modal */}
      <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Critical Role</DialogTitle>
            <DialogDescription>Update {selectedRole?.jobRole?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={roleFormData.description}
                onChange={(e) => setRoleFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isCriticalEdit"
                checked={roleFormData.isCritical}
                onCheckedChange={(checked) =>
                  setRoleFormData((prev) => ({ ...prev, isCritical: checked as boolean }))
                }
              />
              <Label htmlFor="isCriticalEdit">Mark as Critical</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Required Competencies</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCompetency}>
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
              {roleFormData.requiredCompetencies.length > 0 && (
                <div className="text-sm text-gray-500">
                  Total Weight: {getTotalWeight()}%{" "}
                  {getTotalWeight() !== 100 && <span className="text-red-500">(Must equal 100%)</span>}
                </div>
              )}
              {roleFormData.requiredCompetencies.map((comp, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Select
                    value={comp.competencyId}
                    onValueChange={(value) => handleCompetencyChange(index, "competencyId", value)}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Select competency" />
                    </SelectTrigger>
                    <SelectContent>
                      {competencies.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Level:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      className="w-16"
                      value={comp.requiredLevel}
                      onChange={(e) => handleCompetencyChange(index, "requiredLevel", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Weight:</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16"
                      value={comp.weight}
                      onChange={(e) => handleCompetencyChange(index, "weight", parseInt(e.target.value))}
                    />
                    <span className="text-xs">%</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCompetency(index)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Talent Pool Modal */}
      <Dialog open={showAddTalentModal} onOpenChange={setShowAddTalentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Talent Pool</DialogTitle>
            <DialogDescription>Add an employee to {selectedRole?.jobRole?.name} talent pool</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const employeeId = formData.get("employeeId") as string
              const notes = formData.get("notes") as string
              if (selectedRole && employeeId) {
                addToTalentPoolMutation.mutate({
                  roleId: selectedRole.id,
                  data: { employeeId, notes },
                })
              }
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select name="employeeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(
                        (emp: any) =>
                          !selectedRole?.talentPool?.some((tp: any) => tp.employeeId === emp.id)
                      )
                      .map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" placeholder="Optional notes about this candidate" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddTalentModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addToTalentPoolMutation.isPending}>
                {addToTalentPoolMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add to Pool
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rate Potential Modal */}
      <Dialog open={showRatePotentialModal} onOpenChange={setShowRatePotentialModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Potential</DialogTitle>
            <DialogDescription>
              Evaluate the potential of {selectedCandidate?.employee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <Label>Potential Rating: {potentialRating.rating}/5</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant={potentialRating.rating === val ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPotentialRating((prev) => ({ ...prev, rating: val }))}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                value={potentialRating.comments}
                onChange={(e) => setPotentialRating((prev) => ({ ...prev, comments: e.target.value }))}
                placeholder="Add comments about the rating"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatePotentialModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedCandidate) {
                  ratePotentialMutation.mutate({
                    employeeId: selectedCandidate.employeeId,
                    data: potentialRating,
                  })
                }
              }}
              disabled={ratePotentialMutation.isPending}
            >
              {ratePotentialMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create IDP Modal */}
      <Dialog open={showCreateIDPModal} onOpenChange={setShowCreateIDPModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Individual Development Plan</DialogTitle>
            <DialogDescription>
              Create an IDP for {selectedEmployeeForIDP?.name || "selected employee"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!selectedEmployeeForIDP && (
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select
                  value={selectedEmployeeForIDP?.id || ""}
                  onValueChange={(value) => {
                    const emp = employees.find((e: any) => e.id === value)
                    setSelectedEmployeeForIDP(emp)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Target Role *</Label>
              {criticalRolesData?.roles?.length > 0 ? (
                <Select
                  value={idpFormData.targetRoleId}
                  onValueChange={(value) => setIdpFormData((prev) => ({ ...prev, targetRoleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target role" />
                  </SelectTrigger>
                  <SelectContent>
                    {criticalRolesData.roles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.jobRole?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-yellow-600 p-2 bg-yellow-50 rounded border border-yellow-200">
                  No critical roles defined. Please create a critical role first.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="autoGenerate"
                checked={idpFormData.autoGenerateGoals}
                onCheckedChange={(checked) =>
                  setIdpFormData((prev) => ({ ...prev, autoGenerateGoals: checked as boolean }))
                }
              />
              <Label htmlFor="autoGenerate">Auto-generate goals from competency gaps</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateIDPModal(false)
                setSelectedEmployeeForIDP(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedEmployeeForIDP && idpFormData.targetRoleId) {
                  createIDPMutation.mutate({
                    employeeId: selectedEmployeeForIDP.id,
                    data: idpFormData,
                  })
                } else {
                  toast.error("Please select both an employee and a target role")
                }
              }}
              disabled={createIDPMutation.isPending || !selectedEmployeeForIDP || !idpFormData.targetRoleId}
            >
              {createIDPMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create IDP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IDP Detail Modal */}
      <Dialog open={showIDPDetailModal} onOpenChange={setShowIDPDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Individual Development Plan</DialogTitle>
            <DialogDescription>
              {selectedIDP?.employee?.name} → {selectedIDP?.targetRole?.jobRole?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedIDP && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge
                    className={
                      selectedIDP.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : selectedIDP.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {selectedIDP.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={selectedIDP.progress} className="w-32 h-2" />
                  <span className="text-sm font-medium">{selectedIDP.progress?.toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Goals</h4>
                  <Button
                    size="sm"
                    onClick={() => setShowAddGoalModal(true)}
                  >
                    <Plus size={14} className="mr-1" /> Add Goal
                  </Button>
                </div>

                {selectedIDP.goals?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedIDP.goals.map((goal: any) => (
                      <div key={goal.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {goal.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Target className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="font-medium">{goal.title}</span>
                              <Badge variant="outline">
                                {goal.goalType === "SHORT_TERM" ? "Short-term" : "Long-term"}
                              </Badge>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-gray-500 mt-1 ml-7">{goal.description}</p>
                            )}
                            {goal.course && (
                              <p className="text-xs text-blue-600 mt-1 ml-7">Course: {goal.course.title}</p>
                            )}
                            {goal.training && (
                              <p className="text-xs text-purple-600 mt-1 ml-7">Training: {goal.training.title}</p>
                            )}
                            {goal.targetDate && (
                              <p className="text-xs text-gray-400 mt-1 ml-7">
                                Target: {new Date(goal.targetDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <Progress value={goal.progress} className="h-2" />
                              <span className="text-xs text-gray-500">{goal.progress?.toFixed(0)}%</span>
                            </div>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              className="w-16 h-8"
                              value={goal.progress}
                              onChange={(e) => {
                                updateGoalProgressMutation.mutate({
                                  goalId: goal.id,
                                  data: { progress: parseInt(e.target.value) || 0 },
                                })
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No goals defined yet</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIDPDetailModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Modal */}
      <Dialog open={showAddGoalModal} onOpenChange={setShowAddGoalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
            <DialogDescription>Add a new goal to the development plan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={goalFormData.title}
                onChange={(e) => setGoalFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Goal title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={goalFormData.description}
                onChange={(e) => setGoalFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Goal description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Goal Type *</Label>
                <Select
                  value={goalFormData.goalType}
                  onValueChange={(value: "SHORT_TERM" | "LONG_TERM") =>
                    setGoalFormData((prev) => ({ ...prev, goalType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHORT_TERM">Short-term</SelectItem>
                    <SelectItem value="LONG_TERM">Long-term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={goalFormData.targetDate}
                  onChange={(e) => setGoalFormData((prev) => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Linked Course (Optional)</Label>
              <Select
                value={goalFormData.courseId}
                onValueChange={(value) => setGoalFormData((prev) => ({ ...prev, courseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Linked Training (Optional)</Label>
              <Select
                value={goalFormData.trainingId}
                onValueChange={(value) => setGoalFormData((prev) => ({ ...prev, trainingId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a training" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {trainings.map((training: any) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoalModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedIDP && goalFormData.title) {
                  addGoalMutation.mutate({
                    idpId: selectedIDP.id,
                    data: {
                      ...goalFormData,
                      courseId: goalFormData.courseId || undefined,
                      trainingId: goalFormData.trainingId || undefined,
                      competencyId: goalFormData.competencyId || undefined,
                      targetDate: goalFormData.targetDate || undefined,
                    },
                  })
                }
              }}
              disabled={addGoalMutation.isPending}
            >
              {addGoalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Alert Modal */}
      <Dialog open={showPromotionAlertModal} onOpenChange={setShowPromotionAlertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Promotion Alert</DialogTitle>
            <DialogDescription>Notify the employee about their promotion eligibility</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Custom Message (Optional)</Label>
              <Textarea
                value={promotionAlertData.message}
                onChange={(e) => setPromotionAlertData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Leave empty for default message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromotionAlertModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendPromotionAlertMutation.mutate(promotionAlertData)}
              disabled={sendPromotionAlertMutation.isPending}
            >
              {sendPromotionAlertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

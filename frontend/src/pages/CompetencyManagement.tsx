"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  Target,
  TrendingUp,
  AlertCircle,
  Truck,
  Users,
  Trash2,
  ClipboardList,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const competencies = [
  {
    id: 1,
    name: "Commercial Driving (CDL)",
    category: "Safety & Compliance",
    description: "Commercial driver's license and safe driving practices",
    requiredLevel: 5,
    totalEmployees: 12,
    assessedEmployees: 10,
    avgCurrentLevel: 4.2,
    createdDate: "2024-01-01",
    assessments: [
      {
        id: 1,
        employeeName: "Mike Rodriguez",
        employeeRole: "Long-Haul Driver",
        currentLevel: 4,
        lastAssessed: "2024-01-15",
        certificationExpiry: "2024-12-31",
        notes: "Excellent driving record, needs refresher on new regulations",
      },
      {
        id: 2,
        employeeName: "John Smith",
        employeeRole: "Local Driver",
        currentLevel: 5,
        lastAssessed: "2024-01-20",
        certificationExpiry: "2024-11-30",
        notes: "Fully proficient, mentor for new drivers",
      },
    ],
  },
  {
    id: 2,
    name: "Route Optimization",
    category: "Operations",
    description: "Efficient route planning and logistics coordination",
    requiredLevel: 4,
    totalEmployees: 8,
    assessedEmployees: 6,
    avgCurrentLevel: 3.5,
    createdDate: "2024-01-05",
    assessments: [
      {
        id: 3,
        employeeName: "Sarah Johnson",
        employeeRole: "Dispatcher",
        currentLevel: 3,
        lastAssessed: "2024-01-10",
        certificationExpiry: null,
        notes: "Good understanding, needs advanced training",
      },
    ],
  },
  {
    id: 3,
    name: "Warehouse Management",
    category: "Operations",
    description: "Inventory management and warehouse operations",
    requiredLevel: 4,
    totalEmployees: 15,
    assessedEmployees: 12,
    avgCurrentLevel: 3.8,
    createdDate: "2024-01-03",
    assessments: [
      {
        id: 4,
        employeeName: "David Chen",
        employeeRole: "Warehouse Supervisor",
        currentLevel: 4,
        lastAssessed: "2024-01-20",
        certificationExpiry: null,
        notes: "Excellent leadership and organization skills",
      },
    ],
  },
]

const employees = [
  { id: 1, name: "Mike Rodriguez", role: "Long-Haul Driver" },
  { id: 2, name: "Sarah Johnson", role: "Dispatcher" },
  { id: 3, name: "David Chen", role: "Warehouse Supervisor" },
  { id: 4, name: "Lisa Thompson", role: "Safety Manager" },
  { id: 5, name: "James Wilson", role: "Forklift Operator" },
  { id: 6, name: "Maria Garcia", role: "Customer Relations" },
]

const skillGapData = [
  { category: "Safety & Compliance", gaps: 3, total: 8 },
  { category: "Operations", gaps: 1, total: 6 },
  { category: "Technical", gaps: 4, total: 7 },
  { category: "Soft Skills", gaps: 0, total: 4 },
]

const competencyRadarData = [
  { skill: "Safety", current: 3.5, required: 4.5 },
  { skill: "Operations", current: 3.8, required: 4.0 },
  { skill: "Technical", current: 2.9, required: 4.2 },
  { skill: "Compliance", current: 3.2, required: 4.8 },
  { skill: "Leadership", current: 3.0, required: 3.5 },
  { skill: "Communication", current: 3.6, required: 3.8 },
]

const roleDistributionData = [
  { name: "Drivers", value: 45, color: "#3B82F6" },
  { name: "Warehouse", value: 25, color: "#10B981" },
  { name: "Dispatchers", value: 15, color: "#F59E0B" },
  { name: "Mechanics", value: 10, color: "#EF4444" },
  { name: "Management", value: 5, color: "#8B5CF6" },
]

const categories = ["All", "Safety & Compliance", "Operations", "Technical", "Soft Skills"]

export default function CompetencyManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const [isCreateCompetencyModalOpen, setIsCreateCompetencyModalOpen] = useState(false)
  const [isEditCompetencyModalOpen, setIsEditCompetencyModalOpen] = useState(false)
  const [isViewCompetencyModalOpen, setIsViewCompetencyModalOpen] = useState(false)
  const [isDeleteCompetencyModalOpen, setIsDeleteCompetencyModalOpen] = useState(false)
  const [isAssessmentsModalOpen, setIsAssessmentsModalOpen] = useState(false)
  const [isCreateAssessmentModalOpen, setIsCreateAssessmentModalOpen] = useState(false)
  const [isEditAssessmentModalOpen, setIsEditAssessmentModalOpen] = useState(false)
  const [isDeleteAssessmentModalOpen, setIsDeleteAssessmentModalOpen] = useState(false)

  const [selectedCompetency, setSelectedCompetency] = useState<any>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)

  const [competencyFormData, setCompetencyFormData] = useState({
    name: "",
    category: "",
    description: "",
    requiredLevel: 1,
  })

  const [assessmentFormData, setAssessmentFormData] = useState({
    employeeName: "",
    employeeRole: "",
    currentLevel: 1,
    notes: "",
    certificationExpiry: "",
  })

  const [isCourseEnrollmentModalOpen, setIsCourseEnrollmentModalOpen] = useState(false)
  const [selectedAssessmentForCourse, setSelectedAssessmentForCourse] = useState<any>(null)
  const [courseEnrollmentForm, setCourseEnrollmentForm] = useState({
    courseTitle: "",
    courseProvider: "",
    courseDuration: "",
    courseDescription: "",
    startDate: "",
    priority: "medium",
  })

  const filteredCompetencies = competencies.filter((comp) => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || comp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getGapBadgeColor = (avgLevel: number, requiredLevel: number) => {
    const gap = requiredLevel - avgLevel
    if (gap <= 0.5) return "bg-green-600 text-white"
    if (gap <= 1) return "bg-yellow-600 text-white"
    return "bg-red-600 text-white"
  }

  const createCompetency = async (data: any) => {
    console.log("Creating competency:", data)
    // API call would go here
  }

  const updateCompetency = async (id: number, data: any) => {
    console.log("Updating competency:", id, data)
    // API call would go here
  }

  const deleteCompetency = async (id: number) => {
    console.log("Deleting competency:", id)
    // API call would go here
  }

  const createAssessment = async (competencyId: number, data: any) => {
    console.log("Creating assessment for competency:", competencyId, data)
    // API call would go here
  }

  const updateAssessment = async (assessmentId: number, data: any) => {
    console.log("Updating assessment:", assessmentId, data)
    // API call would go here
  }

  const deleteAssessment = async (assessmentId: number) => {
    console.log("Deleting assessment:", assessmentId)
    // API call would go here
  }

  const getCompetencyAssessments = async (competencyId: number) => {
    console.log("Fetching assessments for competency:", competencyId)
    // API call would go here
    return competencies.find((c) => c.id === competencyId)?.assessments || []
  }

  const handleCreateCompetencyClick = () => {
    setCompetencyFormData({
      name: "",
      category: "",
      description: "",
      requiredLevel: 1,
    })
    setIsCreateCompetencyModalOpen(true)
  }

  const handleEditCompetencyClick = (competency: any) => {
    setSelectedCompetency(competency)
    setCompetencyFormData({
      name: competency.name,
      category: competency.category,
      description: competency.description,
      requiredLevel: competency.requiredLevel,
    })
    setIsEditCompetencyModalOpen(true)
  }

  const handleViewCompetencyClick = (competency: any) => {
    setSelectedCompetency(competency)
    setIsViewCompetencyModalOpen(true)
  }

  const handleDeleteCompetencyClick = (competency: any) => {
    setSelectedCompetency(competency)
    setIsDeleteCompetencyModalOpen(true)
  }

  const handleViewAssessmentsClick = (competency: any) => {
    setSelectedCompetency(competency)
    setIsAssessmentsModalOpen(true)
  }

  const handleCreateAssessmentClick = () => {
    setAssessmentFormData({
      employeeName: "",
      employeeRole: "",
      currentLevel: 1,
      notes: "",
      certificationExpiry: "",
    })
    setIsCreateAssessmentModalOpen(true)
  }

  const handleEditAssessmentClick = (assessment: any) => {
    setSelectedAssessment(assessment)
    setAssessmentFormData({
      employeeName: assessment.employeeName,
      employeeRole: assessment.employeeRole,
      currentLevel: assessment.currentLevel,
      notes: assessment.notes,
      certificationExpiry: assessment.certificationExpiry || "",
    })
    setIsEditAssessmentModalOpen(true)
  }

  const handleDeleteAssessmentClick = (assessment: any) => {
    setSelectedAssessment(assessment)
    setIsDeleteAssessmentModalOpen(true)
  }

  const handleEnrollInCourseClick = (assessment: any) => {
    setSelectedAssessmentForCourse(assessment)
    setIsCourseEnrollmentModalOpen(true)
  }

  const handleCourseEnrollmentSubmit = () => {
    const enrollmentData = {
      employeeId: selectedAssessmentForCourse?.employeeId,
      employeeName: selectedAssessmentForCourse?.employeeName,
      competencyId: selectedCompetency?.id,
      competencyName: selectedCompetency?.name,
      currentLevel: selectedAssessmentForCourse?.currentLevel,
      requiredLevel: selectedCompetency?.requiredLevel,
      course: courseEnrollmentForm,
      enrollmentDate: new Date().toISOString(),
    }

    enrollEmployeeInCourse(enrollmentData)
    setIsCourseEnrollmentModalOpen(false)
    setCourseEnrollmentForm({
      courseTitle: "",
      courseProvider: "",
      courseDuration: "",
      courseDescription: "",
      startDate: "",
      priority: "medium",
    })
    setSelectedAssessmentForCourse(null)
  }

  const handleSubmitCompetency = async () => {
    if (selectedCompetency) {
      await updateCompetency(selectedCompetency.id, competencyFormData)
      setIsEditCompetencyModalOpen(false)
    } else {
      await createCompetency(competencyFormData)
      setIsCreateCompetencyModalOpen(false)
    }
  }

  const handleSubmitAssessment = async () => {
    if (selectedAssessment) {
      await updateAssessment(selectedAssessment.id, assessmentFormData)
      setIsEditAssessmentModalOpen(false)
    } else {
      await createAssessment(selectedCompetency.id, assessmentFormData)
      setIsCreateAssessmentModalOpen(false)
    }
  }

  const handleDeleteCompetencyConfirm = async () => {
    await deleteCompetency(selectedCompetency.id)
    setIsDeleteCompetencyModalOpen(false)
  }

  const handleDeleteAssessmentConfirm = async () => {
    await deleteAssessment(selectedAssessment.id)
    setIsDeleteAssessmentModalOpen(false)
  }

  const enrollEmployeeInCourse = async (enrollmentData: any) => {
    console.log("Enrolling employee in course:", enrollmentData)
    // API call would go here
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Competency Management</h2>
          <p className="text-gray-300">Manage competencies and employee assessments</p>
        </div>
        <Button
          className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700"
          onClick={handleCreateCompetencyClick}
        >
          <Plus size={16} />
          Create Competency
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Total Competencies</p>
                <p className="text-2xl font-bold text-white">31</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Proficient</p>
                <p className="text-2xl font-bold text-white">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-300">Critical Gaps</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-300">Certifications Due</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gap Analysis Chart */}
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              Skill Gap Analysis by Category
            </CardTitle>
            <CardDescription className="text-gray-300">
              Identify areas requiring immediate training attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                gaps: { label: "Skill Gaps", color: "#EF4444" },
                total: { label: "Total Skills", color: "#6B7280" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="gaps" fill="#EF4444" name="Skill Gaps" />
                  <Bar dataKey="total" fill="#6B7280" name="Total Skills" opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Competency Radar Chart */}
        <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Overall Competency Profile
            </CardTitle>
            <CardDescription className="text-gray-300">
              Current vs Required skill levels across key areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                current: { label: "Current Level", color: "#3B82F6" },
                required: { label: "Required Level", color: "#10B981" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={competencyRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <Radar name="Current" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Radar name="Required" dataKey="required" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution Chart */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Employee Role Distribution
          </CardTitle>
          <CardDescription className="text-gray-300">
            Breakdown of competency assessments by role category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ChartContainer
              config={{
                value: { label: "Employees", color: "#8B5CF6" },
              }}
              className="h-[300px] w-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={(entry) => (entry && entry.name ? `${entry.name}: ${entry.value}%` : "")}
                    labelLine={false}
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Competency Filters</CardTitle>
          <CardDescription className="text-gray-300">Filter and search competencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search competencies..."
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
                setSelectedCategory("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Competencies</CardTitle>
          <CardDescription className="text-gray-300">{filteredCompetencies.length} competencies found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300 font-semibold">Competency</TableHead>
                <TableHead className="text-gray-300 font-semibold">Category</TableHead>
                <TableHead className="text-gray-300 font-semibold">Required Level</TableHead>
                <TableHead className="text-gray-300 font-semibold">Employees</TableHead>
                <TableHead className="text-gray-300 font-semibold">Avg Performance</TableHead>
                <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetencies.map((comp) => (
                <TableRow key={comp.id} className="border-gray-600 hover:bg-gray-700">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{comp.name}</div>
                      <div className="text-sm text-gray-400">{comp.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-500 text-gray-300">
                      {comp.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">Level {comp.requiredLevel}</TableCell>
                  <TableCell>
                    <div className="text-white">
                      {comp.assessedEmployees}/{comp.totalEmployees}
                    </div>
                    <div className="text-sm text-gray-400">assessed</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {comp.avgCurrentLevel.toFixed(1)}/{comp.requiredLevel}
                        </span>
                        <span className="text-gray-400">
                          {Math.round((comp.avgCurrentLevel / comp.requiredLevel) * 100)}%
                        </span>
                      </div>
                      <Progress value={(comp.avgCurrentLevel / comp.requiredLevel) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getGapBadgeColor(comp.avgCurrentLevel, comp.requiredLevel)}>
                      {comp.avgCurrentLevel >= comp.requiredLevel
                        ? "Proficient"
                        : `Gap: ${(comp.requiredLevel - comp.avgCurrentLevel).toFixed(1)}`}
                    </Badge>
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
                          onClick={() => handleViewCompetencyClick(comp)}
                        >
                          <Eye size={16} />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleViewAssessmentsClick(comp)}
                        >
                          <ClipboardList size={16} />
                          Manage Assessments
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleEditCompetencyClick(comp)}
                        >
                          <Edit size={16} />
                          Edit Competency
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-400 hover:bg-gray-700"
                          onClick={() => handleDeleteCompetencyClick(comp)}
                        >
                          <Trash2 size={16} />
                          Delete Competency
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

      <Dialog open={isCreateCompetencyModalOpen} onOpenChange={setIsCreateCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Competency</DialogTitle>
            <DialogDescription className="text-gray-300">
              Define a new competency that employees can be assessed on
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Competency Name
              </Label>
              <Input
                id="name"
                value={competencyFormData.name}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, name: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="e.g., Commercial Driving (CDL)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category
              </Label>
              <Select
                value={competencyFormData.category}
                onValueChange={(value) => setCompetencyFormData({ ...competencyFormData, category: value })}
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="Safety & Compliance" className="text-white">
                    Safety & Compliance
                  </SelectItem>
                  <SelectItem value="Operations" className="text-white">
                    Operations
                  </SelectItem>
                  <SelectItem value="Technical" className="text-white">
                    Technical
                  </SelectItem>
                  <SelectItem value="Soft Skills" className="text-white">
                    Soft Skills
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={competencyFormData.description}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, description: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="Describe what this competency covers..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredLevel" className="text-gray-300">
                Required Level
              </Label>
              <Select
                value={competencyFormData.requiredLevel.toString()}
                onValueChange={(value) =>
                  setCompetencyFormData({ ...competencyFormData, requiredLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-white">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateCompetencyModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCompetency} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Competency
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCompetencyModalOpen} onOpenChange={setIsEditCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Competency</DialogTitle>
            <DialogDescription className="text-gray-300">Update the competency details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Competency Name
              </Label>
              <Input
                id="name"
                value={competencyFormData.name}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, name: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category
              </Label>
              <Select
                value={competencyFormData.category}
                onValueChange={(value) => setCompetencyFormData({ ...competencyFormData, category: value })}
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="Safety & Compliance" className="text-white">
                    Safety & Compliance
                  </SelectItem>
                  <SelectItem value="Operations" className="text-white">
                    Operations
                  </SelectItem>
                  <SelectItem value="Technical" className="text-white">
                    Technical
                  </SelectItem>
                  <SelectItem value="Soft Skills" className="text-white">
                    Soft Skills
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={competencyFormData.description}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, description: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredLevel" className="text-gray-300">
                Required Level
              </Label>
              <Select
                value={competencyFormData.requiredLevel.toString()}
                onValueChange={(value) =>
                  setCompetencyFormData({ ...competencyFormData, requiredLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-white">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditCompetencyModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCompetency} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Competency
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewCompetencyModalOpen} onOpenChange={setIsViewCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Competency Details</DialogTitle>
            <DialogDescription className="text-gray-300">
              Detailed information about {selectedCompetency?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCompetency && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Competency Name</Label>
                  <p className="text-white font-medium">{selectedCompetency.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Category</Label>
                  <Badge variant="outline" className="border-gray-500 text-gray-300 w-fit">
                    {selectedCompetency.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Description</Label>
                <p className="text-white">{selectedCompetency.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Required Level</Label>
                  <p className="text-white font-medium">Level {selectedCompetency.requiredLevel}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Employees</Label>
                  <p className="text-white">
                    {selectedCompetency.assessedEmployees}/{selectedCompetency.totalEmployees}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Avg Performance</Label>
                  <p className="text-white">
                    {selectedCompetency.avgCurrentLevel.toFixed(1)}/{selectedCompetency.requiredLevel}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Overall Progress</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      Average: {selectedCompetency.avgCurrentLevel.toFixed(1)} / Required:{" "}
                      {selectedCompetency.requiredLevel}
                    </span>
                    <span className="text-gray-400">
                      {Math.round((selectedCompetency.avgCurrentLevel / selectedCompetency.requiredLevel) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(selectedCompetency.avgCurrentLevel / selectedCompetency.requiredLevel) * 100}
                    className="h-3"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsViewCompetencyModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewCompetencyModalOpen(false)
                handleEditCompetencyClick(selectedCompetency)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit Competency
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentsModalOpen} onOpenChange={setIsAssessmentsModalOpen}>
        <DialogContent className="sm:max-w-[800px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Assessments - {selectedCompetency?.name}</DialogTitle>
            <DialogDescription className="text-gray-300">
              View and manage employee assessments for this competency
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-300">{selectedCompetency?.assessments?.length || 0} assessments</div>
              <Button onClick={handleCreateAssessmentClick} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus size={16} />
                Add Assessment
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Employee</TableHead>
                  <TableHead className="text-gray-300">Current Level</TableHead>
                  <TableHead className="text-gray-300">Progress</TableHead>
                  <TableHead className="text-gray-300">Last Assessed</TableHead>
                  <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCompetency?.assessments?.map((assessment: any) => (
                  <TableRow key={assessment.id} className="border-gray-600">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-600 text-white text-xs">
                            {assessment.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{assessment.employeeName}</div>
                          <div className="text-sm text-gray-400">{assessment.employeeRole}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">Level {assessment.currentLevel}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">
                            {assessment.currentLevel}/{selectedCompetency.requiredLevel}
                          </span>
                          <span className="text-gray-400">
                            {Math.round((assessment.currentLevel / selectedCompetency.requiredLevel) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(assessment.currentLevel / selectedCompetency.requiredLevel) * 100}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{assessment.lastAssessed}</TableCell>
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
                            onClick={() => handleEditAssessmentClick(assessment)}
                          >
                            <Edit size={16} />
                            Edit Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-blue-400 hover:bg-gray-700"
                            onClick={() => handleEnrollInCourseClick(assessment)}
                          >
                            <BookOpen size={16} />
                            Enroll in Course
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-400 hover:bg-gray-700"
                            onClick={() => handleDeleteAssessmentClick(assessment)}
                          >
                            <Trash2 size={16} />
                            Delete Assessment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAssessmentsModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCourseEnrollmentModalOpen} onOpenChange={setIsCourseEnrollmentModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Enroll Employee in Course</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enroll {selectedAssessmentForCourse?.employeeName} in a course to improve their {selectedCompetency?.name}{" "}
              competency
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Info Card */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gray-600 text-white">
                    {selectedAssessmentForCourse?.employeeName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium">{selectedAssessmentForCourse?.employeeName}</div>
                  <div className="text-sm text-gray-400">{selectedAssessmentForCourse?.employeeRole}</div>
                </div>
              </div>
              <div className="text-sm text-gray-300">
                Current Level: {selectedAssessmentForCourse?.currentLevel} / {selectedCompetency?.requiredLevel}
                <span className="ml-2 text-orange-400">
                  (Gap: {selectedCompetency?.requiredLevel - selectedAssessmentForCourse?.currentLevel})
                </span>
              </div>
            </div>

            {/* Course Details Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="courseTitle" className="text-white">
                  Course Title *
                </Label>
                <Input
                  id="courseTitle"
                  value={courseEnrollmentForm.courseTitle}
                  onChange={(e) => setCourseEnrollmentForm((prev) => ({ ...prev, courseTitle: e.target.value }))}
                  placeholder="e.g., Advanced JavaScript Programming"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseProvider" className="text-white">
                    Course Provider *
                  </Label>
                  <Input
                    id="courseProvider"
                    value={courseEnrollmentForm.courseProvider}
                    onChange={(e) => setCourseEnrollmentForm((prev) => ({ ...prev, courseProvider: e.target.value }))}
                    placeholder="e.g., Coursera, Udemy, Internal"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="courseDuration" className="text-white">
                    Duration *
                  </Label>
                  <Input
                    id="courseDuration"
                    value={courseEnrollmentForm.courseDuration}
                    onChange={(e) => setCourseEnrollmentForm((prev) => ({ ...prev, courseDuration: e.target.value }))}
                    placeholder="e.g., 4 weeks, 20 hours"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="courseDescription" className="text-white">
                  Course Description
                </Label>
                <textarea
                  id="courseDescription"
                  value={courseEnrollmentForm.courseDescription}
                  onChange={(e) => setCourseEnrollmentForm((prev) => ({ ...prev, courseDescription: e.target.value }))}
                  placeholder="Brief description of what the course covers..."
                  className="w-full min-h-[80px] px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-white">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={courseEnrollmentForm.startDate}
                    onChange={(e) => setCourseEnrollmentForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="priority" className="text-white">
                    Priority
                  </Label>
                  <select
                    id="priority"
                    value={courseEnrollmentForm.priority}
                    onChange={(e) => setCourseEnrollmentForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCourseEnrollmentModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCourseEnrollmentSubmit}
              disabled={
                !courseEnrollmentForm.courseTitle ||
                !courseEnrollmentForm.courseProvider ||
                !courseEnrollmentForm.courseDuration ||
                !courseEnrollmentForm.startDate
              }
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Enroll Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateAssessmentModalOpen} onOpenChange={setIsCreateAssessmentModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create Assessment</DialogTitle>
            <DialogDescription className="text-gray-300">
              Add a new employee assessment for {selectedCompetency?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-gray-300">
                Employee Name
              </Label>
              <Select
                value={assessmentFormData.employeeName}
                onValueChange={(value) => {
                  const employee = employees.find((emp) => emp.name === value)
                  setAssessmentFormData({
                    ...assessmentFormData,
                    employeeName: value,
                    employeeRole: employee?.role || "",
                  })
                }}
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.name} className="text-white">
                      {employee.name} - {employee.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLevel" className="text-gray-300">
                Current Level
              </Label>
              <Select
                value={assessmentFormData.currentLevel.toString()}
                onValueChange={(value) =>
                  setAssessmentFormData({ ...assessmentFormData, currentLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-white">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificationExpiry" className="text-gray-300">
                Certification Expiry (Optional)
              </Label>
              <Input
                id="certificationExpiry"
                type="date"
                value={assessmentFormData.certificationExpiry}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, certificationExpiry: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={assessmentFormData.notes}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, notes: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="Assessment notes and observations..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateAssessmentModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitAssessment} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAssessmentModalOpen} onOpenChange={setIsEditAssessmentModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Assessment</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update assessment for {selectedAssessment?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-gray-300">
                Employee Name
              </Label>
              <Input
                id="employeeName"
                value={assessmentFormData.employeeName}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, employeeName: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeRole" className="text-gray-300">
                Employee Role
              </Label>
              <Input
                id="employeeRole"
                value={assessmentFormData.employeeRole}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, employeeRole: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLevel" className="text-gray-300">
                Current Level
              </Label>
              <Select
                value={assessmentFormData.currentLevel.toString()}
                onValueChange={(value) =>
                  setAssessmentFormData({ ...assessmentFormData, currentLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-white">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificationExpiry" className="text-gray-300">
                Certification Expiry (Optional)
              </Label>
              <Input
                id="certificationExpiry"
                type="date"
                value={assessmentFormData.certificationExpiry}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, certificationExpiry: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={assessmentFormData.notes}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, notes: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="Assessment notes and observations..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditAssessmentModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitAssessment} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAssessmentModalOpen} onOpenChange={setIsDeleteAssessmentModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Assessment</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete the assessment for {selectedAssessment?.employeeName}?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-600 text-white">
                  {selectedAssessment?.employeeName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-medium">{selectedAssessment?.employeeName}</div>
                <div className="text-sm text-gray-400">{selectedAssessment?.employeeRole}</div>
                <div className="text-sm text-gray-300">Current Level: {selectedAssessment?.currentLevel}</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800">
            <strong>Warning:</strong> This action cannot be undone. All assessment data will be permanently removed.
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteAssessmentModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteAssessmentConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteCompetencyModalOpen} onOpenChange={setIsDeleteCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Competency</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete the competency "{selectedCompetency?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="text-white font-medium">{selectedCompetency?.name}</div>
                <div className="text-sm text-gray-400">{selectedCompetency?.description}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-300">Category: {selectedCompetency?.category}</span>
                  <span className="text-gray-300">Required Level: {selectedCompetency?.requiredLevel}</span>
                </div>
                <div className="text-sm text-orange-400">
                  {selectedCompetency?.assessments?.length || 0} employee assessments will also be deleted
                </div>
              </div>
            </div>
            <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800">
              <strong>Warning:</strong> This action cannot be undone. The competency and all associated employee
              assessments will be permanently removed.
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteCompetencyModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteCompetencyConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Competency
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

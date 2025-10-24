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
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  createCompetency,
  updateCompetency,
  deleteCompetency,
  addAssessment,
  getCompetencies,
  getAnalytics,
} from "@/api/competency"
import { enrollEmployee, getCourses } from "@/api/learning"
import { getEmployees } from "@/api/employee"
import { toast } from "react-hot-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import FullPageLoader from "@/components/FullpageLoader"

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
    employeeId: "",
    employeeName: "",
    currentLevel: 1,
    requiredLevel: 1,
  })

  const [isCourseEnrollmentModalOpen, setIsCourseEnrollmentModalOpen] = useState(false)
  const [selectedAssessmentForCourse, setSelectedAssessmentForCourse] = useState<any>(null)
  const [courseEnrollmentForm, setCourseEnrollmentForm] = useState({
    courseId: "",
    employeeId: "",
  })

  const queryClient = useQueryClient()

  const { data: employeesData = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  })

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["competencyAnalytics"],
    queryFn: getAnalytics,
  })

  const { data: coursesData = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  })

  console.log("Analytics Data:", analyticsData)

  const { data: competencies = [], isLoading: isCompetenciesLoading } = useQuery({
    queryKey: ["competencies"],
    queryFn: getCompetencies,
  })

  const { mutate: createCompetencyMutate, isPending: isCreatingCompetency } = useMutation({
    mutationFn: createCompetency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      toast.success("Competency created successfully!")
      setIsCreateCompetencyModalOpen(false)
    },
  })

  const { mutate: updateCompetencyMutate, isPending: isUpdatingCompetency } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCompetency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      toast.success("Competency updated successfully!")
      setIsEditCompetencyModalOpen(false)
    },
  })

  const { mutate: deleteCompetencyMutate, isPending: isDeletingCompetency } = useMutation({
    mutationFn: (id: string) => deleteCompetency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      toast.success("Competency deleted successfully!")
      setIsDeleteCompetencyModalOpen(false)
    },
  })

  const { mutate: addAssessmentMutate, isPending: isAddingAssessment } = useMutation({
    mutationFn: addAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      queryClient.invalidateQueries({ queryKey: ["competencyAnalytics"] })
      toast.success("Assessment added successfully!")
      setIsCreateAssessmentModalOpen(false)
    },
  })

  const { mutate: enrollEmployeeMutate, isPending: isEnrollingEmployee } = useMutation({
    mutationFn: enrollEmployee,
    onSuccess: () => {
      toast.success("Employee enrolled in course successfully!")
      setIsCourseEnrollmentModalOpen(false)
      setCourseEnrollmentForm({
        courseId: "",
        employeeId: "",
      })
      setSelectedAssessmentForCourse(null)
    },
  })

  const filteredCompetencies = (competencies ?? []).filter((comp: any) => {
    const matchesSearch = comp?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || comp?.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getGapBadgeColor = (avgLevel: number, requiredLevel: number) => {
    const gap = requiredLevel - avgLevel
    if (gap <= 0.5) return "bg-green-600 text-white"
    if (gap <= 1) return "bg-yellow-600 text-white"
    return "bg-red-600 text-white"
  }

  const updateAssessment = async (assessmentId: number, data: any) => {
    console.log("Updating assessment:", assessmentId, data)
    // API call would go here
  }

  const deleteAssessment = async (assessmentId: number) => {
    console.log("Deleting assessment:", assessmentId)
    // API call would go here
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
      employeeId: "",
      employeeName: "",
      currentLevel: 1,
      requiredLevel: selectedCompetency?.requiredLevel || 1,
    })
    setIsCreateAssessmentModalOpen(true)
  }

  const handleEditAssessmentClick = (assessment: any) => {
    setSelectedAssessment(assessment)
    setAssessmentFormData({
      currentLevel: assessment.currentLevel,
      employeeName: assessment.employeeName,
      employeeId: assessment.employeeId,
      requiredLevel: assessment.hrScore,
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
      courseId: courseEnrollmentForm.courseId,
    }
    enrollEmployeeMutate(enrollmentData)
  }

  const handleSubmitCompetency = async () => {
    if (selectedCompetency) {
      updateCompetencyMutate({ id: selectedCompetency.id, data: competencyFormData })
    } else {
      createCompetencyMutate(competencyFormData)
    }
  }

  const handleSubmitAssessment = async () => {
    if (selectedAssessment) {
      await updateAssessment(selectedAssessment.id, assessmentFormData)
      setIsEditAssessmentModalOpen(false)
    } else {
      addAssessmentMutate({ competencyId: selectedCompetency.id, ...assessmentFormData })
    }
  }

  const handleDeleteCompetencyConfirm = async () => {
    deleteCompetencyMutate(selectedCompetency.id)
  }

  const handleDeleteAssessmentConfirm = async () => {
    await deleteAssessment(selectedAssessment.id)
    setIsDeleteAssessmentModalOpen(false)
  }

  const enrollEmployeeInCourse = async (enrollmentData: any) => {
    console.log("Enrolling employee in course:", enrollmentData)
    // API call would go here
  }

  const isLoading = isCompetenciesLoading || isEmployeesLoading || isAnalyticsLoading

  if (isLoading) {
    return <FullPageLoader message={"Fetching Competency Data"} showLogo={false} />
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Competency Management</h2>
          <p className="text-gray-600">Manage competencies and employee assessments</p>
        </div>
        <Button
          className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
          onClick={handleCreateCompetencyClick}
        >
          <Plus size={16} />
          Create Competency
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm mb-5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Competency Filters</CardTitle>
          <CardDescription className="text-gray-600">Filter and search competencies</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search competencies..."
                className="pl-10 h-11 bg-white border border-gray-300 focus:border-blue-500 text-gray-900 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-11 border border-gray-300 text-gray-900 bg-white hover:bg-gray-50 rounded-lg"
                >
                  <Filter size={16} />
                  Category: {selectedCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="text-gray-900 hover:bg-gray-50"
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="gap-2 h-11 border border-gray-300 text-gray-900 bg-white hover:bg-gray-50 rounded-lg"
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

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Competencies</CardTitle>
          <CardDescription className="text-gray-600">{filteredCompetencies.length} competencies found</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold h-12">Competency</TableHead>
                  <TableHead className="text-gray-700 font-semibold h-12">Category</TableHead>
                  <TableHead className="text-gray-700 font-semibold h-12">Required Level</TableHead>
                  <TableHead className="text-gray-700 font-semibold h-12">Employees</TableHead>
                  <TableHead className="text-gray-700 font-semibold h-12">Avg Performance</TableHead>
                  <TableHead className="text-gray-700 font-semibold h-12">Status</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetencies.map((comp: any) => (
                  <TableRow key={comp.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{comp.name}</div>
                        <div className="text-sm text-gray-600">{comp.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {comp.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">Level {comp.requiredLevel}</TableCell>
                    <TableCell>
                      <div className="text-gray-900">{comp.assessments.length}</div>
                      <div className="text-sm text-gray-600">assessed</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {comp.averageCurrentLevel.averageSelfScore.toFixed(1)}/
                            {comp.averageCurrentLevel.requiredLevel}
                          </span>
                          <span className="text-gray-600">
                            {Math.round(
                              (comp.averageCurrentLevel.averageSelfScore / comp.averageCurrentLevel.requiredLevel) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (comp.averageCurrentLevel.averageSelfScore / comp.averageCurrentLevel.requiredLevel) * 100
                          }
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getGapBadgeColor(
                          comp.averageCurrentLevel.averageSelfScore,
                          comp.averageCurrentLevel.requiredLevel,
                        )}
                      >
                        {comp.averageCurrentLevel.averageSelfScore >= comp.averageCurrentLevel.requiredLevel
                          ? "Proficient"
                          : `Gap: ${(comp.averageCurrentLevel.requiredLevel - comp.averageCurrentLevel.averageSelfScore).toFixed(1)}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                          <DropdownMenuItem
                            className="gap-2 text-gray-900 hover:bg-gray-50"
                            onClick={() => handleViewCompetencyClick(comp)}
                          >
                            <Eye size={16} />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-gray-900 hover:bg-gray-50"
                            onClick={() => handleViewAssessmentsClick(comp)}
                          >
                            <ClipboardList size={16} />
                            Manage Assessments
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-gray-900 hover:bg-gray-50"
                            onClick={() => handleEditCompetencyClick(comp)}
                          >
                            <Edit size={16} />
                            Edit Competency
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-600 hover:bg-gray-50"
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
          </div>
        </CardContent>
      </Card>

      {/* Create Competency Modal */}
      <Dialog open={isCreateCompetencyModalOpen} onOpenChange={setIsCreateCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create New Competency</DialogTitle>
            <DialogDescription className="text-gray-600">
              Define a new competency that employees can be assessed on
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Competency Name
              </Label>
              <Input
                id="name"
                value={competencyFormData.name}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, name: e.target.value })}
                className="bg-white border border-gray-300 text-gray-900 focus:border-blue-500"
                placeholder="e.g., Commercial Driving (CDL)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700">
                Category
              </Label>
              <Select
                value={competencyFormData.category}
                onValueChange={(value) => setCompetencyFormData({ ...competencyFormData, category: value })}
              >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="Safety & Compliance" className="text-gray-900">
                    Safety & Compliance
                  </SelectItem>
                  <SelectItem value="Operations" className="text-gray-900">
                    Operations
                  </SelectItem>
                  <SelectItem value="Technical" className="text-gray-900">
                    Technical
                  </SelectItem>
                  <SelectItem value="Soft Skills" className="text-gray-900">
                    Soft Skills
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={competencyFormData.description}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, description: e.target.value })}
                className="bg-white border border-gray-300 text-gray-900 focus:border-blue-500"
                placeholder="Describe what this competency covers..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredLevel" className="text-gray-700">
                Required Level
              </Label>
              <Select
                value={competencyFormData.requiredLevel.toString()}
                onValueChange={(value) =>
                  setCompetencyFormData({ ...competencyFormData, requiredLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-gray-900">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateCompetencyModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCompetency}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isCreatingCompetency}
            >
              {isCreatingCompetency ? "Creating..." : "Create Competency"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Competency Modal */}
      <Dialog open={isEditCompetencyModalOpen} onOpenChange={setIsEditCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Competency</DialogTitle>
            <DialogDescription className="text-gray-600">Update the competency details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Competency Name
              </Label>
              <Input
                id="name"
                value={competencyFormData.name}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, name: e.target.value })}
                className="bg-white border border-gray-300 text-gray-900 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700">
                Category
              </Label>
              <Select
                value={competencyFormData.category}
                onValueChange={(value) => setCompetencyFormData({ ...competencyFormData, category: value })}
              >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="Safety & Compliance" className="text-gray-900">
                    Safety & Compliance
                  </SelectItem>
                  <SelectItem value="Operations" className="text-gray-900">
                    Operations
                  </SelectItem>
                  <SelectItem value="Technical" className="text-gray-900">
                    Technical
                  </SelectItem>
                  <SelectItem value="Soft Skills" className="text-gray-900">
                    Soft Skills
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={competencyFormData.description}
                onChange={(e) => setCompetencyFormData({ ...competencyFormData, description: e.target.value })}
                className="bg-white border border-gray-300 text-gray-900 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredLevel" className="text-gray-700">
                Required Level
              </Label>
              <Select
                value={competencyFormData.requiredLevel.toString()}
                onValueChange={(value) =>
                  setCompetencyFormData({ ...competencyFormData, requiredLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-gray-900">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditCompetencyModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCompetency}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isUpdatingCompetency}
            >
              {isUpdatingCompetency ? "Updating..." : "Update Competency"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Competency Modal */}
      <Dialog open={isViewCompetencyModalOpen} onOpenChange={setIsViewCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Competency Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              Detailed information about {selectedCompetency?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCompetency && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-600">Competency Name</Label>
                  <p className="text-gray-900 font-medium">{selectedCompetency.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Category</Label>
                  <Badge variant="outline" className="border-gray-300 text-gray-700 w-fit">
                    {selectedCompetency.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600">Description</Label>
                <p className="text-gray-900">{selectedCompetency.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-600">Required Level</Label>
                  <p className="text-gray-900 font-medium">Level {selectedCompetency.requiredLevel}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Employees</Label>
                  <p className="text-gray-900">{selectedCompetency.assessments.length} assessed</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">Avg Performance</Label>
                  <p className="text-gray-900">
                    {selectedCompetency.averageCurrentLevel.averageSelfScore.toFixed(1)}/
                    {selectedCompetency.averageCurrentLevel.requiredLevel} (Self)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600">Overall Progress</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      Average: {selectedCompetency.averageCurrentLevel.averageSelfScore.toFixed(1)} / Required:{" "}
                      {selectedCompetency.averageCurrentLevel.requiredLevel}
                    </span>
                    <span className="text-gray-600">
                      {Math.round(
                        (selectedCompetency.averageCurrentLevel.averageSelfScore /
                          selectedCompetency.averageCurrentLevel.requiredLevel) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (selectedCompetency.averageCurrentLevel.averageSelfScore /
                        selectedCompetency.averageCurrentLevel.requiredLevel) *
                      100
                    }
                    className="h-3"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsViewCompetencyModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
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

      {/* Assessments Modal */}
      <Dialog open={isAssessmentsModalOpen} onOpenChange={setIsAssessmentsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Manage Assessments - {selectedCompetency?.name}</DialogTitle>
            <DialogDescription className="text-gray-600">
              View and manage employee assessments for this competency
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-sm text-gray-600">{selectedCompetency?.assessments?.length || 0} assessments</div>
              <Button
                onClick={handleCreateAssessmentClick}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Plus size={16} />
                Add Assessment
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-700">Employee</TableHead>
                    <TableHead className="text-gray-700">Current Level</TableHead>
                    <TableHead className="text-gray-700">Progress</TableHead>
                    <TableHead className="text-gray-700">Last Assessed</TableHead>
                    <TableHead className="text-right text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCompetency?.assessments?.map((assessment: any) => (
                    <TableRow key={assessment.id} className="border-gray-200">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gray-200 text-gray-900 text-xs">
                              {assessment.employee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-gray-900 font-medium">{assessment.employee.name}</div>
                            <div className="text-sm text-gray-600">{assessment.employee.position}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">Level {assessment.selfScore}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {assessment.selfScore}/{selectedCompetency.requiredLevel}
                            </span>
                            <span className="text-gray-600">
                              {Math.round((assessment.selfScore / selectedCompetency.requiredLevel) * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={(assessment.selfScore / selectedCompetency.requiredLevel) * 100}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">
                        {new Date(assessment.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-gray-200">
                            <DropdownMenuItem
                              className="gap-2 text-blue-600 hover:bg-gray-50"
                              onClick={() => handleEnrollInCourseClick(assessment)}
                            >
                              <BookOpen size={16} />
                              Enroll in Course
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-red-600 hover:bg-gray-50"
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
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAssessmentsModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Enrollment Modal */}
      <Dialog open={isCourseEnrollmentModalOpen} onOpenChange={setIsCourseEnrollmentModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Enroll Employee in Course</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enroll {selectedAssessmentForCourse?.employeeName} in a course to improve their {selectedCompetency?.name}{" "}
              competency
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            {/* Employee Info Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gray-200 text-gray-900">
                    {selectedAssessmentForCourse?.employee?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-gray-900 font-medium">{selectedAssessmentForCourse?.employee.name}</div>
                  <div className="text-sm text-gray-600">{selectedAssessmentForCourse?.employee.position}</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Current Level: {selectedAssessmentForCourse?.selfScore} / {selectedAssessmentForCourse?.hrScore}
                <span className="ml-2 text-orange-600">(Gap: {selectedAssessmentForCourse?.gap})</span>
              </div>
            </div>

            {/* Course Details Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-gray-900">
                    Course
                  </Label>
                  <select
                    id="priority"
                    value={courseEnrollmentForm.courseId}
                    onChange={(e) => setCourseEnrollmentForm((prev) => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-3 py-2 mt-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-blue-500"
                  >
                    {coursesData.map((course: any) => (
                      <option key={course.title} value={course.id} className="text-gray-900">
                        {course.title} - {course.category} ({course.duration} minutes)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCourseEnrollmentModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCourseEnrollmentSubmit}
              disabled={!courseEnrollmentForm.courseId || isEnrollingEmployee}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isEnrollingEmployee ? "Enrolling..." : "Enroll in Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Assessment Modal */}
      <Dialog open={isCreateAssessmentModalOpen} onOpenChange={setIsCreateAssessmentModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create Assessment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new employee assessment for {selectedCompetency?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-gray-700">
                Employee Name
              </Label>
              <Select
                value={assessmentFormData.employeeName}
                onValueChange={(value) => {
                  const employee = employeesData.find((emp: any) => emp.name === value)
                  setAssessmentFormData({
                    ...assessmentFormData,
                    employeeId: employee ? employee.id : "",
                    employeeName: value,
                  })
                }}
              >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {employeesData.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.name} className="text-gray-900">
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLevel" className="text-gray-700">
                Current Level
              </Label>
              <Select
                value={assessmentFormData.currentLevel.toString()}
                onValueChange={(value) =>
                  setAssessmentFormData({ ...assessmentFormData, currentLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-gray-900">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateAssessmentModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitAssessment} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Assessment Modal */}
      <Dialog open={isEditAssessmentModalOpen} onOpenChange={setIsEditAssessmentModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Assessment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update assessment for {selectedAssessment?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-gray-700">
                Employee Name
              </Label>
              <Input
                id="employeeName"
                value={assessmentFormData.employeeName}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, employeeName: e.target.value })}
                className="bg-gray-100 border border-gray-300 text-gray-900"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLevel" className="text-gray-700">
                Current Level
              </Label>
              <Select
                value={assessmentFormData.currentLevel.toString()}
                onValueChange={(value) =>
                  setAssessmentFormData({ ...assessmentFormData, currentLevel: Number.parseInt(value) })
                }
              >
                <SelectTrigger className="bg-white border border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()} className="text-gray-900">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditAssessmentModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitAssessment} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Assessment Modal */}
      <Dialog open={isDeleteAssessmentModalOpen} onOpenChange={setIsDeleteAssessmentModalOpen}>
        <DialogContent className="sm:max-w-[400px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Assessment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete the assessment for {selectedAssessment?.employeeName}?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-200 text-gray-900">
                  {selectedAssessment?.employeeName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-gray-900 font-medium">{selectedAssessment?.employeeName}</div>
                <div className="text-sm text-gray-600">{selectedAssessment?.employeeRole}</div>
                <div className="text-sm text-gray-700">Current Level: {selectedAssessment?.currentLevel}</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <strong>Warning:</strong> This action cannot be undone. All assessment data will be permanently removed.
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteAssessmentModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteAssessmentConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Competency Modal */}
      <Dialog open={isDeleteCompetencyModalOpen} onOpenChange={setIsDeleteCompetencyModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Competency</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete the competency "{selectedCompetency?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="text-gray-900 font-medium">{selectedCompetency?.name}</div>
                <div className="text-sm text-gray-600">{selectedCompetency?.description}</div>
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <span className="text-gray-700">Category: {selectedCompetency?.category}</span>
                  <span className="text-gray-700">Required Level: {selectedCompetency?.requiredLevel}</span>
                </div>
                <div className="text-sm text-orange-600">
                  {selectedCompetency?.assessments?.length || 0} employee assessments will also be deleted
                </div>
              </div>
            </div>
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <strong>Warning:</strong> This action cannot be undone. The competency and all associated employee
              assessments will be permanently removed.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteCompetencyModalOpen(false)}
              className="border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCompetencyConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeletingCompetency}
            >
              {isDeletingCompetency ? "Deleting..." : "Delete Competency"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

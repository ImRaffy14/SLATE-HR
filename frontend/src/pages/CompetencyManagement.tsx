"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  Trash2,
  ClipboardList,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
  Upload,
  X,
  Check,
  Users,
  Briefcase,
  Award,
  FileText,
  BarChart3,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-hot-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import FullPageLoader from "@/components/FullpageLoader"
import {
  getCompetencies,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  assignCompetencyToEmployee,
  updateSelfRating,
  updateManagerRating,
  uploadAttachment,
  getEmployeeCompetencies,
  runGapAnalysis,
  getGapAnalysis,
  generateGapReport,
  getRecommendations as getEmployeeRecommendations,
  getAnalytics,
  getSuggestedCompetencies,
  batchUpdateManagerRatings,
} from "@/api/competency"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/competencyCategory"
import { getJobRoles } from "@/api/jobRole"
import {
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  getRecommendationsByCompetency,
} from "@/api/trainingRecommendation"
import { getEmployees } from "@/api/employee"
import { Competency, CompetencyCategory, JobRole, ProficiencyLevel, EmployeeCompetency, TrainingRecommendation } from "@/types/competency"
import {
  getRequiredLevel,
  getCurrentLevel,
  calculateGap,
  getAverageSelfRating,
  getAverageManagerRating,
  getAverageFinalScore,
  transformCompetencyForDisplay,
  getGapBadgeColor,
  validateProficiencyLevels,
  validateWeight,
  validateRating,
} from "@/lib/competencyUtils"

export default function CompetencyManagement() {
  const [activeTab, setActiveTab] = useState("competencies")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [selectedJobRoleId, setSelectedJobRoleId] = useState<string>("all")

  // Modal states
  const [isCreateCompetencyModalOpen, setIsCreateCompetencyModalOpen] = useState(false)
  const [isEditCompetencyModalOpen, setIsEditCompetencyModalOpen] = useState(false)
  const [isViewCompetencyModalOpen, setIsViewCompetencyModalOpen] = useState(false)
  const [isDeleteCompetencyModalOpen, setIsDeleteCompetencyModalOpen] = useState(false)
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false)
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false)
  const [isAssignCompetencyModalOpen, setIsAssignCompetencyModalOpen] = useState(false)
  const [isEmployeeCompetenciesModalOpen, setIsEmployeeCompetenciesModalOpen] = useState(false)
  const [isUpdateRatingModalOpen, setIsUpdateRatingModalOpen] = useState(false)
  const [isGapAnalysisModalOpen, setIsGapAnalysisModalOpen] = useState(false)
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = useState(false)
  const [isCreateRecommendationModalOpen, setIsCreateRecommendationModalOpen] = useState(false)
  const [isDeleteRecommendationModalOpen, setIsDeleteRecommendationModalOpen] = useState(false)
  const [isBulkRatingModalOpen, setIsBulkRatingModalOpen] = useState(false)
  const [isSuggestCompetenciesModalOpen, setIsSuggestCompetenciesModalOpen] = useState(false)
  const [employeeCompetenciesSearchTerm, setEmployeeCompetenciesSearchTerm] = useState("")
  const [employeeCompetenciesJobRoleFilter, setEmployeeCompetenciesJobRoleFilter] = useState<string>("all")

  // Selected items
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CompetencyCategory | null>(null)
  const [selectedEmployeeCompetency, setSelectedEmployeeCompetency] = useState<EmployeeCompetency | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<TrainingRecommendation | null>(null)

  // Form data
  const [competencyFormData, setCompetencyFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    weight: 50,
    levels: [] as ProficiencyLevel[],
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    jobRoleIds: [] as string[],
  })

  const [assignmentFormData, setAssignmentFormData] = useState({
    employeeId: "",
    competencyId: "",
  })

  const [ratingFormData, setRatingFormData] = useState({
    selfRating: undefined as number | undefined,
    managerRating: undefined as number | undefined,
    notes: "",
  })

  const [bulkRatingFormData, setBulkRatingFormData] = useState<
    Record<string, { rating: number | undefined; notes: string }>
  >({})

  const [suggestedCompetencies, setSuggestedCompetencies] = useState<any[]>([])
  const [selectedSuggestedCompetencies, setSelectedSuggestedCompetencies] = useState<string[]>([])

  const [recommendationFormData, setRecommendationFormData] = useState({
    competencyId: "",
    title: "",
    description: "",
    link: "",
    difficultyLevel: 1,
    courseId: "",
  })

  const queryClient = useQueryClient()

  // Queries
  const { data: competencies = [], isLoading: isCompetenciesLoading } = useQuery({
    queryKey: ["competencies", selectedJobRoleId],
    queryFn: () => getCompetencies(selectedJobRoleId !== "all" ? selectedJobRoleId : undefined),
  })

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  })

  const { data: jobRoles = [] } = useQuery({
    queryKey: ["jobRoles"],
    queryFn: () => getJobRoles(),
  })

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  })

  const { data: recommendations = [], isLoading: isRecommendationsLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => getRecommendations(),
  })

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["competencyAnalytics"],
    queryFn: getAnalytics,
  })

  // Mutations
  const { mutate: createCompetencyMutate, isPending: isCreatingCompetency } = useMutation({
    mutationFn: createCompetency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      toast.success("Competency created successfully!")
      setIsCreateCompetencyModalOpen(false)
      resetCompetencyForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create competency")
    },
  })

  const { mutate: updateCompetencyMutate, isPending: isUpdatingCompetency } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCompetency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      toast.success("Competency updated successfully!")
      setIsEditCompetencyModalOpen(false)
      resetCompetencyForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update competency")
    },
  })

  const { mutate: deleteCompetencyMutate, isPending: isDeletingCompetency } = useMutation({
    mutationFn: deleteCompetency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      toast.success("Competency deleted successfully!")
      setIsDeleteCompetencyModalOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete competency")
    },
  })

  const { mutate: createCategoryMutate, isPending: isCreatingCategory } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category created successfully!")
      setIsCreateCategoryModalOpen(false)
      resetCategoryForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category")
    },
  })

  const { mutate: updateCategoryMutate, isPending: isUpdatingCategory } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category updated successfully!")
      setIsEditCategoryModalOpen(false)
      resetCategoryForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category")
    },
  })

  const { mutate: deleteCategoryMutate, isPending: isDeletingCategory } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category deleted successfully!")
      setIsDeleteCategoryModalOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category")
    },
  })

  const { mutate: assignCompetencyMutate, isPending: isAssigning } = useMutation({
    mutationFn: assignCompetencyToEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      queryClient.invalidateQueries({ queryKey: ["employeeCompetencies"] })
      toast.success("Competency assigned successfully!")
      setIsAssignCompetencyModalOpen(false)
      resetAssignmentForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign competency")
    },
  })

  const { mutate: updateSelfRatingMutate, isPending: isUpdatingSelfRating } = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) => updateSelfRating(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      queryClient.invalidateQueries({ queryKey: ["employeeCompetencies"] })
      toast.success("Self-rating updated successfully!")
      setIsUpdateRatingModalOpen(false)
      resetRatingForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update self-rating")
    },
  })

  const { mutate: updateManagerRatingMutate, isPending: isUpdatingManagerRating } = useMutation({
    mutationFn: ({ id, rating, notes }: { id: string; rating: number; notes?: string }) =>
      updateManagerRating(id, rating, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      queryClient.invalidateQueries({ queryKey: ["employeeCompetencies"] })
      toast.success("Manager rating updated successfully!")
      setIsUpdateRatingModalOpen(false)
      resetRatingForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update manager rating")
    },
  })

  const { mutate: uploadAttachmentMutate, isPending: isUploading } = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadAttachment(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      queryClient.invalidateQueries({ queryKey: ["employeeCompetencies"] })
      toast.success("File uploaded successfully!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload file")
    },
  })

  const { mutate: createRecommendationMutate, isPending: isCreatingRecommendation } = useMutation({
    mutationFn: createRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] })
      toast.success("Recommendation created successfully!")
      setIsCreateRecommendationModalOpen(false)
      resetRecommendationForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create recommendation")
    },
  })

  const { mutate: deleteRecommendationMutate, isPending: isDeletingRecommendation } = useMutation({
    mutationFn: deleteRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] })
      toast.success("Recommendation deleted successfully!")
      setIsDeleteRecommendationModalOpen(false)
      setSelectedRecommendation(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete recommendation")
    },
  })

  const { mutate: batchUpdateRatingsMutate, isPending: isBatchUpdating } = useMutation({
    mutationFn: ({ employeeId, ratings }: { employeeId: string; ratings: Array<{ competencyId: string; rating: number; notes?: string }> }) =>
      batchUpdateManagerRatings(employeeId, ratings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies"] })
      queryClient.invalidateQueries({ queryKey: ["employeeCompetencies"] })
      toast.success("Ratings updated successfully!")
      setIsBulkRatingModalOpen(false)
      setBulkRatingFormData({})
      setSelectedEmployee(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ratings")
    },
  })

  // Queries for modals
  const { data: employeeCompetenciesData, isLoading: isEmployeeCompetenciesLoading } = useQuery({
    queryKey: ["employeeCompetencies", selectedEmployee?.id],
    queryFn: () => {
      if (!selectedEmployee?.id) return []
      return getEmployeeCompetencies(selectedEmployee.id)
    },
    enabled: !!selectedEmployee?.id && (isBulkRatingModalOpen || isEmployeeCompetenciesModalOpen),
  })

  const { data: suggestedCompetenciesData, isLoading: isSuggestedCompetenciesLoading } = useQuery({
    queryKey: ["suggestedCompetencies", selectedEmployee?.id],
    queryFn: () => {
      if (!selectedEmployee?.id) return []
      return getSuggestedCompetencies(selectedEmployee.id)
    },
    enabled: !!selectedEmployee?.id && isSuggestCompetenciesModalOpen,
  })

  const { data: gapAnalysisData, isLoading: isGapAnalysisLoading } = useQuery({
    queryKey: ["gapAnalysis", selectedEmployee?.id],
    queryFn: () => {
      if (!selectedEmployee?.id) return null
      return getGapAnalysis(selectedEmployee.id)
    },
    enabled: !!selectedEmployee?.id && isGapAnalysisModalOpen,
  })

  const { data: employeeRecommendationsData, isLoading: isEmployeeRecommendationsLoading } = useQuery({
    queryKey: ["employeeRecommendations", selectedEmployee?.id],
    queryFn: () => {
      if (!selectedEmployee?.id) return []
      return getEmployeeRecommendations(selectedEmployee.id)
    },
    enabled: !!selectedEmployee?.id && isRecommendationsModalOpen,
  })

  // Helper functions
  const resetCompetencyForm = () => {
    setCompetencyFormData({
      name: "",
      description: "",
      categoryId: "",
      weight: 50,
      levels: [],
    })
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      jobRoleIds: [],
    })
  }

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      employeeId: "",
      competencyId: "",
    })
  }

  const resetRatingForm = () => {
    setRatingFormData({
      selfRating: undefined,
      managerRating: undefined,
      notes: "",
    })
    setSelectedEmployeeCompetency(null)
  }

  const resetRecommendationForm = () => {
    setRecommendationFormData({
      competencyId: "",
      title: "",
      description: "",
      link: "",
      difficultyLevel: 1,
      courseId: "",
    })
  }

  // Filter competencies
  const filteredCompetencies = (competencies as Competency[]).filter((comp) => {
    const matchesSearch = comp?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategoryId === "all" || comp?.categoryId === selectedCategoryId
    return matchesSearch && matchesCategory
  })

  // Handlers
  const handleCreateCompetencyClick = () => {
    setSelectedCompetency(null)
    resetCompetencyForm()
    setIsCreateCompetencyModalOpen(true)
  }

  const handleEditCompetencyClick = (competency: Competency) => {
    setSelectedCompetency(competency)
    setCompetencyFormData({
      name: competency.name,
      description: competency.description || "",
      categoryId: competency.categoryId,
      weight: competency.weight,
      levels: competency.levels || [],
    })
    setIsEditCompetencyModalOpen(true)
  }

  const handleViewCompetencyClick = (competency: Competency) => {
    setSelectedCompetency(competency)
    setIsViewCompetencyModalOpen(true)
  }

  const handleDeleteCompetencyClick = (competency: Competency) => {
    setSelectedCompetency(competency)
    setIsDeleteCompetencyModalOpen(true)
  }

  const handleSubmitCompetency = () => {
    // Validate
    if (!competencyFormData.name.trim()) {
      toast.error("Competency name is required")
      return
    }
    if (!competencyFormData.categoryId) {
      toast.error("Category is required")
      return
    }
    const levelsValidation = validateProficiencyLevels(competencyFormData.levels)
    if (!levelsValidation.valid) {
      toast.error(levelsValidation.error)
      return
    }
    const weightValidation = validateWeight(competencyFormData.weight)
    if (!weightValidation.valid) {
      toast.error(weightValidation.error)
      return
    }

    if (selectedCompetency) {
      updateCompetencyMutate({ id: selectedCompetency.id, data: competencyFormData })
    } else {
      createCompetencyMutate(competencyFormData)
    }
  }

  const handleAddProficiencyLevel = () => {
    const nextLevel = competencyFormData.levels.length + 1
    if (nextLevel > 5) {
      toast.error("Maximum 5 proficiency levels allowed")
      return
    }
    setCompetencyFormData({
      ...competencyFormData,
      levels: [
        ...competencyFormData.levels,
        { levelNumber: nextLevel, title: "", definition: "" },
      ],
    })
  }

  const handleUpdateProficiencyLevel = (index: number, field: keyof ProficiencyLevel, value: string | number) => {
    const updatedLevels = [...competencyFormData.levels]
    updatedLevels[index] = { ...updatedLevels[index], [field]: value }
    setCompetencyFormData({ ...competencyFormData, levels: updatedLevels })
  }

  const handleRemoveProficiencyLevel = (index: number) => {
    const updatedLevels = competencyFormData.levels.filter((_, i) => i !== index)
    setCompetencyFormData({ ...competencyFormData, levels: updatedLevels })
  }

  const handleCreateCategoryClick = () => {
    setSelectedCategory(null)
    resetCategoryForm()
    setIsCreateCategoryModalOpen(true)
  }

  const handleEditCategoryClick = (category: CompetencyCategory) => {
    setSelectedCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      jobRoleIds: category.jobRoleIds || [],
    })
    setIsEditCategoryModalOpen(true)
  }

  const handleDeleteCategoryClick = (category: CompetencyCategory) => {
    setSelectedCategory(category)
    setIsDeleteCategoryModalOpen(true)
  }

  const handleSubmitCategory = () => {
    if (!categoryFormData.name.trim()) {
      toast.error("Category name is required")
      return
    }
    if (selectedCategory) {
      updateCategoryMutate({ id: selectedCategory.id, data: categoryFormData })
    } else {
      createCategoryMutate(categoryFormData)
    }
  }

  const handleAssignCompetencyClick = () => {
    resetAssignmentForm()
    setIsAssignCompetencyModalOpen(true)
  }

  const handleSubmitAssignment = () => {
    if (!assignmentFormData.employeeId || !assignmentFormData.competencyId) {
      toast.error("Please select both employee and competency")
      return
    }
    assignCompetencyMutate(assignmentFormData)
  }

  const handleUpdateRatingClick = (employeeCompetency: EmployeeCompetency) => {
    setSelectedEmployeeCompetency(employeeCompetency)
    setRatingFormData({
      selfRating: undefined,
      managerRating: employeeCompetency.managerRating,
      notes: employeeCompetency.notes || "",
    })
    setIsUpdateRatingModalOpen(true)
  }

  const handleSubmitRating = () => {
    if (!selectedEmployeeCompetency) return

    if (ratingFormData.managerRating === undefined) {
      toast.error("Please select a manager rating")
      return
    }
    const validation = validateRating(ratingFormData.managerRating)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }
    updateManagerRatingMutate({
      id: selectedEmployeeCompetency.id,
      rating: ratingFormData.managerRating,
      notes: ratingFormData.notes,
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, employeeCompetencyId: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, or PDF files only.")
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    uploadAttachmentMutate({ id: employeeCompetencyId, file })
  }

  const handleViewEmployeeCompetencies = (competency: Competency) => {
    setSelectedCompetency(competency)
    setIsEmployeeCompetenciesModalOpen(true)
  }

  const handleViewGapAnalysis = async (employeeId: string) => {
    const employee = employees.find((emp: any) => emp.id === employeeId)
    if (!employee) return
    
    setSelectedEmployee(employee)
    setIsGapAnalysisModalOpen(true)
    
    // Ensure gap analysis is run for all competencies with ratings
    try {
      const employeeComps = competencies.filter(
        (comp: Competency) => {
          const ec = comp.employeeCompetencies?.find((e) => e.employeeId === employeeId)
          return ec && ec.managerRating !== null && ec.managerRating !== undefined
        }
      )
      
      // Run gap analysis for each competency (will update if exists, create if not)
      await Promise.all(
        employeeComps.map(async (comp: Competency) => {
          try {
            await runGapAnalysis({ employeeId, competencyId: comp.id })
          } catch (error: any) {
            // Silently fail if gap analysis already exists or other expected errors
            if (error?.message?.includes('not found')) {
              console.debug('Gap analysis may already exist or employee competency not found:', comp.id)
            }
          }
        })
      )
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["gapAnalysis", employeeId] })
    } catch (error) {
      console.error('Error running gap analysis:', error)
      // Continue anyway - gap analysis might already exist
    }
  }

  const handleSubmitRecommendation = () => {
    if (!recommendationFormData.competencyId || !recommendationFormData.title.trim()) {
      toast.error("Competency and title are required")
      return
    }
    createRecommendationMutate(recommendationFormData)
  }

  const handleDeleteCompetencyConfirm = () => {
    if (!selectedCompetency) return
    deleteCompetencyMutate(selectedCompetency.id)
  }

  const handleDeleteCategoryConfirm = () => {
    if (!selectedCategory) return
    deleteCategoryMutate(selectedCategory.id)
  }

  const handleDeleteRecommendationClick = (recommendation: TrainingRecommendation) => {
    setSelectedRecommendation(recommendation)
    setIsDeleteRecommendationModalOpen(true)
  }

  const handleDeleteRecommendationConfirm = () => {
    if (!selectedRecommendation) return
    deleteRecommendationMutate(selectedRecommendation.id)
  }

  const handleBulkRatingClick = async (employee: any) => {
    setSelectedEmployee(employee)
    setIsBulkRatingModalOpen(true)
    // Initialize form data with existing ratings
    const employeeComps = await getEmployeeCompetencies(employee.id)
    const initialFormData: Record<string, { rating: number | undefined; notes: string }> = {}
    employeeComps.forEach((ec: EmployeeCompetency) => {
      initialFormData[ec.competencyId] = {
        rating: ec.managerRating || undefined,
        notes: ec.notes || "",
      }
    })
    setBulkRatingFormData(initialFormData)
  }

  const handleSuggestCompetenciesClick = (employee: any) => {
    setSelectedEmployee(employee)
    setIsSuggestCompetenciesModalOpen(true)
    setSelectedSuggestedCompetencies([])
  }

  const handleBulkRatingSubmit = () => {
    if (!selectedEmployee) return

    const ratings = Object.entries(bulkRatingFormData)
      .filter(([_, data]) => data.rating !== undefined && data.rating !== null)
      .map(([competencyId, data]) => ({
        competencyId,
        rating: data.rating!,
        notes: data.notes || undefined,
      }))

    if (ratings.length === 0) {
      toast.error("Please provide at least one rating")
      return
    }

    batchUpdateRatingsMutate({
      employeeId: selectedEmployee.id,
      ratings,
    })
  }

  const handleAssignSuggestedCompetencies = () => {
    if (selectedSuggestedCompetencies.length === 0) {
      toast.error("Please select at least one competency to assign")
      return
    }

    // Assign each selected competency
    const assignments = selectedSuggestedCompetencies.map((competencyId) =>
      assignCompetencyToEmployee({
        employeeId: selectedEmployee!.id,
        competencyId,
      })
    )

    Promise.all(assignments)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["competencies"] })
        queryClient.invalidateQueries({ queryKey: ["employeeCompetencies"] })
        queryClient.invalidateQueries({ queryKey: ["suggestedCompetencies"] })
        toast.success(`${selectedSuggestedCompetencies.length} competency(ies) assigned successfully!`)
        setIsSuggestCompetenciesModalOpen(false)
        setSelectedSuggestedCompetencies([])
        setSelectedEmployee(null)
      })
      .catch((error) => {
        toast.error(error.message || "Failed to assign competencies")
      })
  }

  const isLoading =
    isCompetenciesLoading ||
    isCategoriesLoading ||
    isEmployeesLoading ||
    isRecommendationsLoading ||
    isAnalyticsLoading

  if (isLoading) {
    return <FullPageLoader message="Fetching Competency Data" showLogo={false} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Competency Management</h2>
          <p className="text-gray-600">Manage competencies, categories, job roles, and employee assessments</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="competencies">
            <Award className="w-4 h-4 mr-2" />
            Competencies
          </TabsTrigger>
          <TabsTrigger value="categories">
            <ClipboardList className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="employee-competencies">
            <Users className="w-4 h-4 mr-2" />
            Employee Competencies
          </TabsTrigger>
          <TabsTrigger value="gap-analysis">
            <BarChart3 className="w-4 h-4 mr-2" />
            Gap Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <BookOpen className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Competencies Tab */}
        <TabsContent value="competencies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Competencies</CardTitle>
                  <CardDescription>Manage competency definitions and proficiency levels</CardDescription>
                </div>
                <Button onClick={handleCreateCompetencyClick} className="gap-2">
                  <Plus size={16} />
                  Create Competency
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search competencies..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat: CompetencyCategory) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedJobRoleId} onValueChange={setSelectedJobRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by job role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Roles</SelectItem>
                    {jobRoles.map((role: JobRole) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Competencies Table */}
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competency</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Proficiency Levels</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Avg Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompetencies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            {searchTerm || selectedCategoryId !== "all" || selectedJobRoleId !== "all"
                              ? "No competencies match your filters. Try adjusting your search criteria."
                              : "No competencies found. Create your first competency to get started."}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompetencies.map((comp) => {
                      const transformed = transformCompetencyForDisplay(comp)
                      const requiredLevel = getRequiredLevel(comp)
                      const avgCurrentLevel = transformed.averageCurrentLevel?.averageCurrentLevel || 0
                      const gap = requiredLevel - avgCurrentLevel

                      return (
                        <TableRow key={comp.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{comp.name}</div>
                              <div className="text-sm text-gray-600">{comp.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {comp.category?.name || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              Levels {comp.levels.map((l) => l.levelNumber).join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>{comp.weight}%</TableCell>
                          <TableCell>
                            {comp.employeeCompetencies?.length || 0} assigned
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{avgCurrentLevel.toFixed(1)}/{requiredLevel}</span>
                                <span>{Math.round((avgCurrentLevel / requiredLevel) * 100)}%</span>
                              </div>
                              <Progress value={(avgCurrentLevel / requiredLevel) * 100} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewCompetencyClick(comp)}>
                                  <Eye size={16} className="mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewEmployeeCompetencies(comp)}>
                                  <Users size={16} className="mr-2" />
                                  View Employees
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditCompetencyClick(comp)}>
                                  <Edit size={16} className="mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCompetencyClick(comp)}
                                  className="text-red-600"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Competency Categories</CardTitle>
                  <CardDescription>Manage competency categories and their job role assignments</CardDescription>
                </div>
                <Button onClick={handleCreateCategoryClick} className="gap-2">
                  <Plus size={16} />
                  Create Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Job Roles</TableHead>
                      <TableHead>Competencies</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            No categories found. Create your first category to get started.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((cat: CompetencyCategory) => {
                      const assignedJobRoles = jobRoles.filter((role: JobRole) =>
                        cat.jobRoleIds?.includes(role.id)
                      )
                      return (
                        <TableRow key={cat.id}>
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell>{cat.description || "—"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {assignedJobRoles.length > 0 ? (
                                assignedJobRoles.map((role: JobRole) => (
                                  <Badge key={role.id} variant="outline">
                                    {role.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{cat.competencies?.length || 0}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditCategoryClick(cat)}>
                                  <Edit size={16} className="mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCategoryClick(cat)}
                                  className="text-red-600"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Competencies Tab */}
        <TabsContent value="employee-competencies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Employee Competencies</CardTitle>
                  <CardDescription>View and rate employee competencies based on their job roles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees..."
                    value={employeeCompetenciesSearchTerm}
                    onChange={(e) => setEmployeeCompetenciesSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={employeeCompetenciesJobRoleFilter}
                  onValueChange={setEmployeeCompetenciesJobRoleFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by job role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Roles</SelectItem>
                    {jobRoles.map((role: JobRole) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employees Table */}
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Job Role</TableHead>
                      <TableHead>Assigned Competencies</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Attachments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Get employees with assigned competencies
                      const employeesWithCompetencies = employees.filter((employee: any) => {
                        const hasCompetencies = competencies.some((comp: Competency) =>
                          comp.employeeCompetencies?.some((ec) => ec.employeeId === employee.id)
                        )
                        return hasCompetencies
                      })

                      // Filter by search term
                      const filteredBySearch = employeesWithCompetencies.filter((employee: any) => {
                        if (!employeeCompetenciesSearchTerm) return true
                        return employee.name
                          .toLowerCase()
                          .includes(employeeCompetenciesSearchTerm.toLowerCase())
                      })

                      // Filter by job role
                      const filtered = filteredBySearch.filter((employee: any) => {
                        if (employeeCompetenciesJobRoleFilter === "all") return true
                        return employee.positionId === employeeCompetenciesJobRoleFilter
                      })

                      if (filtered.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <p className="text-sm text-gray-500">
                                {employeesWithCompetencies.length === 0
                                  ? "No employees with assigned competencies found. Use 'Suggest Competencies' to assign competencies based on job roles."
                                  : "No employees match the current filters."}
                              </p>
                            </TableCell>
                          </TableRow>
                        )
                      }

                      return filtered.map((employee: any) => {
                        const employeeComps = competencies
                          .map((comp: Competency) => {
                            const ec = comp.employeeCompetencies?.find((e) => e.employeeId === employee.id)
                            return ec ? { competency: comp, employeeCompetency: ec } : null
                          })
                          .filter(Boolean) as Array<{ competency: Competency; employeeCompetency: EmployeeCompetency }>

                        const totalAttachments = employeeComps.reduce(
                          (sum, item) => sum + (item.employeeCompetency.attachments?.length || 0),
                          0
                        )

                        // Calculate overall score (average of final scores)
                        const scoresWithRatings = employeeComps.filter(
                          (item) => item.employeeCompetency.managerRating !== null && item.employeeCompetency.managerRating !== undefined
                        )
                        const overallScore =
                          scoresWithRatings.length > 0
                            ? scoresWithRatings.reduce(
                                (sum, item) => sum + (item.employeeCompetency.finalScore || 0),
                                0
                              ) / scoresWithRatings.length
                            : null

                        return (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{employee.name?.charAt(0) || "E"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{employee.name}</div>
                                  <div className="text-sm text-gray-600">{employee.email || employee.employeeId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {employee.jobRole ? (
                                <Badge variant="outline">{employee.jobRole.name}</Badge>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{employeeComps.length}</span>
                                <span className="text-sm text-gray-500">competencies</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {overallScore !== null ? (
                                <div className="font-medium">{overallScore.toFixed(2)}</div>
                              ) : (
                                <span className="text-gray-400">Not rated</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {totalAttachments > 0 ? (
                                <Badge variant="outline" className="gap-1">
                                  <FileText size={12} />
                                  {totalAttachments}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestCompetenciesClick(employee)}
                                >
                                  <Plus size={14} className="mr-1" />
                                  Suggest
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleBulkRatingClick(employee)}
                                  disabled={employeeComps.length === 0}
                                >
                                  <Award size={14} className="mr-1" />
                                  Rate
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    })()}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gap-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis</CardTitle>
              <CardDescription>View competency gaps summary for employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.filter((employee: any) => {
                  const employeeComps = competencies.filter(
                    (comp: Competency) =>
                      comp.employeeCompetencies?.some((ec) => ec.employeeId === employee.id)
                  )
                  return employeeComps.length > 0
                }).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      No gap analysis data available. Assign competencies to employees and add ratings to see gap analysis.
                    </p>
                  </div>
                ) : (
                  employees.map((employee: any) => {
                    const employeeComps = competencies.filter(
                      (comp: Competency) =>
                        comp.employeeCompetencies?.some((ec) => ec.employeeId === employee.id)
                    )
                    if (employeeComps.length === 0) return null

                    // Calculate gap summary
                    const gaps = employeeComps.map((comp: Competency) => {
                      const ec = comp.employeeCompetencies?.find((e) => e.employeeId === employee.id)
                      if (!ec) return null
                      const requiredLevel = getRequiredLevel(comp)
                      const currentLevel = getCurrentLevel(ec, comp)
                      const gap = requiredLevel - currentLevel
                      return { comp, gap, currentLevel, requiredLevel }
                    }).filter(Boolean) as Array<{ comp: Competency; gap: number; currentLevel: number; requiredLevel: number }>

                    const totalGaps = gaps.filter(g => g.gap > 0).length
                    const criticalGaps = gaps.filter(g => g.gap >= 2).length
                    const totalCompetencies = gaps.length
                    const averageGap = totalGaps > 0
                      ? gaps.filter(g => g.gap > 0).reduce((sum, g) => sum + g.gap, 0) / totalGaps
                      : 0

                    return (
                      <Card key={employee.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{employee.name?.charAt(0) || "E"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">{employee.name}</CardTitle>
                                <CardDescription>
                                  {employee.jobRole?.name || employee.position || "No job role assigned"}
                                </CardDescription>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => handleViewGapAnalysis(employee.id)}
                            >
                              <Eye size={16} className="mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">Total Competencies</Label>
                              <p className="text-2xl font-bold">{totalCompetencies}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">Competencies with Gaps</Label>
                              <p className="text-2xl font-bold text-orange-600">{totalGaps}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">Critical Gaps (≥2)</Label>
                              <p className="text-2xl font-bold text-red-600">{criticalGaps}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">Average Gap</Label>
                              <p className="text-2xl font-bold">{averageGap.toFixed(1)}</p>
                            </div>
                          </div>
                          {totalGaps > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <AlertCircle size={16} />
                                <span>
                                  {totalGaps} competency gap{totalGaps !== 1 ? 's' : ''} detected. 
                                  {criticalGaps > 0 && ` ${criticalGaps} critical gap${criticalGaps !== 1 ? 's' : ''} require immediate attention.`}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Training Recommendations</CardTitle>
                  <CardDescription>Manage training recommendations for competencies</CardDescription>
                </div>
                <Button onClick={() => setIsCreateRecommendationModalOpen(true)} className="gap-2">
                  <Plus size={16} />
                  Create Recommendation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Competency</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            No recommendations found. Create your first training recommendation to get started.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recommendations.map((rec: TrainingRecommendation) => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium">{rec.title}</TableCell>
                        <TableCell>{rec.competency?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {rec.difficultyLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          {rec.link ? (
                            <a
                              href={rec.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
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
                                onClick={() => handleDeleteRecommendationClick(rec)}
                                className="text-red-600"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Competency Modal */}
      <Dialog
        open={isCreateCompetencyModalOpen || isEditCompetencyModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateCompetencyModalOpen(false)
            setIsEditCompetencyModalOpen(false)
            resetCompetencyForm()
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCompetency ? "Edit Competency" : "Create Competency"}
            </DialogTitle>
            <DialogDescription>
              Define a new competency with proficiency levels and weight
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Competency Name *</Label>
              <Input
                value={competencyFormData.name}
                onChange={(e) =>
                  setCompetencyFormData({ ...competencyFormData, name: e.target.value })
                }
                placeholder="e.g., Commercial Driving (CDL)"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={competencyFormData.description}
                onChange={(e) =>
                  setCompetencyFormData({ ...competencyFormData, description: e.target.value })
                }
                placeholder="Describe what this competency covers..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={competencyFormData.categoryId}
                onValueChange={(value) =>
                  setCompetencyFormData({ ...competencyFormData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: CompetencyCategory) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Weight (1-100) *</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={competencyFormData.weight}
                onChange={(e) =>
                  setCompetencyFormData({
                    ...competencyFormData,
                    weight: parseInt(e.target.value) || 50,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Proficiency Levels *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProficiencyLevel}
                  disabled={competencyFormData.levels.length >= 5}
                >
                  <Plus size={16} className="mr-2" />
                  Add Level
                </Button>
              </div>
              <div className="space-y-2">
                {competencyFormData.levels.map((level, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="w-20">Level {level.levelNumber}</Label>
                            <Input
                              placeholder="Title"
                              value={level.title}
                              onChange={(e) =>
                                handleUpdateProficiencyLevel(index, "title", e.target.value)
                              }
                            />
                          </div>
                          <Textarea
                            placeholder="Definition"
                            value={level.definition}
                            onChange={(e) =>
                              handleUpdateProficiencyLevel(index, "definition", e.target.value)
                            }
                            rows={2}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProficiencyLevel(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {competencyFormData.levels.length === 0 && (
                  <p className="text-sm text-gray-500">No proficiency levels added yet</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateCompetencyModalOpen(false)
                setIsEditCompetencyModalOpen(false)
                resetCompetencyForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCompetency} disabled={isCreatingCompetency || isUpdatingCompetency}>
              {isCreatingCompetency || isUpdatingCompetency
                ? "Saving..."
                : selectedCompetency
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Category Modal */}
      <Dialog
        open={isCreateCategoryModalOpen || isEditCategoryModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateCategoryModalOpen(false)
            setIsEditCategoryModalOpen(false)
            resetCategoryForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>Create a new competency category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input
                value={categoryFormData.name}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, name: e.target.value })
                }
                placeholder="e.g., Safety & Compliance"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, description: e.target.value })
                }
                placeholder="Describe this category..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Assign to Job Roles</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                {jobRoles.map((role: JobRole) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`job-role-${role.id}`}
                      checked={categoryFormData.jobRoleIds.includes(role.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCategoryFormData({
                            ...categoryFormData,
                            jobRoleIds: [...categoryFormData.jobRoleIds, role.id],
                          })
                        } else {
                          setCategoryFormData({
                            ...categoryFormData,
                            jobRoleIds: categoryFormData.jobRoleIds.filter((id) => id !== role.id),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`job-role-${role.id}`} className="cursor-pointer">
                      {role.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateCategoryModalOpen(false)
                setIsEditCategoryModalOpen(false)
                resetCategoryForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCategory} disabled={isCreatingCategory || isUpdatingCategory}>
              {isCreatingCategory || isUpdatingCategory ? "Saving..." : selectedCategory ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Competency Modal */}
      <Dialog open={isAssignCompetencyModalOpen} onOpenChange={setIsAssignCompetencyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Competency to Employee</DialogTitle>
            <DialogDescription>Assign a competency to an employee for assessment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select
                value={assignmentFormData.employeeId}
                onValueChange={(value) =>
                  setAssignmentFormData({ ...assignmentFormData, employeeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Competency *</Label>
              <Select
                value={assignmentFormData.competencyId}
                onValueChange={(value) =>
                  setAssignmentFormData({ ...assignmentFormData, competencyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competency" />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((comp: Competency) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.category?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAssignCompetencyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAssignment} disabled={isAssigning}>
              {isAssigning ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Rating Modal (deprecated - kept for backward compatibility) */}
      <Dialog open={isUpdateRatingModalOpen} onOpenChange={setIsUpdateRatingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Manager Rating</DialogTitle>
            <DialogDescription>
              Update employee competency rating for {selectedEmployeeCompetency?.competency?.name} (HR only)
            </DialogDescription>
          </DialogHeader>
          {selectedEmployeeCompetency && (
            <div className="space-y-4">
              {/* Competency Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Competency</Label>
                  <p className="text-sm font-medium">{selectedEmployeeCompetency.competency?.name}</p>
                  <p className="text-xs text-gray-600">{selectedEmployeeCompetency.competency?.category?.name}</p>
                </div>
              </div>

              {/* Proficiency Levels Info */}
              {selectedEmployeeCompetency.competency?.levels && selectedEmployeeCompetency.competency.levels.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Available Proficiency Levels</Label>
                  <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg">
                    {[...selectedEmployeeCompetency.competency.levels]
                      .sort((a, b) => a.levelNumber - b.levelNumber)
                      .map((level: ProficiencyLevel) => (
                        <div key={level.levelNumber} className="text-sm">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="shrink-0">Level {level.levelNumber}</Badge>
                            <div className="flex-1">
                              <p className="font-medium">{level.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{level.definition}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="space-y-2">
                <Label>Manager Rating *</Label>
                <Select
                  value={ratingFormData.managerRating?.toString() || ""}
                  onValueChange={(value) =>
                    setRatingFormData({ ...ratingFormData, managerRating: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select proficiency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEmployeeCompetency.competency?.levels && selectedEmployeeCompetency.competency.levels.length > 0 ? (
                      [...selectedEmployeeCompetency.competency.levels]
                        .sort((a, b) => a.levelNumber - b.levelNumber)
                        .map((level: ProficiencyLevel) => (
                          <SelectItem key={level.levelNumber} value={level.levelNumber.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Level {level.levelNumber}: {level.title}
                              </span>
                              <span className="text-xs text-gray-500 mt-0.5">{level.definition}</span>
                            </div>
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="" disabled>
                        No proficiency levels defined
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {(!selectedEmployeeCompetency.competency?.levels || selectedEmployeeCompetency.competency.levels.length === 0) && (
                  <p className="text-xs text-red-600 mt-1">
                    Warning: This competency has no proficiency levels defined. Please define levels before rating.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={ratingFormData.notes}
                  onChange={(e) => setRatingFormData({ ...ratingFormData, notes: e.target.value })}
                  placeholder="Enter any additional notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsUpdateRatingModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRating} 
              disabled={isUpdatingManagerRating || ratingFormData.managerRating === undefined}
            >
              {isUpdatingManagerRating ? "Updating..." : "Update Rating"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Rating Modal */}
      <Dialog open={isBulkRatingModalOpen} onOpenChange={setIsBulkRatingModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rate Employee Competencies</DialogTitle>
            <DialogDescription>
              Rate all competencies for {selectedEmployee?.name} based on their attachments and interviews
            </DialogDescription>
          </DialogHeader>
          
          {/* Employee Details Section */}
          {selectedEmployee && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Employee Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Name</Label>
                    <p className="font-medium">{selectedEmployee.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Employee ID</Label>
                    <p className="font-medium">{selectedEmployee.employeeId}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="font-medium">{selectedEmployee.email || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Job Role</Label>
                    <p className="font-medium">
                      {selectedEmployee.jobRole ? (
                        <Badge variant="outline">{selectedEmployee.jobRole.name}</Badge>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Department</Label>
                    <p className="font-medium">{selectedEmployee.department || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Position</Label>
                    <p className="font-medium">{selectedEmployee.position || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Date Hired</Label>
                    <p className="font-medium">
                      {selectedEmployee.dateHired
                        ? new Date(selectedEmployee.dateHired).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Status</Label>
                    <p className="font-medium">
                      <Badge variant={selectedEmployee.status === "ACTIVE" ? "default" : "secondary"}>
                        {selectedEmployee.status || "—"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isEmployeeCompetenciesLoading ? (
            <div className="py-8 text-center">
              <FullPageLoader message="Loading competencies..." showLogo={false} />
            </div>
          ) : employeeCompetenciesData && employeeCompetenciesData.length > 0 ? (
            <div className="space-y-4">
              {employeeCompetenciesData.map((ec: EmployeeCompetency) => {
                const competency = ec.competency
                const requiredLevel = competency?.levels && competency.levels.length > 0
                  ? Math.max(...competency.levels.map((l: ProficiencyLevel) => l.levelNumber))
                  : 5

                // Get sorted proficiency levels for this competency
                const sortedLevels = competency?.levels
                  ? [...competency.levels].sort((a, b) => a.levelNumber - b.levelNumber)
                  : []

                return (
                  <Card key={ec.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{competency?.name}</CardTitle>
                          <CardDescription>{competency?.category?.name}</CardDescription>
                        </div>
                        <Badge variant="outline">Required: Level {requiredLevel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Attachments */}
                      {ec.attachments && ec.attachments.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Attachments ({ec.attachments.length})</Label>
                          <div className="flex flex-wrap gap-2">
                            {ec.attachments.map((url, idx) => {
                              const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i)
                              return (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                                >
                                  {isImage ? (
                                    <img src={url} alt={`Attachment ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                                  ) : (
                                    <FileText size={24} className="text-blue-600" />
                                  )}
                                  <span className="text-xs text-gray-600">View</span>
                                </a>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Proficiency Levels Info */}
                      {sortedLevels.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Available Proficiency Levels</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                            {sortedLevels.map((level: ProficiencyLevel) => (
                              <div key={level.levelNumber} className="text-sm">
                                <div className="flex items-start gap-2">
                                  <Badge variant="outline" className="shrink-0">Level {level.levelNumber}</Badge>
                                  <div className="flex-1">
                                    <p className="font-medium">{level.title}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{level.definition}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rating */}
                      <div className="space-y-2">
                        <Label>Manager Rating *</Label>
                        <Select
                          value={bulkRatingFormData[ec.competencyId]?.rating?.toString() || ""}
                          onValueChange={(value) => {
                            setBulkRatingFormData({
                              ...bulkRatingFormData,
                              [ec.competencyId]: {
                                ...bulkRatingFormData[ec.competencyId],
                                rating: parseInt(value),
                              },
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select proficiency level" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedLevels.length > 0 ? (
                              sortedLevels.map((level: ProficiencyLevel) => (
                                <SelectItem key={level.levelNumber} value={level.levelNumber.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      Level {level.levelNumber}: {level.title}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5">{level.definition}</span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No proficiency levels defined
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {sortedLevels.length === 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            Warning: This competency has no proficiency levels defined. Please define levels before rating.
                          </p>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={bulkRatingFormData[ec.competencyId]?.notes || ""}
                          onChange={(e) => {
                            setBulkRatingFormData({
                              ...bulkRatingFormData,
                              [ec.competencyId]: {
                                ...bulkRatingFormData[ec.competencyId],
                                notes: e.target.value,
                              },
                            })
                          }}
                          placeholder="Enter notes about this rating..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No competencies assigned to this employee.</p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setIsBulkRatingModalOpen(false)
              setBulkRatingFormData({})
              setSelectedEmployee(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleBulkRatingSubmit} disabled={isBatchUpdating}>
              {isBatchUpdating ? "Saving..." : "Save All Ratings"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggest Competencies Modal */}
      <Dialog open={isSuggestCompetenciesModalOpen} onOpenChange={setIsSuggestCompetenciesModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suggest Competencies</DialogTitle>
            <DialogDescription>
              Select competencies to assign to {selectedEmployee?.name} based on their job role ({selectedEmployee?.jobRole?.name})
            </DialogDescription>
          </DialogHeader>
          {isSuggestedCompetenciesLoading ? (
            <div className="py-8 text-center">
              <FullPageLoader message="Loading suggested competencies..." showLogo={false} />
            </div>
          ) : suggestedCompetenciesData && suggestedCompetenciesData.length > 0 ? (
            <div className="space-y-4">
              {suggestedCompetenciesData.map((group: any) => (
                <Card key={group.category.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{group.category.name}</CardTitle>
                    {group.category.description && (
                      <CardDescription>{group.category.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.competencies.map((comp: Competency) => (
                        <div key={comp.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={`suggest-${comp.id}`}
                            checked={selectedSuggestedCompetencies.includes(comp.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSuggestedCompetencies([...selectedSuggestedCompetencies, comp.id])
                              } else {
                                setSelectedSuggestedCompetencies(
                                  selectedSuggestedCompetencies.filter((id) => id !== comp.id)
                                )
                              }
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`suggest-${comp.id}`} className="cursor-pointer font-medium">
                              {comp.name}
                            </Label>
                            {comp.description && (
                              <p className="text-sm text-gray-600 mt-1">{comp.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Weight: {comp.weight}%</Badge>
                              <Badge variant="outline">
                                Levels: {comp.levels?.map((l: ProficiencyLevel) => l.levelNumber).join(", ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                No suggested competencies found. Make sure the employee has a job role assigned and categories are linked to that role.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsSuggestCompetenciesModalOpen(false)
                setSelectedSuggestedCompetencies([])
                setSelectedEmployee(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignSuggestedCompetencies} disabled={selectedSuggestedCompetencies.length === 0}>
              Assign Selected ({selectedSuggestedCompetencies.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Competency Modal */}
      <Dialog open={isViewCompetencyModalOpen} onOpenChange={setIsViewCompetencyModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Competency Details</DialogTitle>
            <DialogDescription>View detailed information about this competency</DialogDescription>
          </DialogHeader>
          {selectedCompetency && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Name</Label>
                <p className="text-sm">{selectedCompetency.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <p className="text-sm text-gray-600">{selectedCompetency.description || "No description"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Category</Label>
                <Badge variant="outline">{selectedCompetency.category?.name || "N/A"}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Weight</Label>
                <p className="text-sm">{selectedCompetency.weight}%</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Proficiency Levels</Label>
                <div className="space-y-2">
                  {selectedCompetency.levels && selectedCompetency.levels.length > 0 ? (
                    selectedCompetency.levels
                      .sort((a, b) => a.levelNumber - b.levelNumber)
                      .map((level) => (
                        <Card key={level.levelNumber}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline">Level {level.levelNumber}</Badge>
                              <div className="flex-1">
                                <p className="font-medium">{level.title}</p>
                                <p className="text-sm text-gray-600">{level.definition}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">No proficiency levels defined</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Employee Assignments</Label>
                <p className="text-sm">
                  {selectedCompetency.employeeCompetencies?.length || 0} employee(s) assigned
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Average Performance</Label>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Average Manager Rating:</span>
                    <span>{getAverageManagerRating(selectedCompetency).toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Final Score:</span>
                    <span>{getAverageFinalScore(selectedCompetency).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsViewCompetencyModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Competency Modal */}
      <Dialog open={isDeleteCompetencyModalOpen} onOpenChange={setIsDeleteCompetencyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Competency</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this competency? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCompetency && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      This competency will be permanently deleted. If it has employee assessments, you may need to remove them first.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Competency Name</Label>
                <p className="text-sm font-medium">{selectedCompetency.name}</p>
              </div>
              {selectedCompetency.employeeCompetencies && selectedCompetency.employeeCompetencies.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This competency has {selectedCompetency.employeeCompetencies.length} employee assessment(s). 
                    You may need to remove them before deleting.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteCompetencyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCompetencyConfirm}
              disabled={isDeletingCompetency}
            >
              {isDeletingCompetency ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Modal */}
      <Dialog open={isDeleteCategoryModalOpen} onOpenChange={setIsDeleteCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      This category will be permanently deleted. If it has competencies, you may need to remove them first.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category Name</Label>
                <p className="text-sm font-medium">{selectedCategory.name}</p>
              </div>
              {selectedCategory.competencies && selectedCategory.competencies.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This category has {selectedCategory.competencies.length} competency(ies). 
                    You may need to remove them before deleting.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategoryConfirm}
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Recommendation Modal */}
      <Dialog open={isDeleteRecommendationModalOpen} onOpenChange={setIsDeleteRecommendationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recommendation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this training recommendation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRecommendation && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      This recommendation will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recommendation Title</Label>
                <p className="text-sm font-medium">{selectedRecommendation.title}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteRecommendationModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecommendationConfirm}
              disabled={isDeletingRecommendation}
            >
              {isDeletingRecommendation ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Competencies Modal */}
      <Dialog open={isEmployeeCompetenciesModalOpen} onOpenChange={setIsEmployeeCompetenciesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Competencies</DialogTitle>
            <DialogDescription>
              View and manage employee competencies for {selectedCompetency?.name}
            </DialogDescription>
          </DialogHeader>
          {isEmployeeCompetenciesLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">Loading employee competencies...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employeeCompetenciesData && employeeCompetenciesData.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Manager Rating</TableHead>
                        <TableHead>Final Score</TableHead>
                        <TableHead>Attachments</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeCompetenciesData.map((ec: EmployeeCompetency) => (
                        <TableRow key={ec.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>
                                  {ec.employee?.name?.charAt(0) || "E"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{ec.employee?.name}</div>
                                <div className="text-sm text-gray-600">{ec.employee?.position}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {ec.managerRating ? (
                              <Badge variant="outline">Level {ec.managerRating}</Badge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {ec.finalScore !== null && ec.finalScore !== undefined ? (
                              <div className="font-medium">{ec.finalScore.toFixed(2)}</div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {ec.attachments?.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  <FileText size={16} />
                                </a>
                              ))}
                              {(!ec.attachments || ec.attachments.length === 0) && (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateRatingClick(ec)}>
                                  <Edit size={16} className="mr-2" />
                                  Update Manager Rating
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <label className="cursor-pointer">
                                    <Upload size={16} className="mr-2" />
                                    Upload File
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                                      onChange={(e) => handleFileUpload(e, ec.id)}
                                    />
                                  </label>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No employee competencies found for this competency.</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEmployeeCompetenciesModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gap Analysis Modal */}
      <Dialog open={isGapAnalysisModalOpen} onOpenChange={setIsGapAnalysisModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gap Analysis Details</DialogTitle>
            <DialogDescription>
              View detailed competency gaps and training recommendations for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          {isGapAnalysisLoading ? (
            <div className="flex items-center justify-center py-8">
              <FullPageLoader message="Loading gap analysis..." showLogo={false} />
            </div>
          ) : (
            <div className="space-y-4">
              {gapAnalysisData && Array.isArray(gapAnalysisData) && gapAnalysisData.length > 0 ? (
                (() => {
                  // Filter to show only gaps (gap > 0) or show all if no gaps
                  const gapsWithIssues = gapAnalysisData.filter((gap: any) => (gap.gap || 0) > 0)
                  const allGaps = gapsWithIssues.length > 0 ? gapsWithIssues : gapAnalysisData

                  if (allGaps.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No gap analysis data available for this employee.</p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-4">
                      {allGaps.map((gap: any) => {
                        const gapValue = gap.gap || 0
                        const recommendationDetails = gap.recommendationDetails || []
                        
                        // If no recommendations in gap analysis, try to get from recommendations list
                        let displayRecommendations = recommendationDetails
                        if (gapValue > 0 && recommendationDetails.length === 0 && gap.competency?.id) {
                          displayRecommendations = recommendations.filter(
                            (rec: TrainingRecommendation) => rec.competencyId === gap.competency.id
                          )
                        }

                        return (
                          <Card key={gap.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base">{gap.competency?.name || "Unknown Competency"}</CardTitle>
                                  <CardDescription>
                                    Category: {gap.competency?.category?.name || "N/A"}
                                  </CardDescription>
                                </div>
                                <Badge className={getGapBadgeColor(gapValue)}>
                                  {gapValue > 0 ? `Gap: ${gapValue}` : "Proficient"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Gap Details */}
                              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <Label className="text-xs text-gray-500">Required Level</Label>
                                  <p className="text-lg font-semibold">{gap.requiredLevel}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">Current Level</Label>
                                  <p className="text-lg font-semibold">{gap.currentLevel}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">Gap</Label>
                                  <p className={`text-lg font-semibold ${gapValue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {gapValue > 0 ? `-${gapValue}` : '0'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Training Recommendations */}
                              {gapValue > 0 && displayRecommendations.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                                    <BookOpen size={16} />
                                    Training Recommendations ({displayRecommendations.length})
                                  </Label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {displayRecommendations.map((rec: TrainingRecommendation) => (
                                      <Card key={rec.id} className="bg-blue-50 border-blue-200 hover:border-blue-300 transition-colors">
                                        <CardContent className="pt-4">
                                          <div className="space-y-2">
                                            <div className="font-medium text-sm text-blue-900">{rec.title}</div>
                                            {rec.description && (
                                              <p className="text-xs text-gray-700 line-clamp-3">{rec.description}</p>
                                            )}
                                            <div className="flex items-center flex-wrap gap-2 mt-3">
                                              <Badge variant="outline" className="text-xs">
                                                Difficulty: {rec.difficultyLevel}/5
                                              </Badge>
                                              {rec.link && (
                                                <a
                                                  href={rec.link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <BookOpen size={12} />
                                                  View Resource
                                                </a>
                                              )}
                                              {rec.course && (
                                                <Badge variant="outline" className="text-xs">
                                                  Course: {rec.course.title}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {gapValue > 0 && displayRecommendations.length === 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-yellow-900">No Training Recommendations</p>
                                      <p className="text-xs text-yellow-700 mt-1">
                                        No training recommendations are currently available for this competency gap. 
                                        Consider creating recommendations in the Recommendations tab.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No gap analysis data available for this employee.</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Gap analysis is automatically generated when employees are rated. Rate employees to see gap analysis.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setIsGapAnalysisModalOpen(false)
              setSelectedEmployee(null)
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recommendations Modal */}
      <Dialog open={isRecommendationsModalOpen} onOpenChange={setIsRecommendationsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Training Recommendations</DialogTitle>
            <DialogDescription>
              View training recommendations for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          {isEmployeeRecommendationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">Loading recommendations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employeeRecommendationsData && employeeRecommendationsData.length > 0 ? (
                <div className="space-y-4">
                  {employeeRecommendationsData.map((rec: TrainingRecommendation) => (
                    <Card key={rec.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{rec.title}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {rec.description || "No description"}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">Difficulty: {rec.difficultyLevel}/5</Badge>
                              {rec.competency && (
                                <Badge variant="outline">{rec.competency.name}</Badge>
                              )}
                            </div>
                            {rec.link && (
                              <a
                                href={rec.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                              >
                                View Resource
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No recommendations available for this employee.</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsRecommendationsModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Recommendation Modal */}
      <Dialog open={isCreateRecommendationModalOpen} onOpenChange={setIsCreateRecommendationModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Training Recommendation</DialogTitle>
            <DialogDescription>
              Create a new training recommendation for a competency
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Competency *</Label>
              <Select
                value={recommendationFormData.competencyId}
                onValueChange={(value) =>
                  setRecommendationFormData({ ...recommendationFormData, competencyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competency" />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((comp: Competency) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.category?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={recommendationFormData.title}
                onChange={(e) =>
                  setRecommendationFormData({ ...recommendationFormData, title: e.target.value })
                }
                placeholder="e.g., Advanced JavaScript Course"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={recommendationFormData.description}
                onChange={(e) =>
                  setRecommendationFormData({ ...recommendationFormData, description: e.target.value })
                }
                placeholder="Describe this training recommendation..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={recommendationFormData.link}
                onChange={(e) =>
                  setRecommendationFormData({ ...recommendationFormData, link: e.target.value })
                }
                placeholder="https://example.com/course"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty Level (1-5) *</Label>
              <Select
                value={recommendationFormData.difficultyLevel.toString()}
                onValueChange={(value) =>
                  setRecommendationFormData({
                    ...recommendationFormData,
                    difficultyLevel: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
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
              onClick={() => {
                setIsCreateRecommendationModalOpen(false)
                resetRecommendationForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRecommendation} disabled={isCreatingRecommendation}>
              {isCreatingRecommendation ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


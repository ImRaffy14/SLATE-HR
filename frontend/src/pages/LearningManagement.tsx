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
  BookOpen,
  Users,
  Clock,
  Award,
  BarChart3,
  FileText,
  Video,
  Link as LinkIcon,
  Upload,
  X,
  Check,
  Play,
  Download,
  TrendingUp,
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-hot-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import FullPageLoader from "@/components/FullpageLoader"
import { useAuth } from "@/context/authContext"
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  enrollEmployee,
  getAllEnrollments,
  getEmployeeEnrollments,
  getEnrollmentDetails,
  updateEnrollmentProgress,
  completeCourse,
  deleteEnrollment,
  markMaterialComplete,
  getQuizAttempt,
  generateCertificate,
  getCertificate,
  getCompletionReport,
  getLearningHoursReport,
  getCourseAnalytics,
  getRecommendedCourses,
  getEmployeeProgress,
} from "@/api/learning"
import { getCompetencies } from "@/api/competency"
import { getEmployees } from "@/api/employee"
import { getGapAnalysis } from "@/api/competency"
import {
  Course,
  CourseStatus,
  MaterialType,
  QuestionType,
  Enrollment,
  EnrollmentStatus,
  EnrollmentType,
  CourseFormData,
  MaterialFormData,
  QuizFormData,
  EnrollmentFormData,
  CompletionReport,
  LearningHoursReport,
  CourseAnalytics,
} from "@/types/learning"

export default function LearningManagement() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("courses")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string>("all")
  
  // Check if current user is HR/Manager (not an employee)
  // Only employees can take quizzes (ESS module - not implemented yet)
  const isEmployee = user?.role === "EMPLOYEE"

  // Modal states
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false)
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false)
  const [isViewCourseModalOpen, setIsViewCourseModalOpen] = useState(false)
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [isViewEnrollmentModalOpen, setIsViewEnrollmentModalOpen] = useState(false)
  const [isMaterialManagerOpen, setIsMaterialManagerOpen] = useState(false)
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false)
  const [isQuizTakerOpen, setIsQuizTakerOpen] = useState(false)
  const [isContentDeliveryOpen, setIsContentDeliveryOpen] = useState(false)

  // Selected items
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  // Form data
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    categoryId: "",
    taggedCompetencies: [],
    status: CourseStatus.DRAFT,
    duration: 0,
    estimatedHours: 0,
    isRequired: false,
  })

  const [courseMaterials, setCourseMaterials] = useState<MaterialFormData[]>([])
  const [materialValidationErrors, setMaterialValidationErrors] = useState<Record<number, string>>({})

  const [materialFormData, setMaterialFormData] = useState<MaterialFormData>({
    type: MaterialType.PDF,
    url: "",
    title: "",
    description: "",
    order: 0,
  })

  const [quizFormData, setQuizFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    totalPoints: 100,
    passingScore: 70,
    timeLimit: undefined,
    allowRetake: false,
    questions: [],
  })

  const [enrollmentFormData, setEnrollmentFormData] = useState<EnrollmentFormData>({
    employeeId: "",
    courseId: "",
    isRequired: false,
  })

  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})

  const queryClient = useQueryClient()

  // Queries
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses", selectedStatus, selectedCategoryId, selectedCompetencyId, searchTerm],
    queryFn: () => getCourses({
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      categoryId: selectedCategoryId !== "all" ? selectedCategoryId : undefined,
      competencyId: selectedCompetencyId !== "all" ? selectedCompetencyId : undefined,
      search: searchTerm || undefined,
    }),
  })

  const courses = coursesData?.courses || []
  const coursesPagination = coursesData?.pagination

  const { data: competencies = [] } = useQuery({
    queryKey: ["competencies"],
    queryFn: () => getCompetencies(),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  })

  // Fetch all enrollments for Content Delivery tab
  const { data: allEnrollmentsData, isLoading: isAllEnrollmentsLoading } = useQuery({
    queryKey: ["all-enrollments"],
    queryFn: getAllEnrollments,
    enabled: activeTab === "content",
    refetchOnMount: true, // Refetch when component mounts or tab is switched
  })

  const { data: selectedCourseData } = useQuery({
    queryKey: ["course", selectedCourse?.id],
    queryFn: () => getCourseById(selectedCourse!.id),
    enabled: !!selectedCourse?.id && (isViewCourseModalOpen || isEditCourseModalOpen),
  })

  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["enrollments", selectedEmployee?.id],
    queryFn: () => getEmployeeEnrollments(selectedEmployee!.id),
    enabled: !!selectedEmployee?.id && activeTab === "enrollments",
  })

  const { data: enrollmentDetails, isLoading: isEnrollmentDetailsLoading, error: enrollmentDetailsError } = useQuery({
    queryKey: ["enrollmentDetails", selectedEnrollment?.id],
    queryFn: () => getEnrollmentDetails(selectedEnrollment!.id),
    enabled: !!selectedEnrollment?.id && (isContentDeliveryOpen || isViewEnrollmentModalOpen),
  })

  const { data: completionReport } = useQuery({
    queryKey: ["completionReport"],
    queryFn: () => getCompletionReport(),
    enabled: activeTab === "reporting",
  })

  const { data: learningHoursReport } = useQuery({
    queryKey: ["learningHoursReport"],
    queryFn: () => getLearningHoursReport(),
    enabled: activeTab === "reporting",
  })

  const { data: courseAnalytics } = useQuery({
    queryKey: ["courseAnalytics"],
    queryFn: () => getCourseAnalytics(),
    enabled: activeTab === "reporting",
  })

  // Mutations
  const { mutate: createCourseMutate, isPending: isCreatingCourse } = useMutation({
    mutationFn: createCourse,
    onSuccess: async (course) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      
      // Add materials if any were provided during creation
      if (courseMaterials.length > 0 && course?.id) {
        try {
          await Promise.all(
            courseMaterials.map((material, index) =>
              addMaterial(course.id, { ...material, order: index })
            )
          )
          queryClient.invalidateQueries({ queryKey: ["course", course.id] })
        } catch (error: any) {
          toast.error("Course created but some materials failed to add: " + error.message)
        }
      }
      
      toast.success("Course created successfully!")
      setIsCreateCourseModalOpen(false)
      
      // Open quiz builder if user wants to add quizzes
      if (course?.id) {
        setSelectedCourse(course)
        setIsQuizBuilderOpen(true)
      }
      
      resetCourseForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create course")
    },
  })

  const { mutate: updateCourseMutate, isPending: isUpdatingCourse } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      queryClient.invalidateQueries({ queryKey: ["course"] })
      toast.success("Course updated successfully!")
      setIsEditCourseModalOpen(false)
      resetCourseForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update course")
    },
  })

  const { mutate: deleteCourseMutate, isPending: isDeletingCourse } = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast.success("Course deleted successfully!")
      setIsDeleteCourseModalOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete course")
    },
  })

  const { mutate: enrollEmployeeMutate, isPending: isEnrolling } = useMutation({
    mutationFn: enrollEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      toast.success("Employee enrolled successfully!")
      setIsEnrollModalOpen(false)
      resetEnrollmentForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enroll employee")
    },
  })


  const { mutate: completeCourseMutate, isPending: isCompleting } = useMutation({
    mutationFn: completeCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["enrollmentDetails"] })
      toast.success("Course completed successfully!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete course")
    },
  })

  const { mutate: submitQuizMutate, isPending: isSubmittingQuiz } = useMutation({
    mutationFn: ({ quizId, enrollmentId, answers }: { quizId: string; enrollmentId: string; answers: any[] }) =>
      submitQuiz(quizId, enrollmentId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollmentDetails"] })
      toast.success("Quiz submitted successfully!")
      setIsQuizTakerOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit quiz")
    },
  })

  const { mutate: markMaterialCompleteMutate } = useMutation({
    mutationFn: ({ materialId, enrollmentId, timeSpent }: { materialId: string; enrollmentId: string; timeSpent?: number }) =>
      markMaterialComplete(materialId, enrollmentId, timeSpent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollmentDetails"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark material complete")
    },
  })

  const { mutate: generateCertificateMutate, isPending: isGeneratingCertificate } = useMutation({
    mutationFn: generateCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollmentDetails"] })
      queryClient.invalidateQueries({ queryKey: ["all-enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["course-content"] })
      // Refresh enrollment details to show certificate
      if (selectedEnrollment?.id) {
        queryClient.refetchQueries({ queryKey: ["enrollmentDetails", selectedEnrollment.id] })
      }
      toast.success("Certificate generated and downloaded successfully! It has also been added to the employee's achievements.")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate certificate")
    },
  })

  // Helper functions
  const resetCourseForm = () => {
    setCourseFormData({
      title: "",
      description: "",
      categoryId: "",
      taggedCompetencies: [],
      status: CourseStatus.DRAFT,
      duration: 0,
      estimatedHours: 0,
      isRequired: false,
    })
    setCourseMaterials([])
    setMaterialFormData({
      type: MaterialType.YOUTUBE,
      url: "",
      title: "",
      description: "",
      order: 0,
    })
    setQuizFormData({
      title: "",
      description: "",
      totalPoints: 100,
      passingScore: 70,
      timeLimit: undefined,
      allowRetake: false,
      questions: [],
    })
  }

  const resetEnrollmentForm = () => {
    setEnrollmentFormData({
      employeeId: "",
      courseId: "",
      isRequired: false,
    })
  }

  // Handlers
  const handleCreateCourseClick = () => {
    setSelectedCourse(null)
    resetCourseForm()
    setIsCreateCourseModalOpen(true)
  }

  const handleEditCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setCourseFormData({
      title: course.title,
      description: course.description || "",
      categoryId: course.categoryId || "",
      taggedCompetencies: course.taggedCompetencies || [],
      status: course.status,
      duration: course.duration,
      estimatedHours: course.estimatedHours,
      isRequired: course.isRequired,
    })
    setIsEditCourseModalOpen(true)
  }

  const handleViewCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setIsViewCourseModalOpen(true)
  }

  const handleDeleteCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setIsDeleteCourseModalOpen(true)
  }

  const handleSubmitCourse = () => {
    if (!courseFormData.title.trim()) {
      toast.error("Course title is required")
      return
    }
    if (courseFormData.duration <= 0) {
      toast.error("Duration must be greater than 0")
      return
    }
    if (courseFormData.estimatedHours <= 0) {
      toast.error("Estimated hours must be greater than 0")
      return
    }

    // Validate materials before creating course
    if (!selectedCourse) {
      // Require at least one material
      if (courseMaterials.length === 0) {
        toast.error("Please add at least one material before creating the course")
        return
      }
      // Validate all materials and set errors
      const allMaterialsValid = validateAllMaterials(true)
      if (!allMaterialsValid) {
        toast.error("Please fix invalid material URLs before creating the course")
        return
      }
    }

    // Clean up categoryId - convert empty string to undefined
    // Remove courseId from data since it's auto-generated (only for create, not update)
    const { courseId, ...courseDataWithoutId } = courseFormData;
    const cleanedData = {
      ...courseDataWithoutId,
      categoryId: courseFormData.categoryId && courseFormData.categoryId.trim() !== "" 
        ? courseFormData.categoryId 
        : undefined,
    }

    if (selectedCourse) {
      updateCourseMutate({ id: selectedCourse.id, data: cleanedData })
    } else {
      createCourseMutate(cleanedData)
    }
  }

  // Check if course can be created (all materials valid and at least one material required)
  // Don't set state during render - only check validation
  const canCreateCourse = () => {
    if (!courseFormData.title.trim()) return false
    if (courseFormData.duration <= 0) return false
    if (courseFormData.estimatedHours <= 0) return false
    
    // If creating new course, require at least one material
    if (!selectedCourse) {
      if (courseMaterials.length === 0) {
        return false // At least one material is required
      }
      // Validate all materials without setting state (to avoid re-render loop)
      return validateAllMaterials(false)
    }
    
    return true
  }

  // Validation functions
  const validateYouTubeURL = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url.trim())
  }

  const validatePDFURL = (url: string): boolean => {
    try {
      const urlObj = new URL(url.trim())
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const validateMaterialURL = (material: MaterialFormData): string | null => {
    if (!material.url.trim()) {
      return "URL is required"
    }
    
    if (material.type === MaterialType.YOUTUBE) {
      if (!validateYouTubeURL(material.url)) {
        return "Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)"
      }
    } else if (material.type === MaterialType.PDF) {
      if (!validatePDFURL(material.url)) {
        return "Please enter a valid URL (must start with http:// or https://)"
      }
    }
    
    return null
  }

  const validateAllMaterials = (setErrors: boolean = false): boolean => {
    const errors: Record<number, string> = {}
    let isValid = true

    courseMaterials.forEach((material, index) => {
      const error = validateMaterialURL(material)
      if (error) {
        errors[index] = error
        isValid = false
      }
    })

    // Only set errors if explicitly requested (not during render checks)
    if (setErrors) {
      setMaterialValidationErrors(errors)
    }
    return isValid
  }

  const handleAddMaterialToCourse = () => {
    if (!materialFormData.title.trim() || !materialFormData.url.trim()) {
      toast.error("Title and URL are required")
      return
    }
    
    // Validate URL before adding
    const validationError = validateMaterialURL(materialFormData)
    if (validationError) {
      toast.error(validationError)
      return
    }

    const newMaterial = {
      ...materialFormData,
      order: courseMaterials.length,
    }

    setCourseMaterials([...courseMaterials, newMaterial])
    
    // Clear validation errors for this material
    setMaterialValidationErrors({})
    
    // Reset material form
    setMaterialFormData({
      type: MaterialType.YOUTUBE,
      url: "",
      title: "",
      description: "",
      order: 0,
    })
    
    toast.success("Material added to course")
  }

  const handleRemoveMaterialFromCourse = (index: number) => {
    setCourseMaterials(courseMaterials.filter((_, i) => i !== index))
    // Clear validation error for removed material and reindex
    const newErrors: Record<number, string> = {}
    Object.keys(materialValidationErrors).forEach((key) => {
      const oldIndex = parseInt(key)
      if (oldIndex > index) {
        newErrors[oldIndex - 1] = materialValidationErrors[oldIndex]
      } else if (oldIndex < index) {
        newErrors[oldIndex] = materialValidationErrors[oldIndex]
      }
    })
    setMaterialValidationErrors(newErrors)
  }

  const handleAddMaterial = async () => {
    if (!selectedCourse) return

    if (!materialFormData.title.trim() || !materialFormData.url.trim()) {
      toast.error("Title and URL are required")
      return
    }

    try {
      await addMaterial(selectedCourse.id, materialFormData)
      queryClient.invalidateQueries({ queryKey: ["course", selectedCourse.id] })
      toast.success("Material added successfully!")
      setMaterialFormData({
        type: MaterialType.PDF,
        url: "",
        title: "",
        description: "",
        order: 0,
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to add material")
    }
  }

  const handleUploadMaterial = async (file: File) => {
    if (!selectedCourse) return

    try {
      await uploadMaterial(selectedCourse.id, file)
      queryClient.invalidateQueries({ queryKey: ["course", selectedCourse.id] })
      toast.success("Material uploaded successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload material")
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!selectedCourse) return

    try {
      await deleteMaterial(materialId)
      queryClient.invalidateQueries({ queryKey: ["course", selectedCourse.id] })
      toast.success("Material deleted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete material")
    }
  }

  const handleAddQuestion = () => {
    setQuizFormData({
      ...quizFormData,
      questions: [
        ...quizFormData.questions,
        {
          question: "",
          questionType: QuestionType.MULTIPLE_CHOICE,
          points: 10,
          order: quizFormData.questions.length,
          choices: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          correctAnswer: "",
        },
      ],
    })
  }

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...quizFormData.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuizFormData({ ...quizFormData, questions: updatedQuestions })
  }

  const handleUpdateChoice = (questionIndex: number, choiceIndex: number, field: string, value: any) => {
    const updatedQuestions = [...quizFormData.questions]
    const updatedChoices = [...updatedQuestions[questionIndex].choices]
    updatedChoices[choiceIndex] = { ...updatedChoices[choiceIndex], [field]: value }
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], choices: updatedChoices }
    setQuizFormData({ ...quizFormData, questions: updatedQuestions })
  }

  const handleRemoveQuestion = (index: number) => {
    setQuizFormData({
      ...quizFormData,
      questions: quizFormData.questions.filter((_, i) => i !== index),
    })
  }

  const handleSaveQuiz = async () => {
    if (!selectedCourse) return

    if (!quizFormData.title.trim()) {
      toast.error("Quiz title is required")
      return
    }

    if (quizFormData.questions.length === 0) {
      toast.error("Quiz must have at least one question")
      return
    }

    // Validate questions
    for (const question of quizFormData.questions) {
      if (!question.question.trim()) {
        toast.error("All questions must have text")
        return
      }
      if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
        const correctChoices = question.choices.filter(c => c.isCorrect)
        if (correctChoices.length !== 1) {
          toast.error("Each multiple choice question must have exactly one correct answer")
          return
        }
        const correctChoice = question.choices.find(c => c.isCorrect)
        if (correctChoice) {
          question.correctAnswer = correctChoice.text
        }
      }
    }

    try {
      await createQuiz(selectedCourse.id, quizFormData)
      queryClient.invalidateQueries({ queryKey: ["course", selectedCourse.id] })
      toast.success("Quiz created successfully!")
      setIsQuizBuilderOpen(false)
      setQuizFormData({
        title: "",
        description: "",
        totalPoints: 100,
        passingScore: 70,
        timeLimit: undefined,
        allowRetake: false,
        questions: [],
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to create quiz")
    }
  }

  const handleEnrollEmployee = () => {
    if (!enrollmentFormData.employeeId || !enrollmentFormData.courseId) {
      toast.error("Please select both employee and course")
      return
    }
    enrollEmployeeMutate(enrollmentFormData)
  }


  const handleTakeQuiz = async (quizId: string) => {
    if (!selectedEnrollment) return

    try {
      const quiz = await getQuiz(quizId, selectedEnrollment.id)
      if (quiz.existingAttempt && quiz.existingAttempt.locked) {
        toast.error("This quiz has already been submitted and cannot be retaken")
        return
      }
      setSelectedCourse({ ...selectedCourse!, quizzes: [quiz] } as Course)
      setIsQuizTakerOpen(true)
    } catch (error: any) {
      toast.error(error.message || "Failed to load quiz")
    }
  }

  const handleSubmitQuiz = () => {
    if (!selectedCourse?.quizzes?.[0] || !selectedEnrollment) return

    const quiz = selectedCourse.quizzes[0]
    const answers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }))

    if (answers.length !== quiz.questions?.length) {
      toast.error("Please answer all questions")
      return
    }

    submitQuizMutate({
      quizId: quiz.id,
      enrollmentId: selectedEnrollment.id,
      answers,
    })
  }

  const handleMarkMaterialComplete = (materialId: string) => {
    if (!selectedEnrollment) return
    markMaterialCompleteMutate({
      materialId,
      enrollmentId: selectedEnrollment.id,
    })
  }

  const handleCompleteCourse = () => {
    if (!selectedEnrollment) return
    completeCourseMutate(selectedEnrollment.id)
  }

  const handleGenerateCertificate = () => {
    if (!selectedEnrollment) return
    generateCertificateMutate(selectedEnrollment.id)
  }

  const isLoading = isCoursesLoading || isEnrollmentsLoading

  if (isLoading && activeTab === "courses") {
    return <FullPageLoader message="Loading Courses" showLogo={false} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learning Management</h2>
          <p className="text-gray-600">Manage courses, enrollments, and track learning progress</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <Users className="w-4 h-4 mr-2" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="content">
            <Play className="w-4 h-4 mr-2" />
            Content Delivery
          </TabsTrigger>
          <TabsTrigger value="reporting">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reporting
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Library</CardTitle>
                  <CardDescription>Manage courses, materials, and quizzes</CardDescription>
                </div>
                <Button onClick={handleCreateCourseClick} className="gap-2">
                  <Plus size={16} />
                  Create Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Categories will be populated from API */}
                  </SelectContent>
                </Select>
                <Select value={selectedCompetencyId} onValueChange={setSelectedCompetencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by competency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Competencies</SelectItem>
                    {competencies.map((comp: any) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Courses Table */}
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Competencies</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-sm text-gray-500">
                            {searchTerm || selectedStatus !== "all" || selectedCategoryId !== "all" || selectedCompetencyId !== "all"
                              ? "No courses match your filters."
                              : "No courses found. Create your first course to get started."}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map((course: Course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-gray-600">{course.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                course.status === CourseStatus.PUBLISHED
                                  ? "default"
                                  : course.status === CourseStatus.DRAFT
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{course.duration} min</div>
                              <div className="text-gray-500">{course.estimatedHours} hours</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {course.taggedCompetencies.length > 0 ? (
                                <Badge variant="outline">{course.taggedCompetencies.length} competencies</Badge>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {course.enrollments?.length || 0} enrolled
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewCourseClick(course)}>
                                  <Eye size={16} className="mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditCourseClick(course)}>
                                  <Edit size={16} className="mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCourseClick(course)}
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

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Employee Enrollments</CardTitle>
                  <CardDescription>Manage employee course enrollments and track progress</CardDescription>
                </div>
                <Button onClick={() => setIsEnrollModalOpen(true)} className="gap-2">
                  <Plus size={16} />
                  Enroll Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Employees with enrollments */}
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>In Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Filter employees to only show those with enrollments
                      const enrolledEmployees = employees.filter((employee: any) => 
                        employee.enrollments && employee.enrollments.length > 0
                      )

                      if (enrolledEmployees.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <p className="text-sm text-gray-500">No employees with enrollments found.</p>
                              <p className="text-xs text-gray-400 mt-1">Enroll employees in courses to see them here.</p>
                            </TableCell>
                          </TableRow>
                        )
                      }

                      return enrolledEmployees.map((employee: any) => {
                        const employeeEnrollments = employee.enrollments || []
                        const completed = employeeEnrollments.filter((e: Enrollment) => e.status === EnrollmentStatus.COMPLETED).length
                        const inProgress = employeeEnrollments.filter((e: Enrollment) => e.status === EnrollmentStatus.IN_PROGRESS).length

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
                            <TableCell>{employeeEnrollments.length}</TableCell>
                            <TableCell>{completed}</TableCell>
                            <TableCell>{inProgress}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  setSelectedEmployee(employee)
                                  try {
                                    const enrollments = await getEmployeeEnrollments(employee.id)
                                    if (enrollments && enrollments.length > 0) {
                                      setSelectedEnrollment(enrollments[0])
                                      setIsViewEnrollmentModalOpen(true)
                                    } else {
                                      toast.error("No enrollments found for this employee")
                                    }
                                  } catch (error: any) {
                                    toast.error(error.message || "Failed to load enrollments")
                                  }
                                }}
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
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

        {/* Content Delivery Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Delivery</CardTitle>
              <CardDescription>View course content, take quizzes, and track progress</CardDescription>
            </CardHeader>
            <CardContent>
              {isAllEnrollmentsLoading ? (
                <div className="text-center py-8">
                  <FullPageLoader message="Loading enrollments..." showLogo={false} />
                </div>
              ) : (() => {
                const allEnrollments = allEnrollmentsData || []

                if (allEnrollments.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">
                        No enrollments found. Enroll employees in courses to view content here.
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Final Grade</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allEnrollments.map((enrollment: any) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>
                                    {enrollment.employee?.name?.charAt(0) || enrollment.employee?.employeeId?.charAt(0) || "E"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{enrollment.employee?.name || "Unknown"}</div>
                                  <div className="text-sm text-gray-600">
                                    {enrollment.employee?.email || enrollment.employee?.employeeId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{enrollment.course?.title || "Unknown Course"}</div>
                                <div className="text-sm text-gray-600">{enrollment.course?.courseId || ""}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  enrollment.status === EnrollmentStatus.COMPLETED
                                    ? "default"
                                    : enrollment.status === EnrollmentStatus.IN_PROGRESS
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {enrollment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{enrollment.completionPercentage || 0}%</span>
                                </div>
                                <Progress value={enrollment.completionPercentage || 0} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              {enrollment.finalGrade !== null && enrollment.finalGrade !== undefined ? (
                                <div className="font-medium">{enrollment.finalGrade.toFixed(1)}%</div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Set the enrollment with just the ID to trigger the query
                                  setSelectedEnrollment({ id: enrollment.id } as Enrollment)
                                  setIsContentDeliveryOpen(true)
                                }}
                              >
                                <Play size={14} className="mr-1" />
                                View Content
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporting Tab */}
        <TabsContent value="reporting" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completion Report</CardTitle>
              </CardHeader>
              <CardContent>
                {completionReport ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Completed</span>
                      <span className="font-bold">{completionReport.totalCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Passed</span>
                      <span className="font-bold text-green-600">{completionReport.totalPassed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Failed</span>
                      <span className="font-bold text-red-600">{completionReport.totalFailed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="font-bold">{completionReport.averageScore.toFixed(1)}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Hours</CardTitle>
              </CardHeader>
              <CardContent>
                {learningHoursReport ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Hours</span>
                      <span className="font-bold">{learningHoursReport.totalHours.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-gray-600">By Department:</div>
                    {Object.entries(learningHoursReport.departmentHours).slice(0, 3).map(([dept, hours]) => (
                      <div key={dept} className="flex justify-between text-xs">
                        <span>{dept}</span>
                        <span>{hours.toFixed(1)}h</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {courseAnalytics ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Courses</span>
                      <span className="font-bold">{courseAnalytics.all.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Most Enrolled</span>
                      <span className="font-bold">{courseAnalytics.mostEnrolled[0]?.course?.title || "N/A"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Course Modal */}
      <Dialog
        open={isCreateCourseModalOpen || isEditCourseModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateCourseModalOpen(false)
            setIsEditCourseModalOpen(false)
            resetCourseForm()
          }
        }}
      >
        <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? "Edit Course" : "Create Course"}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse ? "Update course information" : "Create a new course with materials and quizzes"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Title *</Label>
                <Input
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  placeholder="e.g., Advanced Safety Training"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                placeholder="Describe the course..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={courseFormData.status}
                  onValueChange={(value) => setCourseFormData({ ...courseFormData, status: value as CourseStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={CourseStatus.PUBLISHED}>Published</SelectItem>
                    <SelectItem value={CourseStatus.ARCHIVED}>Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  min={1}
                  value={courseFormData.duration}
                  onChange={(e) => setCourseFormData({ ...courseFormData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Hours *</Label>
                <Input
                  type="number"
                  min={1}
                  value={courseFormData.estimatedHours}
                  onChange={(e) => setCourseFormData({ ...courseFormData, estimatedHours: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tagged Competencies</Label>
              <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                {competencies.length === 0 ? (
                  <p className="text-sm text-gray-500">No competencies available</p>
                ) : (
                  <div className="space-y-2">
                    {competencies.map((comp: any) => (
                      <div key={comp.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`comp-${comp.id}`}
                          checked={courseFormData.taggedCompetencies.includes(comp.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCourseFormData({
                                ...courseFormData,
                                taggedCompetencies: [...courseFormData.taggedCompetencies, comp.id],
                              })
                            } else {
                              setCourseFormData({
                                ...courseFormData,
                                taggedCompetencies: courseFormData.taggedCompetencies.filter((id) => id !== comp.id),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`comp-${comp.id}`} className="cursor-pointer">
                          {comp.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Course Materials Section */}
            {!selectedCourse && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Course Materials (YouTube/PDF Links) *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMaterialFormData({
                        type: MaterialType.YOUTUBE,
                        url: "",
                        title: "",
                        description: "",
                        order: courseMaterials.length,
                      })
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Material
                  </Button>
                </div>
                
                {/* Add Material Form */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Material Type</Label>
                        <Select
                          value={materialFormData.type}
                          onValueChange={(value) => setMaterialFormData({ ...materialFormData, type: value as MaterialType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={MaterialType.YOUTUBE}>YouTube Link</SelectItem>
                            <SelectItem value={MaterialType.PDF}>PDF Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>URL *</Label>
                        <Input
                          value={materialFormData.url}
                          onChange={(e) => setMaterialFormData({ ...materialFormData, url: e.target.value })}
                          placeholder={materialFormData.type === MaterialType.YOUTUBE ? "https://www.youtube.com/watch?v=..." : "https://example.com/document.pdf"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={materialFormData.title}
                          onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                          placeholder="Material title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={materialFormData.description}
                          onChange={(e) => setMaterialFormData({ ...materialFormData, description: e.target.value })}
                          placeholder="Material description"
                          rows={2}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddMaterialToCourse}
                        className="w-full"
                        disabled={!materialFormData.title.trim() || !materialFormData.url.trim()}
                      >
                        <Plus size={14} className="mr-1" />
                        Add to Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* List of Added Materials */}
                {courseMaterials.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Added Materials ({courseMaterials.length})</Label>
                    <div className="space-y-2">
                      {courseMaterials.map((material, index) => {
                        const validationError = validateMaterialURL(material)
                        const hasError = validationError !== null
                        
                        return (
                          <Card key={index} className={hasError ? "border-red-300 bg-red-50" : ""}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {material.type === MaterialType.YOUTUBE && <Video size={16} />}
                                    {material.type === MaterialType.PDF && <FileText size={16} />}
                                    <span className="font-medium">{material.title}</span>
                                    <Badge variant="outline">{material.type}</Badge>
                                    {hasError && (
                                      <Badge variant="destructive" className="text-xs">
                                        Invalid URL
                                      </Badge>
                                    )}
                                  </div>
                                  {material.description && (
                                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                                  )}
                                  <div className="mt-1">
                                    <a
                                      href={material.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-xs hover:underline inline-block ${hasError ? "text-red-600" : "text-blue-600"}`}
                                    >
                                      {material.url}
                                    </a>
                                    {hasError && (
                                      <p className="text-xs text-red-600 mt-1 font-medium">{validationError}</p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    handleRemoveMaterialFromCourse(index)
                                    // Clear validation error for removed material
                                    const newErrors = { ...materialValidationErrors }
                                    delete newErrors[index]
                                    setMaterialValidationErrors(newErrors)
                                  }}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                    {courseMaterials.length === 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">
                          ⚠️ At least one material is required to create a course
                        </p>
                      </div>
                    )}
                    {courseMaterials.length > 0 && courseMaterials.some((m, i) => validateMaterialURL(m) !== null) && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">
                          ⚠️ Please fix invalid material URLs before creating the course
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRequired"
                checked={courseFormData.isRequired}
                onCheckedChange={(checked) => setCourseFormData({ ...courseFormData, isRequired: !!checked })}
              />
              <Label htmlFor="isRequired" className="cursor-pointer">
                Mark as required course
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateCourseModalOpen(false)
                setIsEditCourseModalOpen(false)
                resetCourseForm()
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitCourse} 
              disabled={isCreatingCourse || isUpdatingCourse || (!selectedCourse && !canCreateCourse())}
            >
              {isCreatingCourse || isUpdatingCourse ? "Saving..." : selectedCourse ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Course Modal */}
      <Dialog open={isViewCourseModalOpen} onOpenChange={setIsViewCourseModalOpen}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>View course information, materials, and quizzes</DialogDescription>
          </DialogHeader>
          {selectedCourseData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Title</Label>
                  <p className="text-sm">{selectedCourseData.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Course ID</Label>
                  <p className="text-sm">{selectedCourseData.courseId}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <Badge>{selectedCourseData.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Duration</Label>
                  <p className="text-sm">{selectedCourseData.duration} minutes ({selectedCourseData.estimatedHours} hours)</p>
                </div>
              </div>
              {selectedCourseData.description && (
                <div>
                  <Label className="text-sm font-semibold">Description</Label>
                  <p className="text-sm">{selectedCourseData.description}</p>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Materials ({selectedCourseData.materials?.length || 0})</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsMaterialManagerOpen(true)
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Material
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedCourseData.materials?.map((material: any) => (
                    <Card key={material.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {material.type === MaterialType.YOUTUBE && <Video size={16} />}
                              {material.type === MaterialType.PDF && <FileText size={16} />}
                              {material.type === MaterialType.FILE && <FileText size={16} />}
                              {material.type === MaterialType.VIDEO && <Video size={16} />}
                              <span className="font-medium">{material.title}</span>
                              <Badge variant="outline">{material.type}</Badge>
                            </div>
                            {material.description && (
                              <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                            )}
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                            >
                              View Material
                            </a>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Quizzes ({selectedCourseData.quizzes?.length || 0})</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsQuizBuilderOpen(true)
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Quiz
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedCourseData.quizzes?.map((quiz: any) => (
                    <Card key={quiz.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{quiz.title}</div>
                            {quiz.description && (
                              <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Points: {quiz.totalPoints}</Badge>
                              <Badge variant="outline">Passing: {quiz.passingScore}%</Badge>
                              {quiz.timeLimit && <Badge variant="outline">Time: {quiz.timeLimit} min</Badge>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                await deleteQuiz(quiz.id)
                                queryClient.invalidateQueries({ queryKey: ["course", selectedCourse?.id] })
                                toast.success("Quiz deleted successfully!")
                              } catch (error: any) {
                                toast.error(error.message || "Failed to delete quiz")
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsViewCourseModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Material Manager Modal */}
      <Dialog open={isMaterialManagerOpen} onOpenChange={setIsMaterialManagerOpen}>
        <DialogContent className="!max-w-[85vw] !w-[85vw] sm:!max-w-[85vw]">
          <DialogHeader>
            <DialogTitle>Add Course Material</DialogTitle>
            <DialogDescription>Add PDF links, upload files, or add YouTube links</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Material Type *</Label>
              <Select
                value={materialFormData.type}
                onValueChange={(value) => setMaterialFormData({ ...materialFormData, type: value as MaterialType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MaterialType.PDF}>PDF Link</SelectItem>
                  <SelectItem value={MaterialType.YOUTUBE}>YouTube Link</SelectItem>
                  <SelectItem value={MaterialType.VIDEO}>Video File</SelectItem>
                  <SelectItem value={MaterialType.FILE}>File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(materialFormData.type === MaterialType.PDF || materialFormData.type === MaterialType.YOUTUBE) && (
              <>
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input
                    value={materialFormData.url}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, url: e.target.value })}
                    placeholder={materialFormData.type === MaterialType.YOUTUBE ? "https://www.youtube.com/watch?v=..." : "https://example.com/document.pdf"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={materialFormData.title}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                    placeholder="Material title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={materialFormData.description}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, description: e.target.value })}
                    placeholder="Material description"
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddMaterial} className="w-full">
                  Add Material
                </Button>
              </>
            )}
            {(materialFormData.type === MaterialType.FILE || materialFormData.type === MaterialType.VIDEO) && (
              <div className="space-y-2">
                <Label>Upload File *</Label>
                <Input
                  type="file"
                  accept={materialFormData.type === MaterialType.VIDEO ? "video/*" : "application/pdf,image/*"}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleUploadMaterial(file)
                      setIsMaterialManagerOpen(false)
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsMaterialManagerOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Builder Modal */}
      <Dialog open={isQuizBuilderOpen} onOpenChange={setIsQuizBuilderOpen}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Quiz</DialogTitle>
            <DialogDescription>Build a quiz with multiple choice or true/false questions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quiz Title *</Label>
                <Input
                  value={quizFormData.title}
                  onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                  placeholder="e.g., Safety Quiz 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%) *</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={quizFormData.passingScore}
                  onChange={(e) => setQuizFormData({ ...quizFormData, passingScore: parseInt(e.target.value) || 70 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={quizFormData.description}
                onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
                placeholder="Quiz description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total Points</Label>
                <Input
                  type="number"
                  min={1}
                  value={quizFormData.totalPoints}
                  onChange={(e) => setQuizFormData({ ...quizFormData, totalPoints: parseInt(e.target.value) || 100 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time Limit (minutes, optional)</Label>
                <Input
                  type="number"
                  min={1}
                  value={quizFormData.timeLimit || ""}
                  onChange={(e) => setQuizFormData({ ...quizFormData, timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Optional"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="allowRetake"
                  checked={quizFormData.allowRetake}
                  onCheckedChange={(checked) => setQuizFormData({ ...quizFormData, allowRetake: !!checked })}
                />
                <Label htmlFor="allowRetake" className="cursor-pointer">
                  Allow Retake
                </Label>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Questions ({quizFormData.questions.length})</Label>
                <Button onClick={handleAddQuestion} size="sm" variant="outline">
                  <Plus size={14} className="mr-1" />
                  Add Question
                </Button>
              </div>
              {quizFormData.questions.map((question, qIndex) => (
                <Card key={qIndex}>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Question text"
                            value={question.question}
                            onChange={(e) => handleUpdateQuestion(qIndex, "question", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Select
                              value={question.questionType}
                              onValueChange={(value) => handleUpdateQuestion(qIndex, "questionType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                                <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Points"
                              value={question.points}
                              onChange={(e) => handleUpdateQuestion(qIndex, "points", parseInt(e.target.value) || 0)}
                            />
                          </div>
                          {question.questionType === QuestionType.MULTIPLE_CHOICE && (
                            <div className="space-y-2">
                              {question.choices.map((choice, cIndex) => (
                                <div key={cIndex} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={choice.isCorrect}
                                    onCheckedChange={(checked) => {
                                      // Uncheck other choices
                                      const updatedChoices = question.choices.map((c, i) => ({
                                        ...c,
                                        isCorrect: i === cIndex ? !!checked : false,
                                      }))
                                      handleUpdateQuestion(qIndex, "choices", updatedChoices)
                                    }}
                                  />
                                  <Input
                                    placeholder={`Choice ${cIndex + 1}`}
                                    value={choice.text}
                                    onChange={(e) => handleUpdateChoice(qIndex, cIndex, "text", e.target.value)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const updatedChoices = question.choices.filter((_, i) => i !== cIndex)
                                      handleUpdateQuestion(qIndex, "choices", updatedChoices)
                                    }}
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updatedChoices = [...question.choices, { text: "", isCorrect: false }]
                                  handleUpdateQuestion(qIndex, "choices", updatedChoices)
                                }}
                              >
                                <Plus size={14} className="mr-1" />
                                Add Choice
                              </Button>
                            </div>
                          )}
                          {question.questionType === QuestionType.TRUE_FALSE && (
                            <div className="flex gap-2">
                              <Button
                                variant={question.correctAnswer === "True" ? "default" : "outline"}
                                onClick={() => handleUpdateQuestion(qIndex, "correctAnswer", "True")}
                              >
                                True
                              </Button>
                              <Button
                                variant={question.correctAnswer === "False" ? "default" : "outline"}
                                onClick={() => handleUpdateQuestion(qIndex, "correctAnswer", "False")}
                              >
                                False
                              </Button>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveQuestion(qIndex)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsQuizBuilderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuiz}>
              Save Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enroll Employee Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="!max-w-[85vw] !w-[85vw] sm:!max-w-[85vw]">
          <DialogHeader>
            <DialogTitle>Enroll Employee</DialogTitle>
            <DialogDescription>Manually enroll an employee in a course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select
                value={enrollmentFormData.employeeId}
                onValueChange={(value) => setEnrollmentFormData({ ...enrollmentFormData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position || emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Course *</Label>
              <Select
                value={enrollmentFormData.courseId}
                onValueChange={(value) => setEnrollmentFormData({ ...enrollmentFormData, courseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.filter((c: Course) => c.status === CourseStatus.PUBLISHED).map((course: Course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enrollRequired"
                checked={enrollmentFormData.isRequired}
                onCheckedChange={(checked) => setEnrollmentFormData({ ...enrollmentFormData, isRequired: !!checked })}
              />
              <Label htmlFor="enrollRequired" className="cursor-pointer">
                Mark as required
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnrollEmployee} disabled={isEnrolling}>
              {isEnrolling ? "Enrolling..." : "Enroll"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Course Modal */}
      <Dialog open={isDeleteCourseModalOpen} onOpenChange={setIsDeleteCourseModalOpen}>
        <DialogContent className="!max-w-[85vw] !w-[85vw] sm:!max-w-[85vw]">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <p className="text-sm font-medium">{selectedCourse.title}</p>
              {selectedCourse.enrollments && selectedCourse.enrollments.length > 0 && (
                <p className="text-sm text-yellow-600">
                  Warning: This course has {selectedCourse.enrollments.length} active enrollment(s).
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCourse) {
                  deleteCourseMutate(selectedCourse.id)
                }
              }}
              disabled={isDeletingCourse}
            >
              {isDeletingCourse ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Delivery Modal */}
      <Dialog open={isContentDeliveryOpen} onOpenChange={setIsContentDeliveryOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] sm:!max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Content</DialogTitle>
            <DialogDescription>View materials, take quizzes, and track your progress</DialogDescription>
          </DialogHeader>
          {!selectedEnrollment?.id ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No enrollment selected</p>
            </div>
          ) : isEnrollmentDetailsLoading ? (
            <div className="text-center py-8">
              <FullPageLoader message="Loading enrollment details..." showLogo={false} />
            </div>
          ) : enrollmentDetailsError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">
                Error loading enrollment details: {enrollmentDetailsError instanceof Error ? enrollmentDetailsError.message : "Unknown error"}
              </p>
            </div>
          ) : enrollmentDetails ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{enrollmentDetails.course?.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-600">Progress: {enrollmentDetails.completionPercentage}%</p>
                    {enrollmentDetails.finalGrade !== null && enrollmentDetails.finalGrade !== undefined ? (
                      <p className="text-sm font-medium text-gray-900">
                        Final Grade: <span className="text-blue-600">{enrollmentDetails.finalGrade.toFixed(1)}%</span>
                      </p>
                    ) : enrollmentDetails.status === EnrollmentStatus.COMPLETED ? (
                      <p className="text-sm text-gray-500 italic">Final grade not calculated yet</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  {enrollmentDetails.status === EnrollmentStatus.COMPLETED && (
                    <Button onClick={handleGenerateCertificate} disabled={isGeneratingCertificate}>
                      <Award size={16} className="mr-2" />
                      {isGeneratingCertificate ? "Generating..." : "Generate Certificate"}
                    </Button>
                  )}
                  {enrollmentDetails.status !== EnrollmentStatus.COMPLETED && (
                    <Button onClick={handleCompleteCourse} disabled={isCompleting}>
                      {isCompleting ? "Completing..." : "Complete Course"}
                    </Button>
                  )}
                </div>
              </div>
              <Progress value={enrollmentDetails.completionPercentage} className="h-2" />
              
              {/* Materials Section */}
              <div>
                <h4 className="font-semibold mb-3">Course Materials</h4>
                {!enrollmentDetails.course?.materials || enrollmentDetails.course.materials.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No materials available for this course</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollmentDetails.course.materials.map((material: any) => {
                    const progress = enrollmentDetails.progressRecords?.find((pr: any) => pr.materialId === material.id)
                    const isCompleted = progress?.completed || false
                    
                    return (
                      <Card key={material.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {material.type === MaterialType.YOUTUBE && <Video size={18} />}
                                {material.type === MaterialType.PDF && <FileText size={18} />}
                                {material.type === MaterialType.FILE && <FileText size={18} />}
                                {material.type === MaterialType.VIDEO && <Video size={18} />}
                                <span className="font-medium">{material.title}</span>
                                {isCompleted && <Badge variant="default">Completed</Badge>}
                              </div>
                              {material.description && (
                                <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(material.url, "_blank")}
                                >
                                  <LinkIcon size={14} className="mr-1" />
                                  Open Material
                                </Button>
                                {!isCompleted && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkMaterialComplete(material.id)}
                                  >
                                    <Check size={14} className="mr-1" />
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  </div>
                )}
              </div>

              {/* Quizzes Section */}
              <div>
                <h4 className="font-semibold mb-3">Quizzes</h4>
                {!enrollmentDetails.course?.quizzes || enrollmentDetails.course.quizzes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No quizzes available for this course</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollmentDetails.course.quizzes.map((quiz: any) => {
                    const attempt = enrollmentDetails.quizAttempts?.find((a: any) => a.quizId === quiz.id)
                    const isPassed = attempt?.passed || false
                    const isLocked = attempt?.locked || false
                    
                    return (
                      <Card key={quiz.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{quiz.title}</span>
                                {attempt && isPassed && <Badge variant="default">Passed</Badge>}
                                {attempt && !isPassed && <Badge variant="destructive">Failed</Badge>}
                                {attempt && isLocked && <Badge variant="outline">Locked</Badge>}
                                {!attempt && !isEmployee && (
                                  <Badge variant="outline">Not Taken</Badge>
                                )}
                              </div>
                              {quiz.description && (
                                <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                              )}
                              <div className="flex gap-2 mb-2">
                                <Badge variant="outline">Points: {quiz.totalPoints}</Badge>
                                <Badge variant="outline">Passing: {quiz.passingScore}%</Badge>
                                {quiz.timeLimit && <Badge variant="outline">Time: {quiz.timeLimit} min</Badge>}
                              </div>
                              {attempt ? (
                                <div className="text-sm">
                                  <p className="font-medium">Score: {attempt.score.toFixed(1)}%</p>
                                  <p className={isPassed ? "text-green-600" : "text-red-600"}>
                                    {isPassed ? "Passed" : "Failed"}
                                  </p>
                                </div>
                              ) : !isEmployee ? (
                                <div className="text-sm text-gray-500 italic">
                                  Quiz not taken yet. Only employees can take quizzes through the ESS module.
                                </div>
                              ) : null}
                              <div className="flex gap-2 mt-2">
                                {/* Only employees can take quizzes (ESS module) */}
                                {isEmployee && (!attempt || (quiz.allowRetake && !isLocked)) && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleTakeQuiz(quiz.id)}
                                  >
                                    <Play size={14} className="mr-1" />
                                    Take Quiz
                                  </Button>
                                )}
                                {/* Show results button only if quiz has been taken */}
                                {attempt && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        const attemptDetails = await getQuizAttempt(quiz.id, enrollmentDetails.id)
                                        // Show attempt details in a modal or alert
                                        toast.success(`Score: ${attemptDetails?.score.toFixed(1)}%`)
                                      } catch (error: any) {
                                        toast.error(error.message || "Failed to load attempt details")
                                      }
                                    }}
                                  >
                                    <Eye size={14} className="mr-1" />
                                    View Results
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
              </div>

              {/* Certificate Section */}
              {enrollmentDetails.certificate && (
                <div>
                  <h4 className="font-semibold mb-3">Certificate</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Certificate Number: {enrollmentDetails.certificate.certificateNumber}</p>
                          <p className="text-sm text-gray-600">
                            Issued: {new Date(enrollmentDetails.certificate.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => window.open(enrollmentDetails.certificate.pdfUrl, "_blank")}
                        >
                          <Download size={16} className="mr-2" />
                          Download Certificate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No enrollment details available</p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setIsContentDeliveryOpen(false)
              setSelectedEnrollment(null)
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Taker Modal */}
      <Dialog open={isQuizTakerOpen} onOpenChange={setIsQuizTakerOpen}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Take Quiz</DialogTitle>
            <DialogDescription>Answer all questions to complete the quiz</DialogDescription>
          </DialogHeader>
          {selectedCourse?.quizzes?.[0] && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{selectedCourse.quizzes[0].title}</h3>
                {selectedCourse.quizzes[0].description && (
                  <p className="text-sm text-gray-600">{selectedCourse.quizzes[0].description}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">Total Points: {selectedCourse.quizzes[0].totalPoints}</Badge>
                  <Badge variant="outline">Passing Score: {selectedCourse.quizzes[0].passingScore}%</Badge>
                  {selectedCourse.quizzes[0].timeLimit && (
                    <Badge variant="outline">Time Limit: {selectedCourse.quizzes[0].timeLimit} minutes</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {selectedCourse.quizzes[0].questions?.map((question: any, index: number) => (
                  <Card key={question.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              {index + 1}. {question.question} ({question.points} points)
                            </p>
                            {question.questionType === QuestionType.MULTIPLE_CHOICE && (
                              <div className="space-y-2">
                                {question.choices?.map((choice: any, cIndex: number) => (
                                  <div key={cIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id={`q-${question.id}-c-${cIndex}`}
                                      name={`question-${question.id}`}
                                      value={choice.text}
                                      checked={quizAnswers[question.id] === choice.text}
                                      onChange={(e) => setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })}
                                      className="w-4 h-4"
                                    />
                                    <Label htmlFor={`q-${question.id}-c-${cIndex}`} className="cursor-pointer">
                                      {choice.text}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.questionType === QuestionType.TRUE_FALSE && (
                              <div className="flex gap-2">
                                <Button
                                  variant={quizAnswers[question.id] === "True" ? "default" : "outline"}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: "True" })}
                                >
                                  True
                                </Button>
                                <Button
                                  variant={quizAnswers[question.id] === "False" ? "default" : "outline"}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: "False" })}
                                >
                                  False
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsQuizTakerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitQuiz} disabled={isSubmittingQuiz}>
              {isSubmittingQuiz ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Enrollment Modal */}
      <Dialog open={isViewEnrollmentModalOpen} onOpenChange={setIsViewEnrollmentModalOpen}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] sm:!max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>View enrollment information and progress</DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Employee</Label>
                  <p className="text-sm">{selectedEnrollment.employee?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Course</Label>
                  <p className="text-sm">{selectedEnrollment.course?.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <Badge
                    variant={
                      selectedEnrollment.status === EnrollmentStatus.COMPLETED
                        ? "default"
                        : selectedEnrollment.status === EnrollmentStatus.IN_PROGRESS
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {selectedEnrollment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Progress</Label>
                  <p className="text-sm">{selectedEnrollment.completionPercentage}%</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Enrollment Type</Label>
                  <p className="text-sm">{selectedEnrollment.enrollmentType}</p>
                </div>
                {selectedEnrollment.finalGrade && (
                  <div>
                    <Label className="text-sm font-semibold">Final Grade</Label>
                    <p className="text-sm">{selectedEnrollment.finalGrade.toFixed(1)}%</p>
                  </div>
                )}
              </div>
              <Progress value={selectedEnrollment.completionPercentage} className="h-2" />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsViewEnrollmentModalOpen(false)
                    setIsContentDeliveryOpen(true)
                  }}
                >
                  <Play size={16} className="mr-2" />
                  View Content
                </Button>
                {selectedEnrollment.status === EnrollmentStatus.COMPLETED && selectedEnrollment.certificate && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedEnrollment.certificate?.pdfUrl, "_blank")}
                  >
                    <Download size={16} className="mr-2" />
                    Download Certificate
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsViewEnrollmentModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

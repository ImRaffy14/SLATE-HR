"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  Calendar,
  Users,
  Clock,
  Save,
  Trash2,
  MapPin,
  BookOpen,
  QrCode,
  BarChart3,
  UserCheck,
  Star,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { 
  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
  getAttendanceList,
  suggestTrainings,
  enrollInTraining,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  getEmployeeTrainings,
  getTrainingEnrollments,
  generateQRCode,
  scanQRCode,
  updateAttendance,
  markAttendanceManually,
  getTrainingHoursReport,
  getAttendanceSummaryReport,
  getCompetencyImprovementReport,
  getTrainers,
  getVenues,
  submitEmployeePerformanceRating
} from "@/api/training"
import { getCompetencies } from "@/api/competency"
import { getEmployees } from "@/api/employee"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import FullPageLoader from "@/components/FullpageLoader"
import { Training, TrainingStatus, TrainingType, TrainingEnrollment as TrainingEnrollmentType } from "@/types/training"
import { useAuth } from "@/context/authContext"
import { TrainingCard } from "@/components/training/TrainingCard"
import { EnrollmentCard } from "@/components/training/EnrollmentCard"
import { QRCodeDisplay } from "@/components/training/QRCodeDisplay"
import { AttendanceTable } from "@/components/training/AttendanceTable"
import { EmployeePerformanceRatingForm } from "@/components/training/EmployeePerformanceRatingForm"

const statuses = ["All", "DRAFT", "OPEN", "ONGOING", "COMPLETED", "CANCELLED"]
const trainingTypes = ["ONLINE", "ONSITE", "HYBRID"]

export default function TrainingManagement() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("setup")
  
  // Setup tab states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedType, setSelectedType] = useState("All")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)

  // Enrollment tab states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [selectedTrainingForEnrollment, setSelectedTrainingForEnrollment] = useState<string>("")
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [trainingSearchTerm, setTrainingSearchTerm] = useState<string>("")
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>("")

  // Attendance tab states
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("")
  const [qrCode, setQrCode] = useState<string>("")
  const [qrCodeString, setQrCodeString] = useState<string>("")
  const [qrExpiresAt, setQrExpiresAt] = useState<string>("")

  // Employee Performance Rating states
  const [isEmployeeRatingModalOpen, setIsEmployeeRatingModalOpen] = useState(false)
  const [selectedEnrollmentForRating, setSelectedEnrollmentForRating] = useState<{ enrollmentId: string; employeeName: string; evaluation?: any } | null>(null)

  // Reports tab states
  const [selectedTrainingForReport, setSelectedTrainingForReport] = useState<string>("")
  const [reportSearchTerm, setReportSearchTerm] = useState<string>("")

  const [createForm, setCreateForm] = useState<{
    title: string;
    description: string;
    trainingType: TrainingType;
    startDate: string;
    endDate: string;
    durationHours: string;
    trainerName: string;
    venueName: string;
    meetingLink: string;
    address: string;
    taggedCompetencies: string[];
    maxParticipants: string;
  }>({
    title: "",
    description: "",
    trainingType: TrainingType.ONLINE,
    startDate: "",
    endDate: "",
    durationHours: "",
    trainerName: "",
    venueName: "",
    meetingLink: "",
    address: "",
    taggedCompetencies: [] as string[],
    maxParticipants: "",
  })

  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    trainingType: TrainingType;
    startDate: string;
    endDate: string;
    durationHours: string;
    trainerName: string;
    venueName: string;
    meetingLink: string;
    address: string;
    taggedCompetencies: string[];
    maxParticipants: string;
    status: TrainingStatus;
  }>({
    title: "",
    description: "",
    trainingType: TrainingType.ONLINE,
    startDate: "",
    endDate: "",
    durationHours: "",
    trainerName: "",
    venueName: "",
    meetingLink: "",
    address: "",
    taggedCompetencies: [] as string[],
    maxParticipants: "",
    status: TrainingStatus.DRAFT,
  })

  // Get trainings
  const { data: trainingsData, isLoading: isLoadingTrainings } = useQuery({
    queryKey: ["trainings", selectedStatus, selectedType],
    queryFn: () => getTrainings({
      status: selectedStatus !== "All" ? selectedStatus as any : undefined,
      trainingType: selectedType !== "All" ? selectedType as any : undefined,
    })
  })

  // Get competencies for tagging
  const { data: competencies = [] } = useQuery({
    queryKey: ["competencies"],
    queryFn: () => getCompetencies()
  })

  // Get employees
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees
  })

  // Get trainers
  const { data: trainers = [] } = useQuery({
    queryKey: ["trainers"],
    queryFn: getTrainers
  })

  // Get venues
  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: getVenues
  })

  // Get attendance for selected training
  const { data: attendanceList = [] } = useQuery({
    queryKey: ["attendance", selectedTraining?.id],
    queryFn: () => getAttendanceList(selectedTraining!.id),
    enabled: !!selectedTraining && isViewDetailsModalOpen
  })

  // Enrollment queries
  const { data: pendingData, isLoading: isLoadingPending } = useQuery({
    queryKey: ["pendingEnrollments"],
    queryFn: () => getPendingEnrollments()
  })

  const { data: trainingEnrollmentsData, isLoading: isLoadingTrainingEnrollments, refetch: refetchTrainingEnrollments } = useQuery({
    queryKey: ["trainingEnrollments", selectedTrainingForEnrollment],
    queryFn: () => getTrainingEnrollments(selectedTrainingForEnrollment),
    enabled: !!selectedTrainingForEnrollment
  })

  // Refetch enrollments when selected training changes
  useEffect(() => {
    if (selectedTrainingForEnrollment) {
      // Small delay to ensure query is enabled
      const timer = setTimeout(() => {
        refetchTrainingEnrollments()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [selectedTrainingForEnrollment])

  // Attendance queries
  const { data: attendanceTrainingList = [] } = useQuery({
    queryKey: ["attendance", selectedTrainingId],
    queryFn: () => getAttendanceList(selectedTrainingId),
    enabled: !!selectedTrainingId
  })

  // Get completed trainings for reports
  const { data: completedTrainingsData } = useQuery({
    queryKey: ["trainings", "COMPLETED"],
    queryFn: () => getTrainings({
      status: TrainingStatus.COMPLETED
    })
  })

  const completedTrainings = completedTrainingsData?.trainings || []
  const filteredCompletedTrainings = completedTrainings.filter((training: Training) => {
    if (!reportSearchTerm) return true
    return training.title.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
           training.trainingId.toLowerCase().includes(reportSearchTerm.toLowerCase())
  })

  // Reports queries - only fetch when a training is selected
  const { data: hoursReport, isLoading: isLoadingHours } = useQuery({
    queryKey: ["trainingHoursReport", selectedTrainingForReport],
    queryFn: () => getTrainingHoursReport({
      trainingId: selectedTrainingForReport || undefined
    }),
    enabled: !!selectedTrainingForReport
  })

  const { data: attendanceReport, isLoading: isLoadingAttendanceReport } = useQuery({
    queryKey: ["attendanceReport", selectedTrainingForReport],
    queryFn: () => getAttendanceSummaryReport({
      trainingId: selectedTrainingForReport || undefined
    }),
    enabled: !!selectedTrainingForReport
  })

  const { data: competencyReport, isLoading: isLoadingCompetencyReport } = useQuery({
    queryKey: ["competencyReport", selectedTrainingForReport],
    queryFn: () => getCompetencyImprovementReport({
      trainingId: selectedTrainingForReport || undefined
    }),
    enabled: !!selectedTrainingForReport
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
      setIsCreateModalOpen(false)
      setCreateForm({
        title: "",
        description: "",
        trainingType: TrainingType.ONLINE,
        startDate: "",
        endDate: "",
        durationHours: "",
        trainerName: "",
        venueName: "",
        meetingLink: "",
        address: "",
        taggedCompetencies: [],
        maxParticipants: "",
      })
      toast.success("Training created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTraining(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
      setIsEditModalOpen(false)
      toast.success("Training updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
      toast.success("Training deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Enrollment mutations
  const enrollMutation = useMutation({
    mutationFn: ({ trainingId, employeeId }: { trainingId: string; employeeId: string }) =>
      enrollInTraining(trainingId, employeeId, "MANUAL"),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
      queryClient.invalidateQueries({ queryKey: ["trainingEnrollments", variables.trainingId] })
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments"] })
      setIsEnrollModalOpen(false)
      setSelectedEmployeeId("")
      setTrainingSearchTerm("")
      setEmployeeSearchTerm("")
      // Keep the training selected so enrollments list updates
      setSelectedTrainingForEnrollment(variables.trainingId)
      // Force refetch after a short delay to ensure state is updated
      setTimeout(async () => {
        await queryClient.refetchQueries({ 
          queryKey: ["trainingEnrollments", variables.trainingId],
          exact: true
        })
      }, 200)
      toast.success("Employee enrolled successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const approveMutation = useMutation({
    mutationFn: approveEnrollment,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments"] })
      if (selectedTrainingForEnrollment) {
        queryClient.invalidateQueries({ queryKey: ["trainingEnrollments", selectedTrainingForEnrollment] })
        await queryClient.refetchQueries({ 
          queryKey: ["trainingEnrollments", selectedTrainingForEnrollment],
          exact: true
        })
      } else {
        queryClient.invalidateQueries({ queryKey: ["trainingEnrollments"] })
      }
      toast.success("Enrollment approved")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectEnrollment(id, reason),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments"] })
      if (selectedTrainingForEnrollment) {
        queryClient.invalidateQueries({ queryKey: ["trainingEnrollments", selectedTrainingForEnrollment] })
        await queryClient.refetchQueries({ 
          queryKey: ["trainingEnrollments", selectedTrainingForEnrollment],
          exact: true
        })
      } else {
        queryClient.invalidateQueries({ queryKey: ["trainingEnrollments"] })
      }
      toast.success("Enrollment rejected")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Employee Performance Rating mutation
  const submitEmployeeRatingMutation = useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: any }) =>
      submitEmployeePerformanceRating(enrollmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", selectedTrainingId] })
      queryClient.invalidateQueries({ queryKey: ["trainingEnrollments"] })
      queryClient.invalidateQueries({ queryKey: ["competencyReport"] })
      queryClient.invalidateQueries({ queryKey: ["competencyImprovementReport"] })
      setIsEmployeeRatingModalOpen(false)
      setSelectedEnrollmentForRating(null)
      toast.success("Employee performance rating submitted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Manual attendance marking mutation
  const markAttendanceMutation = useMutation({
    mutationFn: ({ enrollmentId, attendanceId, status }: { enrollmentId: string; attendanceId: string | undefined; status: 'PRESENT' | 'LATE' | 'ABSENT' }) => {
      if (!selectedTrainingId) {
        throw new Error("Training not selected")
      }
      return markAttendanceManually(selectedTrainingId, enrollmentId, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", selectedTrainingId] })
      toast.success("Attendance updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Attendance mutations
  const generateQRMutation = useMutation({
    mutationFn: generateQRCode,
    onSuccess: (data) => {
      setQrCode(data.qrCode)
      setQrCodeString(data.qrCodeString)
      setQrExpiresAt(data.expiresAt)
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
      toast.success("QR code generated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const scanQRMutation = useMutation({
    mutationFn: ({ trainingId, employeeId, qrData, location }: {
      trainingId: string;
      employeeId: string;
      qrData: string;
      location?: string;
    }) => scanQRCode(trainingId, employeeId, qrData, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      toast.success("Attendance marked successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const trainings = trainingsData?.trainings || []
  const pendingEnrollments = pendingData?.enrollments || []
  const trainingEnrollments = trainingEnrollmentsData?.enrollments || []
  
  // Debug: Log enrollments data (only in development)
  useEffect(() => {
    if (selectedTrainingForEnrollment && trainingEnrollmentsData) {
      console.log("Training Enrollments Data:", trainingEnrollmentsData)
      console.log("Training Enrollments Array:", trainingEnrollments)
      console.log("Selected Training ID:", selectedTrainingForEnrollment)
      console.log("Is Loading:", isLoadingTrainingEnrollments)
    }
  }, [selectedTrainingForEnrollment, trainingEnrollmentsData, trainingEnrollments, isLoadingTrainingEnrollments])

  const filteredTrainings = trainings.filter((training: Training) => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainingId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusBadgeColor = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.DRAFT:
        return "bg-gray-500"
      case TrainingStatus.OPEN:
        return "bg-blue-500"
      case TrainingStatus.ONGOING:
        return "bg-yellow-500"
      case TrainingStatus.COMPLETED:
        return "bg-green-500"
      case TrainingStatus.CANCELLED:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleCreate = () => {
    if (!createForm.title || !createForm.startDate || !createForm.endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    createMutation.mutate({
      ...createForm,
      durationHours: parseFloat(createForm.durationHours),
      maxParticipants: parseInt(createForm.maxParticipants),
      startDate: new Date(createForm.startDate).toISOString(),
      endDate: new Date(createForm.endDate).toISOString(),
      trainerName: createForm.trainerName || undefined,
      venueName: createForm.venueName || undefined,
      meetingLink: createForm.meetingLink || undefined,
      address: createForm.address || undefined,
    })
  }

  const handleEdit = () => {
    if (!selectedTraining) return

    updateMutation.mutate({
      id: selectedTraining.id,
      data: {
        ...editForm,
        durationHours: editForm.durationHours ? parseFloat(editForm.durationHours) : undefined,
        maxParticipants: editForm.maxParticipants ? parseInt(editForm.maxParticipants) : undefined,
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : undefined,
        trainerName: editForm.trainerName || undefined,
        venueName: editForm.venueName || undefined,
        meetingLink: editForm.meetingLink || undefined,
        address: editForm.address || undefined,
      }
    })
  }

  const handleViewDetails = async (training: Training) => {
    try {
      const fullTraining = await getTrainingById(training.id)
      setSelectedTraining(fullTraining)
      setIsViewDetailsModalOpen(true)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const formatDateTimeLocal = (dateString: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleEditClick = (training: Training) => {
    setSelectedTraining(training)
    setEditForm({
      title: training.title,
      description: training.description || "",
      trainingType: training.trainingType,
      startDate: formatDateTimeLocal(training.startDate),
      endDate: formatDateTimeLocal(training.endDate),
      durationHours: training.durationHours.toString(),
      trainerName: (training as any).trainerName || training.trainer?.name || "",
      venueName: (training as any).venueName || training.venue?.name || "",
      meetingLink: (training as any).meetingLink || "",
      address: (training as any).address || "",
      taggedCompetencies: training.taggedCompetencies,
      maxParticipants: training.maxParticipants.toString(),
      status: training.status,
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this training?")) {
      deleteMutation.mutate(id)
    }
  }

  const handleGenerateQR = () => {
    if (!selectedTrainingId) {
      toast.error("Please select a training first")
      return
    }
    generateQRMutation.mutate(selectedTrainingId)
  }

  const handleExport = (reportType: string) => {
    alert(`Export ${reportType} functionality to be implemented`)
  }

  if (isLoadingTrainings) {
    return <FullPageLoader message="Loading trainings..." showLogo={false} />
  }

  const enrolledCount = (training: Training) => {
    return training.enrollments?.filter(e => e.status === 'APPROVED').length || 0
  }

  const selectedTrainingForAttendance = trainings.find((t: Training) => t.id === selectedTrainingId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Training Management</h2>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 border border-gray-200">
          <TabsTrigger value="setup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen size={16} className="mr-2" />
            Training Setup
          </TabsTrigger>
          <TabsTrigger value="enrollment" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <UserCheck size={16} className="mr-2" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <QrCode size={16} className="mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 size={16} className="mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Training Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Training Setup</h3>
            {(user?.role === "ADMIN" || user?.role === "HR") && (
              <Button
                className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={16} />
                Create Training
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Filters</CardTitle>
              <CardDescription className="text-gray-600">Filter training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search trainings..."
                    className="pl-9 bg-white border border-gray-300 focus:border-blue-500 text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start gap-2 border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
                    >
                      <Filter size={16} />
                      Status: {selectedStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-gray-200">
                    {statuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start gap-2 border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
                    >
                      <Filter size={16} />
                      Type: {selectedType}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-gray-200">
                    <DropdownMenuItem
                      onClick={() => setSelectedType("All")}
                      className="text-gray-900 hover:bg-gray-100"
                    >
                      All
                    </DropdownMenuItem>
                    {trainingTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className="text-gray-900 hover:bg-gray-100"
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  className="gap-2 border border-gray-300 text-gray-900 bg-white hover:bg-gray-50"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedStatus("All")
                    setSelectedType("All")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trainings Table */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Trainings</CardTitle>
              <CardDescription className="text-gray-600">{filteredTrainings.length} trainings found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-700 font-semibold min-w-[200px]">Training</TableHead>
                      <TableHead className="text-gray-700 font-semibold min-w-[100px]">Type</TableHead>
                      <TableHead className="text-gray-700 font-semibold min-w-[120px]">Date & Time</TableHead>
                      <TableHead className="text-gray-700 font-semibold min-w-[80px]">Duration</TableHead>
                      <TableHead className="text-gray-700 font-semibold min-w-[100px]">Enrollment</TableHead>
                      <TableHead className="text-gray-700 font-semibold min-w-[100px]">Status</TableHead>
                      <TableHead className="text-right text-gray-700 font-semibold min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrainings.map((training: Training) => (
                      <TableRow key={training.id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{training.title}</div>
                            <div className="text-sm text-gray-500">{training.trainingId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{training.trainingType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-gray-900">{new Date(training.startDate).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(training.startDate).toLocaleTimeString()} - {new Date(training.endDate).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900">{training.durationHours} Hours</TableCell>
                        <TableCell>
                          <div className="text-gray-900">
                            {enrolledCount(training)}/{training.maxParticipants}
                            <div className="text-sm text-gray-500">
                              {Math.round((enrolledCount(training) / training.maxParticipants) * 100)}% full
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`px-3 py-1 ${getStatusBadgeColor(training.status)}`}>
                            {training.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                              >
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(training)}
                                className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Eye size={16} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {(user?.role === "ADMIN" || user?.role === "HR") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEditClick(training)}
                                    className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <Edit size={16} className="mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(training.id)}
                                    className="text-red-700 hover:bg-red-50 cursor-pointer"
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
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
        </TabsContent>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Training Enrollment</h3>
            {(user?.role === "ADMIN" || user?.role === "HR" || user?.role === "MANAGER") && (
              <Button onClick={() => setIsEnrollModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Enroll Employee
              </Button>
            )}
          </div>

          {/* Select Training to View Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>Select Training</CardTitle>
              <CardDescription>Choose a training to view and manage enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTrainingForEnrollment} onValueChange={setSelectedTrainingForEnrollment}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a training" />
                </SelectTrigger>
                <SelectContent>
                  {trainings.map((training: Training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.title} - {new Date(training.startDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Enrollments List */}
          {selectedTrainingForEnrollment && (
            <Card>
              <CardHeader>
                <CardTitle>Enrollments</CardTitle>
                <CardDescription>View all enrollments for this training</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTrainingEnrollments ? (
                  <FullPageLoader message="Loading enrollments..." showLogo={false} />
                ) : trainingEnrollments.length === 0 ? (
                  <p className="text-gray-500">No enrollments found</p>
                ) : (
                  <div className="space-y-4">
                    {trainingEnrollments.map((enrollment: TrainingEnrollmentType) => (
                      <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Approvals (for HR/Manager) */}
          {(user?.role === "ADMIN" || user?.role === "HR" || user?.role === "MANAGER") && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Review and approve/reject enrollment requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPending ? (
                  <FullPageLoader message="Loading pending enrollments..." showLogo={false} />
                ) : pendingEnrollments.length === 0 ? (
                  <p className="text-gray-500">No pending enrollments</p>
                ) : (
                  <div className="space-y-4">
                    {pendingEnrollments.map((enrollment: TrainingEnrollmentType) => (
                      <EnrollmentCard
                        key={enrollment.id}
                        enrollment={enrollment}
                        onApprove={() => approveMutation.mutate(enrollment.id)}
                        onReject={() => {
                          const reason = prompt("Rejection reason (optional):")
                          rejectMutation.mutate({ id: enrollment.id, reason: reason || undefined })
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Training Attendance</h3>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Training</CardTitle>
              <CardDescription>Choose a training to manage attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a training" />
                </SelectTrigger>
                <SelectContent>
                  {trainings.map((training: Training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.title} - {new Date(training.startDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedTrainingId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                  <CardDescription>Generate QR code for attendance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qrCode ? (
                    <QRCodeDisplay
                      qrCode={qrCode}
                      qrCodeString={qrCodeString}
                      expiresAt={qrExpiresAt}
                      trainingTitle={selectedTrainingForAttendance?.title}
                    />
                  ) : (
                    <Button onClick={handleGenerateQR} className="w-full">
                      Generate QR Code
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance List</CardTitle>
                  <CardDescription>
                    View attendance and rate employee performance for this training.
                    {(user?.role === "ADMIN" || user?.role === "HR" || user?.role === "MANAGER") && (
                      <span className="block mt-1 text-sm text-blue-600">
                        You can manually update attendance status using the dropdown for technical issues.
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendanceTable 
                    attendanceList={attendanceTrainingList.map((item: any) => ({
                      ...item,
                      evaluation: item.evaluation || undefined
                    }))}
                    onRateEmployee={(enrollmentId, employeeName) => {
                      const attendanceItem = attendanceTrainingList.find((item: any) => item.enrollmentId === enrollmentId)
                      setSelectedEnrollmentForRating({
                        enrollmentId,
                        employeeName,
                        evaluation: attendanceItem?.evaluation
                      })
                      setIsEmployeeRatingModalOpen(true)
                    }}
                    onUpdateAttendance={(enrollmentId, attendanceId, status) => {
                      markAttendanceMutation.mutate({
                        enrollmentId,
                        attendanceId,
                        status: status as 'PRESENT' | 'LATE' | 'ABSENT'
                      })
                    }}
                    canManageAttendance={
                      (user?.role === "ADMIN" || user?.role === "HR" || user?.role === "MANAGER") && 
                      selectedTrainingId !== "" &&
                      selectedTrainingForAttendance &&
                      selectedTrainingForAttendance.status !== TrainingStatus.COMPLETED &&
                      selectedTrainingForAttendance.status !== TrainingStatus.CANCELLED
                    }
                  />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Training Reports</h3>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Training</CardTitle>
              <CardDescription>Choose a completed training to view reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportSearch">Search Training</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="reportSearch"
                    placeholder="Search by title or ID..."
                    className="pl-10"
                    value={reportSearchTerm}
                    onChange={(e) => setReportSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainingSelect">Completed Training</Label>
                <Select value={selectedTrainingForReport} onValueChange={setSelectedTrainingForReport}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a completed training" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCompletedTrainings.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        {reportSearchTerm ? "No trainings found" : "No completed trainings available"}
                      </div>
                    ) : (
                      filteredCompletedTrainings.map((training: Training) => (
                        <SelectItem key={training.id} value={training.id}>
                          {training.title} - {new Date(training.startDate).toLocaleDateString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedTrainingForReport && (
                <div className="text-sm text-gray-600">
                  <p>Selected: {filteredCompletedTrainings.find((t: Training) => t.id === selectedTrainingForReport)?.title}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="hours" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hours">Training Hours</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="competency">Competency Improvement</TabsTrigger>
            </TabsList>

            <TabsContent value="hours" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Training Hours Report</CardTitle>
                      <CardDescription>Total training hours per employee for selected training</CardDescription>
                    </div>
                    {selectedTrainingForReport && (
                      <Button onClick={() => handleExport("hours")}>Export</Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedTrainingForReport ? (
                    <div className="text-center py-8 text-gray-500">
                      Please select a completed training to view the report
                    </div>
                  ) : isLoadingHours ? (
                    <FullPageLoader message="Loading report..." showLogo={false} />
                  ) : hoursReport?.data?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No data available for this training
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Total Hours</TableHead>
                          <TableHead>Training Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hoursReport?.data?.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.employee.name}</TableCell>
                            <TableCell>{item.employee.department || "-"}</TableCell>
                            <TableCell>{item.totalHours.toFixed(2)}</TableCell>
                            <TableCell>{item.trainingCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Attendance Summary</CardTitle>
                      <CardDescription>Attendance statistics and details for selected training</CardDescription>
                    </div>
                    {selectedTrainingForReport && (
                      <Button onClick={() => handleExport("attendance")}>Export</Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedTrainingForReport ? (
                    <div className="text-center py-8 text-gray-500">
                      Please select a completed training to view the report
                    </div>
                  ) : isLoadingAttendanceReport ? (
                    <FullPageLoader message="Loading report..." showLogo={false} />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{attendanceReport?.summary?.total || 0}</div>
                            <p className="text-sm text-gray-500">Total</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{attendanceReport?.summary?.present || 0}</div>
                            <p className="text-sm text-gray-500">Present</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{attendanceReport?.summary?.late || 0}</div>
                            <p className="text-sm text-gray-500">Late</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{attendanceReport?.summary?.absent || 0}</div>
                            <p className="text-sm text-gray-500">Absent</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="text-sm text-gray-600">
                        Attendance Rate: {attendanceReport?.summary?.attendanceRate || "0.00"}%
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competency" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Competency Improvement</CardTitle>
                      <CardDescription>Track competency improvements from selected training</CardDescription>
                    </div>
                    {selectedTrainingForReport && (
                      <Button onClick={() => handleExport("competency")}>Export</Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedTrainingForReport ? (
                    <div className="text-center py-8 text-gray-500">
                      Please select a completed training to view the report
                    </div>
                  ) : isLoadingCompetencyReport ? (
                    <FullPageLoader message="Loading report..." showLogo={false} />
                  ) : competencyReport?.impacts?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No competency improvements recorded for this training
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Competency</TableHead>
                          <TableHead>Previous Level</TableHead>
                          <TableHead>New Level</TableHead>
                          <TableHead>Improvement</TableHead>
                          <TableHead>Performance Rating</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {competencyReport?.impacts?.map((impact: any) => (
                          <TableRow key={impact.id}>
                            <TableCell>{impact.employee?.name || "-"}</TableCell>
                            <TableCell>{impact.competency?.name || "-"}</TableCell>
                            <TableCell>{impact.previousLevel}</TableCell>
                            <TableCell>{impact.newLevel}</TableCell>
                            <TableCell className="text-green-600">+{impact.improvement}</TableCell>
                            <TableCell>
                              {impact.performanceRating ? (
                                <div className="flex items-center gap-1">
                                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{impact.performanceRating}/5</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Not rated</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Create Training Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create New Training</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new training event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Training title"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Training description"
                className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainingType" className="text-sm font-medium">
                  Training Type *
                </Label>
                <Select
                  value={createForm.trainingType}
                  onValueChange={(value) => setCreateForm({ ...createForm, trainingType: value as any })}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="ONSITE">Onsite</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationHours" className="text-sm font-medium">
                  Duration (Hours) *
                </Label>
                <Input
                  id="durationHours"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 8"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.durationHours}
                  onChange={(e) => setCreateForm({ ...createForm, durationHours: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-sm font-medium">
                  Max Participants *
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="e.g., 50"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.maxParticipants}
                  onChange={(e) => setCreateForm({ ...createForm, maxParticipants: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainerName" className="text-sm font-medium">
                  Trainer/Instructor
                </Label>
                <Input
                  id="trainerName"
                  placeholder="Enter trainer/instructor name"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.trainerName}
                  onChange={(e) => setCreateForm({ ...createForm, trainerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueName" className="text-sm font-medium">
                  Venue
                </Label>
                <Input
                  id="venueName"
                  placeholder="Enter venue name"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.venueName}
                  onChange={(e) => setCreateForm({ ...createForm, venueName: e.target.value })}
                />
              </div>
            </div>

            {/* Conditional fields based on training type */}
            {createForm.trainingType === 'ONLINE' && (
              <div className="space-y-2">
                <Label htmlFor="meetingLink" className="text-sm font-medium">
                  Meeting Link *
                </Label>
                <Input
                  id="meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={createForm.meetingLink}
                  onChange={(e) => setCreateForm({ ...createForm, meetingLink: e.target.value })}
                />
              </div>
            )}

            {createForm.trainingType === 'ONSITE' && (
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter full address"
                  className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                />
              </div>
            )}

            {createForm.trainingType === 'HYBRID' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="meetingLink" className="text-sm font-medium">
                    Meeting Link
                  </Label>
                  <Input
                    id="meetingLink"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    className="bg-white border-gray-300 text-gray-900 text-sm"
                    value={createForm.meetingLink}
                    onChange={(e) => setCreateForm({ ...createForm, meetingLink: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
                    value={createForm.address}
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tagged Competencies</Label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {competencies.map((comp: any) => (
                  <div key={comp.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={createForm.taggedCompetencies.includes(comp.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCreateForm({
                            ...createForm,
                            taggedCompetencies: [...createForm.taggedCompetencies, comp.id]
                          })
                        } else {
                          setCreateForm({
                            ...createForm,
                            taggedCompetencies: createForm.taggedCompetencies.filter(id => id !== comp.id)
                          })
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label className="text-sm">{comp.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              disabled={createMutation.isPending}
            >
              <Save size={16} className="mr-2" />
              {createMutation.isPending ? "Creating..." : "Create Training"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] min-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{selectedTraining?.title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              Detailed information about this training
            </DialogDescription>
          </DialogHeader>

          {selectedTraining && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="enrollments" className="text-xs sm:text-sm">
                  Enrollments
                </TabsTrigger>
                <TabsTrigger value="attendance" className="text-xs sm:text-sm">
                  Attendance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Training Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="text-gray-900">Training ID:</span> {selectedTraining.trainingId}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Type:</span> {selectedTraining.trainingType}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Start:</span> {new Date(selectedTraining.startDate).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">End:</span> {new Date(selectedTraining.endDate).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Duration:</span> {selectedTraining.durationHours} hours
                        </p>
                        {selectedTraining.venue && (
                          <p className="text-gray-600">
                            <span className="text-gray-900">Venue:</span> {selectedTraining.venue.name}
                          </p>
                        )}
                        {selectedTraining.trainer && (
                          <p className="text-gray-600">
                            <span className="text-gray-900">Trainer:</span> {selectedTraining.trainer.name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Enrollment Stats</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="text-gray-900">Capacity:</span> {selectedTraining.maxParticipants}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Enrolled:</span> {enrolledCount(selectedTraining)}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-900">Status:</span> {selectedTraining.status}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedTraining.description && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Description</h4>
                      <p className="text-sm text-gray-600">{selectedTraining.description}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="enrollments" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-sm">Employee</TableHead>
                        <TableHead className="text-gray-700 text-sm">Status</TableHead>
                        <TableHead className="text-gray-700 text-sm">Enrolled At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTraining.enrollments?.map((enrollment: any) => (
                        <TableRow key={enrollment.id} className="border-gray-200">
                          <TableCell>
                            <div>
                              <div className="text-gray-900 text-sm font-medium">{enrollment.employee?.name}</div>
                              <div className="text-gray-500 text-xs">{enrollment.employee?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={enrollment.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {enrollment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-sm">Employee</TableHead>
                        <TableHead className="text-gray-700 text-sm">Status</TableHead>
                        <TableHead className="text-gray-700 text-sm">Time In</TableHead>
                        <TableHead className="text-gray-700 text-sm">Time Out</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceList.map((item: any) => (
                        <TableRow key={item.enrollmentId} className="border-gray-200">
                          <TableCell>
                            <div>
                              <div className="text-gray-900 text-sm font-medium">{item.employee.name}</div>
                              <div className="text-gray-500 text-xs">{item.employee.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              item.attendance.status === 'PRESENT' ? 'bg-green-500' :
                              item.attendance.status === 'LATE' ? 'bg-yellow-500' : 'bg-red-500'
                            }>
                              {item.attendance.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {item.attendance.timeIn ? new Date(item.attendance.timeIn).toLocaleTimeString() : '-'}
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {item.attendance.timeOut ? new Date(item.attendance.timeOut).toLocaleTimeString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDetailsModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Training Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Training</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update training details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value as TrainingStatus })}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-trainingType" className="text-sm font-medium">
                  Training Type
                </Label>
                <Select
                  value={editForm.trainingType}
                  onValueChange={(value) => setEditForm({ ...editForm, trainingType: value as TrainingType })}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="ONSITE">Onsite</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="edit-startDate"
                  type="datetime-local"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate" className="text-sm font-medium">
                  End Date
                </Label>
                <Input
                  id="edit-endDate"
                  type="datetime-local"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-durationHours" className="text-sm font-medium">
                  Duration (Hours)
                </Label>
                <Input
                  id="edit-durationHours"
                  type="number"
                  step="0.5"
                  value={editForm.durationHours}
                  onChange={(e) => setEditForm({ ...editForm, durationHours: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxParticipants" className="text-sm font-medium">
                  Max Participants
                </Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={editForm.maxParticipants}
                  onChange={(e) => setEditForm({ ...editForm, maxParticipants: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-trainerName" className="text-sm font-medium">
                  Trainer/Instructor
                </Label>
                <Input
                  id="edit-trainerName"
                  placeholder="Enter trainer/instructor name"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={editForm.trainerName}
                  onChange={(e) => setEditForm({ ...editForm, trainerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-venueName" className="text-sm font-medium">
                  Venue
                </Label>
                <Input
                  id="edit-venueName"
                  placeholder="Enter venue name"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={editForm.venueName}
                  onChange={(e) => setEditForm({ ...editForm, venueName: e.target.value })}
                />
              </div>
            </div>

            {/* Conditional fields based on training type */}
            {editForm.trainingType === 'ONLINE' && (
              <div className="space-y-2">
                <Label htmlFor="edit-meetingLink" className="text-sm font-medium">
                  Meeting Link *
                </Label>
                <Input
                  id="edit-meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={editForm.meetingLink}
                  onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                />
              </div>
            )}

            {editForm.trainingType === 'ONSITE' && (
              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-sm font-medium">
                  Address *
                </Label>
                <Textarea
                  id="edit-address"
                  placeholder="Enter full address"
                  className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
            )}

            {editForm.trainingType === 'HYBRID' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-meetingLink" className="text-sm font-medium">
                    Meeting Link
                  </Label>
                  <Input
                    id="edit-meetingLink"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    className="bg-white border-gray-300 text-gray-900 text-sm"
                    value={editForm.meetingLink}
                    onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="edit-address"
                    placeholder="Enter full address"
                    className="bg-white border-gray-300 text-gray-900 text-sm min-h-[80px]"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              disabled={updateMutation.isPending}
            >
              <Save size={16} className="mr-2" />
              {updateMutation.isPending ? "Updating..." : "Update Training"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Employee Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enroll Employee</DialogTitle>
            <DialogDescription>Enroll an employee in a training</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Training</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search trainings..."
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={trainingSearchTerm}
                  onChange={(e) => setTrainingSearchTerm(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {trainings
                    .filter((t: Training) => {
                      const matchesSearch = trainingSearchTerm === "" || 
                        t.title.toLowerCase().includes(trainingSearchTerm.toLowerCase()) ||
                        t.trainingId.toLowerCase().includes(trainingSearchTerm.toLowerCase())
                      return matchesSearch
                    })
                    .map((training: Training) => (
                      <div
                        key={training.id}
                        onClick={() => setSelectedTrainingForEnrollment(training.id)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                          selectedTrainingForEnrollment === training.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{training.title}</div>
                        <div className="text-sm text-gray-500">
                          {training.trainingId} - {new Date(training.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Status: {training.status} | Type: {training.trainingType}
                        </div>
                      </div>
                    ))}
                  {trainings.filter((t: Training) => {
                    const matchesSearch = trainingSearchTerm === "" || 
                      t.title.toLowerCase().includes(trainingSearchTerm.toLowerCase()) ||
                      t.trainingId.toLowerCase().includes(trainingSearchTerm.toLowerCase())
                    return matchesSearch
                  }).length === 0 && (
                    <div className="p-3 text-gray-500 text-sm text-center">No trainings found</div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Employee</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search employees..."
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {employees
                    .filter((emp: any) => {
                      const matchesSearch = employeeSearchTerm === "" || 
                        emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                        emp.employeeId?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                        emp.department?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                      return matchesSearch
                    })
                    .map((emp: any) => (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                          selectedEmployeeId === emp.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-500">
                          {emp.employeeId} {emp.department ? `• ${emp.department}` : ''}
                        </div>
                      </div>
                    ))}
                  {employees.filter((emp: any) => {
                    const matchesSearch = employeeSearchTerm === "" || 
                      emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                      emp.employeeId?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                      emp.department?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                    return matchesSearch
                  }).length === 0 && (
                    <div className="p-3 text-gray-500 text-sm text-center">No employees found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEnrollModalOpen(false)
              setTrainingSearchTerm("")
              setEmployeeSearchTerm("")
              setSelectedTrainingForEnrollment("")
              setSelectedEmployeeId("")
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTrainingForEnrollment && selectedEmployeeId) {
                  enrollMutation.mutate({
                    trainingId: selectedTrainingForEnrollment,
                    employeeId: selectedEmployeeId
                  })
                } else {
                  toast.error("Please select both training and employee")
                }
              }}
              disabled={!selectedTrainingForEnrollment || !selectedEmployeeId}
            >
              Enroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Performance Rating Modal */}
      <Dialog open={isEmployeeRatingModalOpen} onOpenChange={setIsEmployeeRatingModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[95vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rate Employee Performance</DialogTitle>
            <DialogDescription>
              Rate {selectedEnrollmentForRating?.employeeName}'s performance and improvement during this training
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollmentForRating && (
            <>
              <EmployeePerformanceRatingForm
                onSubmit={(data) => {
                  submitEmployeeRatingMutation.mutate({
                    enrollmentId: selectedEnrollmentForRating.enrollmentId,
                    data
                  })
                }}
                initialData={selectedEnrollmentForRating.evaluation ? {
                  employeePerformanceRating: selectedEnrollmentForRating.evaluation.employeePerformanceRating,
                  employeeImprovementComments: selectedEnrollmentForRating.evaluation.employeeImprovementComments
                } : undefined}
                employeeName={selectedEnrollmentForRating.employeeName}
              />
              <div className="text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-1">Note:</p>
                <p className="text-blue-800">
                  Rating employee performance will update their competency levels based on their improvement during this training. 
                  This evaluation directly affects the employee's competency records.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

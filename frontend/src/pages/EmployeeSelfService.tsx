"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Briefcase,
  BookOpen,
  GraduationCap,
  Award,
  Bell,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  X,
  Eye,
  FileText,
  Download,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Camera,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import FullPageLoader from "@/components/FullpageLoader"
import {
  getESSDashboard,
  getCareerPath,
  getCareerPathDetails,
  enrollInCourse,
  enrollInTraining,
  getAchievements,
  uploadAchievement,
  getNotifications,
  markNotificationRead,
  getPerformanceSummary,
  ESSPerformanceSummaryResponse,
} from "@/api/ess"
import { getCourses, getCourseContent, markMaterialComplete, submitQuiz, getEmployeeEnrollments, updateEnrollmentProgress } from "@/api/learning"
import { getTrainings, getEmployeeTrainings, scanQRCode, getTrainingById, getTrainingEnrollments } from "@/api/training"
import { getCompetencies } from "@/api/competency"
import type {
  ESSDashboard,
  CareerPath,
  CareerPathDetails,
  AchievementUpload,
  Notification,
} from "@/types/ess"

type ActiveSection = "dashboard" | "career-path" | "learning" | "trainings" | "achievements" | "notifications" | "performance"

export default function EmployeeSelfService() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Determine active section from URL path
  const getActiveSection = (): ActiveSection => {
    const path = location.pathname
    if (path === "/ess" || path === "/ess/") return "dashboard"
    if (path.includes("/career-path")) return "career-path"
    if (path.includes("/learning")) return "learning"
    if (path.includes("/trainings")) return "trainings"
    if (path.includes("/achievements")) return "achievements"
    if (path.includes("/notifications")) return "notifications"
    if (path.includes("/performance")) return "performance"
    return "dashboard"
  }
  
  const activeSection: ActiveSection = getActiveSection()
  const [selectedTargetRole, setSelectedTargetRole] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCareerPathDetailsOpen, setIsCareerPathDetailsOpen] = useState(false)
  const [expandedEnrollmentId, setExpandedEnrollmentId] = useState<string | null>(null)
  const [courseContents, setCourseContents] = useState<Record<string, any>>({})
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [materialTimers, setMaterialTimers] = useState<Record<string, { startTime: number; elapsed: number; intervalId?: NodeJS.Timeout }>>({})
  const materialTimersRef = useRef(materialTimers)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const [selectedTrainingForQR, setSelectedTrainingForQR] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [selectedTrainingDetails, setSelectedTrainingDetails] = useState<string | null>(null)
  const [scannedQRData, setScannedQRData] = useState<string | null>(null)
  const [isAttendanceConfirmOpen, setIsAttendanceConfirmOpen] = useState(false)

  // Keep ref in sync with state
  useEffect(() => {
    materialTimersRef.current = materialTimers
  }, [materialTimers])

  // Reset quiz answers when quiz selection changes
  useEffect(() => {
    if (selectedQuizId) {
      setQuizAnswers({})
    }
  }, [selectedQuizId])

  // Redirect to dashboard if on base /ess path
  useEffect(() => {
    if (location.pathname === "/ess" || location.pathname === "/ess/") {
      navigate("/ess", { replace: true })
    }
  }, [location.pathname, navigate])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      // Use ref to access latest timers without causing effect to re-run
      Object.values(materialTimersRef.current).forEach((timer) => {
        if (timer.intervalId) {
          clearInterval(timer.intervalId)
        }
      })
    }
  }, [])

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  // Achievement upload form
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    competencyId: "",
    file: null as File | null,
  })

  // Notification filters
  const [notificationFilters, setNotificationFilters] = useState({
    isRead: undefined as boolean | undefined,
    type: "",
  })

  // Dashboard query
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["ess-dashboard"],
    queryFn: getESSDashboard,
  })

  // Career path query
  const { data: careerPathData, isLoading: isCareerPathLoading } = useQuery({
    queryKey: ["ess-career-path"],
    queryFn: getCareerPath,
    enabled: activeSection === "career-path",
  })

  // Career path details query
  const { data: careerPathDetails, isLoading: isCareerPathDetailsLoading } = useQuery({
    queryKey: ["ess-career-path-details", selectedTargetRole],
    queryFn: () => getCareerPathDetails(selectedTargetRole!),
    enabled: !!selectedTargetRole && isCareerPathDetailsOpen,
  })

  // All enrollments query (for enrolled courses section)
  const { data: allEnrollmentsData } = useQuery({
    queryKey: ["employee-enrollments", dashboardData?.employee?.id],
    queryFn: () => getEmployeeEnrollments(dashboardData!.employee.id),
    enabled: !!dashboardData?.employee?.id && activeSection === "learning",
  })

  // Available courses query (PUBLISHED status)
  const { data: availableCoursesData } = useQuery({
    queryKey: ["available-courses"],
    queryFn: () => getCourses({ status: "PUBLISHED", limit: 100 }),
    enabled: activeSection === "learning",
  })

  // Course content query (for expanded enrollments)
  const { data: courseContentData, isLoading: isCourseContentLoading, refetch: refetchCourseContent } = useQuery({
    queryKey: ["course-content", expandedEnrollmentId],
    queryFn: () => getCourseContent(expandedEnrollmentId!),
    enabled: !!expandedEnrollmentId && activeSection === "learning",
  })

  // Update course contents when data is fetched
  useEffect(() => {
    if (courseContentData && expandedEnrollmentId) {
      setCourseContents((prev) => ({
        ...prev,
        [expandedEnrollmentId]: courseContentData,
      }))
    }
  }, [courseContentData, expandedEnrollmentId])

  // Available trainings query (OPEN status)
  const { data: availableTrainingsData } = useQuery({
    queryKey: ["available-trainings"],
    queryFn: () => getTrainings({ status: "OPEN" }),
    enabled: activeSection === "trainings",
  })

  // Employee training enrollments query (for trainings section and calendar)
  const { data: employeeTrainingsData, isLoading: isLoadingEmployeeTrainings } = useQuery({
    queryKey: ["employee-trainings", dashboardData?.employee?.id],
    queryFn: () => getEmployeeTrainings(dashboardData!.employee.id, { limit: 100 }),
    enabled: !!dashboardData?.employee?.id,
  })

  // Training details query
  const { data: trainingDetails } = useQuery({
    queryKey: ["training-details", selectedTrainingDetails],
    queryFn: () => getTrainingById(selectedTrainingDetails!),
    enabled: !!selectedTrainingDetails,
  })

  // Also fetch training details when scanning QR (to show in confirmation)
  const { data: scannedTrainingDetails } = useQuery({
    queryKey: ["training-details", selectedTrainingForQR],
    queryFn: () => getTrainingById(selectedTrainingForQR!),
    enabled: !!selectedTrainingForQR && isAttendanceConfirmOpen,
  })

  // Training enrollments query (for participants list)
  const { data: trainingEnrollmentsData } = useQuery({
    queryKey: ["training-enrollments", selectedTrainingDetails],
    queryFn: () => getTrainingEnrollments(selectedTrainingDetails!, { limit: 100 }),
    enabled: !!selectedTrainingDetails,
  })

  // Competencies query (for achievement upload)
  const { data: competencies = [] } = useQuery({
    queryKey: ["competencies"],
    queryFn: () => getCompetencies(),
    enabled: isUploadModalOpen,
  })

  // Achievements query (for achievements section)
  const { data: achievementsData, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ["ess-achievements", dashboardData?.employee?.id],
    queryFn: () => getAchievements({ status: "Approved", limit: 100 }), // Only show approved achievements
    enabled: !!dashboardData?.employee?.id && activeSection === "achievements",
  })

  // Notifications query
  const { data: notificationsData, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["ess-notifications", notificationFilters],
    queryFn: () => getNotifications(notificationFilters),
    enabled: activeSection === "notifications",
  })

  // Performance summary query
  const { data: performanceSummaryData, isLoading: isPerformanceSummaryLoading } = useQuery({
    queryKey: ["ess-performance-summary"],
    queryFn: getPerformanceSummary,
    enabled: activeSection === "performance",
  })

  // Enroll in course mutation
  const enrollCourseMutation = useMutation({
    mutationFn: enrollInCourse,
    onSuccess: () => {
      toast.success("Successfully enrolled in course!")
      queryClient.invalidateQueries({ queryKey: ["ess-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["available-courses"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enroll in course")
    },
  })

  // Enroll in training mutation
  const enrollTrainingMutation = useMutation({
    mutationFn: enrollInTraining,
    onSuccess: () => {
      toast.success("Training enrollment request submitted. Awaiting approval.")
      queryClient.invalidateQueries({ queryKey: ["ess-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["available-trainings"] })
      queryClient.invalidateQueries({ queryKey: ["employee-trainings"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enroll in training")
    },
  })

  // Upload achievement mutation
  const uploadAchievementMutation = useMutation({
    mutationFn: ({ file, data }: { file: File; data: { title: string; description?: string; competencyId?: string } }) =>
      uploadAchievement(file, data),
    onSuccess: () => {
      toast.success("Achievement uploaded successfully. Awaiting HR/Manager approval.")
      setIsUploadModalOpen(false)
      setUploadForm({ title: "", description: "", competencyId: "", file: null })
      queryClient.invalidateQueries({ queryKey: ["ess-achievements"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload achievement")
    },
  })

  // Mark notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-notifications"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark notification as read")
    },
  })

  // Start course mutation
  const startCourseMutation = useMutation({
    mutationFn: (enrollmentId: string) => updateEnrollmentProgress(enrollmentId),
    onSuccess: async (_, enrollmentId) => {
      toast.success("Course started!")
      
      // Invalidate and refetch enrollment data first
      await queryClient.invalidateQueries({ queryKey: ["employee-enrollments"] })
      await queryClient.invalidateQueries({ queryKey: ["ess-dashboard"] })
      await queryClient.invalidateQueries({ queryKey: ["all-enrollments"] })
      await queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      
      // Expand the course section to trigger content fetch
      setExpandedEnrollmentId(enrollmentId)
      
      // Wait a bit for the expansion state to update, then invalidate and refetch content
      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ["course-content", enrollmentId] })
        await queryClient.refetchQueries({ queryKey: ["course-content", enrollmentId] })
      }, 300)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start course")
    },
  })

  // Mark material as complete mutation
  const markMaterialCompleteMutation = useMutation({
    mutationFn: ({ materialId, enrollmentId, timeSpent }: { materialId: string; enrollmentId: string; timeSpent: number }) =>
      markMaterialComplete(materialId, enrollmentId, timeSpent),
    onSuccess: (_, variables) => {
      // Stop timer for this material
      if (materialTimers[variables.materialId]?.intervalId) {
        clearInterval(materialTimers[variables.materialId].intervalId)
      }
      setMaterialTimers((prev) => {
        const newTimers = { ...prev }
        delete newTimers[variables.materialId]
        return newTimers
      })
      setSelectedMaterialId(null)
      toast.success("Material marked as complete!")
      queryClient.invalidateQueries({ queryKey: ["course-content", variables.enrollmentId] })
      queryClient.invalidateQueries({ queryKey: ["ess-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["employee-enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["all-enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["enrollmentDetails"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark material as complete")
    },
  })

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: ({ quizId, enrollmentId, answers }: { quizId: string; enrollmentId: string; answers: Array<{ questionId: string; answer: string }> }) =>
      submitQuiz(quizId, enrollmentId, answers),
    onSuccess: (_, variables) => {
      toast.success("Quiz submitted successfully!")
      setSelectedQuizId(null)
      setQuizAnswers({})
      queryClient.invalidateQueries({ queryKey: ["course-content", variables.enrollmentId] })
      queryClient.invalidateQueries({ queryKey: ["ess-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["enrollmentDetails"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit quiz")
    },
  })

  // Scan QR code mutation (validates QR code)
  const validateQRCodeMutation = useMutation({
    mutationFn: ({ trainingId, qrData }: { trainingId: string; qrData: string }) =>
      scanQRCode(trainingId, dashboardData!.employee.id, qrData),
    onSuccess: () => {
      // QR code is valid, show confirmation dialog
      setIsQRScannerOpen(false)
      setIsAttendanceConfirmOpen(true)
      stopQRScanner()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid QR code or QR code expired")
      setScannedQRData(null)
    },
  })

  // Mark attendance mutation (after confirmation)
  const markAttendanceMutation = useMutation({
    mutationFn: ({ trainingId, qrData }: { trainingId: string; qrData: string }) =>
      scanQRCode(trainingId, dashboardData!.employee.id, qrData),
    onSuccess: () => {
      toast.success("Attendance marked successfully!")
      setIsAttendanceConfirmOpen(false)
      setSelectedTrainingForQR(null)
      setScannedQRData(null)
      queryClient.invalidateQueries({ queryKey: ["employee-trainings"] })
      queryClient.invalidateQueries({ queryKey: ["ess-dashboard"] })
      if (selectedTrainingDetails) {
        queryClient.invalidateQueries({ queryKey: ["training-details", selectedTrainingDetails] })
        queryClient.invalidateQueries({ queryKey: ["training-enrollments", selectedTrainingDetails] })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark attendance")
    },
  })

  const handleEnrollCourse = (courseId: string) => {
    enrollCourseMutation.mutate(courseId)
  }

  const handleEnrollTraining = (trainingId: string) => {
    enrollTrainingMutation.mutate(trainingId)
  }

  // QR Scanner functions
  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      toast.error("Failed to access camera. Please check permissions.")
      console.error("Camera access error:", error)
    }
  }

  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleQRScan = (qrData: string) => {
    if (selectedTrainingForQR) {
      setScannedQRData(qrData)
      // Validate the QR code first
      validateQRCodeMutation.mutate({
        trainingId: selectedTrainingForQR,
        qrData,
      })
    }
  }

  const handleConfirmAttendance = () => {
    if (selectedTrainingForQR && scannedQRData) {
      markAttendanceMutation.mutate({
        trainingId: selectedTrainingForQR,
        qrData: scannedQRData,
      })
    }
  }

  // QR Code scanning using HTML5 QR Code library or manual input
  useEffect(() => {
    if (isQRScannerOpen && videoRef.current) {
      startQRScanner()
      
      // Simple QR code detection using canvas (basic implementation)
      // For production, consider using a library like html5-qrcode
      const scanInterval = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const canvas = document.createElement('canvas')
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx && videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
            // Note: This is a placeholder - you'd need a QR code library for actual scanning
            // For now, we'll provide a manual input option
          }
        }
      }, 1000)

      return () => {
        clearInterval(scanInterval)
        stopQRScanner()
      }
    } else {
      stopQRScanner()
    }
  }, [isQRScannerOpen])

  const handleUploadAchievement = () => {
    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast.error("Please select a file and enter a title")
      return
    }

    uploadAchievementMutation.mutate({
      file: uploadForm.file,
      data: {
        title: uploadForm.title,
        description: uploadForm.description || undefined,
        competencyId: uploadForm.competencyId || undefined,
      },
    })
  }

  const handleViewCareerPathDetails = (jobRoleId: string) => {
    setSelectedTargetRole(jobRoleId)
    setIsCareerPathDetailsOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed")
        return
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }
      setUploadForm({ ...uploadForm, file })
    }
  }

  if (isDashboardLoading && activeSection === "dashboard") {
    return <FullPageLoader message="Loading dashboard..." showLogo={true} />
  }

  const dashboard: ESSDashboard | undefined = dashboardData
  const careerPath: CareerPath | undefined = careerPathData
  const notifications = notificationsData?.notifications || []
  const availableCourses = availableCoursesData?.courses || []
  const availableTrainings = availableTrainingsData?.trainings || []

  // Get enrolled course IDs from all enrollments
  const enrolledCourseIds = new Set(
    allEnrollmentsData?.map((enrollment: any) => enrollment.courseId || enrollment.course?.id) || 
    dashboard?.ongoingCourses.map((oc) => oc.courseId) || 
    []
  )

  // Filter out enrolled courses from available courses
  const filteredAvailableCourses = availableCourses.filter(
    (course: any) => !enrolledCourseIds.has(course.id)
  )

  // Filter out enrolled courses from recommended courses
  const filteredRecommendedCourses = (dashboard?.recommendedCourses || []).filter(
    (course) => !course.isEnrolled && !enrolledCourseIds.has(course.id)
  )

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard()
      case "career-path":
        return renderCareerPath()
      case "learning":
        return renderLearning()
      case "trainings":
        return renderTrainings()
      case "achievements":
        return renderAchievements()
      case "notifications":
        return renderNotifications()
      case "performance":
        return renderPerformance()
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => {
    // Prepare training events for calendar
    const trainingEvents: Record<string, Array<{ title: string; type: 'ongoing' | 'upcoming' | 'enrolled'; status: string }>> = {}
    
    if (dashboard) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to compare dates only
      
      // Add ongoing trainings (only if end date hasn't passed)
      dashboard.ongoingTrainings.forEach((training) => {
        const startDate = new Date(training.startDate)
        const endDate = new Date(training.endDate)
        endDate.setHours(0, 0, 0, 0)
        
        // Only show if end date hasn't passed
        if (endDate >= today) {
          const currentDate = new Date(startDate)
          
          // Only show dates from today onwards
          if (currentDate < today) {
            currentDate.setTime(today.getTime())
          }
          
          while (currentDate <= endDate) {
            const dateKey = formatDateKey(new Date(currentDate))
            if (!trainingEvents[dateKey]) {
              trainingEvents[dateKey] = []
            }
            trainingEvents[dateKey].push({
              title: training.trainingTitle,
              type: 'ongoing',
              status: training.status,
            })
            currentDate.setDate(currentDate.getDate() + 1)
          }
        }
      })

      // Add recommended/upcoming trainings (only if they're OPEN or ONGOING and end date hasn't passed)
      dashboard.recommendedTrainings.forEach((training) => {
        const startDate = new Date(training.startDate)
        const endDate = new Date(training.endDate)
        endDate.setHours(0, 0, 0, 0)
        
        // Only show if end date hasn't passed (recommended trainings are typically OPEN status)
        if (endDate >= today) {
          const currentDate = new Date(startDate)
          
          // Only show dates from today onwards
          if (currentDate < today) {
            currentDate.setTime(today.getTime())
          }
          
          while (currentDate <= endDate) {
            const dateKey = formatDateKey(new Date(currentDate))
            if (!trainingEvents[dateKey]) {
              trainingEvents[dateKey] = []
            }
            // Only add if not already in ongoing
            const existing = trainingEvents[dateKey]?.find(e => e.title === training.title)
            if (!existing) {
              trainingEvents[dateKey].push({
                title: training.title,
                type: 'upcoming',
                status: 'OPEN',
              })
            }
            currentDate.setDate(currentDate.getDate() + 1)
          }
        }
      })
    }

    // Add all enrolled trainings from employee trainings data
    // Only show OPEN and ONGOING trainings that haven't ended yet
    if (employeeTrainingsData?.enrollments) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to compare dates only
      
      employeeTrainingsData.enrollments.forEach((enrollment: any) => {
        if (enrollment.training && enrollment.status === 'APPROVED') {
          const trainingStatus = enrollment.training.status
          const endDate = new Date(enrollment.training.endDate)
          endDate.setHours(0, 0, 0, 0)
          
          // Only add if status is OPEN or ONGOING and end date hasn't passed
          if ((trainingStatus === 'OPEN' || trainingStatus === 'ONGOING') && endDate >= today) {
            const startDate = new Date(enrollment.training.startDate)
            const currentDate = new Date(startDate)
            
            // Only show dates from today onwards (don't show past dates)
            if (currentDate < today) {
              currentDate.setTime(today.getTime())
            }
            
            while (currentDate <= endDate) {
              const dateKey = formatDateKey(new Date(currentDate))
              if (!trainingEvents[dateKey]) {
                trainingEvents[dateKey] = []
              }
              // Only add if not already added
              const existing = trainingEvents[dateKey]?.find(e => e.title === enrollment.training.title)
              if (!existing) {
                // Determine event type based on training status
                let eventType: 'ongoing' | 'upcoming' | 'enrolled' = 'enrolled'
                if (trainingStatus === 'ONGOING') {
                  eventType = 'ongoing'
                } else if (trainingStatus === 'OPEN') {
                  eventType = 'enrolled'
                }
                
                trainingEvents[dateKey].push({
                  title: enrollment.training.title,
                  type: eventType,
                  status: trainingStatus,
                })
              }
              currentDate.setDate(currentDate.getDate() + 1)
            }
          }
        }
      })
    }

    const currentMonth = calendarDate.getMonth()
    const currentYear = calendarDate.getFullYear()
    const daysInMonth = getDaysInMonth(calendarDate)
    const firstDay = getFirstDayOfMonth(calendarDate)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    const navigateMonth = (direction: 'prev' | 'next') => {
      setCalendarDate(prev => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
        return newDate
      })
    }

    return (
      <div className="space-y-6">
          {dashboard && (
            <>
              {/* Top Section: Summary Cards and Calendar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Summary Cards - Left Side */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Competency Score</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboard.competencyScores.length > 0
                        ? Math.round(
                            dashboard.competencyScores.reduce((sum, cs) => sum + (cs.finalScore || 0), 0) /
                              dashboard.competencyScores.length
                          )
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.competencyScores.length} competencies
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.gapSummary.totalGaps}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.gapSummary.criticalGaps} critical
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ongoing Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.ongoingCourses.length}</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Succession Readiness</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboard.succession?.readinessScore !== null && dashboard.succession?.readinessScore !== undefined
                        ? `${dashboard.succession.readinessScore.toFixed(1)}%` 
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.succession?.talentPools?.length || 0} succession roles
                    </p>
                  </CardContent>
                </Card>
                </div>

                {/* Calendar - Right Side */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Training Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => navigateMonth('prev')}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <h4 className="text-sm font-semibold">
                          {monthNames[currentMonth]} {currentYear}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => navigateMonth('next')}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Calendar Grid - Compact */}
                      <div className="border rounded overflow-hidden">
                        {/* Week Days Header */}
                        <div className="grid grid-cols-7 bg-gray-50 border-b">
                          {weekDays.map((day) => (
                            <div key={day} className="p-1 text-center text-xs font-medium text-gray-600">
                              {day.charAt(0)}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 text-xs">
                          {/* Empty cells for days before month starts */}
                          {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[40px] border-r border-b border-gray-200" />
                          ))}

                          {/* Days of the month */}
                          {days.map((day) => {
                            const date = new Date(currentYear, currentMonth, day)
                            const dateKey = formatDateKey(date)
                            const events = trainingEvents[dateKey] || []
                            const isToday = 
                              date.getDate() === new Date().getDate() &&
                              date.getMonth() === new Date().getMonth() &&
                              date.getFullYear() === new Date().getFullYear()
                            const hasTrainings = events.length > 0

                            return (
                              <div
                                key={day}
                                className={`min-h-[40px] border-r border-b border-gray-200 p-0.5 ${
                                  isToday ? 'bg-blue-50' : ''
                                } ${hasTrainings ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                                onClick={() => {
                                  if (hasTrainings) {
                                    navigate('/ess/trainings')
                                  }
                                }}
                                title={hasTrainings ? `Click to view ${events.length} training${events.length > 1 ? 's' : ''} on this date` : ''}
                              >
                                <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-blue-600' : ''}`}>
                                  {day}
                                </div>
                                {hasTrainings && (
                                  <div className="space-y-0.5">
                                    {events.slice(0, 2).map((event, idx) => (
                                      <div
                                        key={idx}
                                        className={`text-[9px] px-1 py-0.5 rounded truncate ${
                                          event.type === 'ongoing'
                                            ? 'bg-green-100 text-green-800'
                                            : event.type === 'enrolled'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}
                                        title={event.title}
                                      >
                                        {event.title.length > 12 ? event.title.substring(0, 10) + '...' : event.title}
                                      </div>
                                    ))}
                                    {events.length > 2 && (
                                      <div className="text-[9px] text-gray-500 px-1">
                                        +{events.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Compact Legend */}
                      <div className="flex items-center gap-2 text-[10px] pt-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded bg-green-100 border border-green-300" />
                          <span>Ongoing</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded bg-purple-100 border border-purple-300" />
                          <span>Open/Enrolled</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded bg-blue-100 border border-blue-300" />
                          <span>Other</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Competency Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Competency Scores</CardTitle>
                  <CardDescription>Your current competency levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.competencyScores.length > 0 ? (
                      dashboard.competencyScores.map((cs) => (
                        <div key={cs.competencyId} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{cs.competencyName}</p>
                              <p className="text-sm text-gray-500">{cs.categoryName}</p>
                            </div>
                            <Badge variant={cs.finalScore && cs.finalScore >= 70 ? "default" : "secondary"}>
                              {cs.finalScore?.toFixed(1) || "Not Rated"}
                            </Badge>
                          </div>
                          {cs.finalScore && (
                            <Progress value={cs.finalScore} className="h-2" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No competency scores available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gap Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Gap Analysis</CardTitle>
                  <CardDescription>Competencies that need improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.gapSummary.gaps.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competency</TableHead>
                          <TableHead>Required Level</TableHead>
                          <TableHead>Current Level</TableHead>
                          <TableHead>Gap</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboard.gapSummary.gaps.map((gap) => (
                          <TableRow key={gap.competencyId}>
                            <TableCell className="font-medium">{gap.competencyName}</TableCell>
                            <TableCell>{gap.requiredLevel}</TableCell>
                            <TableCell>{gap.currentLevel}</TableCell>
                            <TableCell>
                              <Badge variant={gap.gap > 2 ? "destructive" : gap.gap === 2 ? "default" : "secondary"}>
                                {gap.gap > 0 ? `+${gap.gap}` : gap.gap}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No skill gaps identified</p>
                  )}
                </CardContent>
              </Card>

              {/* Succession Readiness */}
              {dashboard.succession && (dashboard.succession.talentPools.length > 0 || dashboard.succession.idps.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Succession Readiness
                    </CardTitle>
                    <CardDescription>Your status in the succession planning pipeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Talent Pools */}
                      {dashboard.succession.talentPools.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Target Roles
                          </h4>
                          <div className="space-y-3">
                            {dashboard.succession.talentPools.map((tp) => (
                              <div key={tp.id} className="p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{tp.roleName}</span>
                                  <Badge className={
                                    tp.readinessStatus === 'READY_NOW' ? 'bg-green-100 text-green-800' :
                                    tp.readinessStatus === 'READY_6_MONTHS' ? 'bg-blue-100 text-blue-800' :
                                    tp.readinessStatus === 'READY_1_YEAR' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {tp.readinessStatus === 'READY_NOW' ? 'Ready Now' :
                                     tp.readinessStatus === 'READY_6_MONTHS' ? 'Ready in 6 Months' :
                                     tp.readinessStatus === 'READY_1_YEAR' ? 'Ready in 1 Year' :
                                     'Not Ready'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={tp.overallScore || 0} className="flex-1 h-2" />
                                  <span className="text-sm font-medium">
                                    {tp.overallScore?.toFixed(1) || 0}%
                                  </span>
                                </div>
                                {tp.riskLevel && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Risk: <span className={
                                      tp.riskLevel === 'CRITICAL' || tp.riskLevel === 'HIGH' ? 'text-red-600' :
                                      tp.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                                    }>{tp.riskLevel}</span>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* IDPs */}
                      {dashboard.succession.idps.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Development Plans
                          </h4>
                          <div className="space-y-3">
                            {dashboard.succession.idps.map((idp) => (
                              <div key={idp.id} className="p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{idp.targetRoleName}</span>
                                  <Badge variant={idp.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {idp.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Progress value={idp.progress} className="flex-1 h-2" />
                                  <span className="text-sm font-medium">{idp.progress.toFixed(0)}%</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {idp.completedGoals} / {idp.totalGoals} goals completed
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ongoing Courses & Trainings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ongoing Courses</CardTitle>
                    <CardDescription>Courses you're currently taking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboard.ongoingCourses.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.ongoingCourses.map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{course.courseTitle}</p>
                              <Progress value={course.completionPercentage} className="mt-2 h-2" />
                              <p className="text-sm text-gray-500 mt-1">
                                {course.completionPercentage.toFixed(0)}% complete
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No ongoing courses</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ongoing Trainings</CardTitle>
                    <CardDescription>Trainings you're enrolled in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboard.ongoingTrainings.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.ongoingTrainings.map((training) => (
                          <div key={training.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{training.trainingTitle}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(training.startDate).toLocaleDateString()} -{" "}
                              {new Date(training.endDate).toLocaleDateString()}
                            </p>
                            <Badge className="mt-2">{training.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No ongoing trainings</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Courses & Trainings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Courses</CardTitle>
                    <CardDescription>Based on your skill gaps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboard.recommendedCourses.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.recommendedCourses.slice(0, 5).map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-gray-500">{course.estimatedHours} hours</p>
                            </div>
                            {course.isEnrolled && <Badge>Enrolled</Badge>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recommended courses</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Trainings</CardTitle>
                    <CardDescription>Based on your skill gaps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboard.recommendedTrainings.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.recommendedTrainings.slice(0, 5).map((training) => (
                          <div key={training.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{training.title}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {training.durationHours} hours • {training.trainingType}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recommended trainings</p>
                    )}
                  </CardContent>
                </Card>
              </div>

            </>
          )}
      </div>
    )
  }

  const renderCareerPath = () => {
    return (
      <div className="space-y-6">
          {isCareerPathLoading ? (
            <FullPageLoader message="Loading career path..." showLogo={true} />
          ) : careerPath ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Current Position</CardTitle>
                </CardHeader>
                <CardContent>
                  {careerPath.currentJobRole ? (
                    <div>
                      <p className="text-2xl font-bold">{careerPath.currentJobRole.name}</p>
                      {careerPath.currentJobRole.description && (
                        <p className="text-gray-600 mt-2">{careerPath.currentJobRole.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No current job role assigned</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Potential Next Roles</CardTitle>
                  <CardDescription>Career progression opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  {careerPath.careerPaths.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Role</TableHead>
                          <TableHead>Readiness</TableHead>
                          <TableHead>Competencies Met</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {careerPath.careerPaths.map((path) => (
                          <TableRow key={path.jobRoleId}>
                            <TableCell className="font-medium">{path.jobRoleName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={path.readinessScore} className="w-24 h-2" />
                                <span className="text-sm font-medium">{path.readinessScore}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {path.competenciesMet} / {path.competenciesTotal}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCareerPathDetails(path.jobRoleId)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No potential next roles found</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
      </div>
    )
  }

  const handleExpandEnrollment = (enrollmentId: string) => {
    if (expandedEnrollmentId === enrollmentId) {
      setExpandedEnrollmentId(null)
    } else {
      setExpandedEnrollmentId(enrollmentId)
      // Invalidate and refetch course content to ensure it's up to date
      queryClient.invalidateQueries({ queryKey: ["course-content", enrollmentId] })
    }
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Start timer for a material
  const startMaterialTimer = (materialId: string) => {
    if (materialTimers[materialId]) {
      return // Timer already running
    }

    const startTime = Date.now() - (materialTimers[materialId]?.elapsed || 0)
    const intervalId = setInterval(() => {
      setMaterialTimers((prev) => ({
        ...prev,
        [materialId]: {
          startTime: prev[materialId]?.startTime || startTime,
          elapsed: Date.now() - (prev[materialId]?.startTime || startTime),
          intervalId: prev[materialId]?.intervalId || intervalId,
        },
      }))
    }, 1000) // Update every second

    setMaterialTimers((prev) => ({
      ...prev,
      [materialId]: {
        startTime,
        elapsed: 0,
        intervalId,
      },
    }))
  }

  // Stop timer for a material
  const stopMaterialTimer = (materialId: string) => {
    if (materialTimers[materialId]?.intervalId) {
      clearInterval(materialTimers[materialId].intervalId)
    }
    setMaterialTimers((prev) => {
      const newTimers = { ...prev }
      if (newTimers[materialId]) {
        delete newTimers[materialId].intervalId
      }
      return newTimers
    })
  }

  // Format time in minutes:seconds
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleStartCourse = (enrollmentId: string) => {
    startCourseMutation.mutate(enrollmentId)
  }

  const handleViewMaterial = (material: any, enrollment: any) => {
    setSelectedMaterialId(material.id)
    startMaterialTimer(material.id)
  }

  const handleCloseMaterial = (materialId: string) => {
    stopMaterialTimer(materialId)
    setSelectedMaterialId(null)
  }

  const handleMarkMaterialComplete = (materialId: string, enrollmentId: string, course: any, materials: any[]) => {
    // Calculate required time per material (in minutes)
    const totalMaterials = materials.length
    const courseDurationMinutes = course.duration || (course.estimatedHours * 60) || 0
    const requiredTimePerMaterial = courseDurationMinutes / totalMaterials || 1 // Minimum 1 minute

    const elapsedMinutes = Math.floor((materialTimers[materialId]?.elapsed || 0) / 60000)

    if (elapsedMinutes < requiredTimePerMaterial) {
      toast.error(`You need to spend at least ${Math.ceil(requiredTimePerMaterial)} minutes on this material. Current time: ${elapsedMinutes} minutes`)
      return
    }

    markMaterialCompleteMutation.mutate({
      materialId,
      enrollmentId,
      timeSpent: elapsedMinutes,
    })
  }

  const handleQuizAnswerChange = (questionId: string, answer: string) => {
    const trimmedAnswer = String(answer).trim()
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: trimmedAnswer,
    }))
  }

  const handleSubmitQuiz = (quizId: string, enrollmentId: string) => {
    const answers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }))
    submitQuizMutation.mutate({ quizId, enrollmentId, answers })
  }

  const renderLearning = () => {
    // Use all enrollments if available, otherwise fall back to ongoingCourses from dashboard
    const allEnrollments = allEnrollmentsData || []
    const enrolledCourses = allEnrollments.length > 0 
      ? allEnrollments.map((enrollment: any) => ({
          id: enrollment.id,
          courseId: enrollment.courseId || enrollment.course?.id,
          courseTitle: enrollment.course?.title || enrollment.courseTitle || "Unknown Course",
          status: enrollment.status,
          completionPercentage: enrollment.completionPercentage || 0,
          enrolledAt: enrollment.enrolledAt,
        }))
      : (dashboard?.ongoingCourses || []).map((oc: any) => ({
          id: oc.id,
          courseId: oc.courseId,
          courseTitle: oc.courseTitle,
          status: oc.status,
          completionPercentage: oc.completionPercentage || 0,
          enrolledAt: oc.enrolledAt,
        }))

    return (
      <div className="space-y-6">
        {/* Enrolled Courses Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Enrolled Courses</CardTitle>
            <CardDescription>Continue learning from your enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map((enrollment) => {
                  const isExpanded = expandedEnrollmentId === enrollment.id
                  const content = courseContents[enrollment.id]
                  const materials = content?.course?.materials || []
                  const quizzes = content?.course?.quizzes || []
                  const progressRecords = content?.progressRecords || []
                  const quizAttempts = content?.quizAttempts || []
                  const completedMaterialIds = progressRecords
                    .filter((pr: any) => pr.materialId && pr.completed)
                    .map((pr: any) => pr.materialId)
                  const canTakeQuiz = enrollment.status !== "NOT_STARTED" && materials.length > 0 && completedMaterialIds.length === materials.length

                  return (
                    <div key={enrollment.id} className="border rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <p className="font-medium">{enrollment.courseTitle}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Progress value={enrollment.completionPercentage} className="w-48 h-2" />
                            <span className="text-sm text-gray-500">
                              {enrollment.completionPercentage.toFixed(0)}% complete
                            </span>
                            <Badge variant={enrollment.status === "COMPLETED" ? "default" : "secondary"}>
                              {enrollment.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleExpandEnrollment(enrollment.id)}
                        >
                          {isExpanded ? "Hide Details" : "View Course"}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="border-t p-4 space-y-4">
                          {isCourseContentLoading && expandedEnrollmentId === enrollment.id ? (
                            <div className="text-center py-4">
                              <p className="text-gray-500">Loading course content...</p>
                            </div>
                          ) : (
                            <>
                              {/* Start Course Button */}
                              {enrollment.status === "NOT_STARTED" && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-sm text-gray-700 mb-3">
                                    You need to start this course before accessing the materials.
                                  </p>
                                  <Button
                                    onClick={() => handleStartCourse(enrollment.id)}
                                    disabled={startCourseMutation.isPending}
                                  >
                                    {startCourseMutation.isPending ? "Starting..." : "Start Course"}
                                  </Button>
                                </div>
                              )}

                              {/* Course Materials */}
                              {enrollment.status !== "NOT_STARTED" && (
                                <>
                                  {isCourseContentLoading && expandedEnrollmentId === enrollment.id ? (
                                    <div className="text-center py-4">
                                      <p className="text-gray-500">Loading course materials...</p>
                                    </div>
                                  ) : materials.length > 0 ? (
                                    <div>
                                      <h4 className="font-medium mb-3">Course Materials</h4>
                                      <div className="space-y-2">
                                        {materials.map((material: any, index: number) => {
                                      const isCompleted = completedMaterialIds.includes(material.id)
                                      const canAccess = index === 0 || completedMaterialIds.includes(materials[index - 1]?.id)
                                      const isViewing = selectedMaterialId === material.id
                                      const timer = materialTimers[material.id]
                                      const elapsedMinutes = timer ? Math.floor(timer.elapsed / 60000) : 0
                                      
                                      // Calculate required time
                                      const course = content?.course
                                      const totalMaterials = materials.length
                                      const courseDurationMinutes = course?.duration || (course?.estimatedHours * 60) || 0
                                      const requiredTimePerMaterial = courseDurationMinutes / totalMaterials || 1
                                      const requiredMinutes = Math.ceil(requiredTimePerMaterial)

                                      return (
                                        <div
                                          key={material.id}
                                          className={`flex items-center justify-between p-3 border rounded-lg ${
                                            isCompleted ? "bg-green-50" : ""
                                          }`}
                                        >
                                          <div className="flex items-center gap-3 flex-1">
                                            {isCompleted ? (
                                              <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                              <Clock className="w-5 h-5 text-gray-400" />
                                            )}
                                            <div className="flex-1">
                                              <p className="font-medium">{material.title}</p>
                                              {material.description && (
                                                <p className="text-sm text-gray-500">{material.description}</p>
                                              )}
                                              <div className="flex gap-2 mt-1">
                                                <Badge variant="outline">{material.type}</Badge>
                                                {material.order && (
                                                  <Badge variant="outline">Order: {material.order}</Badge>
                                                )}
                                                {timer && (
                                                  <Badge variant="outline">
                                                    Time: {formatTime(timer.elapsed)} / {requiredMinutes} min
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {!isCompleted && canAccess && material.url && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewMaterial(material, enrollment)}
                                                disabled={isViewing}
                                              >
                                                <Eye className="w-4 h-4 mr-2" />
                                                {isViewing ? "Viewing..." : "View Material"}
                                              </Button>
                                            )}
                                            {!isCompleted && canAccess && (
                                              <Button
                                                size="sm"
                                                onClick={() => handleMarkMaterialComplete(material.id, enrollment.id, course, materials)}
                                                disabled={markMaterialCompleteMutation.isPending || elapsedMinutes < requiredMinutes}
                                                variant={elapsedMinutes >= requiredMinutes ? "default" : "outline"}
                                              >
                                                {elapsedMinutes >= requiredMinutes ? "Mark Complete" : `Need ${requiredMinutes - elapsedMinutes} more min`}
                                              </Button>
                                            )}
                                            {!canAccess && !isCompleted && (
                                              <p className="text-sm text-gray-500">Complete previous materials first</p>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500">No materials available for this course</p>
                              )}
                                </>
                              )}

                              {/* Quizzes */}
                              {quizzes.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">Quizzes</h4>
                                  <div className="space-y-2">
                                    {quizzes.map((quiz: any) => {
                                      const attempt = quizAttempts.find((qa: any) => qa.quizId === quiz.id)
                                      const hasAttempt = !!attempt
                                      const canTake = canTakeQuiz && (!hasAttempt || quiz.allowRetake)

                                      return (
                                        <div key={quiz.id} className="p-3 border rounded-lg">
                                          <div className="flex items-center justify-between mb-2">
                                            <div>
                                              <p className="font-medium">{quiz.title}</p>
                                              {quiz.description && (
                                                <p className="text-sm text-gray-500">{quiz.description}</p>
                                              )}
                                              <div className="flex gap-2 mt-1">
                                                <Badge variant="outline">
                                                  {quiz.totalPoints} points
                                                </Badge>
                                                <Badge variant="outline">
                                                  Passing: {quiz.passingScore}%
                                                </Badge>
                                                {quiz.timeLimit && (
                                                  <Badge variant="outline">
                                                    {quiz.timeLimit} min
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            {selectedQuizId === quiz.id ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  setSelectedQuizId(null)
                                                  setQuizAnswers({}) // Clear answers when canceling
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                            ) : (
                                              <Button
                                                size="sm"
                                                onClick={() => {
                                                  setQuizAnswers({}) // Reset answers when opening quiz
                                                  setSelectedQuizId(quiz.id)
                                                }}
                                                disabled={!canTake}
                                              >
                                                {hasAttempt ? "Retake Quiz" : "Take Quiz"}
                                              </Button>
                                            )}
                                          </div>

                                          {hasAttempt && attempt && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded">
                                              <p className="text-sm">
                                                Score: {attempt.score?.toFixed(1) || 0}% (
                                                {attempt.totalPoints || quiz.totalPoints} points)
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                {attempt.passed ? (
                                                  <span className="text-green-600">Passed</span>
                                                ) : (
                                                  <span className="text-red-600">Failed</span>
                                                )}
                                              </p>
                                              {attempt.submittedAt && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                  Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                                                </p>
                                              )}
                                            </div>
                                          )}

                                          {selectedQuizId === quiz.id && (
                                            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded">
                                              {quiz.questions?.map((question: any, qIndex: number) => (
                                                <div key={question.id} className="space-y-2">
                                                  <p className="font-medium">
                                                    {qIndex + 1}. {question.question} ({question.points} points)
                                                  </p>
                                                  {question.questionType === "MULTIPLE_CHOICE" && (
                                                    <div className="space-y-2 ml-4">
                                                      {question.choices?.map((choice: any, cIndex: number) => {
                                                        const choiceValue = String(choice.text || '').trim()
                                                        const choiceId = `${question.id}-choice-${cIndex}`
                                                        const isSelected = quizAnswers[question.id] === choiceValue
                                                        
                                                        return (
                                                          <label
                                                            key={choiceId}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                          >
                                                            <input
                                                              type="radio"
                                                              name={`question-${question.id}`}
                                                              value={choiceValue}
                                                              checked={isSelected}
                                                              onChange={(e) => {
                                                                const selectedValue = String(e.target.value).trim()
                                                                handleQuizAnswerChange(question.id, selectedValue)
                                                              }}
                                                              className="w-4 h-4"
                                                            />
                                                            <span>{choice.text}</span>
                                                          </label>
                                                        )
                                                      })}
                                                    </div>
                                                  )}
                                                  {question.questionType === "TRUE_FALSE" && (
                                                    <div className="space-y-2 ml-4">
                                                      <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                          type="radio"
                                                          name={`question-${question.id}`}
                                                          value="True"
                                                          checked={quizAnswers[question.id] === "True" || quizAnswers[question.id] === "true"}
                                                          onChange={(e) => {
                                                            const value = String(e.target.value).trim()
                                                            handleQuizAnswerChange(question.id, value)
                                                          }}
                                                          className="w-4 h-4"
                                                        />
                                                        <span>True</span>
                                                      </label>
                                                      <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                          type="radio"
                                                          name={`question-${question.id}`}
                                                          value="False"
                                                          checked={quizAnswers[question.id] === "False" || quizAnswers[question.id] === "false"}
                                                          onChange={(e) => {
                                                            const value = String(e.target.value).trim()
                                                            handleQuizAnswerChange(question.id, value)
                                                          }}
                                                          className="w-4 h-4"
                                                        />
                                                        <span>False</span>
                                                      </label>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                              <Button
                                                onClick={() => handleSubmitQuiz(quiz.id, enrollment.id)}
                                                disabled={
                                                  submitQuizMutation.isPending ||
                                                  Object.keys(quizAnswers).length !== quiz.questions?.length
                                                }
                                                className="mt-4"
                                              >
                                                {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                                              </Button>
                                            </div>
                                          )}

                                          {!canTake && !hasAttempt && (
                                            <p className="text-sm text-gray-500 mt-2">
                                              Complete all course materials to take this quiz
                                            </p>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                You haven't enrolled in any courses yet. Browse available courses below to get started!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Available Courses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Enroll in courses to improve your skills</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAvailableCourses.length > 0 ? (
              <div className="space-y-4">
                {filteredAvailableCourses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{course.estimatedHours} hours</Badge>
                        {course.category && <Badge variant="outline">{course.category.name}</Badge>}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleEnrollCourse(course.id)}
                      disabled={enrollCourseMutation.isPending}
                    >
                      Enroll
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No available courses</p>
            )}
          </CardContent>
        </Card>

        {/* Recommended Courses Section */}
        {filteredRecommendedCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended Courses</CardTitle>
              <CardDescription>Courses recommended based on your skill gaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecommendedCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {course.estimatedHours} hours
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleEnrollCourse(course.id)}
                      disabled={enrollCourseMutation.isPending}
                    >
                      Enroll
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderTrainings = () => {
    const enrolledTrainings = employeeTrainingsData?.enrollments || []
    
    // Show only approved enrollments, and include upcoming trainings
    const approvedEnrollments = enrolledTrainings.filter((e: any) => e.status === 'APPROVED')
    
    // Sort enrollments: ongoing first, then open/upcoming, then completed, then others
    const sortedEnrollments = [...approvedEnrollments].sort((a: any, b: any) => {
      const aTraining = a.training
      const bTraining = b.training
      if (!aTraining || !bTraining) return 0
      
      const aStartDate = new Date(aTraining.startDate)
      const bStartDate = new Date(bTraining.startDate)
      const today = new Date()
      
      // Priority order: ONGOING > OPEN > COMPLETED > others
      const statusPriority: Record<string, number> = {
        'ONGOING': 1,
        'OPEN': 2,
        'COMPLETED': 3,
        'CANCELLED': 4,
        'DRAFT': 5
      }
      
      const aPriority = statusPriority[aTraining.status] || 99
      const bPriority = statusPriority[bTraining.status] || 99
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Within same status, sort by start date
      return aStartDate.getTime() - bStartDate.getTime()
    })
    
    // Get enrolled training IDs (check both trainingId and training.id)
    const enrolledTrainingIds = new Set(
      enrolledTrainings.map((e: any) => {
        const id = e.trainingId || e.training?.id
        return id
      }).filter(Boolean)
    )

    return (
      <div className="space-y-6">
        {/* Enrolled Trainings Section */}
        {isLoadingEmployeeTrainings ? (
          <Card>
            <CardHeader>
              <CardTitle>My Enrolled Trainings</CardTitle>
              <CardDescription>Trainings you are enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">Loading enrolled trainings...</p>
            </CardContent>
          </Card>
        ) : sortedEnrollments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>My Enrolled Trainings</CardTitle>
              <CardDescription>Trainings you are enrolled in (approved)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedEnrollments.map((enrollment: any) => {
                  const training = enrollment.training
                  if (!training) return null
                  
                  const trainingStatus = training?.status
                  const startDate = training?.startDate ? new Date(training.startDate) : null
                  const endDate = training?.endDate ? new Date(training.endDate) : null
                  const today = new Date()
                  
                  // Determine if can mark attendance (only if training is ongoing and no attendance marked yet, or attendance is ABSENT)
                  const hasAttendance = enrollment.attendance && enrollment.attendance.status
                  const isPresentOrAttended = hasAttendance && (enrollment.attendance.status === 'PRESENT' || enrollment.attendance.status === 'LATE')
                  const canMarkAttendance = trainingStatus === 'ONGOING' && startDate && startDate <= today && !isPresentOrAttended
                  
                  // Get status badge color
                  const getStatusBadgeClass = (status: string) => {
                    switch(status) {
                      case 'ONGOING':
                        return 'bg-green-100 text-green-800 border-green-300'
                      case 'OPEN':
                        return 'bg-blue-100 text-blue-800 border-blue-300'
                      case 'COMPLETED':
                        return 'bg-gray-100 text-gray-800 border-gray-300'
                      case 'CANCELLED':
                        return 'bg-red-100 text-red-800 border-red-300'
                      default:
                        return 'bg-gray-100 text-gray-600 border-gray-300'
                    }
                  }
                  
                  return (
                    <div key={enrollment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-medium">{training?.title || 'Unknown Training'}</p>
                            {/* Training Status Badge */}
                            {trainingStatus && (
                              <Badge 
                                variant="outline" 
                                className={getStatusBadgeClass(trainingStatus)}
                              >
                                {trainingStatus}
                              </Badge>
                            )}
                          </div>
                          {training?.description && (
                            <p className="text-sm text-gray-500 mt-1">{training.description}</p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">{training?.durationHours || 0} hours</Badge>
                            <Badge variant="outline">{training?.trainingType || 'N/A'}</Badge>
                            <Badge variant={enrollment.status === 'APPROVED' ? 'default' : 'secondary'}>
                              Enrollment: {enrollment.status}
                            </Badge>
                          </div>
                          {training?.startDate && training?.endDate && (
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}
                            </p>
                          )}
                          {isPresentOrAttended && enrollment.attendance && (
                            <div className="mt-2">
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                {enrollment.attendance.status === 'PRESENT' ? 'Present' : 'Attended'}
                              </Badge>
                              {enrollment.attendance.timeIn && (
                                <p className="text-sm text-gray-600 mt-1 font-medium">
                                  {new Date(enrollment.attendance.timeIn).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                          {hasAttendance && !isPresentOrAttended && (
                            <div className="mt-2">
                              <Badge variant="secondary">
                                Attendance: {enrollment.attendance.status}
                              </Badge>
                              {enrollment.attendance.timeIn && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Time In: {new Date(enrollment.attendance.timeIn).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTrainingDetails(training.id)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {canMarkAttendance && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTrainingForQR(training.id)
                                setIsQRScannerOpen(true)
                              }}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Mark Attendance
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>My Enrolled Trainings</CardTitle>
              <CardDescription>Trainings you are enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">You haven't enrolled in any trainings yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Available Trainings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Available Trainings</CardTitle>
            <CardDescription>Enroll in trainings to develop your skills</CardDescription>
          </CardHeader>
          <CardContent>
            {availableTrainings.length > 0 ? (
              <div className="space-y-4">
                {availableTrainings
                  .filter((training: any) => !enrolledTrainingIds.has(training.id))
                  .map((training: any) => (
                    <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{training.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{training.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{training.durationHours} hours</Badge>
                          <Badge variant="outline">{training.trainingType}</Badge>
                          <Badge variant="outline">
                            {new Date(training.startDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEnrollTraining(training.id)}
                        disabled={enrollTrainingMutation.isPending}
                      >
                        Enroll
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No available trainings</p>
            )}
          </CardContent>
        </Card>

        {/* Recommended Trainings Section */}
        {dashboard && dashboard.recommendedTrainings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended Trainings</CardTitle>
              <CardDescription>Trainings recommended based on your skill gaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recommendedTrainings
                  .filter((training) => !enrolledTrainingIds.has(training.id))
                  .map((training) => {
                  return (
                    <div key={training.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{training.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{training.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{training.durationHours} hours</Badge>
                            <Badge variant="outline">{training.trainingType}</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEnrollTraining(training.id)}
                          disabled={enrollTrainingMutation.isPending}
                        >
                          Enroll
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderAchievements = () => {
    const achievements = achievementsData?.achievements || []
    
    return (
      <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Achievements & Certificates</CardTitle>
                  <CardDescription>View and manage your approved achievements and certificates</CardDescription>
                </div>
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Achievement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isAchievementsLoading ? (
                <div className="text-center py-8">
                  <FullPageLoader message="Loading achievements..." showLogo={false} />
                </div>
              ) : achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((achievement: any) => (
                    <Card key={achievement.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-5 h-5 text-yellow-600" />
                              <h4 className="font-medium text-lg">{achievement.title}</h4>
                              <Badge 
                                variant={achievement.status === 'Approved' ? 'default' : achievement.status === 'Rejected' ? 'destructive' : 'secondary'}
                              >
                                {achievement.status}
                              </Badge>
                            </div>
                            {achievement.description && (
                              <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                            )}
                            {achievement.competency && (
                              <Badge variant="outline" className="mb-2">
                                {achievement.competency.name}
                              </Badge>
                            )}
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(achievement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {achievement.fileUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(achievement.fileUrl, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No approved achievements or certificates yet.
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload certificates and achievements to see them here after HR/Manager approval.
                  </p>
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Achievement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    )
  }

  const renderNotifications = () => {
    return (
      <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Stay updated with your learning and career progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select
                  value={notificationFilters.isRead === undefined ? "all" : notificationFilters.isRead ? "read" : "unread"}
                  onValueChange={(value) =>
                    setNotificationFilters({
                      ...notificationFilters,
                      isRead: value === "all" ? undefined : value === "read",
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isNotificationsLoading ? (
                <FullPageLoader message="Loading notifications..." showLogo={true} />
              ) : notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start justify-between p-4 border rounded-lg ${
                        !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                          <Badge variant="outline">{notification.type}</Badge>
                        </div>
                        <p className="mt-2 font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markReadMutation.mutate(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              )}
            </CardContent>
          </Card>
      </div>
    )
  }

  const renderPerformance = () => {
    const perfData = performanceSummaryData as ESSPerformanceSummaryResponse | undefined

    if (isPerformanceSummaryLoading) {
      return <FullPageLoader message="Loading performance summary..." showLogo={true} />
    }

    return (
      <div className="space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Performance Trend</p>
                  <p className="text-xl font-bold text-gray-900">
                    {perfData?.summary?.performanceTrend || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Competency Growth</p>
                  <p className="text-xl font-bold text-gray-900">
                    {perfData?.summary?.competencyGrowth || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Learning Activity</p>
                  <p className="text-xl font-bold text-gray-900">
                    {perfData?.summary?.learningActivity || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Training Attendance</p>
                  <p className="text-xl font-bold text-gray-900">
                    {perfData?.summary?.trainingAttendance || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance History */}
        {perfData?.history && perfData.history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>Your performance scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Competency</TableHead>
                    <TableHead>Learning</TableHead>
                    <TableHead>Training</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfData.history.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{h.period}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={h.overallScore} className="h-2 w-16" />
                          <span className="text-sm">{Math.round(h.overallScore)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{Math.round(h.performanceScore)}%</TableCell>
                      <TableCell>{Math.round(h.competencyScore)}%</TableCell>
                      <TableCell>{Math.round(h.learningScore)}%</TableCell>
                      <TableCell>{Math.round(h.trainingScore)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {perfData?.aiInsight && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Award className="h-5 w-5" />
                AI Insights
              </CardTitle>
              <CardDescription>Personalized insights based on your performance data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {perfData.aiInsight.strengthAreas?.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Your Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {perfData.aiInsight.strengthAreas.map((s, i) => (
                      <Badge key={i} className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {perfData.aiInsight.developmentAreas?.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-700 mb-2">Areas for Development</h4>
                  <div className="flex flex-wrap gap-2">
                    {perfData.aiInsight.developmentAreas.map((d, i) => (
                      <Badge key={i} className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Target className="h-3 w-3 mr-1" />
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {perfData.aiInsight.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {perfData.aiInsight.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {perfData?.recommendations && perfData.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Courses and trainings to boost your growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {perfData.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={
                          rec.priority === "High" ? "border-red-300 text-red-700" :
                          rec.priority === "Medium" ? "border-yellow-300 text-yellow-700" :
                          "border-green-300 text-green-700"
                        }>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">{rec.type}</Badge>
                      </div>
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.rationale}</p>
                    </div>
                    {(rec.linkedCourseId || rec.linkedTrainingId) && (
                      <Button
                        size="sm"
                        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          if (rec.linkedCourseId) {
                            enrollCourseMutation.mutate(rec.linkedCourseId)
                          } else if (rec.linkedTrainingId) {
                            enrollTrainingMutation.mutate(rec.linkedTrainingId)
                          }
                        }}
                      >
                        Enroll
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        {perfData?.disclaimer && (
          <p className="text-sm text-gray-500 text-center italic">{perfData.disclaimer}</p>
        )}

        {/* No data state */}
        {!perfData?.summary && !isPerformanceSummaryLoading && (
          <Card className="bg-gray-50">
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data Yet</h3>
              <p className="text-gray-600">
                Your performance summary will be available once you have completed some courses and trainings.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Self-Service</h1>
        <p className="text-gray-600 mt-1">Manage your learning, career, and achievements</p>
      </div>

      {renderContent()}

      {/* Upload Achievement Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Achievement</DialogTitle>
            <DialogDescription>Upload a certificate or achievement document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>File *</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG (Max 10MB)
              </p>
              {uploadForm.file && (
                <div className="mt-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{uploadForm.file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadForm({ ...uploadForm, file: null })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g., AWS Certified Solutions Architect"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Optional description"
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Related Competency (Optional)</Label>
              <Select
                value={uploadForm.competencyId}
                onValueChange={(value) => setUploadForm({ ...uploadForm, competencyId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a competency" />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((comp: any) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadAchievement}
              disabled={!uploadForm.file || !uploadForm.title.trim() || uploadAchievementMutation.isPending}
            >
              {uploadAchievementMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Material Viewer Dialog */}
      <Dialog open={!!selectedMaterialId} onOpenChange={(open) => !open && selectedMaterialId && handleCloseMaterial(selectedMaterialId)}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedMaterialId && (() => {
            // Find the material from all course contents
            let material: any = null
            let enrollmentId: string | null = null
            
            for (const [enrId, content] of Object.entries(courseContents)) {
              const found = content?.course?.materials?.find((m: any) => m.id === selectedMaterialId)
              if (found) {
                material = found
                enrollmentId = enrId
                break
              }
            }
            
            const allEnrollments = allEnrollmentsData || []
            const enrolledCoursesList = allEnrollments.length > 0 
              ? allEnrollments.map((enrollment: any) => ({
                  id: enrollment.id,
                  courseId: enrollment.courseId || enrollment.course?.id,
                  courseTitle: enrollment.course?.title || enrollment.courseTitle || "Unknown Course",
                  status: enrollment.status,
                  completionPercentage: enrollment.completionPercentage || 0,
                  enrolledAt: enrollment.enrolledAt,
                }))
              : dashboard?.ongoingCourses || []
            
            const enrollment = enrollmentId ? enrolledCoursesList.find((e: any) => e.id === enrollmentId) : null

            if (!material) return <div>Material not found</div>

            const timer = materialTimers[material.id]
            const elapsedMinutes = timer ? Math.floor(timer.elapsed / 60000) : 0
            const course = courseContents[enrollment?.id]?.course
            const totalMaterials = course?.materials?.length || 1
            const courseDurationMinutes = course?.duration || (course?.estimatedHours * 60) || 0
            const requiredTimePerMaterial = courseDurationMinutes / totalMaterials || 1
            const requiredMinutes = Math.ceil(requiredTimePerMaterial)

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle>{material.title}</DialogTitle>
                      {material.description && (
                        <DialogDescription>{material.description}</DialogDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {timer && (
                        <Badge variant="outline">
                          Time: {formatTime(timer.elapsed)} / {requiredMinutes} min
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleCloseMaterial(material.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {material.type === "YOUTUBE" && material.url && (() => {
                    const videoId = getYouTubeVideoId(material.url)
                    return videoId ? (
                      <div className="aspect-video w-full">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={material.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-500">Invalid YouTube URL</p>
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Open in new tab
                        </a>
                      </div>
                    )
                  })()}
                  
                  {material.type === "PDF" && material.url && (
                    <div className="w-full" style={{ height: "70vh" }}>
                      <iframe
                        src={material.url}
                        width="100%"
                        height="100%"
                        className="border rounded-lg"
                        title={material.title}
                      />
                    </div>
                  )}

                  {material.type === "VIDEO" && material.url && (
                    <div className="aspect-video w-full">
                      <video
                        controls
                        className="w-full h-full rounded-lg"
                        src={material.url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {material.type === "FILE" && material.url && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-gray-500 mb-2">File: {material.title}</p>
                      <Button onClick={() => window.open(material.url, "_blank")}>
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  )}

                  {!material.url && (
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-gray-500">No content available for this material</p>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <Dialog open={isQRScannerOpen} onOpenChange={(open) => {
        setIsQRScannerOpen(open)
        if (!open) {
          stopQRScanner()
          setSelectedTrainingForQR(null)
          setScannedQRData(null)
        }
      }}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code for Attendance</DialogTitle>
            <DialogDescription>
              Scan the QR code displayed at the training venue (on screen or wall) to mark your attendance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Camera Preview */}
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {!streamRef.current && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera access required</p>
                  </div>
                </div>
              )}
              {validateQRCodeMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                  <div className="text-center">
                    <p className="text-sm">Validating QR code...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Manual QR Code Input */}
            <div className="space-y-2">
              <Label>Or Enter QR Code Manually</Label>
              <Input
                placeholder="Paste QR code data here"
                onChange={(e) => {
                  const value = e.target.value.trim()
                  if (value && selectedTrainingForQR && value.length > 10) {
                    handleQRScan(value)
                  }
                }}
                disabled={validateQRCodeMutation.isPending}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsQRScannerOpen(false)
                  stopQRScanner()
                  setSelectedTrainingForQR(null)
                  setScannedQRData(null)
                }}
                disabled={validateQRCodeMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Confirmation Modal */}
      <Dialog open={isAttendanceConfirmOpen} onOpenChange={(open) => {
        setIsAttendanceConfirmOpen(open)
        if (!open) {
          setScannedQRData(null)
          setSelectedTrainingForQR(null)
        }
      }}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Attendance</DialogTitle>
            <DialogDescription>
              QR code scanned successfully. Confirm to mark your attendance as present.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  QR Code validated successfully
                </p>
              </div>
            </div>
            {selectedTrainingForQR && (scannedTrainingDetails || trainingDetails) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Training:</p>
                <p className="text-sm text-gray-600">{(scannedTrainingDetails || trainingDetails)?.title}</p>
                {(scannedTrainingDetails || trainingDetails)?.startDate && (
                  <p className="text-sm text-gray-500">
                    {new Date((scannedTrainingDetails || trainingDetails)!.startDate).toLocaleDateString()} - {new Date((scannedTrainingDetails || trainingDetails)!.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAttendanceConfirmOpen(false)
                setScannedQRData(null)
                setSelectedTrainingForQR(null)
              }}
              disabled={markAttendanceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAttendance}
              disabled={markAttendanceMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {markAttendanceMutation.isPending ? "Marking..." : "Mark Present"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Details Modal */}
      <Dialog open={!!selectedTrainingDetails} onOpenChange={(open) => {
        if (!open) {
          setSelectedTrainingDetails(null)
        }
      }}>
        <DialogContent 
          className="bg-white border-gray-200 text-gray-900 max-h-[90vh] overflow-y-auto"
          style={{ width: '98vw', maxWidth: '98vw' }}
        >
          <DialogHeader>
            <DialogTitle>Training Details</DialogTitle>
            <DialogDescription>View training details, participants, and QR code for attendance</DialogDescription>
          </DialogHeader>
          {trainingDetails ? (() => {
            // Check current employee's attendance status
            const currentEmployeeId = dashboardData?.employee?.id
            const currentEmployeeEnrollment = employeeTrainingsData?.enrollments?.find(
              (e: any) => e.training?.id === selectedTrainingDetails && e.employeeId === currentEmployeeId
            )
            const hasAttendance = currentEmployeeEnrollment?.attendance && currentEmployeeEnrollment.attendance.status
            const isPresentOrAttended = hasAttendance && (currentEmployeeEnrollment.attendance.status === 'PRESENT' || currentEmployeeEnrollment.attendance.status === 'LATE')
            const canShowAttendanceButton = (trainingDetails.status === 'ONGOING' || trainingDetails.status === 'OPEN') && !isPresentOrAttended

            return (
            <div className="space-y-6 mt-4">
              {/* Training Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{trainingDetails.title}</CardTitle>
                  <CardDescription>{trainingDetails.description || 'No description available'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Training Type</p>
                      <p className="mt-1">{trainingDetails.trainingType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="mt-1">{trainingDetails.durationHours} hours</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="mt-1">{new Date(trainingDetails.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <p className="mt-1">{new Date(trainingDetails.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge className="mt-1">
                        {trainingDetails.status}
                      </Badge>
                    </div>
                    {trainingDetails.trainer?.name && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Trainer</p>
                        <p className="mt-1">{trainingDetails.trainer.name}</p>
                      </div>
                    )}
                    {trainingDetails.venue?.name && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Venue</p>
                        <p className="mt-1">{trainingDetails.venue.name}</p>
                      </div>
                    )}
                    {(trainingDetails as any).meetingLink && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Meeting Link</p>
                        <a href={(trainingDetails as any).meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block">
                          {(trainingDetails as any).meetingLink}
                        </a>
                      </div>
                    )}
                    {(trainingDetails as any).address && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="mt-1">{(trainingDetails as any).address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Participants List */}
              <Card>
                <CardHeader>
                  <CardTitle>Participants ({trainingEnrollmentsData?.enrollments?.length || 0})</CardTitle>
                  <CardDescription>List of all enrolled participants</CardDescription>
                </CardHeader>
                <CardContent>
                  {trainingEnrollmentsData?.enrollments && trainingEnrollmentsData.enrollments.length > 0 ? (
                    <div className="space-y-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Enrolled Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trainingEnrollmentsData.enrollments.map((enrollment: any) => (
                            <TableRow key={enrollment.id}>
                              <TableCell className="font-medium">
                                {enrollment.employee?.name || 'N/A'}
                              </TableCell>
                              <TableCell>{enrollment.employee?.email || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={enrollment.status === 'APPROVED' ? 'default' : 'secondary'}>
                                  {enrollment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No participants found</p>
                  )}
                </CardContent>
              </Card>

              {/* Scan QR Code for Attendance */}
              {canShowAttendanceButton && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mark Attendance</CardTitle>
                    <CardDescription>Scan the QR code displayed at the training venue to mark your attendance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Button
                        onClick={() => {
                          setSelectedTrainingForQR(trainingDetails.id)
                          setIsQRScannerOpen(true)
                        }}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Open Camera to Scan QR Code
                      </Button>
                      <p className="text-sm text-gray-500 mt-4">
                        Point your camera at the QR code displayed on the screen or wall at the training venue
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Show attendance status if already marked */}
              {isPresentOrAttended && currentEmployeeEnrollment?.attendance && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Attendance</CardTitle>
                    <CardDescription>Your attendance has been marked for this training</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700 mb-3">
                        {currentEmployeeEnrollment.attendance.status === 'PRESENT' ? 'Present' : 'Attended'}
                      </Badge>
                      {currentEmployeeEnrollment.attendance.timeIn && (
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          {new Date(currentEmployeeEnrollment.attendance.timeIn).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            )
          })() : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading training details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Career Path Details Modal */}
      <Dialog open={isCareerPathDetailsOpen} onOpenChange={setIsCareerPathDetailsOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Career Path Details</DialogTitle>
            <DialogDescription>Detailed comparison with target role</DialogDescription>
          </DialogHeader>
          {isCareerPathDetailsLoading ? (
            <FullPageLoader message="Loading details..." showLogo={true} />
          ) : careerPathDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {careerPathDetails.currentJobRole?.name || "Not assigned"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Target Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{careerPathDetails.targetJobRole.name}</p>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={careerPathDetails.readinessScore} className="flex-1 h-2" />
                        <span className="font-medium">{careerPathDetails.readinessScore}%</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {careerPathDetails.competenciesMet} / {careerPathDetails.competenciesTotal} competencies met
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Competency Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Competency</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Gap</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {careerPathDetails.competencyComparison.map((comp) => (
                        <TableRow key={comp.competencyId}>
                          <TableCell className="font-medium">{comp.competencyName}</TableCell>
                          <TableCell>{comp.requiredLevel}</TableCell>
                          <TableCell>{comp.currentLevel}</TableCell>
                          <TableCell>
                            <Badge variant={comp.gap > 0 ? "destructive" : "default"}>
                              {comp.gap > 0 ? `+${comp.gap}` : comp.gap}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {comp.isMet ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}


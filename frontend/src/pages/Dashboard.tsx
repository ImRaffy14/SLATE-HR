"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Truck, BookOpen, TrendingUp, AlertTriangle, CheckCircle, Clock, Target, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for dashboard
const kpiData = [
  {
    title: "Total Employees",
    value: "247",
    change: "+12",
    changeType: "positive",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Active Drivers",
    value: "89",
    change: "+5",
    changeType: "positive",
    icon: Truck,
    color: "text-green-600",
  },
  {
    title: "Training Completion",
    value: "87%",
    change: "+3%",
    changeType: "positive",
    icon: BookOpen,
    color: "text-purple-600",
  },
  {
    title: "Safety Score",
    value: "94.2",
    change: "-0.8",
    changeType: "negative",
    icon: Target,
    color: "text-orange-600",
  },
]

const departmentData = [
  { name: "Drivers", employees: 89, budget: 450000 },
  { name: "Warehouse", employees: 67, budget: 320000 },
  { name: "Dispatch", employees: 23, budget: 180000 },
  { name: "Maintenance", employees: 34, budget: 220000 },
  { name: "Administration", employees: 34, budget: 280000 },
]

const trainingProgressData = [
  { month: "Jan", completed: 45, scheduled: 60 },
  { month: "Feb", completed: 52, scheduled: 65 },
  { month: "Mar", completed: 48, scheduled: 55 },
  { month: "Apr", completed: 61, scheduled: 70 },
  { month: "May", completed: 58, scheduled: 68 },
  { month: "Jun", completed: 67, scheduled: 75 },
]

const competencyDistribution = [
  { name: "Expert", value: 15, color: "#10b981" },
  { name: "Proficient", value: 35, color: "#3b82f6" },
  { name: "Developing", value: 40, color: "#f59e0b" },
  { name: "Beginner", value: 10, color: "#ef4444" },
]

const performanceMetrics = [
  { month: "Jan", efficiency: 85, safety: 92, satisfaction: 88 },
  { month: "Feb", efficiency: 87, safety: 94, satisfaction: 90 },
  { month: "Mar", efficiency: 83, safety: 91, satisfaction: 87 },
  { month: "Apr", efficiency: 89, safety: 95, satisfaction: 92 },
  { month: "May", efficiency: 91, safety: 93, satisfaction: 89 },
  { month: "Jun", efficiency: 94, safety: 96, satisfaction: 94 },
]

const recentActivities = [
  {
    id: 1,
    type: "training",
    message: "DOT Safety Training completed by 15 drivers",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    type: "alert",
    message: "CDL renewal required for 3 drivers this month",
    time: "4 hours ago",
    status: "pending",
  },
  {
    id: 3,
    type: "competency",
    message: "Warehouse safety assessment scheduled",
    time: "6 hours ago",
    status: "scheduled",
  },
  {
    id: 4,
    type: "performance",
    message: "Monthly performance reviews completed",
    time: "1 day ago",
    status: "completed",
  },
]

export default function Dashboard() {
  console.log("[v0] Dashboard rendering")
  console.log("[v0] Competency distribution data:", competencyDistribution)

  return (
    <div className="space-y-4">
      {/* Dashboard Overview Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Comprehensive view of FreightHR operations, performance metrics, and key activities
        </p>
      </div>

      {/* KPI Cards - Updated colors for light theme and improved mobile responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{kpi.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          kpi.changeType === "positive" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {kpi.change}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full bg-gray-50 ${kpi.color} flex-shrink-0`}>
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Department Overview - Updated chart colors and improved responsiveness */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
              <BarChart3 size={20} />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              config={{
                employees: { label: "Employees", color: "#3b82f6" },
                budget: { label: "Budget ($)", color: "#10b981" },
              }}
              className="h-[250px] sm:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" fontSize={12} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="employees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Training Progress - Updated chart colors and improved responsiveness */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
              <BookOpen size={20} />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              config={{
                completed: { label: "Completed", color: "#10b981" },
                scheduled: { label: "Scheduled", color: "#f59e0b" },
              }}
              className="h-[250px] sm:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" fontSize={12} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scheduled"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Competency Distribution - Updated colors and improved mobile layout */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
              <Target size={20} />
              Competency Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={competencyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                    fontSize={12}
                  >
                    {competencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics - Updated colors and improved responsiveness */}
        <Card className="bg-white border-gray-200 lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
              <TrendingUp size={20} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              config={{
                efficiency: { label: "Efficiency", color: "#3b82f6" },
                safety: { label: "Safety", color: "#10b981" },
                satisfaction: { label: "Satisfaction", color: "#f59e0b" },
              }}
              className="h-[200px] sm:h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" fontSize={12} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="safety"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="satisfaction"
                    stackId="3"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

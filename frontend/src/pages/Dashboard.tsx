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
    color: "text-blue-400",
  },
  {
    title: "Active Drivers",
    value: "89",
    change: "+5",
    changeType: "positive",
    icon: Truck,
    color: "text-green-400",
  },
  {
    title: "Training Completion",
    value: "87%",
    change: "+3%",
    changeType: "positive",
    icon: BookOpen,
    color: "text-purple-400",
  },
  {
    title: "Safety Score",
    value: "94.2",
    change: "-0.8",
    changeType: "negative",
    icon: Target,
    color: "text-orange-400",
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
    <div className="space-y-6">
      {/* Dashboard Overview Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-300">
          Comprehensive view of FreightHR operations, performance metrics, and key activities
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="bg-gray-800 border-gray-600 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{kpi.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-sm font-medium ${
                          kpi.changeType === "positive" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {kpi.change}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-700 ${kpi.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <Card className="bg-gray-800 border-gray-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 size={20} />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                employees: { label: "Employees", color: "#3b82f6" },
                budget: { label: "Budget ($)", color: "#10b981" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="employees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card className="bg-gray-800 border-gray-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen size={20} />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: { label: "Completed", color: "#10b981" },
                scheduled: { label: "Scheduled", color: "#f59e0b" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competency Distribution */}
        <Card className="bg-gray-800 border-gray-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target size={20} />
              Competency Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={competencyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
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

        {/* Performance Metrics */}
        <Card className="bg-gray-800 border-gray-600 lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp size={20} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                efficiency: { label: "Efficiency", color: "#3b82f6" },
                safety: { label: "Safety", color: "#10b981" },
                satisfaction: { label: "Satisfaction", color: "#f59e0b" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
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

      {/* Recent Activities */}
      <Card className="bg-gray-800 border-gray-600 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock size={20} />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      activity.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : activity.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {activity.status === "completed" ? (
                      <CheckCircle size={16} />
                    ) : activity.status === "pending" ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{activity.message}</p>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    activity.status === "completed"
                      ? "border-green-500 text-green-400"
                      : activity.status === "pending"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-blue-500 text-blue-400"
                  }`}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

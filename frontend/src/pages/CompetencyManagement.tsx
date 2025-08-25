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
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmationModal } from "@/components/ConfirmationModal"
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
    requiredLevel: 5,
    currentLevel: 4,
    gap: 1,
    employee: "Mike Rodriguez",
    role: "Long-Haul Driver",
    lastAssessed: "2024-01-15",
    certificationExpiry: "2024-12-31",
  },
  {
    id: 2,
    name: "Route Optimization",
    category: "Operations",
    requiredLevel: 4,
    currentLevel: 3,
    gap: 1,
    employee: "Sarah Johnson",
    role: "Dispatcher",
    lastAssessed: "2024-01-10",
    certificationExpiry: null,
  },
  {
    id: 3,
    name: "Warehouse Management",
    category: "Operations",
    requiredLevel: 4,
    currentLevel: 4,
    gap: 0,
    employee: "David Chen",
    role: "Warehouse Supervisor",
    lastAssessed: "2024-01-20",
    certificationExpiry: null,
  },
  {
    id: 4,
    name: "DOT Regulations",
    category: "Safety & Compliance",
    requiredLevel: 5,
    currentLevel: 3,
    gap: 2,
    employee: "Lisa Thompson",
    role: "Safety Manager",
    lastAssessed: "2024-01-05",
    certificationExpiry: "2024-06-30",
  },
  {
    id: 5,
    name: "Heavy Equipment Operation",
    category: "Technical",
    requiredLevel: 4,
    currentLevel: 2,
    gap: 2,
    employee: "James Wilson",
    role: "Forklift Operator",
    lastAssessed: "2024-01-12",
    certificationExpiry: "2024-08-15",
  },
  {
    id: 6,
    name: "Customer Service",
    category: "Soft Skills",
    requiredLevel: 3,
    currentLevel: 4,
    gap: 0,
    employee: "Maria Garcia",
    role: "Customer Relations",
    lastAssessed: "2024-01-18",
    certificationExpiry: null,
  },
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCompetency, setSelectedCompetency] = useState<any>(null)
  const [formData, setFormData] = useState({
    employee: "",
    competency: "",
    category: "",
    currentLevel: 1,
    requiredLevel: 1,
    notes: "",
  })

  const filteredCompetencies = competencies.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.employee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || comp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getGapBadgeColor = (gap: number) => {
    if (gap === 0) return "bg-green-600 text-white"
    if (gap === 1) return "bg-yellow-600 text-white"
    return "bg-red-600 text-white"
  }

  const handleAddClick = () => {
    setFormData({
      employee: "",
      competency: "",
      category: "",
      currentLevel: 1,
      requiredLevel: 1,
      notes: "",
    })
    setIsAddModalOpen(true)
  }

  const handleEditClick = (competency: any) => {
    setSelectedCompetency(competency)
    setFormData({
      employee: competency.employee,
      competency: competency.name,
      category: competency.category,
      currentLevel: competency.currentLevel,
      requiredLevel: competency.requiredLevel,
      notes: "",
    })
    setIsEditModalOpen(true)
  }

  const handleViewClick = (competency: any) => {
    setSelectedCompetency(competency)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (competency: any) => {
    setSelectedCompetency(competency)
    setIsDeleteModalOpen(true)
  }

  const handleSave = () => {
    // Mock save functionality
    console.log("Saving competency assessment:", formData)
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
  }

  const handleDelete = () => {
    // Mock delete functionality
    console.log("Deleting competency:", selectedCompetency)
    setIsDeleteModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Competency Management</h2>
          <p className="text-gray-300">Freight & Logistics Skills Assessment</p>
        </div>
        <Button
          className="gap-2 bg-gray-800 hover:bg-gray-900 text-white border border-gray-700"
          onClick={handleAddClick}
        >
          <Plus size={16} />
          New Assessment
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
          <CardTitle className="text-white">Assessment Filters</CardTitle>
          <CardDescription className="text-gray-300">Filter and search competency assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search employees or skills..."
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

      {/* Competencies Table */}
      <Card className="bg-gray-800 border-2 border-gray-600 shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Individual Competency Assessments</CardTitle>
          <CardDescription className="text-gray-300">{filteredCompetencies.length} assessments found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300 font-semibold">Employee</TableHead>
                <TableHead className="text-gray-300 font-semibold">Competency</TableHead>
                <TableHead className="text-gray-300 font-semibold">Category</TableHead>
                <TableHead className="text-gray-300 font-semibold">Progress</TableHead>
                <TableHead className="text-gray-300 font-semibold">Gap Status</TableHead>
                <TableHead className="text-gray-300 font-semibold">Last Assessed</TableHead>
                <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetencies.map((comp) => (
                <TableRow key={comp.id} className="border-gray-600 hover:bg-gray-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-gray-600 text-white">{comp.employee.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{comp.employee}</div>
                        <div className="text-sm text-gray-400">{comp.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-white font-medium">{comp.name}</div>
                      {comp.certificationExpiry && (
                        <div className="text-xs text-yellow-400">Cert expires: {comp.certificationExpiry}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-500 text-gray-300">
                      {comp.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {comp.currentLevel}/{comp.requiredLevel}
                        </span>
                        <span className="text-gray-400">
                          {Math.round((comp.currentLevel / comp.requiredLevel) * 100)}%
                        </span>
                      </div>
                      <Progress value={(comp.currentLevel / comp.requiredLevel) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getGapBadgeColor(comp.gap)}>
                      {comp.gap === 0 ? "Proficient" : `Gap: ${comp.gap} level${comp.gap > 1 ? "s" : ""}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">{comp.lastAssessed}</TableCell>
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
                          onClick={() => handleViewClick(comp)}
                        >
                          <Eye size={16} />
                          View Assessment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-white hover:bg-gray-700"
                          onClick={() => handleEditClick(comp)}
                        >
                          <Edit size={16} />
                          Update Skills
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-white hover:bg-gray-700">
                          <Target size={16} />
                          Create Training Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-400 hover:bg-gray-700"
                          onClick={() => handleDeleteClick(comp)}
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
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">New Competency Assessment</DialogTitle>
            <DialogDescription className="text-gray-300">
              Create a new competency assessment for an employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee" className="text-gray-300">
                Employee
              </Label>
              <Select
                value={formData.employee}
                onValueChange={(value) => setFormData({ ...formData, employee: value })}
              >
                <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="Mike Rodriguez" className="text-white">
                    Mike Rodriguez - Long-Haul Driver
                  </SelectItem>
                  <SelectItem value="Sarah Johnson" className="text-white">
                    Sarah Johnson - Dispatcher
                  </SelectItem>
                  <SelectItem value="David Chen" className="text-white">
                    David Chen - Warehouse Supervisor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="competency" className="text-gray-300">
                Competency
              </Label>
              <Input
                id="competency"
                value={formData.competency}
                onChange={(e) => setFormData({ ...formData, competency: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="e.g., Commercial Driving (CDL)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentLevel" className="text-gray-300">
                  Current Level
                </Label>
                <Select
                  value={formData.currentLevel.toString()}
                  onValueChange={(value) => setFormData({ ...formData, currentLevel: Number.parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()} className="text-white">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredLevel" className="text-gray-300">
                  Required Level
                </Label>
                <Select
                  value={formData.requiredLevel.toString()}
                  onValueChange={(value) => setFormData({ ...formData, requiredLevel: Number.parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()} className="text-white">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">
                Assessment Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="Additional notes about the assessment..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Update Competency Assessment</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update the competency assessment for {selectedCompetency?.employee}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competency" className="text-gray-300">
                Competency
              </Label>
              <Input
                id="competency"
                value={formData.competency}
                onChange={(e) => setFormData({ ...formData, competency: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentLevel" className="text-gray-300">
                  Current Level
                </Label>
                <Select
                  value={formData.currentLevel.toString()}
                  onValueChange={(value) => setFormData({ ...formData, currentLevel: Number.parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()} className="text-white">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredLevel" className="text-gray-300">
                  Required Level
                </Label>
                <Select
                  value={formData.requiredLevel.toString()}
                  onValueChange={(value) => setFormData({ ...formData, requiredLevel: Number.parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-700 border-2 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()} className="text-white">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">
                Assessment Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-gray-700 border-2 border-gray-600 text-white"
                placeholder="Additional notes about the assessment..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 border-2 border-gray-600 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Competency Assessment Details</DialogTitle>
            <DialogDescription className="text-gray-300">
              Detailed view of {selectedCompetency?.employee}'s competency assessment
            </DialogDescription>
          </DialogHeader>
          {selectedCompetency && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Employee</Label>
                  <p className="text-white font-medium">{selectedCompetency.employee}</p>
                  <p className="text-gray-300 text-sm">{selectedCompetency.role}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Competency</Label>
                  <p className="text-white font-medium">{selectedCompetency.name}</p>
                  <Badge variant="outline" className="border-gray-500 text-gray-300 w-fit">
                    {selectedCompetency.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Skill Level Progress</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        Current: {selectedCompetency.currentLevel} / Required: {selectedCompetency.requiredLevel}
                      </span>
                      <span className="text-gray-400">
                        {Math.round((selectedCompetency.currentLevel / selectedCompetency.requiredLevel) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(selectedCompetency.currentLevel / selectedCompetency.requiredLevel) * 100}
                      className="h-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Gap Status</Label>
                    <Badge className={getGapBadgeColor(selectedCompetency.gap)}>
                      {selectedCompetency.gap === 0
                        ? "Proficient"
                        : `Gap: ${selectedCompetency.gap} level${selectedCompetency.gap > 1 ? "s" : ""}`}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Last Assessed</Label>
                    <p className="text-white">{selectedCompetency.lastAssessed}</p>
                  </div>
                </div>

                {selectedCompetency.certificationExpiry && (
                  <div className="space-y-2">
                    <Label className="text-gray-400">Certification Expiry</Label>
                    <p className="text-yellow-400">{selectedCompetency.certificationExpiry}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
              className="border-2 border-gray-600 text-white bg-transparent hover:bg-gray-700"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewModalOpen(false)
                handleEditClick(selectedCompetency)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Competency Assessment"
        description="Are you sure you want to delete this competency assessment for"
        itemName={selectedCompetency?.employee}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

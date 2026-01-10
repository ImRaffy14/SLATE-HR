"use client"

import { useState } from "react"
import { Users, UserCheck, BarChart3, LogOut, Menu, FileMinus2, BookPlus, RailSymbol, LaptopMinimalCheck, FolderKanban, Briefcase, Target, Award, GraduationCap } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { useAuth } from "@/context/authContext"
import LOGO from '@/assets/slate-logo.png';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { user, logout: logoutFromContext } = useAuth()

  const isAdmin = user?.role?.includes("ADMIN")
  const isEmployee = user?.role === "EMPLOYEE"

  // Dashboard only for non-employees (admin/HR/managers)
  const baseMenuItems = isEmployee ? [] : [{ id: "dashboard", path: "/", icon: <BarChart3 size={20} />, label: "Dashboard" }]

  const adminMenuItems = [
    { id: "competencies", path: "/competencies", icon: <FileMinus2 size={20} />, label: "Competency Management" },
    { id: "employees", path: "/employees", icon: <UserCheck size={20} />, label: "Employee Management" },
    { id: "learning", path: "/learning", icon: <BookPlus size={20} />, label: "Learning Management" },
    { id: "training", path: "/training", icon: <RailSymbol size={20} />, label: "Training Management" },
    { id: "succession", path: "/succession", icon: <LaptopMinimalCheck size={20} />, label: "Succession Planning" },
    { id: "performance", path: "/performance", icon: <FolderKanban size={20} />, label: "Performance Analysis" },
    { id: "users", path: "/users", icon: <Users size={20} />, label: "User Management" },
  ]

  const userMenuItems = [
    { id: "competencies", path: "/competencies", icon: <FileMinus2 size={20} />, label: "Competency Management" },
    { id: "employees", path: "/employees", icon: <UserCheck size={20} />, label: "Employee Management" },
    { id: "learning", path: "/learning", icon: <BookPlus size={20} />, label: "Learning Management" },
    { id: "training", path: "/training", icon: <RailSymbol size={20} />, label: "Training Management" },
    { id: "succession", path: "/succession", icon: <LaptopMinimalCheck size={20} />, label: "Succession Planning" },
  ]

  // ESS submodules in sidebar for employees
  const employeeMenuItems = [
    { id: "ess-dashboard", path: "/ess", icon: <BarChart3 size={20} />, label: "Dashboard" },
    { id: "ess-career-path", path: "/ess/career-path", icon: <Target size={20} />, label: "Career Path" },
    { id: "ess-learning", path: "/ess/learning", icon: <BookPlus size={20} />, label: "Learning" },
    { id: "ess-trainings", path: "/ess/trainings", icon: <GraduationCap size={20} />, label: "Trainings" },
    { id: "ess-achievements", path: "/ess/achievements", icon: <Award size={20} />, label: "Achievements" },
    { id: "ess-performance", path: "/ess/performance", icon: <FolderKanban size={20} />, label: "Performance" },
  ]

  const menuItems = [
    ...baseMenuItems,
    ...(isEmployee ? employeeMenuItems : isAdmin ? adminMenuItems : userMenuItems)
  ]

  const handleLogout = async () => {
    try {
      await logoutFromContext()
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      toast.error("Failed to logout")
      // Still navigate to login even if logout fails
      navigate("/login")
    }
  }

  return (
    <div
      className={`bg-slate-800 text-slate-100 border-r border-slate-700
      ${collapsed ? "w-16" : "w-64"} 
      flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        {!collapsed && 
          <div className="rounded-full bg-gray-800 p-1 flex justify-center items-center">
            <img src={LOGO} alt="Logo" className="h-11 w-11 rounded-full" />
            <h1 className="ml-3 text-lg font-bold text-gray-100 inline-block align-middle">
              {isEmployee ? "Employee Panel" : "Admin Panel"}
            </h1>
          </div>
        }
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-slate-200 hover:bg-slate-400 hover:text-white"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4">
        <nav className="px-2 space-y-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center ${collapsed ? "justify-center" : "justify-start"} 
                 px-3 py-2 w-full rounded-md transition-colors duration-200
                 ${
                   isActive
                     ? "bg-slate-600 text-white font-semibold shadow-sm"
                     : "text-white hover:bg-slate-500 hover:text-white"
                 }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className={`w-full justify-${collapsed ? "center" : "start"} 
          text-red-300 hover:bg-red-600 hover:text-white transition-colors`}
          onClick={handleLogout}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  )
}

export default Sidebar

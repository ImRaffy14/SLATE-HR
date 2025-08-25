import { useState } from "react";
import {  
  Users, 
  BarChart3, 
  LogOut, 
  Menu,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { logout } from "@/api/auth";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user?.role?.includes("ADMIN");

  const baseMenuItems = [
    { id: "dashboard", path: "/", icon: <BarChart3 size={20} />, label: "Dashboard" },
  ];

  const adminMenuItems = [
    { id: "users", path: "/users", icon: <Users size={20} />, label: "Users" },
    { id: "competencies", path: "/competencies", icon: <Users size={20} />, label: "Competency Management" },
    { id: "learning", path: "/learning", icon: <Users size={20} />, label: "Learning Management" },
    { id: "performance", path: "/performance", icon: <Users size={20} />, label: "Performance Management" },
    { id: "succession", path: "/succession", icon: <Users size={20} />, label: "Succession Planning" },
    { id: "training", path: "/training", icon: <Users size={20} />, label: "Training Programs" },
  ];

  const menuItems = [
    ...baseMenuItems,
    ...(isAdmin ? adminMenuItems : []),
  ];

  const handleLogout = async () => {
    try {
      const result = await logout();
      toast.success(result.message);
      navigate('/login');
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div 
      className={`bg-gray-900 text-gray-200 
      ${collapsed ? "w-16" : "w-64"} 
      flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && <h1 className="text-lg font-semibold text-gray-100">Admin Panel</h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-gray-400 hover:bg-gray-800"
        >
          <Menu size={20} />
        </Button>
      </div>
      
      {/* Menu Items */}
      <div className="flex-1 py-4">
        <nav className="px-2 space-y-1">
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
                     ? "bg-gray-800 text-white font-medium" 
                     : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
      <div className="p-4 border-t border-gray-800">
        <Button 
          variant="ghost"
          className={`w-full justify-${collapsed ? "center" : "start"} 
          text-red-500 hover:bg-red-900/30 transition-colors`}
          onClick={handleLogout}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="ml-3 font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;

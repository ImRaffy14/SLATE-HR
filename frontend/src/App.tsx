import { Routes, Route, Navigate, useLocation, Outlet} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import UserManagement from "./pages/UserManagement";
import CompetencyManagement from "./pages/CompetencyManagement";
import LearningManagement from "./pages/LearningManagement";
import PerformanceAnalysis from "./pages/PerformanceAnalysis";
import SuccessionPlanning from "./pages/SuccessionPlanning";
import TrainingManagement from "./pages/TrainingManagement";
import EnrollmentManagement from "./pages/enrollmentManagement";
import WithSocket from "./components/WithSocket";
import FullPageLoader from "./components/FullpageLoader";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/authContext";
import React, { ReactNode } from "react"

interface ProtectedRouteProps {
  roles?: string[];
  redirectPath?: string;
  children?: ReactNode;
}

type AppRoute = {
  path: string;
  public?: boolean;
  element: React.ReactNode;
  children?: AppRoute[];
  roles?: string[];
};

const ProtectedRoute = ({ 
  roles, 
  redirectPath = "/login",
  children 
}: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (roles && !roles.some(role => user.role?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};


function App() {
  const { isLoading, user } = useAuth();

  if (isLoading) return (
    <div className="h-screen">
      <FullPageLoader message={'Authenticating'} showLogo={true}/>
    </div>
  );

  const routes: AppRoute[] = [

    // Public Routes
    { 
      path: "/login", 
      public: true, 
      element: user ? <Navigate to="/" replace /> : <Login /> 
    },

    // Protected Routes
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <WithSocket>
            <MainLayout />
          </WithSocket>
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Dashboard /> },
        { 
          path: "users", 
          element: <UserManagement />,
          roles: ["ADMIN"] 
        },
        { 
          path: "competencies", 
          element: <CompetencyManagement />,
          roles: ["ADMIN"] 
        },
        { 
          path: "learning", 
          element: <LearningManagement />,
          roles: ["ADMIN"] 
        },
        { 
          path: "performance", 
          element: <PerformanceAnalysis />,
          roles: ["ADMIN"] 
        },
        { 
          path: "succession", 
          element: <SuccessionPlanning />,
          roles: ["ADMIN"] 
        },
        { 
          path: "training", 
          element: <TrainingManagement />,
          roles: ["ADMIN"] 
        },
        {
          path: "enrollments/:courseId",
          element: <EnrollmentManagement />,
          roles: ["ADMIN"]
        }
      ],
    },
  ];
  
  const renderRoutes = (routes: AppRoute[]) => {
    return routes.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          route.public 
            ? route.element 
            : (
              <ProtectedRoute roles={route.roles}>
                {route.element}
              </ProtectedRoute>
            )
        }
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    ));
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>{renderRoutes(routes)}</Routes>
    </>
  );
}


export default App;
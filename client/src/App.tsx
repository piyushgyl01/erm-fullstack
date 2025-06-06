// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { LoadingSpinner } from "./components/layout/LoadingSpinner";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AuthLayout } from "./components/layout/AuthLayout";

// Lazy load pages for better performance
// This demonstrates code splitting, which improves initial page load times
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const ManagerDashboard = React.lazy(() => import("./pages/ManagerDashboard"));
const EngineerDashboard = React.lazy(() => import("./pages/EngineerDashboard"));
const EngineersPage = React.lazy(() => import("./pages/EngineersPage"));
const ProjectsPage = React.lazy(() => import("./pages/ProjectsPage"));
const AssignmentsPage = React.lazy(() => import("./pages/AssignmentsPage"));
const AnalyticsPage = React.lazy(() => import("./pages/AnalyticsPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));

/**
 * Protected Route component that requires authentication
 * This wrapper ensures only authenticated users can access protected pages
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAuth();

  // Show loading spinner while checking authentication status
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

/**
 * Manager-only Route component that requires manager role
 * This ensures only managers can access administrative features
 */
const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state, isManager } = useAuth();

  // First check authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Then check manager role
  if (!isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Dashboard Route component that renders different dashboards based on user role
 * This demonstrates role-based rendering while maintaining a single route
 */
const DashboardRoute: React.FC = () => {
  const { isManager } = useAuth();

  // Render appropriate dashboard based on user role
  return isManager ? <ManagerDashboard /> : <EngineerDashboard />;
};

/**
 * Public Route component for pages that should only be accessible when not authenticated
 * This prevents authenticated users from seeing login pages
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();

  // Show loading spinner while checking authentication status
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render public content if not authenticated
  return <>{children}</>;
};

/**
 * Suspense wrapper component for lazy-loaded pages
 * Provides consistent loading experience for code-split components
 */
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading page..." />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};

/**
 * App Routes component that defines all application routes
 * This is separated for better organization and testability
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes - accessible when not authenticated */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Nested routes within the dashboard layout */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route
          path="dashboard"
          element={
            <SuspenseWrapper>
              <DashboardRoute />
            </SuspenseWrapper>
          }
        />

        <Route
          path="engineers"
          element={
            <ManagerRoute>
              <SuspenseWrapper>
                <EngineersPage />
              </SuspenseWrapper>
            </ManagerRoute>
          }
        />

        <Route
          path="projects"
          element={
            <SuspenseWrapper>
              <ProjectsPage />
            </SuspenseWrapper>
          }
        />

        <Route
          path="assignments"
          element={
            <SuspenseWrapper>
              <AssignmentsPage />
            </SuspenseWrapper>
          }
        />

        <Route
          path="analytics"
          element={
            <ManagerRoute>
              <SuspenseWrapper>
                <AnalyticsPage />
              </SuspenseWrapper>
            </ManagerRoute>
          }
        />

        <Route
          path="profile"
          element={
            <SuspenseWrapper>
              <ProfilePage />
            </SuspenseWrapper>
          }
        />
      </Route>

      {/* Catch-all route for 404 pages */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Page not found</p>
              <a
                href="/dashboard"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

/**
 * Context providers wrapper component
 * This organizes all our context providers in a clean, maintainable way
 */
const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

/**
 * Main App component that brings everything together
 * This is the root component that orchestrates the entire application
 */
const App: React.FC = () => {
  return (
    <AppProviders>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AppProviders>
  );
};

export default App;

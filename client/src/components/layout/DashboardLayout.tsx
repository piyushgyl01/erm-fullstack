// src/components/layout/DashboardLayout.tsx
import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  FolderKanban,
  Calendar,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn, getInitials, generateAvatarColor } from "@/lib/utils";

/**
 * Navigation item interface for type safety
 * Defines the structure of each navigation link
 */
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("manager" | "engineer")[]; // Restrict access by role
}

/**
 * Navigation configuration for different user roles
 * This demonstrates role-based UI that adapts to user permissions
 */
const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["manager", "engineer"], // Available to both roles
  },
  {
    name: "Engineers",
    href: "/engineers",
    icon: Users,
    roles: ["manager"], // Manager-only feature
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["manager", "engineer"], // Available to both roles
  },
  {
    name: "Assignments",
    href: "/assignments",
    icon: Calendar,
    roles: ["manager", "engineer"], // Available to both roles
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["manager"], // Manager-only feature
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    roles: ["manager", "engineer"], // Available to both roles
  },
];

/**
 * Main dashboard layout component that provides the structure for authenticated pages
 * Features responsive sidebar navigation, user menu, and content area
 */
export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state: authState, logout, isManager } = useAuth();

  // Filter navigation items based on user role
  // This ensures users only see navigation items they have permission to access
  const filteredNavigation = navigation.filter(
    (item) =>
      !item.roles ||
      item.roles.includes(authState.user?.role as "manager" | "engineer")
  );

  // Handle user logout with navigation
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user initials and avatar color for display
  const userInitials = authState.user ? getInitials(authState.user.name) : "U";
  const avatarColor = authState.user
    ? generateAvatarColor(authState.user.name)
    : "bg-gray-500";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop - shows on small screens when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation - responsive design with mobile overlay */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header with logo and close button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">ResourceHub</h1>
          </div>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User info section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm",
                avatarColor
              )}
            >
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {authState.user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {authState.user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === "/dashboard" && location.pathname === "/");

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)} // Close mobile sidebar on navigation
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer with logout button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Page title based on current route */}
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {getPageTitle(location.pathname)}
              </h2>

              {/* Header actions */}
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                {/* Role indicator badge */}
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    isManager
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  )}
                >
                  {isManager ? "Manager" : "Engineer"}
                </div>

                {/* User avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm",
                    avatarColor
                  )}
                >
                  {userInitials}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area with proper overflow handling */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            {/* This is where page content will be rendered */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Helper function to get page title based on current route
 * This provides context-aware page titles in the header
 */
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/engineers": "Team Engineers",
    "/projects": "Projects",
    "/assignments": "Assignments",
    "/analytics": "Analytics",
    "/profile": "Profile",
  };

  return titles[pathname] || "ResourceHub";
}

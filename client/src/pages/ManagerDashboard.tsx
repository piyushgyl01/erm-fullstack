// src/pages/ManagerDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FolderKanban,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { EmptyState } from "@/components/layout/EmptyState";
import { formatDate, formatPercentage, getStatusColor } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * Manager Dashboard Component
 * Provides comprehensive overview of team resources, project status, and analytics
 */
const ManagerDashboard: React.FC = () => {
  const { state, loadEngineers, refreshAllData } = useApp();
  const { state: authState } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load all dashboard data on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await refreshAllData();
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeDashboard();
  }, [refreshAllData]);

  // Show loading state during initial data fetch
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // Calculate dashboard metrics
  const totalEngineers = state.engineers.length;
  const activeProjects = state.projects.filter(
    (p) => p.status === "active"
  ).length;
  const totalAssignments = state.assignments.length;

  // Calculate team utilization metrics
  const overAllocatedEngineers = state.engineers.filter(
    (e) => e.currentAllocation && e.currentAllocation > e.maxCapacity
  ).length;

  const averageUtilization =
    state.engineers.length > 0
      ? state.engineers.reduce((sum, engineer) => {
          const utilization = engineer.currentAllocation || 0;
          return sum + (utilization / engineer.maxCapacity) * 100;
        }, 0) / state.engineers.length
      : 0;

  // Prepare data for charts
  const utilizationChartData = state.engineers.map((engineer) => ({
    name: engineer.name.split(" ")[0], // First name only for chart
    utilization: engineer.currentAllocation
      ? (engineer.currentAllocation / engineer.maxCapacity) * 100
      : 0,
    capacity: engineer.maxCapacity,
  }));

  const projectStatusData = [
    {
      name: "Active",
      value: state.projects.filter((p) => p.status === "active").length,
      color: "#10B981",
    },
    {
      name: "Planning",
      value: state.projects.filter((p) => p.status === "planning").length,
      color: "#3B82F6",
    },
    {
      name: "Completed",
      value: state.projects.filter((p) => p.status === "completed").length,
      color: "#6B7280",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {authState.user?.name}!
        </h1>
        <p className="text-blue-100">
          Here's your team overview and resource allocation status.
        </p>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngineers}</div>
            <p className="text-xs text-muted-foreground">
              engineers in your team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              projects in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Assignments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">current assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Utilization
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(averageUtilization, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              average capacity used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and warnings */}
      {overAllocatedEngineers > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Resource Allocation Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {overAllocatedEngineers} engineer
              {overAllocatedEngineers > 1 ? "s are" : " is"} over-allocated.
              Consider redistributing assignments to prevent burnout.
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/engineers">View Team Capacity</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team utilization chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Utilization</CardTitle>
            <CardDescription>
              Current capacity allocation across all engineers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {utilizationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
                      "Utilization",
                    ]}
                  />
                  <Bar
                    dataKey="utilization"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No utilization data"
                description="Load engineers data to see team utilization"
                action={{
                  label: "Load Engineers",
                  onClick: loadEngineers,
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Project status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>
              Overview of project statuses across your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectStatusData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No projects found"
                description="Create your first project to see status distribution"
                action={{
                  label: "Create Project",
                  onClick: () => (window.location.href = "/projects"),
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common management tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link to="/projects">
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/assignments">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Assignments
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/analytics">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Latest project activity and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.projects.length > 0 ? (
              <div className="space-y-3">
                {state.projects.slice(0, 3).map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(project.startDate)} -{" "}
                        {formatDate(project.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(project.status)}
                      >
                        {project.status}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/projects">View All Projects</Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                title="No projects yet"
                description="Create your first project to get started"
                action={{
                  label: "Create Project",
                  onClick: () => (window.location.href = "/projects"),
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;

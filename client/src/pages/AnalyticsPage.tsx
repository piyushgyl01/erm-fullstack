// src/pages/AnalyticsPage.tsx
import React, { useEffect, useMemo } from "react";
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
  Legend,
} from "recharts";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Award,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPercentage, isDateInRange, getDaysBetween } from "@/lib/utils";

/**
 * AnalyticsPage Component - The Business Intelligence Dashboard
 *
 * This component demonstrates advanced data analysis and visualization skills
 * by transforming raw engineering data into actionable business insights.
 *
 * Key Concepts Demonstrated:
 * 1. Data Aggregation - Taking raw assignments/projects and computing meaningful metrics
 * 2. Trend Analysis - Showing patterns over time
 * 3. Resource Optimization - Identifying bottlenecks and opportunities
 * 4. Performance Monitoring - Tracking key performance indicators (KPIs)
 */
const AnalyticsPage: React.FC = () => {
  const { state, loadAnalytics, loadEngineers, loadProjects, loadAssignments } =
    useApp();

  // Load all necessary data for comprehensive analytics
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load data in parallel for better performance
        await Promise.all([
          loadAnalytics(),
          loadEngineers(),
          loadProjects(),
          loadAssignments(),
        ]);
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      }
    };

    loadAllData();
  }, [loadAnalytics, loadEngineers, loadProjects, loadAssignments]);

  /**
   * useMemo for Complex Analytics Calculations
   *
   * We use useMemo here to avoid recalculating expensive analytics on every render.
   * This is a performance optimization technique that's crucial in data-heavy applications.
   */
  const analyticsData = useMemo(() => {
    // If data isn't loaded yet, return empty state
    if (
      !state.engineers.length ||
      !state.projects.length ||
      !state.assignments.length
    ) {
      return null;
    }

    /**
     * 1. TEAM UTILIZATION ANALYSIS
     * This calculates how efficiently we're using our engineering resources
     */
    const utilizationAnalysis = state.engineers.map((engineer) => {
      const currentAllocation = engineer.currentAllocation || 0;
      const utilizationPercentage =
        (currentAllocation / engineer.maxCapacity) * 100;

      return {
        name: engineer.name.split(" ")[0], // First name for cleaner charts
        fullName: engineer.name,
        utilization: utilizationPercentage,
        capacity: engineer.maxCapacity,
        allocated: currentAllocation,
        available: engineer.maxCapacity - currentAllocation,
        seniority: engineer.seniority,
        skills: engineer.skills || [],
      };
    });

    /**
     * 2. PROJECT STATUS DISTRIBUTION
     * Understanding where our projects stand in their lifecycle
     */
    const projectsByStatus = {
      planning: state.projects.filter((p) => p.status === "planning").length,
      active: state.projects.filter((p) => p.status === "active").length,
      completed: state.projects.filter((p) => p.status === "completed").length,
    };

    const projectStatusData = [
      {
        name: "Planning",
        value: projectsByStatus.planning,
        color: "#3B82F6",
        percentage: 0,
      },
      {
        name: "Active",
        value: projectsByStatus.active,
        color: "#10B981",
        percentage: 0,
      },
      {
        name: "Completed",
        value: projectsByStatus.completed,
        color: "#6B7280",
        percentage: 0,
      },
    ];

    // Calculate percentages for project status
    const totalProjects = state.projects.length;
    projectStatusData.forEach((item) => {
      item.percentage =
        totalProjects > 0 ? (item.value / totalProjects) * 100 : 0;
    });

    /**
     * 3. SKILLS DISTRIBUTION ANALYSIS
     * Understanding what technical capabilities our team has
     */
    const skillsCount: Record<string, number> = {};
    state.engineers.forEach((engineer) => {
      engineer.skills?.forEach((skill) => {
        skillsCount[skill] = (skillsCount[skill] || 0) + 1;
      });
    });

    const skillsData = Object.entries(skillsCount)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: (count / state.engineers.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 skills

    /**
     * 4. WORKLOAD DISTRIBUTION BY SENIORITY
     * Analyzing how work is distributed across experience levels
     */
    const seniorityWorkload = state.engineers.reduce((acc, engineer) => {
      const seniority = engineer.seniority || "unknown";
      if (!acc[seniority]) {
        acc[seniority] = { count: 0, totalAllocation: 0, totalCapacity: 0 };
      }
      acc[seniority].count += 1;
      acc[seniority].totalAllocation += engineer.currentAllocation || 0;
      acc[seniority].totalCapacity += engineer.maxCapacity || 100;
      return acc;
    }, {} as Record<string, { count: number; totalAllocation: number; totalCapacity: number }>);

    const seniorityData = Object.entries(seniorityWorkload).map(
      ([level, data]) => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        engineers: data.count,
        avgUtilization:
          data.count > 0
            ? (data.totalAllocation / data.totalCapacity) * 100
            : 0,
        totalCapacity: data.totalCapacity,
      })
    );

    /**
     * 5. PROJECT TIMELINE ANALYSIS
     * Understanding project duration and completion patterns
     */
    const projectTimelines = state.projects.map((project) => {
      const duration = getDaysBetween(project.startDate, project.endDate);
      const isActive = project.status === "active";
      const progress = isActive
        ? // For active projects, calculate progress based on time
          (() => {
            const totalDuration = getDaysBetween(
              project.startDate,
              project.endDate
            );
            const elapsed = getDaysBetween(project.startDate, new Date());
            return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          })()
        : project.status === "completed"
        ? 100
        : 0;

      return {
        name: project.name,
        duration,
        progress,
        status: project.status,
        teamSize: project.teamSize,
        requiredSkills: project.requiredSkills.length,
      };
    });

    /**
     * 6. ASSIGNMENT EFFICIENCY METRICS
     * How well are we matching engineers to projects?
     */
    const assignmentEfficiency = state.assignments.map((assignment) => {
      const engineer = state.engineers.find(
        (e) => e.id === assignment.engineerId._id
      );
      const project = state.projects.find(
        (p) => p._id === assignment.projectId._id
      );

      // Calculate skill match score
      const engineerSkills = engineer?.skills || [];
      const requiredSkills = project?.requiredSkills || [];
      const matchingSkills = requiredSkills.filter((skill) =>
        engineerSkills.includes(skill)
      ).length;
      const skillMatchScore =
        requiredSkills.length > 0
          ? (matchingSkills / requiredSkills.length) * 100
          : 0;

      return {
        assignmentId: assignment._id,
        engineerName: assignment.engineerId.name,
        projectName: assignment.projectId.name,
        allocation: assignment.allocationPercentage,
        skillMatch: skillMatchScore,
        duration: getDaysBetween(assignment.startDate, assignment.endDate),
        isActive: isDateInRange(assignment.startDate, assignment.endDate),
      };
    });

    /**
     * 7. KEY PERFORMANCE INDICATORS (KPIs)
     * The most important metrics for executive dashboards
     */
    const kpis = {
      // Team efficiency metrics
      averageUtilization:
        utilizationAnalysis.length > 0
          ? utilizationAnalysis.reduce((sum, eng) => sum + eng.utilization, 0) /
            utilizationAnalysis.length
          : 0,

      overAllocatedEngineers: utilizationAnalysis.filter(
        (eng) => eng.utilization > 100
      ).length,
      underUtilizedEngineers: utilizationAnalysis.filter(
        (eng) => eng.utilization < 60
      ).length,

      // Project metrics
      projectCompletionRate:
        totalProjects > 0
          ? (projectsByStatus.completed / totalProjects) * 100
          : 0,
      activeProjectCount: projectsByStatus.active,

      // Assignment metrics
      averageSkillMatch:
        assignmentEfficiency.length > 0
          ? assignmentEfficiency.reduce(
              (sum, assignment) => sum + assignment.skillMatch,
              0
            ) / assignmentEfficiency.length
          : 0,

      // Capacity metrics
      totalTeamCapacity: state.engineers.reduce(
        (sum, eng) => sum + eng.maxCapacity,
        0
      ),
      totalAllocatedCapacity: state.engineers.reduce(
        (sum, eng) => sum + (eng.currentAllocation || 0),
        0
      ),
    };

    return {
      utilizationAnalysis,
      projectStatusData,
      skillsData,
      seniorityData,
      projectTimelines,
      assignmentEfficiency,
      kpis,
    };
  }, [state.engineers, state.projects, state.assignments]);

  // Show loading state while data is being fetched
  if (state.analyticsLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Analyzing team data..." />
      </div>
    );
  }

  /**
   * Custom Tooltip Components for Enhanced User Experience
   * These provide rich context when users hover over chart elements
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${
                entry.dataKey.includes("utilization") ||
                entry.dataKey.includes("percentage")
                  ? "%"
                  : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights into team performance and resource utilization"
      />

      {/* KEY PERFORMANCE INDICATORS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Utilization
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analyticsData.kpis.averageUtilization, 1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average capacity utilization
            </p>
            <Progress
              value={analyticsData.kpis.averageUtilization}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Project Completion
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analyticsData.kpis.projectCompletionRate, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Projects successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Skill Matching
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analyticsData.kpis.averageSkillMatch, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average assignment skill match
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resource Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsData.kpis.overAllocatedEngineers}
            </div>
            <p className="text-xs text-muted-foreground">
              Over-allocated engineers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TEAM UTILIZATION VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Individual Engineer Utilization</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current workload distribution across team members
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.utilizationAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="utilization"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Utilization %"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current state of all projects in portfolio
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.projectStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) =>
                    `${name}: ${percentage.toFixed(1)}%`
                  }
                >
                  {analyticsData.projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SKILLS AND SENIORITY ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Technical Skills</CardTitle>
            <p className="text-sm text-muted-foreground">
              Most common skills across the engineering team
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.skillsData.slice(0, 8).map((skill) => (
                <div
                  key={skill.skill}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{skill.skill}</Badge>
                    <span className="text-sm text-gray-600">
                      {skill.count} engineer{skill.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {formatPercentage(skill.percentage, 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workload by Seniority</CardTitle>
            <p className="text-sm text-muted-foreground">
              Resource allocation across experience levels
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.seniorityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="level" type="category" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="avgUtilization"
                  fill="#10B981"
                  name="Avg Utilization %"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CAPACITY PLANNING INSIGHTS */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity Planning Insights</CardTitle>
          <p className="text-sm text-muted-foreground">
            Actionable recommendations for resource optimization
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Over-allocated engineers alert */}
            {analyticsData.kpis.overAllocatedEngineers > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-800">
                    Over-allocation Alert
                  </h4>
                </div>
                <p className="text-sm text-red-700">
                  {analyticsData.kpis.overAllocatedEngineers} engineer(s) exceed
                  100% capacity. Consider redistributing assignments to prevent
                  burnout.
                </p>
              </div>
            )}

            {/* Under-utilized engineers opportunity */}
            {analyticsData.kpis.underUtilizedEngineers > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">
                    Capacity Opportunity
                  </h4>
                </div>
                <p className="text-sm text-blue-700">
                  {analyticsData.kpis.underUtilizedEngineers} engineer(s) have
                  significant available capacity. Consider assigning additional
                  projects.
                </p>
              </div>
            )}

            {/* High skill match achievement */}
            {analyticsData.kpis.averageSkillMatch > 80 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-800">
                    Excellent Skill Matching
                  </h4>
                </div>
                <p className="text-sm text-green-700">
                  Average skill match of{" "}
                  {formatPercentage(analyticsData.kpis.averageSkillMatch, 0)}{" "}
                  indicates effective engineer-to-project alignment.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;

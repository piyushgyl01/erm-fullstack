// src/pages/EngineerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Clock, 
  User,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { EmptyState } from '@/components/layout/EmptyState';
import { 
  formatDate, 
  formatPercentage, 
  isDateInRange,
  getCapacityColor
} from '@/lib/utils';

const EngineerDashboard: React.FC = () => {
  const { state, refreshAllData } = useApp();
  const { state: authState } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await refreshAllData();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeDashboard();
  }, [refreshAllData]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // FIXED: Use both _id and id for compatibility
  const userId = authState.user?._id || authState.user?.id;
  
  // Calculate engineer-specific metrics
  const myAssignments = state.assignments.filter(a => {
    return a.engineerId._id === userId;
  });  
  
  const activeAssignments = myAssignments.filter(a =>
    isDateInRange(a.startDate, a.endDate)
  );

  const upcomingAssignments = myAssignments.filter(a => 
    new Date(a.startDate) > new Date()
  );

  // Calculate current workload
  const currentWorkload = activeAssignments.reduce((sum, assignment) => 
    sum + assignment.allocationPercentage, 0
  );

  const maxCapacity = authState.user?.maxCapacity || 100;
  const availableCapacity = Math.max(0, maxCapacity - currentWorkload);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {authState.user?.name}!
        </h1>
        <p className="text-green-100">
          Here's your current workload and upcoming assignments.
        </p>
      </div>

      {/* Current capacity overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Your Current Capacity
          </CardTitle>
          <CardDescription>
            Workload allocation and availability status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Allocation</span>
              <span className={`text-sm font-bold px-2 py-1 rounded ${getCapacityColor((currentWorkload / maxCapacity) * 100)}`}>
                {formatPercentage((currentWorkload / maxCapacity) * 100, 0)} of {maxCapacity}%
              </span>
            </div>
            <Progress value={(currentWorkload / maxCapacity) * 100} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercentage((currentWorkload / maxCapacity) * 100, 0)}
                </div>
                <div className="text-xs text-blue-600">Allocated</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage((availableCapacity / maxCapacity) * 100, 0)}
                </div>
                <div className="text-xs text-green-600">Available</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Active Assignments
            </span>
            <Badge variant="secondary">
              {activeAssignments.length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAssignments.length > 0 ? (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <div key={assignment._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {assignment.projectId.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {assignment.projectId.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Role: {assignment.role}</span>
                        <span>
                          {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-blue-600">
                        {assignment.allocationPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">allocation</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active assignments"
              description="You don't have any active assignments at the moment"
              icon={Calendar}
            />
          )}
        </CardContent>
      </Card>

      {/* Upcoming assignments */}
      {upcomingAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Upcoming Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAssignments.slice(0, 3).map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {assignment.projectId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Starts {formatDate(assignment.startDate)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {assignment.allocationPercentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills and profile summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Skills</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {authState.user?.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                )) || <span className="text-gray-500">No skills listed</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Seniority</label>
                <p className="text-sm text-gray-900 capitalize">
                  {authState.user?.seniority || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <p className="text-sm text-gray-900">
                  {authState.user?.department || 'Not specified'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile">Update Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerDashboard;
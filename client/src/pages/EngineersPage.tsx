// src/pages/EngineersPage.tsx
import React, { useEffect, useState } from "react";
import { Search, Users, Mail, Award, Briefcase } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  cn,
  getCapacityColor,
  generateAvatarColor,
  getInitials,
} from "@/lib/utils";

const EngineersPage: React.FC = () => {
  const { state, loadEngineers } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEngineers();
  }, [loadEngineers]);

  const filteredEngineers = state.engineers.filter(
    (engineer) =>
      engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.skills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (state.engineersLoading) {
    return <LoadingSpinner size="lg" text="Loading engineers..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Engineers"
        description="View and manage your engineering team capacity and skills"
      />

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Engineers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Engineers list */}
      {filteredEngineers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEngineers.map((engineer) => {
            const utilizationPercentage = engineer.currentAllocation
              ? (engineer.currentAllocation / engineer.maxCapacity) * 100
              : 0;
            const avatarColor = generateAvatarColor(engineer.name);
            const initials = getInitials(engineer.name);

            return (
              <Card
                key={engineer._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-medium",
                        avatarColor
                      )}
                    >
                      {initials}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{engineer.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {engineer.email}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      <Award className="w-3 h-3 mr-1" />
                      {engineer.seniority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Capacity indicator */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Current Allocation</span>
                        <span className="font-medium">
                          {engineer.currentAllocation || 0}% /{" "}
                          {engineer.maxCapacity}%
                        </span>
                      </div>
                      <Progress value={utilizationPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span
                          className={
                            getCapacityColor(utilizationPercentage).split(
                              " "
                            )[0]
                          }
                        >
                          {utilizationPercentage > 100
                            ? "Over-allocated"
                            : utilizationPercentage > 80
                            ? "High utilization"
                            : utilizationPercentage > 60
                            ? "Good utilization"
                            : "Available"}
                        </span>
                        <span>
                          {engineer.maxCapacity -
                            (engineer.currentAllocation || 0)}
                          % available
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Technical Skills:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {engineer.skills?.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        )) || (
                          <span className="text-gray-500 text-sm">
                            No skills listed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Department and employment info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {engineer.department || "No department"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {engineer.maxCapacity === 100
                            ? "Full-time"
                            : "Part-time"}
                          ({engineer.maxCapacity}%)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No engineers found"
          description={
            state.engineers.length === 0
              ? "No engineers in your team yet"
              : "No engineers match your search criteria"
          }
        />
      )}
    </div>
  );
};

export default EngineersPage;

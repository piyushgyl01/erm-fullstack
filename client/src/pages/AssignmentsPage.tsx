// src/pages/AssignmentsPage.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Calendar, AlertCircle, Edit, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { EmptyState } from "@/components/layout/EmptyState";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Assignment } from "@/services/apiService";

// Assignment form validation schema
const assignmentSchema = z
  .object({
    engineerId: z.string().min(1, "Engineer is required"),
    projectId: z.string().min(1, "Project is required"),
    allocationPercentage: z
      .number()
      .min(1, "Allocation must be at least 1%")
      .max(100, "Allocation cannot exceed 100%"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    role: z.string().min(1, "Role is required"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type AssignmentFormData = z.infer<typeof assignmentSchema>;

const ASSIGNMENT_ROLES = [
  "Developer",
  "Senior Developer",
  "Tech Lead",
  "Architect",
  "DevOps Engineer",
  "QA Engineer",
  "Product Manager",
  "Scrum Master",
];

const AssignmentsPage: React.FC = () => {
  const {
    state,
    loadAssignments,
    loadEngineers,
    loadProjects,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getEngineerCapacity,
  } = useApp();
  const { isManager } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [capacityInfo, setCapacityInfo] = useState<{
    available: number;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      allocationPercentage: 50,
      role: "Developer",
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedEngineerId = watch("engineerId");

  useEffect(() => {
    Promise.all([loadAssignments(), loadEngineers(), loadProjects()]);
  }, [loadAssignments, loadEngineers, loadProjects]);

  // Check engineer capacity when engineer or dates change
  useEffect(() => {
    const checkCapacity = async () => {
      if (watchedEngineerId && watchedStartDate && watchedEndDate) {
        try {
          const capacity = await getEngineerCapacity(
            watchedEngineerId,
            watchedStartDate,
            watchedEndDate
          );
          const engineer = state.engineers.find(
            (e) => e._id === watchedEngineerId
          );

          if (engineer) {
            setCapacityInfo({
              available: capacity,
              message:
                capacity > 0
                  ? `${capacity}% capacity available during this period`
                  : "Engineer is fully allocated during this period",
            });
          }
        } catch (error) {
          console.error("Failed to check capacity:", error);
          setCapacityInfo({
            available: 0,
            message: "Unable to check capacity",
          });
        }
      }
    };

    checkCapacity();
  }, [
    watchedEngineerId,
    watchedStartDate,
    watchedEndDate,
    getEngineerCapacity,
    state.engineers,
  ]);

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      // Check if allocation exceeds available capacity (skip for edits)
      if (
        !editingAssignment &&
        capacityInfo &&
        data.allocationPercentage > capacityInfo.available
      ) {
        alert(
          `Engineer only has ${capacityInfo.available}% capacity available. Please reduce the allocation percentage.`
        );
        return;
      }

      if (editingAssignment) {
        // Update existing assignment
        await updateAssignment(editingAssignment._id, data);
        alert("Assignment updated successfully!");
        setIsEditDialogOpen(false);
        setEditingAssignment(null);
      } else {
        // Create new assignment
        await createAssignment(data);
        alert("Assignment created successfully!");
        setIsCreateDialogOpen(false);
      }

      // Reset form and close dialog
      reset();
      setCapacityInfo(null);
    } catch (error) {
      console.error("Failed to save assignment:", error);
      alert(
        `Failed to ${
          editingAssignment ? "update" : "create"
        } assignment. Please check the details and try again.`
      );
    }
  };

  const handleDeleteAssignment = async (
    assignmentId: string,
    engineerName: string,
    projectName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${engineerName} from ${projectName}?`
      )
    ) {
      try {
        await deleteAssignment(assignmentId);
        alert("Assignment removed successfully!");
      } catch (error) {
        console.error("Failed to delete assignment:", error);
        alert("Failed to remove assignment. Please try again.");
      }
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);

    // Pre-fill the form with existing data
    setValue("engineerId", assignment.engineerId._id);
    setValue("projectId", assignment.projectId._id);
    setValue("allocationPercentage", assignment.allocationPercentage);
    setValue("startDate", assignment.startDate.split("T")[0]); // Format for date input
    setValue("endDate", assignment.endDate.split("T")[0]); // Format for date input
    setValue("role", assignment.role);

    setIsEditDialogOpen(true);
  };

  const handleDialogClose = (isEdit = false) => {
    if (isEdit) {
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
    } else {
      setIsCreateDialogOpen(false);
    }
    reset();
    setCapacityInfo(null);
  };

  if (
    state.assignmentsLoading ||
    state.engineersLoading ||
    state.projectsLoading
  ) {
    return <LoadingSpinner size="lg" text="Loading assignments..." />;
  }

  const AssignmentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="engineerId">Engineer *</Label>
        <Select
          value={watchedEngineerId}
          onValueChange={(value) => setValue("engineerId", value)}
          disabled={isEdit} // Disable engineer selection when editing
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an engineer" />
          </SelectTrigger>
          <SelectContent>
            {state.engineers.map((engineer) => (
              <SelectItem key={engineer._id} value={engineer._id}>
                {engineer.name} ({engineer.seniority}) - {engineer.maxCapacity}%
                capacity
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.engineerId && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.engineerId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectId">Project *</Label>
        <Select
          value={watch("projectId")}
          onValueChange={(value) => setValue("projectId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {state.projects
              .filter((p) => p.status !== "completed")
              .map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name} ({project.status})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.projectId && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.projectId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={watch("role")}
          onValueChange={(value) => setValue("role", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNMENT_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.role.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="allocationPercentage">Allocation Percentage *</Label>
        <Input
          id="allocationPercentage"
          type="number"
          min="1"
          max="100"
          {...register("allocationPercentage", { valueAsNumber: true })}
          placeholder="50"
        />
        {errors.allocationPercentage && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.allocationPercentage.message}
          </p>
        )}

        {/* Capacity information */}
        {capacityInfo && !isEdit && (
          <div
            className={`p-2 rounded text-sm ${
              capacityInfo.available > 0
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {capacityInfo.message}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDialogClose(isEdit)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || state.isCreating || state.isUpdating}
        >
          {isSubmitting || state.isCreating || state.isUpdating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {isEdit ? "Updating..." : "Creating..."}
            </div>
          ) : isEdit ? (
            "Update Assignment"
          ) : (
            "Create Assignment"
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Manage engineer assignments across projects"
      >
        {isManager && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Assign an engineer to a project with specific allocation and
                  timeline.
                </DialogDescription>
              </DialogHeader>
              <AssignmentForm />
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {/* Edit Assignment Dialog */}
      {isManager && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
              <DialogDescription>
                Update the assignment details.
              </DialogDescription>
            </DialogHeader>
            <AssignmentForm isEdit={true} />
          </DialogContent>
        </Dialog>
      )}

      {/* Assignments table */}
      {state.assignments.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engineer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    {isManager && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.assignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.engineerId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.engineerId.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {assignment.engineerId.seniority} •{" "}
                            {assignment.engineerId.skills?.join(", ")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.projectId.name}
                          </div>
                          <Badge
                            className={getStatusColor(
                              assignment.projectId.status
                            )}
                          >
                            {assignment.projectId.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {assignment.allocationPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatDate(assignment.startDate)}</div>
                          <div className="text-gray-500">
                            to {formatDate(assignment.endDate)}
                          </div>
                        </div>
                      </td>
                      {isManager && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment._id,
                                assignment.engineerId.name,
                                assignment.projectId.name
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No assignments found"
          description="Create assignments to allocate engineers to projects"
          action={
            isManager
              ? {
                  label: "Create Assignment",
                  onClick: () => setIsCreateDialogOpen(true),
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default AssignmentsPage;

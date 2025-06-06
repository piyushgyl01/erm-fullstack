// src/pages/ProjectsPage.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  FolderKanban,
  Calendar,
  Users,
  AlertCircle,
  Trash2,
  Edit as EditIcon,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Form validation schema for project creation/updating
const projectSchema = z
  .object({
    name: z
      .string()
      .min(1, "Project name is required")
      .max(100, "Name too long"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description too long"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    teamSize: z
      .number({ invalid_type_error: "Team size must be a number" })
      .min(1, "Team size must be at least 1")
      .max(50, "Team size too large"),
    status: z.enum(["planning", "active", "completed"]).optional(),
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

type ProjectFormData = z.infer<typeof projectSchema> & {
  requiredSkills: string[];
};

const AVAILABLE_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Django",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "GraphQL",
  "Next.js",
  "Vue.js",
  "Angular",
  "Spring Boot",
  "AWS",
  "Azure",
  "Kubernetes",
  "Redis",
  "Express.js",
  "FastAPI",
  "React Native",
  "Flutter",
  "Go",
  "Rust",
];

const ProjectsPage: React.FC = () => {
  const { state, loadProjects, createProject, deleteProject, updateProject } =
    useApp();
  const { isManager } = useAuth();

  // State for create dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Currently editing project
  const [editingProject, setEditingProject] = useState<
    (typeof state.projects)[0] | null
  >(null);
  // Shared skills selection
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Omit<ProjectFormData, "requiredSkills">>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      teamSize: 1,
      status: "planning",
    },
  });

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Toggle skill selection
  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Reset form & skills
  const resetFormAndSkills = () => {
    reset({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      teamSize: 1,
      status: "planning",
    });
    setSelectedSkills([]);
    setEditingProject(null);
  };

  // Handle create project
  const handleCreate = async (
    data: Omit<ProjectFormData, "requiredSkills">
  ): Promise<void> => {
    if (selectedSkills.length === 0) {
      alert("Please select at least one required skill");
      return;
    }
    try {
      await createProject({
        ...data,
        requiredSkills: selectedSkills,
      });
      alert("Project created successfully!");
      setIsCreateDialogOpen(false);
      resetFormAndSkills();
    } catch (error) {
      console.error("Failed to create project:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to create project. Please try again.";
      alert(msg);
    }
  };

  // Handle edit icon click: open dialog & prefill
  const openEditDialog = (project: (typeof state.projects)[0]) => {
    setEditingProject(project);
    // Prefill form fields
    reset({
      name: project.name,
      description: project.description,
      startDate: project.startDate.slice(0, 10), // format YYYY-MM-DD
      endDate: project.endDate.slice(0, 10),
      teamSize: project.teamSize,
      status: project.status,
    });
    setSelectedSkills(project.requiredSkills || []);
    setIsEditDialogOpen(true);
  };

  // Handle update project
  const handleUpdate = async (
    data: Omit<ProjectFormData, "requiredSkills">
  ): Promise<void> => {
    if (!editingProject) return;
    if (selectedSkills.length === 0) {
      alert("Please select at least one required skill");
      return;
    }
    try {
      await updateProject(editingProject._id, {
        ...data,
        requiredSkills: selectedSkills,
      });
      alert("Project updated successfully!");
      setIsEditDialogOpen(false);
      resetFormAndSkills();
    } catch (error) {
      console.error("Failed to update project:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to update project. Please try again.";
      alert(msg);
    }
  };

  // Handle delete project
  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${projectName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProject(projectId);
        alert("Project deleted successfully!");
      } catch (error) {
        console.error("Failed to delete project:", error);
        const msg =
          error instanceof Error
            ? error.message
            : "Failed to delete project. Please try again.";
        alert(msg);
      }
    }
  };

  // Clear filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = state.projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (state.projectsLoading) {
    return <LoadingSpinner size="lg" text="Loading projects..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage and track all engineering projects"
      >
        {isManager && (
          <>
            {/* Create Dialog */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                resetFormAndSkills();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to track team assignments and progress.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(handleCreate)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="E-commerce Platform"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        min="1"
                        max="50"
                        {...register("teamSize", { valueAsNumber: true })}
                        placeholder="5"
                      />
                      {errors.teamSize && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.teamSize.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      {...register("description")}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Build a modern e-commerce platform with React and Node.js"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register("startDate")}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register("endDate")}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Required Skills * (Select at least one)</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-2">
                        {AVAILABLE_SKILLS.map((skill) => (
                          <label
                            key={skill}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSkills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{skill}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {selectedSkills.length === 0 && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select at least one skill
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select
                      defaultValue="planning"
                      onValueChange={(value) =>
                        setValue("status", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetFormAndSkills();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        state.isCreating ||
                        selectedSkills.length === 0
                      }
                    >
                      {isSubmitting || state.isCreating ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Creating...
                        </div>
                      ) : (
                        "Create Project"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
              open={isEditDialogOpen}
              onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) resetFormAndSkills();
              }}
            >
              <DialogTrigger asChild>
                {/* A hidden trigger; we'll programmatically open this */}
                <span />
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Update project details below.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(handleUpdate)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        min="1"
                        max="50"
                        {...register("teamSize", { valueAsNumber: true })}
                      />
                      {errors.teamSize && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.teamSize.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      {...register("description")}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register("startDate")}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register("endDate")}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Required Skills * (Select at least one)</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-2">
                        {AVAILABLE_SKILLS.map((skill) => (
                          <label
                            key={skill}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSkills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{skill}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {selectedSkills.length === 0 && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Please select at least one skill
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      defaultValue={editingProject?.status}
                      onValueChange={(value) =>
                        setValue("status", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        resetFormAndSkills();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        state.isUpdating ||
                        selectedSkills.length === 0
                      }
                    >
                      {isSubmitting || state.isUpdating ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Updating...
                        </div>
                      ) : (
                        "Update Project"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </PageHeader>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    {isManager && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(project)}
                          className="hover:bg-gray-100"
                          disabled={state.isUpdating}
                        >
                          <EditIcon className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteProject(project._id, project.name)
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={state.isDeleting}
                        >
                          {state.isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(project.startDate)} -{" "}
                    {formatDate(project.endDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Team size: {project.teamSize}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Required Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      Manager: {project.managerId?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            filteredProjects.length === 0 && state.projects.length > 0
              ? "No projects match your current filters"
              : "Create your first project to get started with resource management"
          }
          action={
            isManager
              ? {
                  label: "Create Project",
                  onClick: () => setIsCreateDialogOpen(true),
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default ProjectsPage;

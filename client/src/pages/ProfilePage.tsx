// src/pages/ProfilePage.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit, Save, X, Mail, Briefcase, Settings } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { generateAvatarColor, getInitials, cn } from "@/lib/utils";

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

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  seniority: z.enum(["junior", "mid", "senior"]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { state: authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    authState.user?.skills || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: authState.user?.name || "",
      email: authState.user?.email || "",
      department: authState.user?.department || "",
      seniority: authState.user?.seniority || "mid",
    },
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // In a real app, this would update the user profile via API
      console.log("Profile update:", { ...data, skills: selectedSkills });
      alert(
        "Profile updated successfully! (Note: This is a demo - changes are not persisted)"
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const avatarColor = authState.user
    ? generateAvatarColor(authState.user.name)
    : "bg-gray-500";
  const initials = authState.user ? getInitials(authState.user.name) : "U";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account settings and preferences"
      >
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <Card>
          <CardHeader className="text-center">
            <div
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4",
                avatarColor
              )}
            >
              {initials}
            </div>
            <CardTitle>{authState.user?.name}</CardTitle>
            <CardDescription className="capitalize">
              {authState.user?.role} • {authState.user?.seniority}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {authState.user?.email}
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Briefcase className="w-4 h-4 mr-2" />
              {authState.user?.department}
            </div>
            {authState.user?.role === "engineer" && (
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Settings className="w-4 h-4 mr-2" />
                {authState.user?.maxCapacity}% max capacity
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update your profile information"
                  : "Your current profile information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john@company.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        {...register("department")}
                        placeholder="Engineering"
                      />
                      {errors.department && (
                        <p className="text-sm text-red-600">
                          {errors.department.message}
                        </p>
                      )}
                    </div>
                    {authState.user?.role === "engineer" && (
                      <div className="space-y-2">
                        <Label htmlFor="seniority">Seniority Level</Label>
                        <Select
                          defaultValue={authState.user?.seniority}
                          onValueChange={(value) =>
                            setValue("seniority", value as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select seniority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid-level</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {authState.user?.role === "engineer" && (
                    <div className="space-y-2">
                      <Label>Technical Skills</Label>
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
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Name
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {authState.user?.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {authState.user?.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Role
                      </Label>
                      <p className="text-sm text-gray-900 mt-1 capitalize">
                        {authState.user?.role}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Department
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {authState.user?.department}
                      </p>
                    </div>
                  </div>

                  {authState.user?.role === "engineer" && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Skills
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {authState.user?.skills?.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          )) || (
                            <span className="text-gray-500">
                              No skills listed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Seniority Level
                          </Label>
                          <p className="text-sm text-gray-900 mt-1 capitalize">
                            {authState.user?.seniority}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Maximum Capacity
                          </Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {authState.user?.maxCapacity}%
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

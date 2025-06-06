// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, Database, User, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
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

/**
 * Form validation schema using Zod
 * This provides type-safe form validation with detailed error messages
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

// TypeScript type derived from our Zod schema
type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Demo credentials for easy testing
 * Enhanced with better responsive design
 */
const DEMO_CREDENTIALS = [
  {
    email: "manager@company.com",
    password: "password123",
    role: "Manager",
    shortRole: "Manager",
    description: "Full access to team management, projects, and analytics",
    color: "bg-blue-500",
  },
  {
    email: "john@company.com",
    password: "password123",
    role: "Senior Engineer",
    shortRole: "Engineer",
    description: "View assignments and project information",
    color: "bg-green-500",
  },
  {
    email: "alice@company.com",
    password: "password123",
    role: "Backend Engineer",
    shortRole: "Backend",
    description: "Python/Django backend development",
    color: "bg-purple-500",
  },
  {
    email: "bob@company.com",
    password: "password123",
    role: "Frontend Engineer",
    shortRole: "Frontend",
    description: "React/TypeScript frontend development",
    color: "bg-orange-500",
  },
];

/**
 * Login Page Component - FIXED RESPONSIVE VERSION
 * Provides authentication interface with responsive design
 */
const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [selectedCred, setSelectedCred] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, state: authState, clearError } = useAuth();
  const { createSeedData } = useApp();

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const currentEmail = watch("email");

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Handle demo credential selection
  const handleDemoLogin = (credentials: (typeof DEMO_CREDENTIALS)[0]) => {
    setValue("email", credentials.email);
    setValue("password", credentials.password);
    setSelectedCred(credentials.email);

    // Clear selection after a short delay
    setTimeout(() => {
      setSelectedCred(null);
    }, 2000);
  };

  // Handle demo data creation
  const handleCreateDemoData = async () => {
    setIsCreatingDemo(true);
    try {
      await createSeedData();
      alert(
        "Demo data created successfully! You can now log in with the demo credentials."
      );
    } catch (error) {
      console.error("Failed to create demo data:", error);
      alert(
        "Failed to create demo data. Please check your connection and try again."
      );
    } finally {
      setIsCreatingDemo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Main login form */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the resource management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@company.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="break-words">{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="break-words">{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Authentication error display */}
            {authState.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{authState.error}</span>
                </p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || authState.isLoading}
            >
              {isSubmitting || authState.isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Demo credentials section - FIXED RESPONSIVE DESIGN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Demo Credentials
          </CardTitle>
          <CardDescription>
            Click any credential to auto-fill the login form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Responsive credential cards */}
          <div className="space-y-3">
            {DEMO_CREDENTIALS.map((cred, index) => (
              <div
                key={index}
                className={`relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  selectedCred === cred.email
                    ? "border-blue-500 bg-blue-50"
                    : currentEmail === cred.email
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => handleDemoLogin(cred)}
              >
                {/* Role badge */}
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    className={`${cred.color} text-white text-xs px-2 py-1`}
                  >
                    <User className="w-3 h-3 mr-1" />
                    {cred.shortRole}
                  </Badge>
                  {currentEmail === cred.email && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Selected
                    </Badge>
                  )}
                </div>

                {/* Email display - responsive */}
                <div className="flex items-center mb-1">
                  <Mail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 break-all">
                    {cred.email}
                  </span>
                </div>

                {/* Description - responsive */}
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {cred.description}
                </p>

                {/* Password hint */}
                <div className="mt-2 flex items-center justify-between">
                  <code className="text-xs bg-white px-2 py-1 rounded border text-gray-700">
                    password123
                  </code>
                  <span className="text-xs text-blue-600 font-medium">
                    Click to use →
                  </span>
                </div>

                {/* Selection indicator */}
                {selectedCred === cred.email && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create demo data button */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Need sample data? Create demo projects, engineers, and
                assignments.
              </p>
              <Button
                variant="outline"
                onClick={handleCreateDemoData}
                disabled={isCreatingDemo}
                className="w-full"
                size="sm"
              >
                {isCreatingDemo ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                    Creating Demo Data...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Create Demo Data
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development information - responsive */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4 text-center">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">
            Demo Application Features
          </h3>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
            <span className="bg-white px-2 py-1 rounded">TypeScript</span>
            <span className="bg-white px-2 py-1 rounded">React 19</span>
            <span className="bg-white px-2 py-1 rounded">Tailwind CSS</span>
            <span className="bg-white px-2 py-1 rounded">Hook Form</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

// src/services/apiService.ts
import axios, { AxiosResponse, AxiosError } from "axios";

export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  role: "engineer" | "manager";
  skills?: string[];
  seniority?: "junior" | "mid" | "senior";
  maxCapacity: number;
  department: string;
  availableCapacity?: number;
  currentAllocation?: number;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: "planning" | "active" | "completed";
  managerId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  _id: string;
  engineerId: {
    _id: string;
    name: string;
    email: string;
    skills: string[];
    seniority: string;
  };
  projectId: {
    _id: string;
    name: string;
    description: string;
    status: string;
  };
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Add this new interface after AssignmentUpdate
export interface AssignmentCreate {
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role?: string;
}

export interface UtilizationData {
  engineerId: string;
  name: string;
  maxCapacity: number;
  currentAllocation: number;
  utilizationPercentage: number;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Create an axios instance with default configuration
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://erm-server-v1.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to automatically include authentication tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      } else if (error.response.status === 403) {
        console.error("Access denied: Insufficient permissions");
      } else if (error.response.status >= 500) {
        console.error("Server error: Please try again later");
      }
    } else {
      console.error("Network error or no response from server");
    }
    return Promise.reject(error);
  }
);

// Authentication service methods
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to login");
    }
  },

  async register(userData: {
    email: string;
    name: string;
    password: string;
    role: "engineer" | "manager";
    skills?: string[];
    seniority?: "junior" | "mid" | "senior";
    maxCapacity?: number;
    department: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);

      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to create account");
    }
  },

  async getProfile(): Promise<{ user: User }> {
    try {
      const response = await api.get<{ user: User }>("/auth/profile");
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to load profile");
    }
  },

  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  },

  getCurrentUser(): User | null {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  },

  handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(defaultMessage);
  },
};

// Engineer management service methods
export const engineerService = {
  async getEngineers(): Promise<{ engineers: User[] }> {
    try {
      const response = await api.get<{ engineers: User[] }>("/engineers");
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to load engineers");
    }
  },

  async getEngineerCapacity(
    engineerId: string,
    startDate: string,
    endDate: string
  ): Promise<{ availableCapacity: number }> {
    try {
      const response = await api.get<{ availableCapacity: number }>(
        `/engineers/${engineerId}/capacity`,
        {
          params: { startDate, endDate },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to load engineer capacity");
    }
  },

  handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(defaultMessage);
  },
};

// Project management service methods
export const projectService = {
  async getProjects(): Promise<{ projects: Project[] }> {
    try {
      const response = await api.get<{ projects: Project[] }>("/projects");
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to load projects");
    }
  },

  async getProject(id: string): Promise<{ project: Project }> {
    try {
      const response = await api.get<{ project: Project }>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to load project");
    }
  },

  async createProject(projectData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    requiredSkills: string[];
    teamSize: number;
    status?: "planning" | "active" | "completed";
  }): Promise<{ project: Project }> {
    try {
      const response = await api.post<{ project: Project }>(
        "/projects",
        projectData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to create project");
    }
  },

  async updateProject(
    id: string,
    projectData: Partial<Project>
  ): Promise<{ project: Project }> {
    try {
      const response = await api.put<{ project: Project }>(
        `/projects/${id}`,
        projectData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to update project");
    }
  },

  // NEW: Add delete project functionality
  async deleteProject(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to delete project");
    }
  },

  handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(defaultMessage);
  },
};

// Assignment management service methods
export const assignmentService = {
  async getAssignments(): Promise<{ assignments: Assignment[] }> {
    try {
      const response = await api.get<{ assignments: Assignment[] }>(
        "/assignments"
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to load assignments");
    }
  },

  async createAssignment(
    assignmentData: AssignmentCreate
  ): Promise<{ assignment: Assignment }> {
    try {
      const response = await api.post<{ assignment: Assignment }>(
        "/assignments",
        assignmentData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to create assignment");
    }
  },

  async updateAssignment(
    id: string,
    assignmentData: Partial<Assignment>
  ): Promise<{ assignment: Assignment }> {
    try {
      const response = await api.put<{ assignment: Assignment }>(
        `/assignments/${id}`,
        assignmentData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to update assignment");
    }
  },

  async deleteAssignment(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(
        `/assignments/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to delete assignment");
    }
  },

  handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(defaultMessage);
  },
};

// Analytics and reporting service methods
export const analyticsService = {
  async getUtilizationData(): Promise<{ utilizationData: UtilizationData[] }> {
    try {
      const response = await api.get<{ utilizationData: UtilizationData[] }>(
        "/analytics/utilization"
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to load utilization data");
    }
  },

  handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(defaultMessage);
  },
};

// Development utility methods
export const devService = {
  async createSeedData(): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>("/seed");
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to create seed data");
    }
  },

  handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(defaultMessage);
  },
};

export default api;

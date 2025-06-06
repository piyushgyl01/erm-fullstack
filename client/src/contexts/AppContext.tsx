// src/contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  Project,
  Assignment,
  UtilizationData,
  engineerService,
  projectService,
  assignmentService,
  analyticsService,
  devService,
} from "../services/apiService";

// Define the shape of our application state
interface AppState {
  // Engineers data
  engineers: User[];
  engineersLoading: boolean;
  engineersError: string | null;

  // Projects data
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;

  // Assignments data
  assignments: Assignment[];
  assignmentsLoading: boolean;
  assignmentsError: string | null;

  // Analytics data
  utilizationData: UtilizationData[];
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Global loading states for complex operations
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// Define all possible actions that can modify our app state
type AppAction =
  // Engineers actions
  | { type: "LOAD_ENGINEERS_START" }
  | { type: "LOAD_ENGINEERS_SUCCESS"; payload: User[] }
  | { type: "LOAD_ENGINEERS_FAILURE"; payload: string }

  // Projects actions
  | { type: "LOAD_PROJECTS_START" }
  | { type: "LOAD_PROJECTS_SUCCESS"; payload: Project[] }
  | { type: "LOAD_PROJECTS_FAILURE"; payload: string }
  | { type: "CREATE_PROJECT_START" }
  | { type: "CREATE_PROJECT_SUCCESS"; payload: Project }
  | { type: "CREATE_PROJECT_FAILURE"; payload: string }
  | { type: "UPDATE_PROJECT_START" }
  | { type: "UPDATE_PROJECT_SUCCESS"; payload: Project }
  | { type: "UPDATE_PROJECT_FAILURE"; payload: string }
  | { type: "DELETE_PROJECT_START" }
  | { type: "DELETE_PROJECT_SUCCESS"; payload: string }
  | { type: "DELETE_PROJECT_FAILURE"; payload: string }

  // Assignments actions
  | { type: "LOAD_ASSIGNMENTS_START" }
  | { type: "LOAD_ASSIGNMENTS_SUCCESS"; payload: Assignment[] }
  | { type: "LOAD_ASSIGNMENTS_FAILURE"; payload: string }
  | { type: "CREATE_ASSIGNMENT_START" }
  | { type: "CREATE_ASSIGNMENT_SUCCESS"; payload: Assignment }
  | { type: "CREATE_ASSIGNMENT_FAILURE"; payload: string }
  | { type: "UPDATE_ASSIGNMENT_START" }
  | { type: "UPDATE_ASSIGNMENT_SUCCESS"; payload: Assignment }
  | { type: "UPDATE_ASSIGNMENT_FAILURE"; payload: string }
  | { type: "DELETE_ASSIGNMENT_START" }
  | { type: "DELETE_ASSIGNMENT_SUCCESS"; payload: string }
  | { type: "DELETE_ASSIGNMENT_FAILURE"; payload: string }

  // Analytics actions
  | { type: "LOAD_ANALYTICS_START" }
  | { type: "LOAD_ANALYTICS_SUCCESS"; payload: UtilizationData[] }
  | { type: "LOAD_ANALYTICS_FAILURE"; payload: string }

  // Utility actions
  | { type: "CLEAR_ERROR"; payload: string }
  | { type: "RESET_STATE" };

// Define the methods available through our app context
interface AppContextType {
  state: AppState;

  // Engineers methods
  loadEngineers: () => Promise<void>;
  getEngineerCapacity: (
    engineerId: string,
    startDate: string,
    endDate: string
  ) => Promise<number>;

  // Projects methods
  loadProjects: () => Promise<void>;
  createProject: (projectData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    requiredSkills: string[];
    teamSize: number;
    status?: "planning" | "active" | "completed";
  }) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>; // NEW: Add delete project

  // Assignments methods
  loadAssignments: () => Promise<void>;
  createAssignment: (assignmentData: {
    engineerId: string;
    projectId: string;
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    role?: string;
  }) => Promise<void>;
  updateAssignment: (
    id: string,
    assignmentData: {
      engineerId?: string;
      projectId?: string;
      allocationPercentage?: number;
      startDate?: string;
      endDate?: string;
      role?: string;
    }
  ) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  // Analytics methods
  loadAnalytics: () => Promise<void>;

  // Utility methods
  createSeedData: () => Promise<void>;
  clearError: (errorType: string) => void;
  refreshAllData: () => Promise<void>;
}

// Initial state for our application
const initialState: AppState = {
  engineers: [],
  engineersLoading: false,
  engineersError: null,

  projects: [],
  projectsLoading: false,
  projectsError: null,

  assignments: [],
  assignmentsLoading: false,
  assignmentsError: null,

  utilizationData: [],
  analyticsLoading: false,
  analyticsError: null,

  isCreating: false,
  isUpdating: false,
  isDeleting: false,
};

// Reducer function that handles all state transitions
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Engineers state management
    case "LOAD_ENGINEERS_START":
      return { ...state, engineersLoading: true, engineersError: null };
    case "LOAD_ENGINEERS_SUCCESS":
      return {
        ...state,
        engineers: action.payload,
        engineersLoading: false,
        engineersError: null,
      };
    case "LOAD_ENGINEERS_FAILURE":
      return {
        ...state,
        engineersLoading: false,
        engineersError: action.payload,
      };

    // Projects state management
    case "LOAD_PROJECTS_START":
      return { ...state, projectsLoading: true, projectsError: null };
    case "LOAD_PROJECTS_SUCCESS":
      return {
        ...state,
        projects: action.payload,
        projectsLoading: false,
        projectsError: null,
      };
    case "LOAD_PROJECTS_FAILURE":
      return {
        ...state,
        projectsLoading: false,
        projectsError: action.payload,
      };

    case "CREATE_PROJECT_START":
      return { ...state, isCreating: true, projectsError: null };
    case "CREATE_PROJECT_SUCCESS":
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        isCreating: false,
        projectsError: null,
      };
    case "CREATE_PROJECT_FAILURE":
      return { ...state, isCreating: false, projectsError: action.payload };

    case "UPDATE_PROJECT_START":
      return { ...state, isUpdating: true, projectsError: null };
    case "UPDATE_PROJECT_SUCCESS":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project._id === action.payload._id ? action.payload : project
        ),
        isUpdating: false,
        projectsError: null,
      };
    case "UPDATE_PROJECT_FAILURE":
      return { ...state, isUpdating: false, projectsError: action.payload };

    // NEW: Project delete state management
    case "DELETE_PROJECT_START":
      return { ...state, isDeleting: true, projectsError: null };
    case "DELETE_PROJECT_SUCCESS":
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project._id !== action.payload
        ),
        isDeleting: false,
        projectsError: null,
      };
    case "DELETE_PROJECT_FAILURE":
      return { ...state, isDeleting: false, projectsError: action.payload };

    // Assignments state management
    case "LOAD_ASSIGNMENTS_START":
      return { ...state, assignmentsLoading: true, assignmentsError: null };
    case "LOAD_ASSIGNMENTS_SUCCESS":
      return {
        ...state,
        assignments: action.payload,
        assignmentsLoading: false,
        assignmentsError: null,
      };
    case "LOAD_ASSIGNMENTS_FAILURE":
      return {
        ...state,
        assignmentsLoading: false,
        assignmentsError: action.payload,
      };

    case "CREATE_ASSIGNMENT_START":
      return { ...state, isCreating: true, assignmentsError: null };
    case "CREATE_ASSIGNMENT_SUCCESS":
      return {
        ...state,
        assignments: [action.payload, ...state.assignments],
        isCreating: false,
        assignmentsError: null,
      };
    case "CREATE_ASSIGNMENT_FAILURE":
      return { ...state, isCreating: false, assignmentsError: action.payload };

    case "UPDATE_ASSIGNMENT_START":
      return { ...state, isUpdating: true, assignmentsError: null };
    case "UPDATE_ASSIGNMENT_SUCCESS":
      return {
        ...state,
        assignments: state.assignments.map((assignment) =>
          assignment._id === action.payload._id ? action.payload : assignment
        ),
        isUpdating: false,
        assignmentsError: null,
      };
    case "UPDATE_ASSIGNMENT_FAILURE":
      return { ...state, isUpdating: false, assignmentsError: action.payload };

    case "DELETE_ASSIGNMENT_START":
      return { ...state, isDeleting: true, assignmentsError: null };
    case "DELETE_ASSIGNMENT_SUCCESS":
      return {
        ...state,
        assignments: state.assignments.filter(
          (assignment) => assignment._id !== action.payload
        ),
        isDeleting: false,
        assignmentsError: null,
      };
    case "DELETE_ASSIGNMENT_FAILURE":
      return { ...state, isDeleting: false, assignmentsError: action.payload };

    // Analytics state management
    case "LOAD_ANALYTICS_START":
      return { ...state, analyticsLoading: true, analyticsError: null };
    case "LOAD_ANALYTICS_SUCCESS":
      return {
        ...state,
        utilizationData: action.payload,
        analyticsLoading: false,
        analyticsError: null,
      };
    case "LOAD_ANALYTICS_FAILURE":
      return {
        ...state,
        analyticsLoading: false,
        analyticsError: action.payload,
      };

    // Utility actions
    case "CLEAR_ERROR":
      const { payload: errorType } = action;
      return {
        ...state,
        [`${errorType}Error`]: null,
      };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Props interface for the AppProvider component
interface AppProviderProps {
  children: ReactNode;
}

// AppProvider component that manages all business logic state
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Engineers methods
  const loadEngineers = useCallback(async (): Promise<void> => {
    dispatch({ type: "LOAD_ENGINEERS_START" });

    try {
      const { engineers } = await engineerService.getEngineers();
      dispatch({ type: "LOAD_ENGINEERS_SUCCESS", payload: engineers });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load engineers";
      dispatch({ type: "LOAD_ENGINEERS_FAILURE", payload: errorMessage });
    }
  }, []);

  const getEngineerCapacity = useCallback(
    async (
      engineerId: string,
      startDate: string,
      endDate: string
    ): Promise<number> => {
      try {
        const { availableCapacity } = await engineerService.getEngineerCapacity(
          engineerId,
          startDate,
          endDate
        );
        return availableCapacity;
      } catch (error) {
        console.error("Failed to get engineer capacity:", error);
        return 0;
      }
    },
    []
  );

  // Projects methods
  const loadProjects = useCallback(async (): Promise<void> => {
    dispatch({ type: "LOAD_PROJECTS_START" });

    try {
      const { projects } = await projectService.getProjects();
      dispatch({ type: "LOAD_PROJECTS_SUCCESS", payload: projects });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load projects";
      dispatch({ type: "LOAD_PROJECTS_FAILURE", payload: errorMessage });
    }
  }, []);

  const createProject = useCallback(
    async (projectData: {
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      requiredSkills: string[];
      teamSize: number;
      status?: "planning" | "active" | "completed";
    }): Promise<void> => {
      dispatch({ type: "CREATE_PROJECT_START" });

      try {
        const { project } = await projectService.createProject(projectData);
        dispatch({ type: "CREATE_PROJECT_SUCCESS", payload: project });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create project";
        dispatch({ type: "CREATE_PROJECT_FAILURE", payload: errorMessage });
        throw error;
      }
    },
    []
  );

  const updateProject = useCallback(
    async (id: string, projectData: Partial<Project>): Promise<void> => {
      dispatch({ type: "UPDATE_PROJECT_START" });

      try {
        const { project } = await projectService.updateProject(id, projectData);
        dispatch({ type: "UPDATE_PROJECT_SUCCESS", payload: project });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update project";
        dispatch({ type: "UPDATE_PROJECT_FAILURE", payload: errorMessage });
        throw error;
      }
    },
    []
  );

  // NEW: Delete project method
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: "DELETE_PROJECT_START" });

    try {
      await projectService.deleteProject(id);
      dispatch({ type: "DELETE_PROJECT_SUCCESS", payload: id });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete project";
      dispatch({ type: "DELETE_PROJECT_FAILURE", payload: errorMessage });
      throw error;
    }
  }, []);

  // Assignments methods
  const loadAssignments = useCallback(async (): Promise<void> => {
    dispatch({ type: "LOAD_ASSIGNMENTS_START" });

    try {
      const { assignments } = await assignmentService.getAssignments();
      dispatch({ type: "LOAD_ASSIGNMENTS_SUCCESS", payload: assignments });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load assignments";
      dispatch({ type: "LOAD_ASSIGNMENTS_FAILURE", payload: errorMessage });
    }
  }, []);

  const createAssignment = useCallback(
    async (assignmentData: {
      engineerId: string;
      projectId: string;
      allocationPercentage: number;
      startDate: string;
      endDate: string;
      role?: string;
    }): Promise<void> => {
      dispatch({ type: "CREATE_ASSIGNMENT_START" });

      try {
        const { assignment } = await assignmentService.createAssignment(
          assignmentData
        );
        dispatch({ type: "CREATE_ASSIGNMENT_SUCCESS", payload: assignment });

        // Refresh engineers data to update capacity information
        await loadEngineers();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create assignment";
        dispatch({ type: "CREATE_ASSIGNMENT_FAILURE", payload: errorMessage });
        throw error;
      }
    },
    [loadEngineers]
  );

  const updateAssignment = useCallback(
    async (id: string, assignmentData: any): Promise<void> => {
      dispatch({ type: "UPDATE_ASSIGNMENT_START" });

      try {
        const { assignment } = await assignmentService.updateAssignment(
          id,
          assignmentData
        );
        dispatch({ type: "UPDATE_ASSIGNMENT_SUCCESS", payload: assignment });

        // Refresh engineers data to update capacity information
        await loadEngineers();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update assignment";
        dispatch({ type: "UPDATE_ASSIGNMENT_FAILURE", payload: errorMessage });
        throw error;
      }
    },
    [loadEngineers]
  );

  const deleteAssignment = useCallback(
    async (id: string): Promise<void> => {
      dispatch({ type: "DELETE_ASSIGNMENT_START" });

      try {
        await assignmentService.deleteAssignment(id);
        dispatch({ type: "DELETE_ASSIGNMENT_SUCCESS", payload: id });

        // Refresh engineers data to update capacity information
        await loadEngineers();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete assignment";
        dispatch({ type: "DELETE_ASSIGNMENT_FAILURE", payload: errorMessage });
        throw error;
      }
    },
    [loadEngineers]
  );

  // Analytics methods
  const loadAnalytics = useCallback(async (): Promise<void> => {
    dispatch({ type: "LOAD_ANALYTICS_START" });

    try {
      const { utilizationData } = await analyticsService.getUtilizationData();
      dispatch({ type: "LOAD_ANALYTICS_SUCCESS", payload: utilizationData });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load analytics";
      dispatch({ type: "LOAD_ANALYTICS_FAILURE", payload: errorMessage });
    }
  }, []);

  // Utility methods
  const createSeedData = useCallback(async (): Promise<void> => {
    try {
      await devService.createSeedData();
      // Refresh all data after creating seed data
      await refreshAllData();
    } catch (error) {
      console.error("Failed to create seed data:", error);
      throw error;
    }
  }, []);

  const clearError = useCallback((errorType: string): void => {
    dispatch({ type: "CLEAR_ERROR", payload: errorType });
  }, []);

  const refreshAllData = useCallback(async (): Promise<void> => {
    // Load all data in parallel for better performance
    await Promise.all([
      loadEngineers(),
      loadProjects(),
      loadAssignments(),
      loadAnalytics().catch(() => {
        // Analytics might fail for non-managers, but that's okay
        console.log("Analytics data not available for current user");
      }),
    ]);
  }, [loadEngineers, loadProjects, loadAssignments, loadAnalytics]);

  // Create the context value object
  const contextValue: AppContextType = {
    state,

    // Engineers methods
    loadEngineers,
    getEngineerCapacity,

    // Projects methods
    loadProjects,
    createProject,
    updateProject,
    deleteProject, // NEW: Add delete project

    // Assignments methods
    loadAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,

    // Analytics methods
    loadAnalytics,

    // Utility methods
    createSeedData,
    clearError,
    refreshAllData,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook for consuming the app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
};

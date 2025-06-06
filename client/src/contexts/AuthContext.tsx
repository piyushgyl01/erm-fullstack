// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { authService, User } from "../services/apiService";

// Define the shape of our authentication state
// This interface ensures type safety throughout our application
interface AuthState {
  user: User | null; // Current authenticated user or null if not logged in
  isLoading: boolean; // Loading state for async authentication operations
  isAuthenticated: boolean; // Quick boolean check for authentication status
  error: string | null; // Any authentication error messages
}

// Define all possible actions that can modify our auth state
// Using a discriminated union pattern ensures type safety for all actions
type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS"; payload: User }
  | { type: "REGISTER_FAILURE"; payload: string }
  | { type: "LOAD_USER_START" }
  | { type: "LOAD_USER_SUCCESS"; payload: User }
  | { type: "LOAD_USER_FAILURE"; payload: string }
  | { type: "CLEAR_ERROR" };

// Define the methods available through our auth context
// This interface acts as a contract for what functionality is available
interface AuthContextType {
  // Current state
  state: AuthState;

  // Authentication actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    name: string;
    password: string;
    role: "engineer" | "manager";
    skills?: string[];
    seniority?: "junior" | "mid" | "senior";
    maxCapacity?: number;
    department: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;

  // Convenience getters
  isManager: boolean;
  isEngineer: boolean;
}

// Initial state for our authentication system
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Reducer function that handles all state transitions
// This pure function ensures predictable state updates
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
    case "LOAD_USER_START":
      // Set loading state for any async authentication operation
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
    case "LOAD_USER_SUCCESS":
      // Successfully authenticated - update state with user data
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
    case "LOAD_USER_FAILURE":
      // Authentication failed - clear user data and show error
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case "LOGOUT":
      // User logged out - reset to initial state
      return initialState;

    case "CLEAR_ERROR":
      // Clear any existing error messages
      return {
        ...state,
        error: null,
      };

    default:
      // TypeScript ensures this case never happens with our action types
      return state;
  }
}

// Create the context with a default value
// The actual implementation will be provided by the AuthProvider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props interface for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component that wraps our application and provides auth functionality
// This component manages all authentication state and provides methods to child components
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use useReducer for complex state management with predictable updates
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Effect to check for existing authentication on app startup
  // This allows users to stay logged in across browser sessions
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user is already authenticated from previous session
      if (authService.isAuthenticated()) {
        dispatch({ type: "LOAD_USER_START" });

        try {
          // Verify the stored token is still valid by fetching user profile
          const { user } = await authService.getProfile();
          dispatch({ type: "LOAD_USER_SUCCESS", payload: user });
        } catch (error) {
          // Token is invalid or expired - clear stored auth data
          authService.logout();
          dispatch({
            type: "LOAD_USER_FAILURE",
            payload: "Session expired. Please log in again.",
          });
        }
      }
    };

    initializeAuth();
  }, []); // Empty dependency array means this runs once on component mount

  // Login function that handles user authentication
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: "LOGIN_START" });

    try {
      const { user } = await authService.login(email, password);
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw error; // Re-throw so components can handle the error if needed
    }
  };

  // Registration function for new user accounts
  const register = async (userData: {
    email: string;
    name: string;
    password: string;
    role: "engineer" | "manager";
    skills?: string[];
    seniority?: "junior" | "mid" | "senior";
    maxCapacity?: number;
    department: string;
  }): Promise<void> => {
    dispatch({ type: "REGISTER_START" });

    try {
      const { user } = await authService.register(userData);
      dispatch({ type: "REGISTER_SUCCESS", payload: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
      throw error; // Re-throw so components can handle the error if needed
    }
  };

  // Logout function that clears all authentication data
  const logout = (): void => {
    authService.logout();
    dispatch({ type: "LOGOUT" });
  };

  // Clear any error messages
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Convenience getters for checking user roles
  // These make it easy for components to conditionally render content
  const isManager = state.user?.role === "manager";
  const isEngineer = state.user?.role === "engineer";

  // Create the context value object with all auth functionality
  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    isManager,
    isEngineer,
  };

  // Provide the auth context to all child components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for consuming the auth context
// This hook provides a clean way for components to access auth functionality
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  // Ensure the hook is used within an AuthProvider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Higher-order component for protecting routes that require authentication
// This can be used to wrap components that should only be accessible to logged-in users
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function AuthenticatedComponent(props: P) {
    const { state } = useAuth();

    // Show loading spinner while checking authentication
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!state.isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please log in to access this page.
            </p>
          </div>
        </div>
      );
    }

    // Render the protected component if authenticated
    return <Component {...props} />;
  };
};

// Higher-order component for protecting routes that require manager role
// This ensures only managers can access certain administrative features
export const withManagerAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function ManagerAuthenticatedComponent(props: P) {
    const { state, isManager } = useAuth();

    // First check authentication
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!state.isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please log in to access this page.
            </p>
          </div>
        </div>
      );
    }

    // Then check manager role
    if (!isManager) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Manager Access Required
            </h2>
            <p className="text-muted-foreground">
              You need manager privileges to access this page.
            </p>
          </div>
        </div>
      );
    }

    // Render the protected component if authenticated and manager
    return <Component {...props} />;
  };
};

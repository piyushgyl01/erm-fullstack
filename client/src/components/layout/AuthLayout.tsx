// src/components/layout/AuthLayout.tsx
import { BarChart3 } from "lucide-react";
/**
 * Layout component for authentication pages (login, register)
 * Provides a clean, centered design for authentication forms
 */
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and branding section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ResourceHub</h1>
          <p className="mt-2 text-sm text-gray-600">
            Engineering Resource Management System
          </p>
        </div>

        {/* Authentication form content */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-100">
          {children}
        </div>

        {/* Footer information */}
        <div className="text-center text-xs text-gray-500">
          <p>Built with React, TypeScript, and modern web technologies</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeDetails } from './pages/EmployeeDetails';
import { OrgHierarchy } from './pages/OrgHierarchy';
import { Bin } from './pages/Bin';

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'HR Manager']}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'HR Manager']}>
            <Layout>
              <EmployeeList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/hierarchy"
        element={
          <ProtectedRoute>
            <Layout>
              <OrgHierarchy />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bin"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'HR Manager']}>
            <Layout>
              <Bin />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <AppContent />
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: 'calc(var(--radius) - 2px)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--chart-3)',
                  secondary: 'var(--card)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--destructive)',
                  secondary: 'var(--card)',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

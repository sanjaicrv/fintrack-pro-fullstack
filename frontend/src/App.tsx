
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Layout
import AppLayout from './components/Layout/AppLayout'
import PrivateRoute from './components/Common/PrivateRoute'

// Auth pages
import LandingPage  from './pages/LandingPage'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

// App pages
import DashboardPage from './pages/DashboardPage'
import IncomePage    from './pages/IncomePage'
import ExpensesPage  from './pages/ExpensesPage'
import GoalsPage     from './pages/GoalsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage  from './pages/SettingsPage'

export default function App() {

  const { isAuthenticated } = useAuth()

  return (
    <ThemeProvider>

      <Routes>

        {/* Default route */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/landing" replace />
          }
        />

        {/* Public pages */}
        <Route path="/landing" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <RegisterPage />
          }
        />

        <Route
          path="/forgot-password"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <ForgotPasswordPage />
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/landing"}
              replace
            />
          }
        />

      </Routes>

    </ThemeProvider>
  )
}


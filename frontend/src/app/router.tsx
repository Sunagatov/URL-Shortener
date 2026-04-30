import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/app/layout/MainLayout';
import { routes } from '@/app/routes';
import { GuestOnlyRoute } from '@/features/auth/routes/GuestOnlyRoute';
import { ProtectedRoute } from '@/features/auth/routes/ProtectedRoute';
import SignInPage from '@/features/auth/routes/SignInPage';
import SignUpPage from '@/features/auth/routes/SignUpPage';
import ForgotPasswordPage from '@/features/auth/routes/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/routes/ResetPasswordPage';
import VerifyEmailPage from '@/features/auth/routes/VerifyEmailPage';
import DashboardPage from '@/features/account/routes/DashboardPage';
import UserAccountPage from '@/features/account/routes/UserAccountPage';
import SecurityPage from '@/features/account/routes/SecurityPage';
import UrlShortenerPage from '@/features/urls/routes/UrlShortenerPage';
import UserUrlMappingsPage from '@/features/urls/routes/UserUrlMappingsPage';
import UrlMappingDetailsPage from '@/features/urls/routes/UrlMappingDetailsPage';

const guestRoutes = [
  { path: routes.signIn, element: <SignInPage /> },
  { path: routes.signUp, element: <SignUpPage /> },
  { path: routes.verifyEmail, element: <VerifyEmailPage /> },
  { path: routes.forgotPassword, element: <ForgotPasswordPage /> },
  { path: routes.resetPassword, element: <ResetPasswordPage /> },
] as const;

const protectedRoutes = [
  { path: routes.dashboard, element: <DashboardPage /> },
  { path: routes.profile, element: <UserAccountPage /> },
  { path: routes.security, element: <SecurityPage /> },
  { path: routes.urlMappings, element: <UserUrlMappingsPage /> },
  { path: routes.urlDetails(':urlHash'), element: <UrlMappingDetailsPage /> },
] as const;

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path={routes.home} element={<UrlShortenerPage />} />
          {guestRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<GuestOnlyRoute>{element}</GuestOnlyRoute>}
            />
          ))}
          <Route
            path={routes.account}
            element={(
              <ProtectedRoute>
                <Navigate to={routes.dashboard} replace />
              </ProtectedRoute>
            )}
          />
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}
          <Route path="*" element={<Navigate to={routes.home} replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;

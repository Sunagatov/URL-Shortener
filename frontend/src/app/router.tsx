import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MainLayout } from '@/app/layout/MainLayout';
import { routes } from '@/app/routes';
import { AuthRoute } from '@/features/auth/routes/AuthRoute';
import SignInPage from '@/features/auth/routes/SignInPage';
import SignUpPage from '@/features/auth/routes/SignUpPage';
import ForgotPasswordPage from '@/features/auth/routes/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/routes/ResetPasswordPage';
import VerifyEmailPage from '@/features/auth/routes/VerifyEmailPage';
import GoogleCallbackPage from '@/features/auth/routes/GoogleCallbackPage';
import DashboardPage from '@/features/account/routes/DashboardPage';
import UserAccountPage from '@/features/account/routes/UserAccountPage';
import SecurityPage from '@/features/account/routes/SecurityPage';
import UrlShortenerPage from '@/features/urls/routes/UrlShortenerPage';
import UserUrlMappingsPage from '@/features/urls/routes/UserUrlMappingsPage';
import UrlMappingDetailsPage from '@/features/urls/routes/UrlMappingDetailsPage';
import AccountAnalyticsPage from '@/features/analytics/routes/AccountAnalyticsPage';

const guestRoutes = [
  { path: routes.signIn, element: <SignInPage /> },
  { path: routes.signUp, element: <SignUpPage /> },
  { path: routes.verifyEmail, element: <VerifyEmailPage /> },
  { path: routes.forgotPassword, element: <ForgotPasswordPage /> },
  { path: routes.resetPassword, element: <ResetPasswordPage /> },
] as const;

const protectedRoutes = [
  { path: routes.dashboard, element: <DashboardPage /> },
  { path: routes.analytics, element: <AccountAnalyticsPage /> },
  { path: routes.profile, element: <UserAccountPage /> },
  { path: routes.security, element: <SecurityPage /> },
  { path: routes.urlMappings, element: <UserUrlMappingsPage /> },
  { path: routes.urlDetails(':urlHash'), element: <UrlMappingDetailsPage /> },
] as const;

function AppRoutes() {
  const location = useLocation();

  return (
    <MainLayout>
      <div key={location.pathname} className="route-transition">
        <Routes location={location}>
          <Route path={routes.home} element={<UrlShortenerPage />} />
          <Route path={routes.googleCallback} element={<GoogleCallbackPage />} />
          {guestRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AuthRoute access="guest">{element}</AuthRoute>}
            />
          ))}
          <Route
            path={routes.account}
            element={(
              <AuthRoute access="protected">
                <Navigate to={routes.dashboard} replace />
              </AuthRoute>
            )}
          />
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AuthRoute access="protected">{element}</AuthRoute>}
            />
          ))}
          <Route path="*" element={<Navigate to={routes.home} replace />} />
        </Routes>
      </div>
    </MainLayout>
  );
}

const AppRouter = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default AppRouter;

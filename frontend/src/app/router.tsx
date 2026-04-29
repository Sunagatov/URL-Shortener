import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/app/layout/MainLayout';
import { routes } from '@/app/routes';
import { GuestOnlyRoute } from '@/features/auth/routes/GuestOnlyRoute';
import { ProtectedRoute } from '@/features/auth/routes/ProtectedRoute';
import SignInPage from '@/features/auth/routes/SignInPage';
import SignUpPage from '@/features/auth/routes/SignUpPage';
import DashboardPage from '@/features/account/routes/DashboardPage';
import UserAccountPage from '@/features/account/routes/UserAccountPage';
import SecurityPage from '@/features/account/routes/SecurityPage';
import UrlShortenerPage from '@/features/urls/routes/UrlShortenerPage';
import UserUrlMappingsPage from '@/features/urls/routes/UserUrlMappingsPage';
import UrlMappingDetailsPage from '@/features/urls/routes/UrlMappingDetailsPage';

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path={routes.home} element={<UrlShortenerPage />} />
          <Route
            path={routes.signIn}
            element={(
              <GuestOnlyRoute>
                <SignInPage />
              </GuestOnlyRoute>
            )}
          />
          <Route
            path={routes.signUp}
            element={(
              <GuestOnlyRoute>
                <SignUpPage />
              </GuestOnlyRoute>
            )}
          />
          <Route
            path={routes.account}
            element={(
              <ProtectedRoute>
                <Navigate to={routes.dashboard} replace />
              </ProtectedRoute>
            )}
          />
          <Route
            path={routes.dashboard}
            element={(
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={routes.profile}
            element={(
              <ProtectedRoute>
                <UserAccountPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={routes.security}
            element={(
              <ProtectedRoute>
                <SecurityPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path={routes.urlMappings}
            element={(
              <ProtectedRoute>
                <UserUrlMappingsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/account/url-mappings/:urlHash"
            element={(
              <ProtectedRoute>
                <UrlMappingDetailsPage />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to={routes.home} replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
